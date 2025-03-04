import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from '@libs/common/interceptors/transform-response.interceptor';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AllExceptionFilter } from '@libs/common/filters/all-exception.filter';
import { BaseException } from '@libs/common/exceptions/http.exception';
import { LoggingInterceptor } from '@libs/common/interceptors/logging.interceptor';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { createLoggerTransports } from '@libs/common/logger/transports';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      level: 'info',
      transports: createLoggerTransports(process.env.LOCAL === 'true', 'bff'),
    }),
  });

  app.useGlobalFilters(new AllExceptionFilter());
  // Add global interceptors
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformResponseInterceptor(),
  );

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );
  app.enableCors();

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
        return new BaseException(
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

  const loggingInterceptor = app.get(LoggingInterceptor);
  app.useGlobalInterceptors(loggingInterceptor);

  await app.listen(configService.get('BFF_SERVICE_PORT')!);
}

bootstrap();
