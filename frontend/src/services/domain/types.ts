export interface IStudyDomain {
  id: string;
  name: string;
  nameNormalized: string;
  createdAt: string;
  updatedAt: string;
}
export interface IPaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
export interface IDomainListParams {
  search?: string;
  page: number;
  pageSize: number;
}
export interface ICreateDomainInput {
  name: string;
}
