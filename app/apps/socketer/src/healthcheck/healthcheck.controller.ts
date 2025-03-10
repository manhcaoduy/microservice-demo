import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthcheckController {
  @Get('liveness')
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  readiness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
