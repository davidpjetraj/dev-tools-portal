import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { config } from '../config';
import type { SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
    constructor(private readonly jwtService: NestJwtService) { }

    /**
     * Sign a payload as a JWT with the given expiry (seconds or duration string).
     */
    sign(payload: Record<string, unknown>, expiresIn: string | number): string {
        return this.jwtService.sign(payload, {
            secret: config.jwt_secret,
            expiresIn: expiresIn as SignOptions['expiresIn'],
        });
    }

    /**
     * Verify a JWT and return its typed payload. Throws BadRequestException on failure.
     */
    verify<T extends object>(token: string): T {
        try {
            return this.jwtService.verify<T>(token, {
                secret: config.jwt_secret,
            });
        } catch {
            throw new BadRequestException('Invalid token');
        }
    }
}
