import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthenticatedGuard } from '../guards';
import { AuthenticatedStrategy } from './strategies';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  providers: [AuthService, AuthResolver, AuthenticatedGuard, AuthenticatedStrategy],
  exports: [AuthService],
})
export class AuthModule { }
