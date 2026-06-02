import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const PRODUCT_SORT_OPTIONS = ['newest', 'price-low', 'price-high'] as const;

export class ProductQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 12;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shipping_type?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  brand_slugs?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_price?: number;

  @ApiPropertyOptional({ enum: PRODUCT_SORT_OPTIONS })
  @IsOptional()
  @IsEnum(PRODUCT_SORT_OPTIONS)
  sort?: 'newest' | 'price-low' | 'price-high';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
