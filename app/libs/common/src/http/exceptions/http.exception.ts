import { HttpException, HttpStatus } from '@nestjs/common';

export interface BaseHttpExceptionInfo {
  code?: string;
  metadata?: any;
}

export class BaseHttpException extends HttpException {
  private readonly info: BaseHttpExceptionInfo | null;

  constructor(
    name: string,
    statusCode: HttpStatus,
    message: string,
    info: BaseHttpExceptionInfo | null = null,
  ) {
    super(message, statusCode);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.info = info;
    Error.captureStackTrace(this);
  }

  getInfo() {
    return this.info;
  }
}
