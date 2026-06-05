import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@ApiTags('wishlist')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  async getMyWishlist(@Session() session: UserSession, @Res() response: Response) {
    try {
      const items = await this.wishlistService.getMyWishlist(session.user.id);
      return new Representation('Wishlist retrieved successfully', items, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get('count')
  @ApiOperation({ summary: 'Get current user wishlist count' })
  async getWishlistCount(@Session() session: UserSession, @Res() response: Response) {
    try {
      const count = await this.wishlistService.getWishlistCount(session.user.id);
      return new Representation('Wishlist count retrieved successfully', count, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if a product is wishlisted' })
  async isWishlisted(
    @Session() session: UserSession,
    @Param('productId') productId: string,
    @Res() response: Response,
  ) {
    try {
      const result = await this.wishlistService.isWishlisted(session.user.id, productId);
      return new Representation('Wishlist status retrieved successfully', result, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  async addToWishlist(
    @Session() session: UserSession,
    @Body() payload: AddWishlistItemDto,
    @Res() response: Response,
  ) {
    try {
      const item = await this.wishlistService.addToWishlist(session.user.id, payload.productId);
      return new Representation('Added to wishlist successfully', item, response).sendMutate();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async removeFromWishlist(
    @Session() session: UserSession,
    @Param('productId') productId: string,
    @Res() response: Response,
  ) {
    try {
      const item = await this.wishlistService.removeFromWishlist(session.user.id, productId);
      return new Representation('Removed from wishlist successfully', item, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
