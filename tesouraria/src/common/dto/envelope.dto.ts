import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MetaDto {
  @ApiPropertyOptional({ example: 25 })
  total?: number;

  @ApiPropertyOptional({ example: 2 })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  pageSize?: number;
}

export class EnvelopeDto<T> {
  @ApiProperty({ description: 'Dados da resposta' })
  data: T;

  @ApiPropertyOptional({ type: MetaDto })
  meta?: MetaDto;
}
