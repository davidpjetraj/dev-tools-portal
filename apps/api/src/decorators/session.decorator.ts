import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export type SessionKey = 'user_id' | 'session_id' | 'role';

export interface ISession {
  user_id: string;
  session_id: string;
  role: string;
}

export const SessionDecorator = createParamDecorator(
  (data: SessionKey | undefined, context: ExecutionContext): ISession | string => {
    const ctx = GqlExecutionContext.create(context);
    const session = ctx.getContext().req?.user as ISession | undefined;

    if (!session) {
      throw new UnauthorizedException('Not authorized');
    }

    if (data) {
      return session[data] as string;
    }
    return session;
  },
);
