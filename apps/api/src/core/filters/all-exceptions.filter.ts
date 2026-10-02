import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { getResponseMessage, ResponseCodes } from '../constants/response-codes';
import { AppError } from '../errors/app.error';

interface ErrorBody {
  status: 'fail' | 'error';
  statusCode: number;
  responseCode: ResponseCodes;
  responseMessage: string;
  message: string;
  field?: string;
  details?: string[];
  timestamp: string;
}

/** Traduce cualquier excepción al formato de error estándar de la API. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    const timestamp = new Date().toISOString();

    if (exception instanceof AppError) {
      return {
        status: exception.statusCode < 500 ? 'fail' : 'error',
        statusCode: exception.statusCode,
        responseCode: exception.responseCode,
        responseMessage: exception.responseMessage,
        message: exception.message,
        field: exception.field,
        timestamp,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload = exception.getResponse() as { message?: unknown };
      const details = Array.isArray(payload?.message) ? (payload.message as string[]) : undefined;
      const responseCode =
        statusCode === HttpStatus.NOT_FOUND
          ? ResponseCodes.RESOURCE_NOT_FOUND
          : statusCode < 500
            ? ResponseCodes.VALIDATION_ERROR
            : ResponseCodes.INTERNAL_SERVER_ERROR;
      return {
        status: statusCode < 500 ? 'fail' : 'error',
        statusCode,
        responseCode,
        responseMessage: getResponseMessage(responseCode),
        message: details?.join('. ') ?? exception.message,
        details,
        timestamp,
      };
    }

    return {
      status: 'error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      responseCode: ResponseCodes.INTERNAL_SERVER_ERROR,
      responseMessage: getResponseMessage(ResponseCodes.INTERNAL_SERVER_ERROR),
      message: 'Error interno del servidor',
      timestamp,
    };
  }
}
