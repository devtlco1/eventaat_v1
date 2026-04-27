import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const PURPOSES = ['login', 'register', 'phone_verification', 'staff_invite'] as const;
const CHANNELS = ['whatsapp', 'sms', 'manual'] as const;

export class RequestOtpDto {
  @ApiProperty({ example: '+9647XXXXXXXXX', description: 'Phone number (Iraq formats accepted)' })
  @IsString()
  @MinLength(8)
  phone!: string;

  @ApiProperty({ enum: PURPOSES, example: 'login' })
  @IsIn([...PURPOSES])
  purpose!: (typeof PURPOSES)[number];

  @ApiProperty({ enum: CHANNELS, example: 'whatsapp' })
  @IsIn([...CHANNELS])
  channel!: (typeof CHANNELS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;
}
