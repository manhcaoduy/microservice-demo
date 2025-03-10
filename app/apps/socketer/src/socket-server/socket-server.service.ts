import { AppLogger } from '@libs/common/logger/app-logger';
import { SOCKET_NAMESPACE } from '@libs/socket/emitter/const';
import { REDIS_CLIENT } from '@libs/socket/redis-client/const';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Namespace, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

@Injectable()
export class SocketServerService {
  private readonly logger = new AppLogger(SocketServerService.name);

  private io: Server;
  private socketNamespace: Namespace<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  >;

  constructor(
    private configService: ConfigService,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
    const port = this.configService.get<string>('SOCKETER_SERVICE_PORT')!;

    const pubClient = this.redisClient.duplicate();
    const subClient = this.redisClient.duplicate();

    this.io = new Server(Number.parseInt(port, 10), {
      adapter: createAdapter(pubClient, subClient),
      cors: {
        origin: '*',
        credentials: true,
      },
    });

    this.socketNamespace = this.io.of(SOCKET_NAMESPACE);
    this.listen();
  }

  private listen() {
    this.socketNamespace.on('connection', (socket) => {
      this.onConnection(socket);
      this.listenSocketRoomEvents(socket);
    });
    this.socketNamespace.on('disconnect', (socket) => {
      this.onDisconnection(socket);
    });
  }

  private listenSocketRoomEvents(socket: Socket) {
    socket.on('subscribe', (roomId: string) => {
      this.logger.log('Socket subscribed to room', {
        socketId: socket.id,
        roomId,
      });
      socket.join(roomId);
    });
    socket.on('unsubscribe', (roomId: string) => {
      this.logger.log('Socket unsubscribed from room', {
        socketId: socket.id,
        roomId,
      });
      socket.leave(roomId);
    });
  }

  private onConnection(socket: Socket) {
    this.logger.log('Socket connected', {
      socketId: socket.id,
    });
  }

  private onDisconnection(socket: Socket) {
    this.logger.log('Socket disconnected', {
      socketId: socket.id,
    });
  }
}
