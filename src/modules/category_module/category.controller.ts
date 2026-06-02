import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { PublicListingQueryDto } from '../shared/dto/public-listing-query.dto';
import { CategoryService } from './category.service';

@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get active categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories(@Query() query: PublicListingQueryDto, @Res() response: Response) {
    try {
      const { data, total } = await this.categoryService.getCategories(query);
      return new Representation('Categories retrieved successfully', data, response, total, query.limit).send();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get(':slug')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get category by slug' })
  async getCategoryBySlug(@Param('slug') slug: string, @Res() response: Response) {
    try {
      const category = await this.categoryService.getCategoryBySlug(slug);
      return new Representation('Category retrieved successfully', category, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
