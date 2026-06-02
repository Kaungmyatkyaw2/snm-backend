import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PublicListingQueryDto } from '../shared/dto/public-listing-query.dto';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  async getBrands(query: PublicListingQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where = { status: 'active' as const };

    const [data, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logoUrl: true,
          websiteUrl: true,
        },
      }),
      this.prisma.brand.count({ where }),
    ]);

    return { data, total };
  }

  async getBrandBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        websiteUrl: true,
        products: {
          where: { status: 'active' },
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnailUrl: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }
}
