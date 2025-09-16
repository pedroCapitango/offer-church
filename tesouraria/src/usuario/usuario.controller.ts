import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioService } from './usuario.service';
import { UsuarioDto } from './usuario.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly service: UsuarioService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  create(@Body() data: UsuarioDto) {
    return this.service.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(@Param('id') id: number, @Body() data: Partial<UsuarioDto>) {
    return this.service.update(Number(id), data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuário' })
  remove(@Param('id') id: number) {
    return this.service.remove(Number(id));
  }
}
