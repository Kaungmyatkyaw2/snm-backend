import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderService } from './order.service';

@Controller('order')
@ApiTags('order')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user orders' })
  async getMyOrders(
    @Session() session: UserSession,
    @Query() query: OrderQueryDto,
    @Res() response: Response,
  ) {
    try {
      const orders = await this.orderService.getMyOrders(
        session.user.id,
        query,
      );
      return new Representation(
        'Orders retrieved successfully',
        orders,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get current user order detail' })
  async getMyOrderById(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const order = await this.orderService.getMyOrderById(
        session.user.id,
        id,
      );
      return new Representation(
        'Order retrieved successfully',
        order,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
