import { ApiProperty } from '@nestjs/swagger';

export class UsuarioResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'joao' })
  usuario: string;

  @ApiProperty({ example: 'TESOUREIRO', enum: ['TESOUREIRO', 'ADMIN'], required: false })
  role?: string;
}

export class CreateUsuarioResponseDto extends UsuarioResponseDto {}

export class ListUsuariosResponseDto {
  @ApiProperty({ type: [UsuarioResponseDto] })
  data: UsuarioResponseDto[];
}
