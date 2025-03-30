import { DynamicModule } from '@nestjs/common';
import { GrpcOptions } from '@nestjs/microservices';
import { GRPC_CLIENT_CONFIG } from './const';
import { GrpcClient } from './grpc-client.service';

export class GrpcClientModule {
  static forAsync(options: GrpcOptions['options']): DynamicModule {
    return {
      module: GrpcClientModule,
      providers: [
        {
          provide: GRPC_CLIENT_CONFIG,
          useValue: options,
        },
        GrpcClient,
      ],
      exports: [GrpcClient],
    };
  }
}
