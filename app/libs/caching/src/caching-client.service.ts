import { Inject, Injectable } from '@nestjs/common';
import { Keyv } from 'cacheable';
import { MEMORY_KEYV_INSTANCE, REDIS_KEYV_INSTANCE } from './const';

abstract class BaseCacheService {
  constructor(private readonly keyv: Keyv) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.keyv.get(key);
  }

  async set<T>(
    key: string,
    value: T,
    ttlInMillisecond?: number,
  ): Promise<boolean> {
    console.log({ key, value });
    return this.keyv.set(key, value, ttlInMillisecond);
  }

  async delete(key: string): Promise<boolean> {
    return this.keyv.delete(key);
  }

  async clear(): Promise<void> {
    return this.keyv.clear();
  }
}

@Injectable()
export class RedisCacheService extends BaseCacheService {
  constructor(@Inject(REDIS_KEYV_INSTANCE) keyv: Keyv) {
    super(keyv);
  }
}

@Injectable()
export class MemoryCacheService extends BaseCacheService {
  constructor(@Inject(MEMORY_KEYV_INSTANCE) keyv: Keyv) {
    super(keyv);
  }
}
