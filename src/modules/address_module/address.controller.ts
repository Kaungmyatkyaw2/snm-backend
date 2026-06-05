import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { Representation } from 'src/common/helpers/representation.helper';
import { AddressService } from './address.service';
import { UpsertAddressDto } from './dto/upsert-address.dto';

@Controller('address')
@ApiTags('address')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user addresses' })
  async getMyAddresses(@Session() session: UserSession, @Res() response: Response) {
    try {
      const addresses = await this.addressService.getMyAddresses(session.user.id);
      return new Representation('Addresses retrieved successfully', addresses, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get current user address by id' })
  async getAddressById(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const address = await this.addressService.getAddressById(session.user.id, id);
      return new Representation('Address retrieved successfully', address, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create address' })
  async addAddress(
    @Session() session: UserSession,
    @Body() payload: UpsertAddressDto,
    @Res() response: Response,
  ) {
    try {
      const address = await this.addressService.addAddress(session.user.id, payload);
      return new Representation('Address created successfully', address, response).sendMutate();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() payload: UpsertAddressDto,
    @Res() response: Response,
  ) {
    try {
      const address = await this.addressService.updateAddress(session.user.id, id, payload);
      return new Representation('Address updated successfully', address, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  async setDefaultAddress(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const address = await this.addressService.setDefaultAddress(session.user.id, id);
      return new Representation('Default address updated successfully', address, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const result = await this.addressService.deleteAddress(session.user.id, id);
      return new Representation('Address deleted successfully', result, response).sendSingle();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
