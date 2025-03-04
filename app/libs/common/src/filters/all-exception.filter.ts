import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import {
  HTTP_ERROR_CODES,
  HTTP_RESPONSE_STATUS,
} from '../exceptions/exception.constant';
import { BaseException } from '../exceptions/http.exception';

interface ErrorInfo {
  code: string;
  message: string;
  metadata?: any;
}

interface ErrorResponse {
  status: HTTP_RESPONSE_STATUS;
  error: ErrorInfo;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(err: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      err instanceof HttpException
        ? err.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let customCode = HTTP_ERROR_CODES.PROBLEM_WITH_REQUEST;
    let metadata = undefined;
    if (err instanceof BaseException) {
      customCode = err.getInfo()?.code ?? customCode;
      metadata = err.getInfo()?.metadata ?? undefined;
    }

    if (err instanceof HttpException) {
      response.status(status).send(<ErrorResponse>{
        status: HTTP_RESPONSE_STATUS.ERROR,
        error: {
          code: customCode,
          message: err.message,
          metadata,
        },
      });

      return;
    }

    response.status(status).send(<ErrorResponse>{
      status: HTTP_RESPONSE_STATUS.ERROR,
      error: {
        code: HTTP_ERROR_CODES.SERVER_ERROR,
        message: 'Something wrong in server',
        metadata,
      },
    });
  }
}
