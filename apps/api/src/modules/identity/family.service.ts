import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  Contact,
  CreatedInvite,
  CreateInviteRequest,
  FamilyInvite,
  FamilyResponse,
  InvitePreview,
  Session,
} from '@kids-chores/contracts';
import type { Redis } from 'ioredis';
import type { FamilyInvite as InviteRow } from '../../generated/prisma/client';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { MailService } from '../../platform/mail';
import { RATE_LIMIT_PREFIX } from '../../platform/rate-limit';
import { VALKEY } from '../../platform/valkey';
import {
  DAY_SECONDS,
  INVITE_MAILS_PER_ADDRESS,
  INVITE_MAILS_PER_ADDRESS_TOTAL,
  INVITE_MAILS_PER_DAY,
  INVITE_MAILS_PER_DAY_TOTAL,
  INVITE_MAILS_PER_IP,
  INVITE_TTL_MS,
  JOIN_REQUEST_TTL_MS,
  JOIN_REQUESTS_PER_DAY,
} from './constants';
import { contactHash, inviteMail, inviteTokenHash, inviteUrl, newInviteToken, subjectHash } from './lib';
import { MembershipsService } from './memberships.service';
import { SessionsService } from './sessions.service';
import type { DailyLimit, InviteWithInviter } from './types';

const toInvite = (row: InviteRow): FamilyInvite => ({
  id: row.id,
  createdAt: row.createdAt.toISOString(),
  expiresAt: row.expiresAt.toISOString(),
});

@Injectable()
export class FamilyService {
  private readonly logger = new Logger(FamilyService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(VALKEY) private readonly valkey: Redis,
    private readonly prisma: PrismaService,
    private readonly memberships: MembershipsService,
    private readonly sessions: SessionsService,
    private readonly mail: MailService
  ) {}

  async family(session: Session): Promise<FamilyResponse> {
    const now = new Date();
    const members = await this.prisma.membership.findMany({
      where: { familyId: session.familyId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    const owner = members.some((member) => member.userId === session.userId && member.role === 'owner');
    const invites = owner
      ? await this.prisma.familyInvite.findMany({
          where: { familyId: session.familyId, expiresAt: { gt: now } },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    const requests = owner
      ? await this.prisma.joinRequest.findMany({
          where: { familyId: session.familyId, expiresAt: { gt: now } },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    return {
      members: members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
        role: member.role,
        you: member.userId === session.userId,
      })),
      invites: invites.map(toInvite),
      requests: requests.map((request) => ({
        id: request.id,
        name: request.user.name,
        createdAt: request.createdAt.toISOString(),
      })),
    };
  }

  async pendingRequests(session: Session): Promise<number> {
    return this.prisma.joinRequest.count({ where: { familyId: session.familyId, expiresAt: { gt: new Date() } } });
  }

  async invite(session: Session, request: CreateInviteRequest, ip: string): Promise<CreatedInvite> {
    await this.requireOwner(session);
    const limits = request.email ? this.mailLimits(session, request.email, ip) : [];
    await this.ensureAllowed(limits);
    const token = newInviteToken();
    const row = await this.prisma.familyInvite.create({
      data: {
        id: randomUUID(),
        familyId: session.familyId,
        tokenHash: inviteTokenHash(this.config.AUTH_PEPPER, token),
        invitedBy: session.userId,
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      },
    });
    if (request.email) {
      const inviter = await this.prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { name: true } });
      const link = inviteUrl(this.config, token);
      try {
        await this.mail.send({ to: request.email, ...inviteMail(request.locale, inviter.name, link, row.expiresAt) });
      } catch (error) {
        await this.prisma.familyInvite.deleteMany({ where: { id: row.id } });
        this.logger.warn(`invite mail failed: ${error instanceof Error ? error.name : 'unknown error'}`);
        throw new ServiceUnavailableException();
      }
      await this.consume(limits);
    }
    return { id: row.id, token, expiresAt: row.expiresAt.toISOString() };
  }

  async dropInvite(session: Session, id: string): Promise<void> {
    await this.requireOwner(session);
    const { count } = await this.prisma.familyInvite.deleteMany({ where: { id, familyId: session.familyId } });
    if (count === 0) {
      throw new NotFoundException();
    }
  }

  async previewInvite(session: Session, token: string): Promise<InvitePreview> {
    const invite = await this.findInvite(token);
    return {
      inviterName: invite.inviter.name,
      expiresAt: invite.expiresAt.toISOString(),
      sameFamily: invite.familyId === session.familyId,
    };
  }

  async acceptInvite(session: Session, token: string): Promise<void> {
    const invite = await this.findInvite(token);
    const { count } = await this.prisma.familyInvite.deleteMany({ where: { id: invite.id } });
    if (count === 0) {
      throw new NotFoundException();
    }
    if (invite.familyId !== session.familyId) {
      await this.join(session.userId, invite.familyId);
    }
  }

  async requestToJoin(session: Session, contact: Contact): Promise<void> {
    const limits = [{ name: `join:${session.userId}`, perDay: JOIN_REQUESTS_PER_DAY }];
    await this.ensureAllowed(limits);
    await this.consume(limits);
    const { kind, hash } = contactHash(this.config.AUTH_PEPPER, contact);
    const holder = await this.prisma.userContact.findUnique({ where: { kind_hash: { kind, hash } }, select: { userId: true } });
    const target = holder ? await this.prisma.membership.findUnique({ where: { userId: holder.userId } }) : null;
    if (!target || target.familyId === session.familyId) {
      return;
    }
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + JOIN_REQUEST_TTL_MS);
    await this.prisma.joinRequest.upsert({
      where: { familyId_userId: { familyId: target.familyId, userId: session.userId } },
      create: { id: randomUUID(), familyId: target.familyId, userId: session.userId, createdAt, expiresAt },
      update: { createdAt, expiresAt },
    });
  }

  async approve(session: Session, id: string): Promise<void> {
    await this.requireOwner(session);
    const request = await this.prisma.joinRequest.findUnique({ where: { id } });
    if (!request || request.familyId !== session.familyId || request.expiresAt <= new Date()) {
      throw new NotFoundException();
    }
    await this.join(request.userId, session.familyId);
  }

  async decline(session: Session, id: string): Promise<void> {
    await this.requireOwner(session);
    const { count } = await this.prisma.joinRequest.deleteMany({ where: { id, familyId: session.familyId } });
    if (count === 0) {
      throw new NotFoundException();
    }
  }

  async removeMember(session: Session, userId: string): Promise<void> {
    await this.requireOwner(session);
    if (userId === session.userId) {
      throw new BadRequestException();
    }
    const member = await this.prisma.membership.findUnique({ where: { userId } });
    if (member?.familyId !== session.familyId) {
      throw new NotFoundException();
    }
    await this.memberships.detach(userId, session.familyId);
    await this.sessions.endUser(session.familyId, userId);
  }

  async leave(session: Session): Promise<void> {
    const members = await this.prisma.membership.count({ where: { familyId: session.familyId } });
    if (members < 2) {
      throw new ConflictException();
    }
    await this.memberships.detach(session.userId, session.familyId);
    await this.sessions.endUser(session.familyId, session.userId);
  }

  private mailLimits(session: Session, email: string, ip: string): DailyLimit[] {
    const pepper = this.config.AUTH_PEPPER;
    const recipient = contactHash(pepper, { kind: 'email', value: email }).hash;
    return [
      { name: `mail:invite:family:${session.familyId}`, perDay: INVITE_MAILS_PER_DAY },
      { name: `mail:invite:to:${session.familyId}:${recipient}`, perDay: INVITE_MAILS_PER_ADDRESS },
      { name: `mail:invite:to:${recipient}`, perDay: INVITE_MAILS_PER_ADDRESS_TOTAL },
      { name: `mail:invite:ip:${subjectHash(pepper, 'ip', ip)}`, perDay: INVITE_MAILS_PER_IP },
      { name: 'mail:invite:all', perDay: INVITE_MAILS_PER_DAY_TOTAL },
    ];
  }

  private async ensureAllowed(limits: readonly DailyLimit[]): Promise<void> {
    if (limits.length === 0) {
      return;
    }
    const counts = await this.valkey.mget(limits.map(({ name }) => `${RATE_LIMIT_PREFIX}${name}`));
    if (limits.some(({ perDay }, index) => Number(counts[index] ?? 0) >= perDay)) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private async consume(limits: readonly DailyLimit[]): Promise<void> {
    const multi = this.valkey.multi();
    for (const { name } of limits) {
      const key = `${RATE_LIMIT_PREFIX}${name}`;
      multi.set(key, 0, 'EX', DAY_SECONDS, 'NX').incr(key);
    }
    await multi.exec();
  }

  private async join(userId: string, familyId: string): Promise<void> {
    const from = await this.memberships.move(userId, familyId);
    if (from !== null && from !== familyId) {
      await this.sessions.moveUser(from, familyId, userId);
    }
  }

  private async isOwner(session: Session): Promise<boolean> {
    const membership = await this.prisma.membership.findUnique({ where: { userId: session.userId } });
    return membership?.familyId === session.familyId && membership.role === 'owner';
  }

  private async requireOwner(session: Session): Promise<void> {
    if (!(await this.isOwner(session))) {
      throw new ForbiddenException();
    }
  }

  private async findInvite(token: string): Promise<InviteWithInviter> {
    const invite = await this.prisma.familyInvite.findUnique({
      where: { tokenHash: inviteTokenHash(this.config.AUTH_PEPPER, token) },
      include: { inviter: { select: { name: true } } },
    });
    if (!invite || invite.expiresAt <= new Date()) {
      throw new NotFoundException();
    }
    return invite;
  }
}
