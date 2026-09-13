import { AppError, InternalServerError } from "./app-error";

/** SPEC-ORM-03: Converte falhas inesperadas de infraestrutura em erro da aplicação. */
export function toAppError(error: unknown, message: string): AppError {
  if (error instanceof AppError) return error;
  return new InternalServerError(message, "INFRASTRUCTURE_ERROR");
}

/** SPEC-ORM-03: Executa uma operação de service preservando erros conhecidos. */
export async function handleServiceError<T>(
  operation: () => Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toAppError(error, message);
  }
}
