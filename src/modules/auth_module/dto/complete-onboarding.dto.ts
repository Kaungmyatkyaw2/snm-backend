import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CompleteOnboardingDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone: string;
}
