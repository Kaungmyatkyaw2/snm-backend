import { BadRequestException, Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { ShippingQuoteDto } from './dto/shipping-quote.dto';

@Controller('checkout')
@ApiTags('checkout')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('meta')
  @ApiOperation({ summary: 'Get checkout meta for current user' })
  async getMeta(@Session() session: UserSession, @Res() response: Response) {
    try {
      const meta = await this.checkoutService.getCheckoutMeta(session.user.id);
      return new Representation('Checkout meta retrieved successfully', meta, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Post('shipping-quote')
  @ApiOperation({ summary: 'Calculate shipping quote for current user cart' })
  async getShippingQuote(
    @Session() session: UserSession,
    @Body() payload: ShippingQuoteDto,
    @Res() response: Response,
  ) {
    try {
      const quote = await this.checkoutService.getShippingQuote(
        session.user.id,
        payload.addressId,
      );
      return new Representation(
        'Shipping quote retrieved successfully',
        quote,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create order from current cart' })
  async createCheckout(
    @Session() session: UserSession,
    @Body() payload: CreateCheckoutDto,
    @Res() response: Response,
  ) {
    try {
      const order = await this.checkoutService.createCheckout(session.user.id, payload);
      return new Representation('Order placed successfully', order, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
