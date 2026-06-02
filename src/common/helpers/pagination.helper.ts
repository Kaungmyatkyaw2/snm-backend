type AnyObject = {
  [key: string]: any;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
  sort?: string;
  scope?: 'inner' | 'outer';
  q?: string;
  filter_by?: string;
  filter_value?: string;
  [key: string]: any;
};

export function createFilterObject(queryString: AnyObject, regexField: string) {
  // Create a copy of the query string
  const filterObj: any = { ...queryString };

  // Remove pagination and sorting fields
  const toRemoveFields: string[] = [
    'limit',
    'sort',
    'page',
    'sort_by',
    'sort_dir',
    'q',
    'categoryIds',
  ];

  toRemoveFields.forEach((field: string) => {
    delete filterObj[field];
  });

  if (queryString.q && regexField) {
    filterObj[regexField] = {
      contains: queryString.q as string,
      mode: 'insensitive',
    };
  }

  Object.entries(filterObj).forEach(([key, value]) => {
    if (value === 'true') {
      filterObj[key] = true;
    } else if (value === 'false') {
      filterObj[key] = false;
    }
  });

  Object.keys(filterObj).forEach((key) => {
    if (filterObj[key] === undefined || filterObj[key] === '') {
      delete filterObj[key];
    }
  });

  return Object.keys(filterObj).length > 0 ? filterObj : undefined;
}

export function createFilteredByObject(query: PaginationQuery) {
  const key = query.filter_by?.replace(/ /g, '_');

  if (key !== 'undefined' && !!key) {
    return {
      [key]: query.filter_value,
    };
  }

  return {};
}

export class Pagination {
  private query: any = {};
  private options: any = {};

  constructor(
    private model: any,
    private queryString: AnyObject,
  ) {}

  filter(regexFields: string) {
    const filterObj = createFilterObject(this.queryString, regexFields);
    this.query = { ...this.query, ...filterObj };
    return this;
  }

  filterField() {
    const key = this.queryString.filter_by?.replace(/ /g, '_');

    if (key !== 'undefined' && !!key && this.queryString.filter_value) {
      this.query = {
        ...this.query,
        [key]: this.queryString.filter_value,
      };
    }

    return this;
  }

  paginate() {
    const limit = +this.queryString?.limit || 5;
    const page = +this.queryString?.page || 1;
    const skip = limit * (page - 1);

    this.options = {
      ...this.options,
      skip,
      take: limit,
    };

    return this;
  }

  sort() {
    const sortBy = this.queryString.sort_by || 'createdAt';
    const sortDirection = this.queryString.sort_dir === 'asc' ? 'asc' : 'desc';

    this.options = {
      ...this.options,
      orderBy: {
        [sortBy]: sortDirection,
      },
    };

    return this;
  }

  async execute() {
    const where = Object.keys(this.query).length > 0 ? this.query : undefined;

    return await this.model.findMany({
      where,
      ...this.options,
    });
  }
}
