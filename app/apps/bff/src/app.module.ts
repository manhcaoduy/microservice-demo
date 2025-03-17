import { AuthGuard } from '@libs/common/auth/auth.guard';
import { AuthModule } from '@libs/common/auth/auth.module';
import { LoggingInterceptor } from '@libs/common/interceptors/logging.interceptor';
import { GrpcClientsModule } from '@libs/grpc/client-options/grpc-clients.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        BFF_SERVICE_URL: Joi.string().required(),
        BFF_SERVICE_PORT: Joi.number().required(),
      }),
    }),
    UserModule,
    AuthModule,
    GrpcClientsModule,
  ],
  providers: [LoggingInterceptor, AuthGuard],
})
export class AppModule {}
