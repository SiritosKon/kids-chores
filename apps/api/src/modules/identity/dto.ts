import { createZodDto } from 'nestjs-zod';
import {
  contactRequestSchema,
  createInviteRequestSchema,
  emailCodeCheckSchema,
  emailCodeRequestSchema,
  emailSignInSchema,
  devLoginRequestSchema,
  inviteTokenRequestSchema,
  updateMeRequestSchema,
} from '@kids-chores/contracts';
import { passkeyLoginSchema, passkeyRegisterSchema } from './schema';

export class DevLoginDto extends createZodDto(devLoginRequestSchema) {}

export class PasskeyRegisterDto extends createZodDto(passkeyRegisterSchema) {}

export class PasskeyLoginDto extends createZodDto(passkeyLoginSchema) {}

export class ContactRequestDto extends createZodDto(contactRequestSchema) {}

export class InviteTokenDto extends createZodDto(inviteTokenRequestSchema) {}

export class CreateInviteDto extends createZodDto(createInviteRequestSchema) {}

export class EmailCodeRequestDto extends createZodDto(emailCodeRequestSchema) {}

export class EmailCodeCheckDto extends createZodDto(emailCodeCheckSchema) {}

export class EmailSignInDto extends createZodDto(emailSignInSchema) {}

export class UpdateMeDto extends createZodDto(updateMeRequestSchema) {}
