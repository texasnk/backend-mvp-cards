import axios from "axios";

export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "/api/v1" });

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? "Não foi possível concluir a operação.";
  }
  return "Ocorreu um erro inesperado.";
}
