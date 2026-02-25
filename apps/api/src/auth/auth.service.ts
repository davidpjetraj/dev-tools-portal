import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { verify, hash } from 'argon2';
import { timingSafeEqual } from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
import { UserSession, UserSessionDocument } from './schemas/user-session.schema';
import { AuthModel } from './model';
import { JwtService } from '../jwt/jwt.service';
import { config } from 'src/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserSession.name) private readonly sessionModel: Model<UserSessionDocument>,
    private readonly jwtService: JwtService,
  ) { }

  async signIn(email: string, password: string, clientIp: string): Promise<AuthModel> {
    try {
      const user = await this.findUserByEmail(email);
      const isPasswordValid = await verify(user.password, password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      return await this.createSession(user._id.toString(), clientIp);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Something went wrong');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthModel> {
    try {
      const payload = this.jwtService.verify<{ user_id: string; session_id: string }>(
        refreshToken,
      );

      const session = await this.sessionModel
        .findById(payload.session_id)
        .populate('user')
        .exec();

      if (!session) {
        throw new BadRequestException('Invalid token');
      }

      let isMatch = false;
      if (
        session.refresh_token &&
        refreshToken.length === session.refresh_token.length
      ) {
        try {
          const tokenBuffer = Buffer.from(refreshToken, 'utf-8');
          const sessionTokenBuffer = Buffer.from(session.refresh_token!, 'utf-8');
          isMatch = timingSafeEqual(tokenBuffer, sessionTokenBuffer);
        } catch {
          isMatch = false;
        }
      }

      if (isMatch) {
        const accessToken = this.jwtService.sign(
          { user_id: payload.user_id, session_id: payload.session_id },
          config.access_token_expires_in,
        );

        const newRefreshToken = this.jwtService.sign(
          { user_id: payload.user_id, session_id: payload.session_id },
          config.refresh_token_expires_in,
        );

        await this.sessionModel
          .findByIdAndUpdate(payload.session_id, { refresh_token: newRefreshToken })
          .exec();

        return {
          access_token: accessToken,
          refresh_token: newRefreshToken,
        };
      }

      if (payload.user_id !== (session.user as unknown as UserDocument)._id.toString()) {
        await this.sessionModel.deleteMany({ user: payload.user_id }).exec();
        throw new UnauthorizedException();
      }
      throw new UnauthorizedException('Invalid refresh token');
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionId: string): Promise<boolean> {
    const result = await this.sessionModel
      .deleteOne({ _id: sessionId, user: userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new UnauthorizedException('Session not found');
    }
    return true;
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase(), status: 'active' })
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async createSession(userId: string, clientIp: string): Promise<AuthModel> {
    const session = await this.sessionModel.create({
      user: userId,
      ip_address: clientIp,
    });

    const accessToken = this.jwtService.sign(
      { user_id: userId, session_id: session._id.toString() },
      config.access_token_expires_in,
    );

    const refreshToken = this.jwtService.sign(
      { user_id: userId, session_id: session._id.toString() },
      config.refresh_token_expires_in,
    );

    await this.sessionModel
      .findByIdAndUpdate(session._id, { refresh_token: refreshToken })
      .exec();

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async destroySession(userId: string, currentSessionId?: string): Promise<void> {
    const query: { user: string; _id?: { $ne: string } } = { user: userId };
    if (currentSessionId) {
      query._id = { $ne: currentSessionId };
    }
    await this.sessionModel.deleteMany(query).exec();
  }

  async checkSession(userId: string, sessionId: string) {
    const session = await this.sessionModel
      .findOne({ _id: sessionId, user: userId })
      .populate('user')
      .exec();

    if (!session) {
      throw new UnauthorizedException('Not authorized to access this route');
    }

    const user = session.user as unknown as UserDocument;
    return {
      id: session._id.toString(),
      user: {
        id: user._id.toString(),
        role: user.role,
      },
    };
  }

  async seedAdminIfNeeded(): Promise<void> {
    const count = await this.userModel.countDocuments().exec();
    if (count > 0) return;

    const adminEmail = config.admin_username;
    const adminPassword = config.admin_password;

    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        'No admin user in DB and ADMIN_USERNAME/ADMIN_PASSWORD not set. Create a user manually.',
      );
      return;
    }

    const hashedPassword = await hash(adminPassword);
    await this.userModel.create({
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    });
    this.logger.log(`Admin user created: ${adminEmail}`);
  }

  async onModuleInit(): Promise<void> {
    await this.seedAdminIfNeeded();
  }
}
