import { GrpcExceptionFilter } from '@libs/common/grpc/grpc.filter';
import { USER_GRPC_PROTO_PATHS } from '@libs/common/grpc/options/user-grpc-option';
import { USER_GRPC_PACKAGES } from '@libs/common/grpc/options/user-grpc-option';
import { CreateGrpcServerOptions } from '@libs/common/grpc/options/utils';
import { createLoggerTransports } from '@libs/common/logger/transports';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: CreateGrpcServerOptions(
      Number(process.env.USER_GRPC_PORT!),
      USER_GRPC_PACKAGES,
      USER_GRPC_PROTO_PATHS,
    ),
    logger: WinstonModule.createLogger({
      level: 'info',
      transports: createLoggerTransports(process.env.ENV === 'local', 'user'),
    }),
  });

  app.useGlobalFilters(new GrpcExceptionFilter());

  await app.listen();
}

bootstrap();
