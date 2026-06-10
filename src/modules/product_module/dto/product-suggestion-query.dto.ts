import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ProductSuggestionQueryDto {
  @ApiProperty({ description: 'Partial product name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  query: string;

  @ApiPropertyOptional({ default: 8, maximum: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 8;
}
