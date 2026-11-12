import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Contact, FamilyInvite, FamilyResponse, IncomingInvite, Session } from '@kids-chores/contracts';
import type { Redis } from 'ioredis';
import type { FamilyInvite as InviteRow } from '../../generated/prisma/client';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { RATE_LIMIT_PREFIX } from '../../platform/rate-limit';
import { VALKEY } from '../../platform/valkey';
import { DAY_SECONDS, INVITE_TTL_MS, JOIN_REQUEST_TTL_MS, JOIN_REQUESTS_PER_DAY } from './constants';
import { contactHash, contactHint } from './lib';
import { MembershipsService } from './memberships.service';
import { SessionsService } from './sessions.service';

const toInvite = (row: InviteRow): FamilyInvite => ({
  id: row.id,
  kind: row.kind,
  hint: row.hint,
  expiresAt: row.expiresAt.toISOString(),
});

@Injectable()
export class FamilyService {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(VALKEY) private readonly valkey: Redis,
    private readonly prisma: PrismaService,
    private readonly memberships: MembershipsService,
    private readonly sessions: SessionsService
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

  async incoming(userId: string, familyId: string): Promise<IncomingInvite[]> {
    const contacts = await this.prisma.userContact.findMany({ where: { userId }, select: { kind: true, hash: true } });
    if (contacts.length === 0) {
      return [];
    }
    const invites = await this.prisma.familyInvite.findMany({
      where: {
        OR: contacts.map(({ kind, hash }) => ({ kind, contactHash: hash })),
        familyId: { not: familyId },
        expiresAt: { gt: new Date() },
      },
      include: { inviter: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return invites.map((invite) => ({
      id: invite.id,
      inviterName: invite.inviter.name,
      expiresAt: invite.expiresAt.toISOString(),
    }));
  }

  async pendingRequests(session: Session): Promise<number> {
    return this.prisma.joinRequest.count({ where: { familyId: session.familyId, expiresAt: { gt: new Date() } } });
  }

  async invite(session: Session, contact: Contact): Promise<FamilyInvite> {
    await this.requireOwner(session);
    const { kind, hash } = contactHash(this.config.AUTH_PEPPER, contact);
    const holder = await this.prisma.userContact.findUnique({ where: { kind_hash: { kind, hash } }, select: { userId: true } });
    if (holder) {
      const member = await this.prisma.membership.findUnique({ where: { userId: holder.userId } });
      if (member?.familyId === session.familyId) {
        throw new ConflictException();
      }
    }
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    const hint = contactHint(contact);
    const row = await this.prisma.familyInvite.upsert({
      where: { familyId_kind_contactHash: { familyId: session.familyId, kind, contactHash: hash } },
      create: { id: randomUUID(), familyId: session.familyId, kind, contactHash: hash, hint, invitedBy: session.userId, expiresAt },
      update: { hint, invitedBy: session.userId, expiresAt },
    });
    return toInvite(row);
  }

  async dropInvite(session: Session, id: string): Promise<void> {
    const invite = await this.prisma.familyInvite.findUnique({ where: { id } });
    const allowed =
      invite !== null &&
      (invite.familyId === session.familyId ? await this.isOwner(session) : await this.addressedTo(session.userId, invite));
    if (!allowed) {
      throw new NotFoundException();
    }
    await this.prisma.familyInvite.deleteMany({ where: { id } });
  }

  async acceptInvite(session: Session, id: string): Promise<void> {
    const invite = await this.prisma.familyInvite.findUnique({ where: { id } });
    if (
      !invite ||
      invite.expiresAt <= new Date() ||
      invite.familyId === session.familyId ||
      !(await this.addressedTo(session.userId, invite))
    ) {
      throw new NotFoundException();
    }
    await this.join(session.userId, invite.familyId);
    await this.prisma.familyInvite.deleteMany({ where: { id } });
  }

  async requestToJoin(session: Session, contact: Contact): Promise<void> {
    const key = `${RATE_LIMIT_PREFIX}join:${session.userId}`;
    const replies = await this.valkey.multi().set(key, 0, 'EX', DAY_SECONDS, 'NX').incr(key).exec();
    if (Number(replies?.[1]?.[1] ?? 0) > JOIN_REQUESTS_PER_DAY) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
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

  private async addressedTo(userId: string, invite: InviteRow): Promise<boolean> {
    const contact = await this.prisma.userContact.findUnique({
      where: { kind_hash: { kind: invite.kind, hash: invite.contactHash } },
      select: { userId: true },
    });
    return contact?.userId === userId;
  }
}
