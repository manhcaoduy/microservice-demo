import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { REDIS_CLIENT } from './const';
import { Redis } from 'ioredis';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_DB: Joi.number().required(),
      }),
    }),
  ],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const client = new Redis({
          host: configService.get<string>('REDIS_HOST')!,
          port: configService.get<number>('REDIS_PORT')!,
          password: configService.get<string>('REDIS_PASSWORD')!,
          db: configService.get<number>('REDIS_DB')!,
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisClientModule {}
