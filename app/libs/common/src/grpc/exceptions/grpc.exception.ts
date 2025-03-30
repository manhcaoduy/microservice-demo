import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export interface IBaseGrpcException {
  code: status;
  message: string;
  info: BaseGrpcExceptionInfo;
}

export interface BaseGrpcExceptionInfo {
  code?: string;
  metadata?: any;
}

export class BaseGrpcException
  extends RpcException
  implements IBaseGrpcException
{
  code: status;
  info: BaseGrpcExceptionInfo;

  constructor(
    name: string,
    code: status,
    message: string,
    info: BaseGrpcExceptionInfo = {},
  ) {
    super({
      message,
      code,
    });
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.code = code;
    this.info = info;
    Error.captureStackTrace(this);
  }
}
