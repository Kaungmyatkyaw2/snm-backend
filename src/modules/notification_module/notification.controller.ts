import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
@ApiTags('notification')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  async getMyNotifications(
    @Session() session: UserSession,
    @Query() query: NotificationQueryDto,
    @Res() response: Response,
  ) {
    try {
      const notifications = await this.notificationService.getMyNotifications(
        session.user.id,
        query,
      );
      return new Representation(
        'Notifications retrieved successfully',
        notifications,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get current user unread notification count' })
  async getUnreadCount(
    @Session() session: UserSession,
    @Res() response: Response,
  ) {
    try {
      const count = await this.notificationService.getUnreadCount(
        session.user.id,
      );
      return new Representation(
        'Unread notification count retrieved successfully',
        count,
        response,
      ).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a current user notification as read' })
  async markRead(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const result = await this.notificationService.markRead(
        session.user.id,
        id,
      );
      return new Representation(
        'Notification marked as read successfully',
        result,
        response,
      ).sendMutate();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
