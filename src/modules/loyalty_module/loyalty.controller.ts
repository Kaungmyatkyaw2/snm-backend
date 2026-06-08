import { BadRequestException, Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { LoyaltyService } from './loyalty.service';

@Controller('loyalty')
@ApiTags('loyalty')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get current user loyalty wallet' })
  async getMyWallet(@Session() session: UserSession, @Res() response: Response) {
    try {
      const wallet = await this.loyaltyService.getMyWallet(session.user.id);
      return new Representation(
        'Loyalty wallet retrieved successfully',
        wallet,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
