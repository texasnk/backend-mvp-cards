/** SPEC-SHARED-01: Base reutilizável para requisições paginadas. */
export abstract class PaginationRequest {
  constructor(
    public readonly page: number,
    public readonly pageSize: number,
  ) {}

  /** SPEC-SHARED-02: Calcula o deslocamento da página atual. */
  get offset(): number {
    return (this.page - 1) * this.pageSize;
  }
}

/** SPEC-SHARED-03: Contrato de resposta paginada. */
export abstract class PaginationResponse<T> {
  constructor(
    public readonly items: T[],
    public readonly page: number,
    public readonly pageSize: number,
    public readonly total: number,
  ) {}
}
