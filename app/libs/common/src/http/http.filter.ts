import {
  HTTP_ERROR_CODES,
  HTTP_RESPONSE_STATUS,
} from '@libs/common/http/exceptions/exception.constant';
import { BaseHttpException } from '@libs/common/http/exceptions/http.exception';
import { AppLogger } from '@libs/common/logger/app-logger';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

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
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new AppLogger(HttpExceptionFilter.name);

  catch(err: Error, host: ArgumentsHost) {
    this.logger.error(err.message, {}, err);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (err instanceof HttpException) {
      status = err.getStatus();
    }

    let customCode = HTTP_ERROR_CODES.PROBLEM_WITH_REQUEST;
    let metadata = undefined;
    if (err instanceof BaseHttpException) {
      customCode = err.getInfo()?.code ?? customCode;
      metadata = err.getInfo()?.metadata ?? metadata;
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
      },
    });
  }
}
