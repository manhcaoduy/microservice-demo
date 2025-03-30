import { status } from '@grpc/grpc-js';
import { AppLogger } from '@libs/common/logger/app-logger';
import { Catch } from '@nestjs/common';
import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import {
  BaseGrpcException,
  BaseGrpcExceptionInfo,
} from './exceptions/grpc.exception';
import { getGrpcDetails } from './exceptions/utils';
@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new AppLogger(GrpcExceptionFilter.name);

  catch(err: Error, host: ArgumentsHost) {
    this.logger.error(err.message, {}, err);

    if (err instanceof RpcException) {
      const { message, name } = err;
      const { code } = err.getError() as { code: status };
      const info: BaseGrpcExceptionInfo =
        err instanceof BaseGrpcException ? err.info : {};

      return throwError(
        () =>
          new RpcException({
            code,
            message: getGrpcDetails(code, message, info),
          }),
      );
    }

    return throwError(() => err);
  }
}
