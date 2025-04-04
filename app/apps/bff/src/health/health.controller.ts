import { Controller, Get } from '@nestjs/common';
import { HealthServiceClient } from '@libs/common/grpc/node/health/health.pb';
import { HEALTH_SERVICE } from '@libs/common/grpc/options/health-grpc-option';
import { Public } from '@libs/common/auth/public.decorator';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(HEALTH_SERVICE)
    private readonly healthClient: HealthServiceClient,
  ) {}

  @Public() 
  @Get()
  async checkHealth() {
    const { status } = await lastValueFrom(this.healthClient.check({}));
    return { status };
  }
}