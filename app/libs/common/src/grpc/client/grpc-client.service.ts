import { ReflectionService } from '@grpc/reflection';
import { BaseHttpException } from '@libs/common/http/exceptions/http.exception';
import { AppLogger } from '@libs/common/logger/app-logger';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpcProxy, GrpcOptions } from '@nestjs/microservices';
import { catchError, map, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import {
  convertGrpcStatusToHttpStatus,
  parseGrpcDetail,
} from '../exceptions/utils';
import { GRPC_CLIENT_CONFIG } from './const';

@Injectable()
export class GrpcClient extends ClientGrpcProxy {
  private readonly clientLogger = new AppLogger('GrpcClient');

  constructor(@Inject(GRPC_CLIENT_CONFIG) config: GrpcOptions['options']) {
    super({
      ...config,
      maxMetadataSize: 1024 * 1024 * 10,
      maxReceiveMessageLength: 1024 * 1024 * 10,
      maxSendMessageLength: 1024 * 1024 * 10,
      keepalive: {
        keepaliveTimeMs: 10000,
        keepaliveTimeoutMs: 5000,
      },
      gracefulShutdown: true,
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    });
  }

  getService<T extends object>(name: string): T {
    const grpcClient = this.createClientByServiceName(name);
    const clientRef = this.getClient(name);
    if (!clientRef) {
      throw new Error(`Invalid grpc service: ${name}`);
    }
    const protoMethods = Object.keys(clientRef[name].prototype);
    const grpcService: any = {};
    for (const m of protoMethods) {
      const grpcMethod = this.createServiceMethod(grpcClient, m);
      grpcService[m] = this.wrap.bind(this, grpcMethod, name, m);
    }
    return grpcService;
  }

  private wrap(
    // biome-ignore lint: Function type is needed here
    fn: Function,
    serviceName: string,
    methodName: string,
    ...args: any[]
  ): any {
    const ret: Observable<unknown> = fn.apply(this, args);
    return ret.pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        this.clientLogger.error(
          `Failed to call grpc to method ${serviceName}.${methodName}`,
          {
            methodName,
            serviceName,
            details: err.details,
            code: err.code,
          },
        );

        if (!err.code || !err.details) {
          return throwError(() => err);
        }

        try {
          const { name } = err;
          const { code, message, info } = parseGrpcDetail(err.details);
          const httpCode = convertGrpcStatusToHttpStatus(code);
          return throwError(
            () => new BaseHttpException(name, httpCode, message, info),
          );
        } catch (parseErr) {
          this.logger.error('can not deserialize grpc error', parseErr);
        }

        return throwError(() => err);
      }),
    );
  }
}
