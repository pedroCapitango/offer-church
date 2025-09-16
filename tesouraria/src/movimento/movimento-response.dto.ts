import { ApiProperty } from '@nestjs/swagger';

export class MovimentoResponseDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ example: 'DIZIMO', enum: ['DIZIMO', 'OFERTA'] })
  tipo: string;

  @ApiProperty({ example: 'Maria Silva' })
  nome: string;

  @ApiProperty({ example: '+244900000000' })
  contato: string;

  @ApiProperty({ example: 150.5 })
  valor: number;

  @ApiProperty({ example: 'CAMPANHA', required: false, nullable: true })
  tipoOferta?: string | null;

  @ApiProperty({ example: '/uploads/169487234-comprovante.jpg', required: false, nullable: true })
  comprovante?: string | null;

  @ApiProperty({ example: '2025-09-16T12:20:00.000Z' })
  data: string;
}

export class ListMovimentosResponseDto {
  @ApiProperty({ type: [MovimentoResponseDto] })
  data: MovimentoResponseDto[];
}
