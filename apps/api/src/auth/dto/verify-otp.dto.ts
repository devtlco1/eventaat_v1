import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MinLength, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ description: 'Challenge id from /auth/otp/request' })
  @IsString()
  @MinLength(8)
  challengeId!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(4, 8)
  @Matches(/^\d+$/)
  code!: string;

  @ApiPropertyOptional({ description: 'Optional; must match challenge if provided' })
  @IsOptional()
  @IsString()
  phone?: string;
}
