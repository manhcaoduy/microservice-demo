import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  generatePasswordHash(password: string): string {
    const secretKey = this.configService.get('PASSWORD_SECRET_KEY')!;
    return crypto
      .createHmac('sha256', secretKey)
      .update(password)
      .digest('hex');
  }

  async generateAccessToken(userId: string) {
    const payload = {
      userId,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });
  }

  async generateRefreshToken(userId: string) {
    const payload = {
      userId,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: '1m',
    });
  }

  async validateToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
    return payload.userId;
  }
}
