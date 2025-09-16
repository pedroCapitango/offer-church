import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HttpExceptions (inclui validação do ValidationPipe)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as
        | string
        | { statusCode?: number; message?: string | string[]; error?: string };

      const body = typeof res === 'string' ? { message: res } : res || {};
      const payload = {
        statusCode: status,
        error:
          body.error || (HttpStatus[status] as unknown as string) || 'Error',
        message: body.message ?? exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
      return response.status(status).json(payload);
    }

    // Prisma known errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      let status = HttpStatus.BAD_REQUEST;
      let message: string | string[] = exception.message;

      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          status = HttpStatus.CONFLICT;
          message = 'Recurso já existe (violação de unicidade)';
          break;
        case 'P2003': // Foreign key constraint failed
          status = HttpStatus.BAD_REQUEST;
          message = 'Referência inválida (chave estrangeira)';
          break;
        case 'P2025': // Record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Recurso não encontrado';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Erro de persistência (${exception.code})`;
      }

      return response.status(status).json({
        statusCode: status,
        error: (HttpStatus[status] as unknown as string) || 'Error',
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Fallback: erro inesperado
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    return response.status(status).json({
      statusCode: status,
      error: 'Internal Server Error',
      message:
        (exception as any)?.message || 'Ocorreu um erro inesperado no servidor',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
