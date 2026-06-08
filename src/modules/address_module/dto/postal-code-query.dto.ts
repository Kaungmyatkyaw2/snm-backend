import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class PostalCodeQueryDto {
  @ApiProperty({ example: '7090714' })
  @IsString()
  @Length(7, 7)
  postalCode: string;
}
