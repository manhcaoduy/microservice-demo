import { HTTP_RESPONSE_STATUS } from '@libs/common/http/exceptions/exception.constant';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        status: HTTP_RESPONSE_STATUS.SUCCESS,
        data,
      })),
    );
  }
}
