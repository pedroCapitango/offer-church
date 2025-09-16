import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService, ResumoFinanceiro } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { DashboardResumoResponseDto, SerieDiaItemDto, SerieMesItemDto } from './dashboard-response.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo financeiro geral (totais e últimos movimentos)' })
  @ApiOkResponse({ type: DashboardResumoResponseDto })
  resumo(): Promise<ResumoFinanceiro> {
    return this.service.resumo();
  }

  @Get('serie/dia')
  @ApiOperation({ summary: 'Série de valores agregados por dia (últimos N dias)' })
  @ApiOkResponse({ type: SerieDiaItemDto, isArray: true })
  @ApiQuery({ name: 'dias', required: false, description: 'Quantidade de dias (default 7)' })
  serieDia(@Query('dias') dias?: string) {
    const n = dias ? parseInt(dias, 10) : 7;
    return this.service.seriePorDia(isNaN(n) ? 7 : n);
  }

  @Get('serie/mes')
  @ApiOperation({ summary: 'Série de valores agregados por mês do ano informado' })
  @ApiOkResponse({ type: SerieMesItemDto, isArray: true })
  @ApiQuery({ name: 'ano', required: false, description: 'Ano (default ano atual)' })
  serieMes(@Query('ano') ano?: string) {
    const a = ano ? parseInt(ano, 10) : new Date().getFullYear();
    return this.service.seriePorMes(isNaN(a) ? new Date().getFullYear() : a);
  }
}
