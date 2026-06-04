import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@ApiTags('cart')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  async getCart(@Session() session: UserSession, @Res() response: Response) {
    try {
      const cart = await this.cartService.getCart(session.user.id);
      return new Representation('Cart retrieved successfully', cart, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @Session() session: UserSession,
    @Body() payload: AddCartItemDto,
    @Res() response: Response,
  ) {
    try {
      const cart = await this.cartService.addItem(session.user.id, payload);
      return new Representation('Cart updated successfully', cart, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(
    @Session() session: UserSession,
    @Param('itemId') itemId: string,
    @Body() payload: UpdateCartItemDto,
    @Res() response: Response,
  ) {
    try {
      const cart = await this.cartService.updateItem(session.user.id, itemId, payload);
      return new Representation('Cart updated successfully', cart, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove cart item' })
  async removeItem(
    @Session() session: UserSession,
    @Param('itemId') itemId: string,
    @Res() response: Response,
  ) {
    try {
      const cart = await this.cartService.removeItem(session.user.id, itemId);
      return new Representation('Cart updated successfully', cart, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
