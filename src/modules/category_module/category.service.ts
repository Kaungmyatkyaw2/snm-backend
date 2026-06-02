import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PublicListingQueryDto } from '../shared/dto/public-listing-query.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(query: PublicListingQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where = { status: 'active' as const };

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          sortOrder: true,
          description: true,
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data, total };
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        sortOrder: true,
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

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
