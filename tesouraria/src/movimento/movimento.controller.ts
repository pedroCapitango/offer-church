import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, ParseFloatPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MovimentoService } from './movimento.service';
import { MovimentoDto } from './movimento.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('movimento')
@Controller('movimento')
export class MovimentoController {
  constructor(private readonly service: MovimentoService) {}

  @Post()
  @UseInterceptors(FileInterceptor('comprovante', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
  }))
  @ApiOperation({ summary: 'Criar novo movimento (multipart: campos + comprovante)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { tipo: { type: 'string', enum: ['DIZIMO','OFERTA'] }, nome: { type: 'string' }, contato: { type: 'string' }, valor: { type: 'number' }, tipoOferta: { type: 'string' }, comprovante: { type: 'string', format: 'binary' } }, required: ['tipo','nome','contato','valor'] } })
  create(@Body() raw: any, @UploadedFile() file?: Express.Multer.File) {
    const data: MovimentoDto = {
      tipo: raw.tipo,
      nome: raw.nome,
      contato: raw.contato,
      valor: raw.valor ? parseFloat(raw.valor) : 0,
      tipoOferta: raw.tipoOferta,
      comprovante: file ? `/uploads/${file.filename}` : undefined,
    };
    if (!data.tipo || !data.nome || !data.contato || isNaN(data.valor)) {
      throw new Error('Campos obrigatórios ausentes ou inválidos');
    }
    return this.service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os movimentos' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar movimento por ID' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('comprovante', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
  }))
  @ApiOperation({ summary: 'Atualizar movimento (enviar novo comprovante opcional)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { tipo: { type: 'string', enum: ['DIZIMO','OFERTA'] }, nome: { type: 'string' }, contato: { type: 'string' }, valor: { type: 'number' }, tipoOferta: { type: 'string' }, comprovante: { type: 'string', format: 'binary' } } } })
  update(@Param('id') id: number, @Body() raw: any, @UploadedFile() file?: Express.Multer.File) {
    const data: Partial<MovimentoDto> = {
      tipo: raw.tipo,
      nome: raw.nome,
      contato: raw.contato,
      valor: raw.valor ? parseFloat(raw.valor) : undefined,
      tipoOferta: raw.tipoOferta,
    };
    if (file) data.comprovante = `/uploads/${file.filename}`;
    return this.service.update(Number(id), data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover movimento' })
  remove(@Param('id') id: number) {
    return this.service.remove(Number(id));
  }
}
