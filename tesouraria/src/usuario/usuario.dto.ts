import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UsuarioDto {
  @ApiPropertyOptional({ example: 1 })
  id?: number;

  @ApiProperty({ example: 'joao', minLength: 3, maxLength: 30 })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  usuario: string;

  @ApiProperty({ example: 'Senha@123', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({ enum: ['TESOUREIRO', 'ADMIN'], example: 'TESOUREIRO' })
  @IsOptional()
  @IsIn(['TESOUREIRO', 'ADMIN'])
  role?: 'TESOUREIRO' | 'ADMIN';
}
