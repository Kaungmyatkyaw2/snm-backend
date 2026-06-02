import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class Representation<T> {
  message: string;
  page_count: number | null;
  D: T;
  total: number | null;
  limit: number | null;
  response: Response;
  currentPage: number;

  constructor(
    message: string,
    D: T,
    response: Response,
    total?: number,
    limit?: number,
  ) {
    this.message = message;
    this.D = D;
    this.response = response;
    this.total = total || null;
    this.currentPage = Number(this.response.req?.query.page) || 1;
    this.limit = limit || 5;
    this.page_count = Math.ceil(this.total / this.limit);
  }

  private metaGenerator() {
    const urlObj = new URL(
      this.response.req?.url || process.env.RESPONSE_URL,
      'http://example.com',
    );
    const endpoint =
      this.response.req?.url.split('?')[0] || this.response.req?.url;
    const searchParams = new URLSearchParams(urlObj.search);
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : 5;

    const meta = {
      path: process.env.RESPONSE_URL + endpoint,
      current_page: this.currentPage,
      from: (this.currentPage - 1) * limit + 1,
      to:
        Math.min(this.currentPage * limit, this.total) === this.total
          ? this.page_count
          : Math.min(this.currentPage * limit, this.total),
      total: this.total,
      last_page: this.page_count,
    };

    return meta;
  }

  private linkGenerator() {
    const modifiedUrl =
      this.response.req?.url.split('?')[0] || process.env.RESPONSE_URL;
    const urlObj = new URL(
      this.response.req?.url || process.env.RESPONSE_URL,
      'http://example.com',
    );
    const searchParams = new URLSearchParams(urlObj.search);
    const defaultSortBy = 'createdAt';
    const defaultSortDirection = 'desc';
    const sortBy = searchParams.get('sort_by') || defaultSortBy;
    const sortDirection =
      searchParams.get('sort_direction') || defaultSortDirection;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : 5;
    const page = searchParams.get('page')
      ? parseInt(searchParams.get('page')!, 10)
      : 1;
    // const q = searchParams.get('q') || '';
    const pageCount = this.page_count || 10;

    const generateQuery = (overrideParams: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(overrideParams).forEach(([key, value]) => {
        params.set(key, value.toString());
      });
      return `${process.env.RESPONSE_URL}${modifiedUrl}?${params.toString()}`;
    };

    return {
      first: generateQuery({
        sort_by: sortBy,
        sort_direction: sortDirection,
        limit,
        page: 1,
      }),
      last: generateQuery({
        sort_by: sortBy,
        sort_direction: sortDirection,
        limit,
        page: pageCount,
      }),
      prev:
        page > 1
          ? generateQuery({
              sort_by: sortBy,
              sort_direction: sortDirection,
              limit,
              page: page - 1,
            })
          : null,
      next:
        page < pageCount
          ? generateQuery({
              sort_by: sortBy,
              sort_direction: sortDirection,
              limit,
              page: page + 1,
            })
          : null,
      current: generateQuery({
        sort_by: sortBy,
        sort_direction: sortDirection,
        limit,
        page,
      }),
    };
  }

  public send() {
    this.response.status(HttpStatus.OK).json({
      con: true,
      message: this.message,
      statusCode: HttpStatus.OK,
      data: this.D,
      meta: this.metaGenerator(),
      link: this.linkGenerator(),
    });
    return this.response;
  }

  public sendSingle() {
    this.response.status(HttpStatus.OK).json({
      con: true,
      message: this.message,
      statusCode: HttpStatus.OK,
      data: this.D,
    });
    return this.response;
  }

  public sendMutate() {
    this.response.status(HttpStatus.CREATED).json({
      con: true,
      message: this.message,
      statusCode: HttpStatus.CREATED,
      data: this.D,
    });
    return this.response;
  }

  public sendDelete() {
    this.response.status(HttpStatus.NO_CONTENT).json({
      con: true,
      message: this.message,
      statusCode: HttpStatus.NO_CONTENT,
    });
    return this.response;
  }
}
