import { createZodDto } from 'nestjs-zod';
import { devLoginRequestSchema, pinCodeCheckSchema, pinCodeRequestSchema } from '@kids-chores/contracts';
import { passkeyLoginSchema, passkeyRegisterSchema } from './schema';

export class DevLoginDto extends createZodDto(devLoginRequestSchema) {}

export class PinCodeRequestDto extends createZodDto(pinCodeRequestSchema) {}

export class PinCodeCheckDto extends createZodDto(pinCodeCheckSchema) {}

export class PasskeyRegisterDto extends createZodDto(passkeyRegisterSchema) {}

export class PasskeyLoginDto extends createZodDto(passkeyLoginSchema) {}
