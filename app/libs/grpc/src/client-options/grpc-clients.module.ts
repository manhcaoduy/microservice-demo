import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import * as Joi from 'joi';
import { USER_GRPC_PROTO_PATHS } from './user-grpc-client-option';
import { USER_GRPC_PACKAGES } from './user-grpc-client-option';
import { USER_GRPC_CLIENT } from './user-grpc-client-option';
import { createGrpcClientOptions } from './utils';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        USER_GRPC_URL: Joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: USER_GRPC_CLIENT,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          createGrpcClientOptions(
            configService.get('USER_GRPC_URL')!,
            USER_GRPC_PACKAGES,
            USER_GRPC_PROTO_PATHS,
          ),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcClientsModule {}
