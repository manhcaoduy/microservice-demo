import { DynamicModule, Global } from '@nestjs/common';
import { GrpcOptions } from '@nestjs/microservices';
import { GrpcClient } from '../client/grpc-client.service';
import { GrpcClientModule } from '../client/grpc-clients.module';
import { GrpcServiceOption } from '../options/type';

@Global()
export class GrpcServiceModule {
  static forAsync(
    config: GrpcOptions['options'],
    options: GrpcServiceOption[],
  ): DynamicModule {
    return {
      module: GrpcServiceModule,
      imports: [GrpcClientModule.forAsync(config)],
      providers: options.map((option) => ({
        provide: option.providerName,
        useFactory: (grpcClient: GrpcClient) =>
          grpcClient.getService(option.serviceName),
        inject: [GrpcClient],
      })),
      exports: options.map((option) => option.providerName),
    };
  }
}
