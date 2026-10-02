import { getResponseMessage, ResponseCodes } from '../constants/response-codes';

/**
 * Error de dominio. Los casos de uso lanzan estas clases y el filtro global
 * las traduce al formato de respuesta estándar de la API.
 */
export class AppError extends Error {
  readonly responseCode: ResponseCodes;
  readonly responseMessage: string;

  constructor(
    message: string,
    readonly statusCode: number,
    responseCode: ResponseCodes = ResponseCodes.INTERNAL_SERVER_ERROR,
    readonly field?: string,
  ) {
    super(message);
    this.name = new.target.name;
    this.responseCode = responseCode;
    this.responseMessage = getResponseMessage(responseCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', field?: string) {
    super(message, 404, ResponseCodes.RESOURCE_NOT_FOUND, field);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos de entrada inválidos', field?: string) {
    super(message, 400, ResponseCodes.VALIDATION_ERROR, field);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe', field?: string) {
    super(message, 409, ResponseCodes.CONFLICT, field);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, responseCode = ResponseCodes.BUSINESS_RULE_VIOLATION, field?: string) {
    super(message, 422, responseCode, field);
  }
}
