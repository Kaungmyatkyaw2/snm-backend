import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AllowAnonymous,
  AuthGuard,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { AuthAppService } from './auth.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Controller('account')
@ApiTags('auth')
export class AuthAppController {
  constructor(private readonly authService: AuthAppService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user session' })
  async getMe(@Session() session: UserSession, @Res() response: Response) {
    try {
      const user = await this.authService.getCurrentUser(session.user.id);
      return new Representation(
        'Authenticated user retrieved successfully',
        user,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Patch('onboarding')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete current user onboarding profile' })
  async completeOnboarding(
    @Session() session: UserSession,
    @Body() payload: CompleteOnboardingDto,
    @Res() response: Response,
  ) {
    try {
      const user = await this.authService.completeOnboarding(
        session.user.id,
        payload,
      );
      return new Representation(
        'Onboarding profile completed successfully',
        user,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get('health')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Check auth module health' })
  async health(@Res() response: Response) {
    return new Representation(
      'Better Auth is configured',
      { ok: true },
      response,
    ).sendSingle();
  }
}
