export enum ResponseCodes {
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  CASH_SESSION_CLOSED = 'CASH_SESSION_CLOSED',
  NO_OPEN_CASH_SESSION = 'NO_OPEN_CASH_SESSION',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

const RESPONSE_MESSAGES: Record<ResponseCodes, string> = {
  [ResponseCodes.SUCCESS]: 'Operación exitosa',
  [ResponseCodes.CREATED]: 'Recurso creado correctamente',
  [ResponseCodes.VALIDATION_ERROR]: 'Datos de entrada inválidos',
  [ResponseCodes.RESOURCE_NOT_FOUND]: 'Recurso no encontrado',
  [ResponseCodes.CONFLICT]: 'El recurso ya existe',
  [ResponseCodes.BUSINESS_RULE_VIOLATION]: 'La operación no cumple las reglas del negocio',
  [ResponseCodes.CASH_SESSION_CLOSED]: 'La caja no está abierta',
  [ResponseCodes.NO_OPEN_CASH_SESSION]: 'No hay ninguna caja abierta',
  [ResponseCodes.INSUFFICIENT_STOCK]: 'No hay stock suficiente',
  [ResponseCodes.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
};

export const getResponseMessage = (code: ResponseCodes): string => RESPONSE_MESSAGES[code];
