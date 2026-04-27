import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LogoutBodyDto {
  @ApiPropertyOptional({ description: 'If set, must match the session in the access token' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
