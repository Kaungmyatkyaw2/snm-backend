import { BadRequestException, Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { HeroBannerService } from './hero-banner.service';

@Controller('hero-banner')
@ApiTags('hero-banner')
export class HeroBannerController {
  constructor(private readonly heroBannerService: HeroBannerService) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get active home hero banners' })
  async getActiveBanners(@Res() response: Response) {
    try {
      const banners = await this.heroBannerService.getActiveBanners();
      return new Representation(
        'Hero banners retrieved successfully',
        banners,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
