import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { APP_NAME } from '@eventaat/shared';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'API health check' })
  @ApiOkResponse({
    description: 'Service is running. Returns liveness, app name, and response time.',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponseDto {
    return { status: 'ok', app: APP_NAME, timestamp: new Date().toISOString() };
  }
}
