import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioService } from './usuario.service';
import { UsuarioDto } from './usuario.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { UsuarioResponseDto } from './usuario-response.dto';
import { EnvelopeDto } from '../common/dto/envelope.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly service: UsuarioService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiCreatedResponse({ type: UsuarioResponseDto, description: 'Usuário criado com sucesso' })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  create(@Body() data: UsuarioDto): Promise<UsuarioResponseDto> {
    return this.service.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiOkResponse({ type: UsuarioResponseDto, isArray: true })
  async findAll(): Promise<UsuarioResponseDto[]> {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('id') id: number): Promise<UsuarioResponseDto | null> {
    return this.service.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  update(@Param('id') id: number, @Body() data: Partial<UsuarioDto>): Promise<UsuarioResponseDto> {
    return this.service.update(Number(id), data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiOkResponse({ description: 'Usuário removido' })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id') id: number) {
    return this.service.remove(Number(id));
  }
}
