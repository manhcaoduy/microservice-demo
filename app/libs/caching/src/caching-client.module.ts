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
            REDIS_URL: Joi.string().required(),
          }),
        }),
      ],
      providers: [
        {
          provide: REDIS_KEYV_INSTANCE,
          useFactory: (configService: ConfigService) => {
            const redisUrl = configService.get('REDIS_URL');
            const store = new KeyvRedis(redisUrl);
            return new Keyv({
              store,
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
