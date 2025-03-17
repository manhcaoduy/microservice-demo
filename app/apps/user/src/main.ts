import { LoggingInterceptor } from '@libs/common/interceptors/logging.interceptor';
import { createLoggerTransports } from '@libs/common/logger/transports';
import {
  USER_GRPC_PACKAGES,
  USER_GRPC_PROTO_PATHS,
} from '@libs/grpc/client-options/user-grpc-client-option';
import { createGrpcClientOptions } from '@libs/grpc/client-options/utils';
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    ...createGrpcClientOptions(
      `0.0.0.0:${process.env.USER_GRPC_PORT!}`,
      USER_GRPC_PACKAGES,
      USER_GRPC_PROTO_PATHS,
    ),
    logger: WinstonModule.createLogger({
      level: 'info',
      transports: createLoggerTransports(process.env.ENV === 'local', 'user'),
    }),
  });

  const loggingInterceptor = app.get(LoggingInterceptor);
  app.useGlobalInterceptors(loggingInterceptor);

  await app.listen();
}

bootstrap();
