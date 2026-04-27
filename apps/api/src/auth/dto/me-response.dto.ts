import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../../generated/client';

class MeRoleAssignmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty()
  scopeType!: string;

  @ApiProperty()
  scopeId!: string;

  @ApiProperty()
  isActive!: boolean;
}

export class MeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  phoneNormalized!: string;

  @ApiPropertyOptional()
  fullName!: string | null;

  @ApiPropertyOptional()
  city!: string | null;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ enum: UserRole })
  primaryRole!: UserRole;

  @ApiProperty()
  isPhoneVerified!: boolean;

  @ApiProperty({ type: [MeRoleAssignmentDto] })
  roleAssignments!: MeRoleAssignmentDto[];
}
