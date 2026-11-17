import { randomUUID } from 'node:crypto';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import type { Redis } from 'ioredis';
import type { Session } from '@kids-chores/contracts';
import { APP_CONFIG, type AppConfig } from '../../platform/config';
import { PrismaService } from '../../platform/database';
import { VALKEY } from '../../platform/valkey';
import {
  PASSKEY_CHALLENGE_TTL_SECONDS,
  PASSKEY_LOGIN_PREFIX,
  PASSKEY_REGISTER_PREFIX,
  PASSKEY_RP_NAME,
} from './constants';
import { publicOrigin, relyingPartyId } from './lib';
import { passkeyTransportsSchema } from './schema';
import type { PasskeyLoginOptions, PasskeyRegisterOptions } from './types';

@Injectable()
export class PasskeysService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(VALKEY) private readonly valkey: Redis,
    @Inject(APP_CONFIG) private readonly config: AppConfig
  ) {}

  async registrationOptions(session: Session): Promise<PasskeyRegisterOptions> {
    const existing = await this.prisma.passkey.findMany({
      where: { userId: session.userId },
      select: { id: true, transports: true },
    });
    const options = await generateRegistrationOptions({
      rpName: PASSKEY_RP_NAME,
      rpID: relyingPartyId(this.config),
      userName: PASSKEY_RP_NAME,
      userID: new TextEncoder().encode(session.userId),
      attestationType: 'none',
      excludeCredentials: existing.map((key) => ({
        id: key.id,
        transports: passkeyTransportsSchema.parse(key.transports),
      })),
      authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
    });
    await this.valkey.set(
      `${PASSKEY_REGISTER_PREFIX}${session.userId}`,
      options.challenge,
      'EX',
      PASSKEY_CHALLENGE_TTL_SECONDS
    );
    return options;
  }

  async register(session: Session, response: RegistrationResponseJSON): Promise<void> {
    const expectedChallenge = await this.valkey.getdel(`${PASSKEY_REGISTER_PREFIX}${session.userId}`);
    if (!expectedChallenge) {
      throw new BadRequestException();
    }
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: publicOrigin(this.config),
      expectedRPID: relyingPartyId(this.config),
      requireUserVerification: true,
    }).catch(() => null);
    if (!verification?.verified || !verification.registrationInfo) {
      throw new BadRequestException();
    }
    const { credential } = verification.registrationInfo;
    await this.prisma.passkey.create({
      data: {
        id: credential.id,
        userId: session.userId,
        publicKey: credential.publicKey,
        counter: BigInt(credential.counter),
        transports: credential.transports ?? [],
      },
    });
  }

  async loginOptions(): Promise<PasskeyLoginOptions> {
    const options = await generateAuthenticationOptions({
      rpID: relyingPartyId(this.config),
      userVerification: 'required',
    });
    const flowId = randomUUID();
    await this.valkey.set(`${PASSKEY_LOGIN_PREFIX}${flowId}`, options.challenge, 'EX', PASSKEY_CHALLENGE_TTL_SECONDS);
    return { flowId, options };
  }

  async verifyLogin(flowId: string, response: AuthenticationResponseJSON): Promise<string> {
    const expectedChallenge = await this.valkey.getdel(`${PASSKEY_LOGIN_PREFIX}${flowId}`);
    const passkey = await this.prisma.passkey.findUnique({ where: { id: response.id } });
    if (!expectedChallenge || !passkey) {
      throw new UnauthorizedException();
    }
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: publicOrigin(this.config),
      expectedRPID: relyingPartyId(this.config),
      requireUserVerification: true,
      credential: {
        id: passkey.id,
        publicKey: passkey.publicKey,
        counter: Number(passkey.counter),
        transports: passkeyTransportsSchema.parse(passkey.transports),
      },
    }).catch(() => null);
    if (!verification?.verified) {
      throw new UnauthorizedException();
    }
    await this.prisma.passkey.update({
      where: { id: passkey.id },
      data: { counter: BigInt(verification.authenticationInfo.newCounter), lastUsedAt: new Date() },
    });
    return passkey.userId;
  }

  async remove(session: Session, id: string): Promise<void> {
    await this.prisma.passkey.deleteMany({ where: { id, userId: session.userId } });
  }
}
