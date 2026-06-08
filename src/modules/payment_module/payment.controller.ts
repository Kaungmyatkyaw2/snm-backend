import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { PaymentTransactionQueryDto } from './dto/payment-transaction-query.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
@ApiTags('payment')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Get current user payment transactions' })
  async getMyPaymentTransactions(
    @Session() session: UserSession,
    @Query() query: PaymentTransactionQueryDto,
    @Res() response: Response,
  ) {
    try {
      const transactions =
        await this.paymentService.getMyPaymentTransactions(
          session.user.id,
          query,
        );
      return new Representation(
        'Payment transactions retrieved successfully',
        transactions,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
