import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC, SAFE_METHODS } from './constants';

export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC, true);

export const isTrustedOrigin = (method: string, origin: string | undefined, publicOrigin: string): boolean =>
  SAFE_METHODS.includes(method) || origin === new URL(publicOrigin).origin;
