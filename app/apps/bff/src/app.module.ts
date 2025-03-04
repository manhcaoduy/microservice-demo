import { LoggingInterceptor } from '@libs/common/interceptors/logging.interceptor';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PASSWORD_SECRET_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        BFF_SERVICE_URL: Joi.string().required(),
        BFF_SERVICE_PORT: Joi.number().required(),
        LOCAL: Joi.boolean().optional(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: !!configService.get('LOCAL'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [LoggingInterceptor],
})
export class AppModule {}
