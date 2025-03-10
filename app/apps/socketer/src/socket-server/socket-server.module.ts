import { RedisClientModule } from '@libs/socket/redis-client/redis.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { SocketServerService } from './socket-server.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        SOCKETER_SERVICE_PORT: Joi.number().required(),
      }),
    }),
    RedisClientModule,
  ],
  providers: [SocketServerService],
})
export class SocketServerModule {}
