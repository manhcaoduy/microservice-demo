import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import Joi from 'joi';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            PASSWORD_SECRET_KEY: Joi.string().required(),
            JWT_SECRET: Joi.string().required(),
          }),
        }),
      ],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
