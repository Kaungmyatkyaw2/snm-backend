import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductService } from './product.service';

@Controller('product')
@ApiTags('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get active products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts(@Query() query: ProductQueryDto, @Res() response: Response) {
    try {
      const { data, total } = await this.productService.getProducts(query);
      return new Representation('Products retrieved successfully', data, response, total, query.limit).send();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get(':slug')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get product by slug' })
  async getProductBySlug(@Param('slug') slug: string, @Res() response: Response) {
    try {
      const product = await this.productService.getProductBySlug(slug);
      return new Representation('Product retrieved successfully', product, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
