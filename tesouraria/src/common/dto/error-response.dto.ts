import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Mensagem detalhada do erro' })
  message: string | string[];

  @ApiProperty({ example: '2025-09-16T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/rota' })
  path: string;
}
