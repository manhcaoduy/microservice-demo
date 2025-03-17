import { AppCacheModule } from '@libs/caching/caching-client.module';

import { UserModule } from './user/user.module';

import { LoggingInterceptor } from '@libs/common/interceptors/logging.interceptor';
import { PostgresModule } from '@libs/postgres/postgres.module';
import { RedisClientModule } from '@libs/socket/redis-client/redis.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        USER_GRPC_PORT: Joi.number().required(),
      }),
    }),
    PostgresModule,
    UserModule,
    AppCacheModule.registerWithMemory(),
    AppCacheModule.registerWithRedis({ ttl: 100 }),
    RedisClientModule,
  ],
  providers: [LoggingInterceptor],
})
export class AppModule {}
