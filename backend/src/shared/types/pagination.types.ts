/** SPEC-SHARED-04: Define os parâmetros de uma consulta paginada. */
export interface IPaginationParams {
  page: number;
  pageSize: number;
}

/** SPEC-SHARED-05: Define o resultado de uma consulta paginada. */
export interface IPaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type PaginatedResult<T> = IPaginatedResult<T>;
