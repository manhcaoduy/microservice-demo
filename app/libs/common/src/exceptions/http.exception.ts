import { HttpException } from '@nestjs/common';

export interface BaseExceptionInfo {
  code?: string;
  metadata?: any;
}

export class BaseException extends HttpException {
  private readonly info: BaseExceptionInfo | null;

  constructor(
    name: string,
    statusCode: number,
    message: string,
    info: BaseExceptionInfo | null = null,
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
