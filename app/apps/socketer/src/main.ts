import { createLoggerTransports } from '@libs/common/logger/transports';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      level: 'info',
      transports: createLoggerTransports(
        process.env.ENV === 'local',
        'socketer',
      ),
    }),
  });

  const configService = app.get(ConfigService);

  await app.listen(configService.get('SOCKETER_HTTP_PORT')!);
}
bootstrap();
