import { AppCacheModule } from '@libs/caching/caching-client.module';
import { LoggingInterceptor } from '@libs/common/interceptors/logging.interceptor';
import { PostgresModule } from '@libs/postgres/postgres.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        BFF_SERVICE_URL: Joi.string().required(),
        BFF_SERVICE_PORT: Joi.number().required(),
      }),
    }),
    PostgresModule,
    UserModule,
    AppCacheModule.registerWithMemory(),
    AppCacheModule.registerWithRedis({ ttl: 100 }),
  ],
  providers: [LoggingInterceptor],
})
export class AppModule {}
