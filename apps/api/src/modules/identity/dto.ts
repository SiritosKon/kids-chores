import { createZodDto } from 'nestjs-zod';
import { devLoginRequestSchema, profileUpdateRequestSchema } from '@kids-chores/contracts';
import { passkeyLoginSchema, passkeyRegisterSchema } from './schema';

export class DevLoginDto extends createZodDto(devLoginRequestSchema) {}

export class ProfileUpdateDto extends createZodDto(profileUpdateRequestSchema) {}

export class PasskeyRegisterDto extends createZodDto(passkeyRegisterSchema) {}

export class PasskeyLoginDto extends createZodDto(passkeyLoginSchema) {}
