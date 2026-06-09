import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpsertAddressDto } from './dto/upsert-address.dto';

const addressSelect = {
  id: true,
  label: true,
  firstName: true,
  lastName: true,
  phone: true,
  postalCode: true,
  prefecture: true,
  city: true,
  addressLine1: true,
  addressLine2: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async lookupPostalCode(postalCode: string) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(postalCode)}&country=JP&format=json&accept-language=en&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ShweNyarMyayMobile/1.0',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Postal code lookup is temporarily unavailable');
    }

    const payload: unknown = await response.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return { city: null, address: null };
    }

    const firstResult = payload[0] as {
      display_name?: unknown;
      address?: {
        state?: unknown;
        city?: unknown;
        county?: unknown;
        suburb?: unknown;
        town?: unknown;
        village?: unknown;
      };
    };
    const displayName =
      typeof firstResult.display_name === 'string'
        ? firstResult.display_name
        : '';
    const parts = displayName.split(', ').filter(Boolean);
    const city =
      parts.length > 1 ? parts.slice(0, -1).reverse().join(', ') : null;
    const addressDetails = firstResult.address;
    const prefecture =
      typeof addressDetails?.state === 'string' ? addressDetails.state : null;
    const cityCandidates = [
      addressDetails?.city,
      addressDetails?.county,
      addressDetails?.town,
      addressDetails?.village,
    ];
    const resolvedCity =
      cityCandidates.find(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0,
      ) ?? city;
    const addressCandidates = [
      addressDetails?.suburb,
      addressDetails?.town,
      addressDetails?.village,
    ];
    const address =
      addressCandidates.find(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0,
      ) ?? null;

    return {
      prefecture,
      city: resolvedCity || null,
      address,
    };
  }

  async getMyAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      select: addressSelect,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getAddressById(userId: string, id: string) {
    await this.assertOwnership(userId, id);

    return this.prisma.userAddress.findUnique({
      where: { id },
      select: addressSelect,
    });
  }

  async addAddress(userId: string, payload: UpsertAddressDto) {
    return this.prisma.$transaction(async (tx) => {
      const existingCount = await tx.userAddress.count({ where: { userId } });
      const shouldSetDefault = payload.isDefault || existingCount === 0;

      if (shouldSetDefault) {
        await tx.userAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.userAddress.create({
        data: {
          userId,
          label: payload.label?.trim() || 'Home',
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          phone: payload.phone.trim(),
          postalCode: payload.postalCode.trim(),
          prefecture: payload.prefecture?.trim() || null,
          city: payload.city.trim(),
          addressLine1: payload.addressLine1.trim(),
          addressLine2: payload.addressLine2?.trim() || null,
          isDefault: shouldSetDefault,
        },
        select: addressSelect,
      });
    });
  }

  async updateAddress(userId: string, id: string, payload: UpsertAddressDto) {
    await this.assertOwnership(userId, id);

    return this.prisma.$transaction(async (tx) => {
      if (payload.isDefault) {
        await tx.userAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.userAddress.update({
        where: { id },
        data: {
          label: payload.label?.trim() || 'Home',
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          phone: payload.phone.trim(),
          postalCode: payload.postalCode.trim(),
          prefecture: payload.prefecture?.trim() || null,
          city: payload.city.trim(),
          addressLine1: payload.addressLine1.trim(),
          addressLine2: payload.addressLine2?.trim() || null,
          isDefault: Boolean(payload.isDefault),
        },
        select: addressSelect,
      });
    });
  }

  async deleteAddress(userId: string, id: string) {
    const existing = await this.prisma.userAddress.findUnique({
      where: { id },
      select: { id: true, isDefault: true },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    await this.assertOwnership(userId, id);

    const remaining = await this.prisma.userAddress.findMany({
      where: { userId, id: { not: id } },
      orderBy: [{ createdAt: 'asc' }],
      select: { id: true },
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.userAddress.delete({ where: { id } });

      if (existing.isDefault && remaining[0]) {
        await tx.userAddress.update({
          where: { id: remaining[0].id },
          data: { isDefault: true },
        });
      }

      return { id };
    });
  }

  async setDefaultAddress(userId: string, id: string) {
    await this.assertOwnership(userId, id);

    return this.prisma.$transaction(async (tx) => {
      await tx.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      return tx.userAddress.update({
        where: { id },
        data: { isDefault: true },
        select: addressSelect,
      });
    });
  }

  private async assertOwnership(userId: string, id: string) {
    const address = await this.prisma.userAddress.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (address?.userId !== userId) {
      throw new NotFoundException('Address not found');
    }
  }
}
