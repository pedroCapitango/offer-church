import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface ResumoFinanceiro {
  totalGeral: number;
  totalDizimos: number;
  totalOfertas: number;
  quantidadeMovimentos: number;
  ultimosMovimentos: any[];
  mediaPorMovimento: number;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async resumo(): Promise<ResumoFinanceiro> {
    const [movimentos, aggregate] = await Promise.all([
      this.prisma.movimento.findMany({ orderBy: { data: 'desc' }, take: 5 }),
      this.prisma.movimento.aggregate({ _count: { _all: true }, _sum: { valor: true } }),
    ]);

    const totalGeral = aggregate._sum.valor || 0;
    const quantidadeMovimentos = aggregate._count._all;

    let totalDizimos = 0;
    let totalOfertas = 0;
    for (const m of movimentos) {
      if (m.tipo === 'DIZIMO') totalDizimos += m.valor; else if (m.tipo === 'OFERTA') totalOfertas += m.valor;
    }

    const mediaPorMovimento = quantidadeMovimentos ? totalGeral / quantidadeMovimentos : 0;

    return {
      totalGeral,
      totalDizimos,
      totalOfertas,
      quantidadeMovimentos,
      ultimosMovimentos: movimentos,
      mediaPorMovimento,
    };
  }

  async seriePorDia(ultimoDias = 7) {
    const desde = new Date();
    desde.setDate(desde.getDate() - (ultimoDias - 1));
    const movimentos = await this.prisma.movimento.findMany({
      where: { data: { gte: desde } },
      orderBy: { data: 'asc' },
    });
    const mapa: Record<string, number> = {};
    for (let i = 0; i < ultimoDias; i++) {
      const d = new Date(desde);
      d.setDate(desde.getDate() + i);
      mapa[d.toISOString().substring(0, 10)] = 0;
    }
    for (const m of movimentos) {
      const key = m.data.toISOString().substring(0, 10);
      mapa[key] = (mapa[key] || 0) + m.valor;
    }
    return Object.entries(mapa).map(([data, valor]) => ({ data, valor }));
  }

  async seriePorMes(ano = new Date().getFullYear()) {
    const inicio = new Date(ano, 0, 1);
    const fim = new Date(ano + 1, 0, 1);
    const movimentos = await this.prisma.movimento.findMany({
      where: { data: { gte: inicio, lt: fim } },
      orderBy: { data: 'asc' },
    });
    const mapa: Record<string, number> = {};
    for (let mes = 0; mes < 12; mes++) {
      const label = `${ano}-${String(mes + 1).padStart(2, '0')}`;
      mapa[label] = 0;
    }
    for (const m of movimentos) {
      const label = `${m.data.getFullYear()}-${String(m.data.getMonth() + 1).padStart(2, '0')}`;
      mapa[label] = (mapa[label] || 0) + m.valor;
    }
    return Object.entries(mapa).map(([mes, valor]) => ({ mes, valor }));
  }
}
