import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';
import { getResponseMessage, ResponseCodes } from '../constants/response-codes';

export interface ApiResponse<T> {
  status: 'success';
  statusCode: number;
  responseCode: ResponseCodes;
  responseMessage: string;
  data: T;
  timestamp: string;
}

/** Envuelve toda respuesta exitosa en el formato estándar de la API. */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const responseCode = response.statusCode === 201 ? ResponseCodes.CREATED : ResponseCodes.SUCCESS;
        return {
          status: 'success',
          statusCode: response.statusCode,
          responseCode,
          responseMessage: getResponseMessage(responseCode),
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
