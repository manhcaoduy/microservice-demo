import { Inject, Injectable } from '@nestjs/common';
import { Emitter } from '@socket.io/redis-emitter';
import { Redis } from 'ioredis';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { REDIS_CLIENT } from '../redis-client/const';
import { SOCKET_NAMESPACE } from './const';

@Injectable()
export class SocketEmitter {
  private emitter: Emitter<DefaultEventsMap>;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
    this.emitter = new Emitter(this.redisClient).of(SOCKET_NAMESPACE);
  }

  emitEventToAllClients(eventName: string, data: any) {
    this.emitter.emit(eventName, data);
  }

  emitEventToRoom(roomId: string, eventName: string, data: any) {
    this.emitter.to(roomId).emit(eventName, data);
  }
}
