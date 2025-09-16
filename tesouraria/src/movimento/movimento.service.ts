import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MovimentoDto } from './movimento.dto';

@Injectable()
export class MovimentoService {
  constructor(private prisma: PrismaService) {}

  async create(data: MovimentoDto) {
    console.log('[MovimentoService.create] raw data param:', data);
    if (!data) {
      console.error('[MovimentoService.create] data parameter is undefined');
      throw new Error('Movimento data ausente');
    }
    const payload: any = {
      tipo: data.tipo,
      nome: data.nome,
      contato: data.contato,
      valor: data.valor,
      tipoOferta: data.tipo === 'OFERTA' ? data.tipoOferta ?? null : null,
      comprovante: data.comprovante || null,
    };
    console.log('[MovimentoService.create] payload to persist:', payload);
    return this.prisma.movimento.create({ data: payload });
  }

  async findAll() {
    return this.prisma.movimento.findMany();
  }

  async findOne(id: number) {
    return this.prisma.movimento.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<MovimentoDto>) {
    console.log('[MovimentoService.update] id:', id, 'data param:', data);
    const payload: any = {};
    if (data.tipo) payload.tipo = data.tipo;
    if (data.nome) payload.nome = data.nome;
    if (data.contato) payload.contato = data.contato;
    if (typeof data.valor === 'number') payload.valor = data.valor;
    if (data.tipo) {
      if (data.tipo === 'OFERTA') payload.tipoOferta = data.tipoOferta ?? null;
      else payload.tipoOferta = null;
    } else if (data.tipoOferta !== undefined) {
      payload.tipoOferta = data.tipoOferta; // only if provided
    }
    if (data.comprovante !== undefined) payload.comprovante = data.comprovante;
    console.log('[MovimentoService.update] payload to persist:', payload);
    return this.prisma.movimento.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    return this.prisma.movimento.delete({ where: { id } });
  }
}
