import { status } from '@grpc/grpc-js';
import { HttpStatus } from '@nestjs/common';
import { BaseGrpcExceptionInfo } from './grpc.exception';

export const GRPC_DETAIL_SEPARATOR = '@@-!-@@';

export function getGrpcDetails(
  code: status,
  message: string,
  info: BaseGrpcExceptionInfo,
): string {
  return [code, message, JSON.stringify(info)].join(GRPC_DETAIL_SEPARATOR);
}

export function parseGrpcDetail(detail: string): {
  code: status;
  message: string;
  info: BaseGrpcExceptionInfo;
} {
  const [status, message, info] = detail.split(GRPC_DETAIL_SEPARATOR);
  return {
    code: Number.parseInt(status) as status,
    message,
    info: JSON.parse(info) as BaseGrpcExceptionInfo,
  };
}

export function convertGrpcStatusToHttpStatus(code: status): HttpStatus {
  switch (code) {
    case status.OK:
      return HttpStatus.OK;
    case status.CANCELLED:
      return HttpStatus.REQUEST_TIMEOUT;
    case status.UNKNOWN:
      return HttpStatus.INTERNAL_SERVER_ERROR;
    case status.INVALID_ARGUMENT:
      return HttpStatus.BAD_REQUEST;
    case status.DEADLINE_EXCEEDED:
      return HttpStatus.REQUEST_TIMEOUT;
    case status.NOT_FOUND:
      return HttpStatus.NOT_FOUND;
    case status.ALREADY_EXISTS:
      return HttpStatus.CONFLICT;
    case status.PERMISSION_DENIED:
      return HttpStatus.FORBIDDEN;
    case status.RESOURCE_EXHAUSTED:
      return HttpStatus.TOO_MANY_REQUESTS;
    case status.FAILED_PRECONDITION:
      return HttpStatus.PRECONDITION_FAILED;
    case status.ABORTED:
      return HttpStatus.REQUEST_TIMEOUT;
    case status.OUT_OF_RANGE:
      return HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE;
    case status.UNIMPLEMENTED:
      return HttpStatus.NOT_IMPLEMENTED;
    case status.INTERNAL:
      return HttpStatus.INTERNAL_SERVER_ERROR;
    case status.UNAVAILABLE:
      return HttpStatus.SERVICE_UNAVAILABLE;
    case status.DATA_LOSS:
      return HttpStatus.INTERNAL_SERVER_ERROR;
    case status.UNAUTHENTICATED:
      return HttpStatus.UNAUTHORIZED;
  }
}
