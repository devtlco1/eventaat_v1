import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Liveness status' })
  status: string;

  @ApiProperty({ example: 'eventaat', description: 'Application name' })
  app: string;

  @ApiProperty({ example: '2026-04-27T12:00:00.000Z', description: 'Response time (ISO 8601)' })
  timestamp: string;
}
