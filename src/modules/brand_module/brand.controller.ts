import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { PublicListingQueryDto } from '../shared/dto/public-listing-query.dto';
import { BrandService } from './brand.service';

@Controller('brand')
@ApiTags('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get active brands' })
  @ApiResponse({ status: 200, description: 'Brands retrieved successfully' })
  async getBrands(@Query() query: PublicListingQueryDto, @Res() response: Response) {
    try {
      const { data, total } = await this.brandService.getBrands(query);
      return new Representation('Brands retrieved successfully', data, response, total, query.limit).send();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get(':slug')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get brand by slug' })
  async getBrandBySlug(@Param('slug') slug: string, @Res() response: Response) {
    try {
      const brand = await this.brandService.getBrandBySlug(slug);
      return new Representation('Brand retrieved successfully', brand, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
