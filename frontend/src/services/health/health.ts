import { http } from "../http";
export const healthService = {
  live: async () => (await http.get<{ status: string }>("/health/live")).data,
  ready: async () => (await http.get<{ status: string }>("/health/ready")).data,
  metrics: async () => (await http.get<string>("/metrics", { responseType: "text" })).data,
};
