import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MovimentoDto {
  id?: number;
  @ApiProperty({ enum: ['DIZIMO', 'OFERTA'] })
  tipo: 'DIZIMO' | 'OFERTA';
  @ApiProperty()
  nome: string;
  @ApiProperty()
  contato: string;
  @ApiProperty()
  valor: number;
  @ApiPropertyOptional({ description: 'Obrigatório se tipo=OFERTA' })
  tipoOferta?: string;
  @ApiPropertyOptional({ description: 'Path do arquivo salvo', type: 'string' })
  comprovante?: string;
  @ApiPropertyOptional()
  data?: Date;
}
