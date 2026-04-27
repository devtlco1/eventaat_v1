import { Controller, Get } from '@nestjs/common';
import { APP_NAME } from '@eventaat/shared';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok', app: APP_NAME, timestamp: new Date().toISOString() };
  }
}
