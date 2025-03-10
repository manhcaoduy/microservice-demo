import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { SocketServerModule } from './socket-server/socket-server.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        SOCKETER_HTTP_PORT: Joi.number().required(),
      }),
    }),
    SocketServerModule,
    HealthcheckModule,
  ],
})
export class AppModule {}
