import { http } from "../http";
import type {
  ICreateDomainInput,
  IDomainListParams,
  IPaginatedResponse,
  IStudyDomain,
} from "./types";

export class DomainService {
  async list(params: IDomainListParams) {
    return (await http.get<IPaginatedResponse<IStudyDomain>>("/domains", { params })).data;
  }
  async getById(id: string) {
    return (await http.get<IStudyDomain>(`/domains/${id}`)).data;
  }
  async create(input: ICreateDomainInput) {
    return (await http.post<IStudyDomain>("/domains", input)).data;
  }
  async update(id: string, input: ICreateDomainInput) {
    return (await http.patch<IStudyDomain>(`/domains/${id}`, input)).data;
  }
  async remove(id: string) {
    await http.delete(`/domains/${id}`);
  }
}
export const domainService = new DomainService();
