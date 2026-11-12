import { createZodDto } from 'nestjs-zod';
import { contactRequestSchema, devLoginRequestSchema, inviteTokenRequestSchema } from '@kids-chores/contracts';
import { passkeyLoginSchema, passkeyRegisterSchema } from './schema';

export class DevLoginDto extends createZodDto(devLoginRequestSchema) {}

export class PasskeyRegisterDto extends createZodDto(passkeyRegisterSchema) {}

export class PasskeyLoginDto extends createZodDto(passkeyLoginSchema) {}

export class ContactRequestDto extends createZodDto(contactRequestSchema) {}

export class InviteTokenDto extends createZodDto(inviteTokenRequestSchema) {}
