import * as crypto from 'crypto';
import { User } from '@libs/postgres/entities/user.entity';
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

  async generateAccessToken(user: User) {
    const payload = {
      id: user.id,
    };
    return this.jwtService.signAsync(payload);
  }
}
