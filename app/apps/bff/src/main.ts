import { AuthGuard } from '@libs/common/auth/auth.guard';
import { BaseHttpException } from '@libs/common/http/exceptions/http.exception';
import { HttpExceptionFilter } from '@libs/common/http/http.filter';
import { HttpInterceptor } from '@libs/common/http/http.interceptor';
import { createLoggerTransports } from '@libs/common/logger/transports';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      level: 'info',
      transports: createLoggerTransports(process.env.ENV === 'local', 'bff'),
    }),
  });

  const authGuard = app.get(AuthGuard);
  app.useGlobalGuards(authGuard);

  app.useGlobalFilters(new HttpExceptionFilter());
  // Add global interceptors
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new HttpInterceptor(),
  );

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );
  app.enableCors({ credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const metadata = errors.map((error) => ({
          property: error.property,
          message: error.constraints ? Object.values(error.constraints)[0] : '',
        }));
        return new BaseHttpException(
          'Invalid Parameter',
          HttpStatus.BAD_REQUEST,
          'parameter must be valid',
          { metadata },
        );
      },
    }),
  );

  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .addServer(configService.get('BFF_SERVICE_URL')!)
    .setTitle('BFF API')
    .setDescription('The BFF API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Add global security to the generated document
  document.security = [{ JWT: [] }];

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(configService.get('BFF_SERVICE_PORT')!);
}

bootstrap();
