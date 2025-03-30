import { GrpcOptions } from '@nestjs/microservices';

export const CreateGrpcServerOptions = (
  port: number,
  packages: string[],
  protoPath: string[],
): GrpcOptions['options'] => {
  return {
    url: `0.0.0.0:${port}`,
    package: packages,
    protoPath,
  };
};
