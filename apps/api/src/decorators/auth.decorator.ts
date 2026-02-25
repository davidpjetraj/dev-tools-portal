import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthenticatedGuard } from '../guards/authenticated.guard';

export function Auth() {
  return applyDecorators(UseGuards(AuthenticatedGuard));
}
