import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({ example: 'joao' })
  @IsString()
  usuario: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  @MinLength(6)
  senha: string;
}
