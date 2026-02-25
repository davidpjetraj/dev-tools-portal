import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GraphQLThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    try {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      if (ctx?.req && ctx?.res) {
        return { req: ctx.req, res: ctx.res };
      }
    } catch {
      // Not a GraphQL context
    }
    return super.getRequestResponse(context);
  }
}
