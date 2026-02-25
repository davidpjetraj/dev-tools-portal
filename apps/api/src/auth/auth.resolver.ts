import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RefreshTokenInput, SignInInput } from './input';
import { Auth } from '../decorators/auth.decorator';
import { SessionDecorator, ISession } from '../decorators/session.decorator';
import { AuthModel } from './model';

@Resolver(() => 'Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Mutation(() => AuthModel)
  async signIn(
    @Args('input') input: SignInInput,
    @Context() context: { clientIp?: string; req?: { ip?: string } },
  ): Promise<AuthModel> {
    const clientIp = context.clientIp ?? context.req?.ip ?? '';
    return this.authService.signIn(input.email, input.password, clientIp);
  }

  @Auth()
  @Mutation(() => Boolean)
  async logout(@SessionDecorator() session: ISession): Promise<boolean> {
    return this.authService.logout(session.user_id, session.session_id);
  }

  @Mutation(() => AuthModel)
  async refreshToken(@Args('input') input: RefreshTokenInput): Promise<AuthModel> {
    return this.authService.refreshToken(input.refresh_token);
  }
}
