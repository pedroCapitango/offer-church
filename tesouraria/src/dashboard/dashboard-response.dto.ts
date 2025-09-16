import { ApiProperty } from '@nestjs/swagger';

export class DashboardResumoMovimentoDto {
  @ApiProperty({ example: 3 })
  id: number;
  @ApiProperty({ example: 'DIZIMO' })
  tipo: string;
  @ApiProperty({ example: 'João' })
  nome: string;
  @ApiProperty({ example: 200 })
  valor: number;
  @ApiProperty({ example: '2025-09-16T10:00:00.000Z' })
  data: string;
}

export class DashboardResumoResponseDto {
  @ApiProperty({ example: 1250.75 })
  totalGeral: number;
  @ApiProperty({ example: 800 })
  totalDizimos: number;
  @ApiProperty({ example: 450.75 })
  totalOfertas: number;
  @ApiProperty({ type: [DashboardResumoMovimentoDto] })
  ultimos: DashboardResumoMovimentoDto[];
}

export class SerieDiaItemDto {
  @ApiProperty({ example: '2025-09-10' })
  dia: string;
  @ApiProperty({ example: 320.5 })
  total: number;
}

export class SerieMesItemDto {
  @ApiProperty({ example: '2025-01' })
  mes: string;
  @ApiProperty({ example: 954.2 })
  total: number;
}
