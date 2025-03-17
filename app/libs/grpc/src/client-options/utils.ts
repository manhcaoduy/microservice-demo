import { join } from 'path';
import { ReflectionService } from '@grpc/reflection';
import { GrpcOptions, Transport } from '@nestjs/microservices';

export function createGrpcClientOptions(
  url: string,
  packageNames: string[],
  protoPaths: string[],
): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      url,
      package: packageNames,
      protoPath: protoPaths.map((path) =>
        join(__dirname, `../../../proto/${path}`),
      ),
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  };
}
