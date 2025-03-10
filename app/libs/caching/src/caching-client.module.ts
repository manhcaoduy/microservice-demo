import KeyvRedis from '@keyv/redis';
import { DynamicModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { Keyv } from 'keyv';
import {
  MemoryCacheService,
  RedisCacheService,
} from './caching-client.service';
import { MEMORY_KEYV_INSTANCE, REDIS_KEYV_INSTANCE } from './const';
import { CacheOption } from './type';

@Global()
export class AppCacheModule {
  static registerWithRedis(cacheOption: CacheOption): DynamicModule {
    return {
      module: AppCacheModule,
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
          provide: REDIS_KEYV_INSTANCE,
          useFactory: (configService: ConfigService) => {
            const redisUrl = `redis://:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}/${configService.get('REDIS_DB')}`;
            return new Keyv({
              store: new KeyvRedis(redisUrl),
              useKeyPrefix: false,
              ttl: cacheOption.ttl * 1000,
              namespace: undefined,
            });
          },
          inject: [ConfigService],
        },
        RedisCacheService,
      ],
      exports: [RedisCacheService],
    };
  }

  static registerWithMemory(): DynamicModule {
    return {
      module: AppCacheModule,
      providers: [
        {
          provide: MEMORY_KEYV_INSTANCE,
          useFactory: () => {
            return new Keyv();
          },
        },
        MemoryCacheService,
      ],
      exports: [MemoryCacheService],
    };
  }
}
