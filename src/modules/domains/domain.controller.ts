import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { DomainService } from "./domain.service";
import {
  parseCreateDomainBody,
  parseDomainParams,
  parseListDomainsQuery,
  parseUpdateDomainBody,
} from "./domain.schemas";

export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  create = async (request: Request, response: Response): Promise<void> => {
    const body = parseCreateDomainBody(request.body);
    const domain = await this.domainService.create({
      id: randomUUID(),
      name: body.name,
    });

    response.status(201).json(domain);
  };

  list = async (request: Request, response: Response): Promise<void> => {
    const query = parseListDomainsQuery(request.query);
    const result = await this.domainService.list(query);
    response.status(200).json(result);
  };

  getById = async (request: Request, response: Response): Promise<void> => {
    const params = parseDomainParams(request.params);
    const domain = await this.domainService.getById(params.id);
    response.status(200).json(domain);
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const params = parseDomainParams(request.params);
    const body = parseUpdateDomainBody(request.body);
    const domain = await this.domainService.update({
      id: params.id,
      name: body.name,
    });

    response.status(200).json(domain);
  };

  delete = async (request: Request, response: Response): Promise<void> => {
    const params = parseDomainParams(request.params);
    await this.domainService.delete(params.id);
    response.status(204).send();
  };
}
