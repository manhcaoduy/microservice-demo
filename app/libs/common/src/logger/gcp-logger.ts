import { Logger } from '@nestjs/common';

export const FATAL_TAG = '[FATAL]';
export const LOG_SEPARATOR = '$#$#$@$$#';

export class GcpLogger {
  private logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  private stringify(message: string, payload: Record<string, any>) {
    return `${message}${LOG_SEPARATOR}${JSON.stringify(payload)}`;
  }

  private prepareLogPayload(
    payload?: object,
    err?: Error,
  ): Record<string, any> {
    const processedPayload: Record<string, any> =
      payload === undefined ? {} : { ...payload };
    if (err) {
      processedPayload.error = { msg: err.message, stack: err.stack };
    }
    return processedPayload;
  }

  debug(message: string, payload?: object) {
    this.logger.debug(this.stringify(message, this.prepareLogPayload(payload)));
  }

  info(message: string, payload?: object, err?: Error) {
    this.logger.log(
      this.stringify(message, this.prepareLogPayload(payload, err)),
    );
  }

  // alias for info
  log = this.info;

  warn(message: string, payload?: object, err?: Error) {
    this.logger.warn(
      this.stringify(message, this.prepareLogPayload(payload, err)),
    );
  }

  error(message: string, payload?: object, err?: Error) {
    this.logger.error(
      this.stringify(message, this.prepareLogPayload(payload, err)),
    );
  }

  fatal(message: string, payload?: object, err?: Error) {
    this.logger.error(
      this.stringify(
        `${FATAL_TAG} ${message}`,
        this.prepareLogPayload(payload, err),
      ),
    );
  }
}
