import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../../config';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthenticatedStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt_secret,
      passReqToCallback: true,
    });
  }

  async validate(_req: unknown, payload: { user_id: string; session_id: string }) {
    const session = await this.authService.checkSession(
      payload.user_id,
      payload.session_id,
    );

    return {
      user_id: session.user.id,
      session_id: session.id,
      role: session.user.role,
    };
  }
}

