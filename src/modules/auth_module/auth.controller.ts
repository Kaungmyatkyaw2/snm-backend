import {
  BadRequestException,
  Controller,
  Get,
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

@Controller('auth')
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
