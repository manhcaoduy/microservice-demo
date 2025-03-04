import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { GcpLogger } from '../logger/gcp-logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new GcpLogger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        this.logger.error(error.message, {}, error);
        throw error;
      }),
    );
  }
}
