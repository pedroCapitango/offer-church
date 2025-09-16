import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsOptional, IsPositive, MinLength } from 'class-validator';

export class MovimentoDto {
  @ApiPropertyOptional({ example: 10 })
  id?: number;

  @ApiProperty({ enum: ['DIZIMO', 'OFERTA'] })
  @IsEnum(['DIZIMO', 'OFERTA'])
  tipo: 'DIZIMO' | 'OFERTA';

  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty({ example: '+244900000000' })
  @IsString()
  contato: string;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @IsPositive()
  valor: number;

  @ApiPropertyOptional({ description: 'Obrigatório se tipo=OFERTA', example: 'CAMPANHA' })
  @IsOptional()
  @IsString()
  tipoOferta?: string;

  @ApiPropertyOptional({ description: 'Path do arquivo salvo', type: 'string' })
  @IsOptional()
  @IsString()
  comprovante?: string;

  @ApiPropertyOptional({ example: '2025-09-16' })
  @IsOptional()
  @IsString()
  data?: Date | string;
}
