import { AuthGuard } from '@libs/common/auth/auth.guard';
import { AuthModule } from '@libs/common/auth/auth.module';
import { USER_SERVICE_NAME } from '@libs/common/grpc/node/user/user.pb';
import {
  USER_GRPC_PACKAGES,
  USER_GRPC_PROTO_PATHS,
  USER_SERVICE,
} from '@libs/common/grpc/options/user-grpc-option';
import { HEALTH_SERVICE_NAME } from '@libs/common/grpc/node/health/health.pb';
import {
  HEALTH_GRPC_PACKAGES,
  HEALTH_GRPC_PROTO_PATHS,
  HEALTH_SERVICE,
} from '@libs/common/grpc/options/health-grpc-option';
import { GrpcServiceModule } from '@libs/common/grpc/service/grpc-service.module';
import { HttpInterceptor } from '@libs/common/http/http.interceptor';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserModule } from './users/user.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        BFF_SERVICE_URL: Joi.string().required(),
        BFF_SERVICE_PORT: Joi.number().required(),
      }),
    }),
    HealthModule,
    UserModule,
    AuthModule,
    GrpcServiceModule.forAsync(
      {
        url: 'localhost:50051',
        package: USER_GRPC_PACKAGES,
        protoPath: USER_GRPC_PROTO_PATHS,
      },
      [
        {
          providerName: USER_SERVICE,
          serviceName: USER_SERVICE_NAME,
        },
      ],
    ),
    GrpcServiceModule.forAsync(
      {
        url: 'localhost:50053',
        package: HEALTH_GRPC_PACKAGES,
        protoPath: HEALTH_GRPC_PROTO_PATHS,
      },
      [
        {
          providerName: HEALTH_SERVICE,
          serviceName: HEALTH_SERVICE_NAME,
        },
      ],
    ),
  ],
  providers: [HttpInterceptor, AuthGuard],
})
export class AppModule {}
