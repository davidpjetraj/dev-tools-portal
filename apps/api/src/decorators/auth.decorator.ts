import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthenticatedGuard, AuthenticatedGuardRest } from '../guards/authenticated.guard';

export function Auth() {
  return applyDecorators(UseGuards(AuthenticatedGuard));
}

export function AuthRest() {
  return applyDecorators(UseGuards(AuthenticatedGuardRest));
}

