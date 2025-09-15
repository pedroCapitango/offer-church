import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/api';
import { formatCurrency, handleApiError } from '../../utils/helpers';

const PastorDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [memberContributions, setMemberContributions] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const [stats, summary, contributions, status] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getFinancialSummary(dateFilter),
        reportService.getMemberContributions({ ...dateFilter, limit: 10 }),
        reportService.getPaymentStatus(dateFilter)
      ]);
      
      setDashboardStats(stats);
      setFinancialSummary(summary);
      setMemberContributions(contributions);
      setPaymentStatus(status);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateFilter]);

  const handleDateFilterChange = (key: string, value: string) => {
    setDateFilter(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-4">Dashboard do Pastor</h1>
        
        {/* Date Filters */}
        <div className="card mb-6">
          <h3 className="font-medium mb-4">Filtros de Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Data Inicial</label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data Final</label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <h3 className="font-medium text-gray-600 mb-2">Este Mês</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Dízimos:</span>
                <span className="font-bold">
                  {formatCurrency(dashboardStats.monthly.tithes.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ofertas:</span>
                <span className="font-bold">
                  {formatCurrency(dashboardStats.monthly.offerings.amount)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-1">
                <span>Total:</span>
                <span>
                  {formatCurrency(
                    dashboardStats.monthly.tithes.amount + dashboardStats.monthly.offerings.amount
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="font-medium text-gray-600 mb-2">Este Ano</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Dízimos:</span>
                <span className="font-bold">
                  {formatCurrency(dashboardStats.yearly.tithes.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ofertas:</span>
                <span className="font-bold">
                  {formatCurrency(dashboardStats.yearly.offerings.amount)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-1">
                <span>Total:</span>
                <span>
                  {formatCurrency(
                    dashboardStats.yearly.tithes.amount + dashboardStats.yearly.offerings.amount
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="font-medium text-gray-600 mb-2">Estatísticas Gerais</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Membros Ativos:</span>
                <span className="font-bold">{dashboardStats.activeMembersCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Pendentes:</span>
                <span className="font-bold text-yellow-600">
                  {dashboardStats.pendingCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {financialSummary && (
        <div className="card mb-6">
          <h3 className="font-medium mb-4">Resumo Financeiro (Período Selecionado)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(financialSummary.summary.totalTithes)}
              </div>
              <div className="text-sm text-gray-600">
                Dízimos ({financialSummary.summary.titheCount} contribuições)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(financialSummary.summary.totalOfferings)}
              </div>
              <div className="text-sm text-gray-600">
                Ofertas ({financialSummary.summary.offeringCount} contribuições)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(financialSummary.summary.grandTotal)}
              </div>
              <div className="text-sm text-gray-600">
                Total Geral
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Breakdown Chart */}
      {financialSummary?.monthlyBreakdown && financialSummary.monthlyBreakdown.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-medium mb-4">Breakdown Mensal</h3>
          <div className="space-y-2">
            {financialSummary.monthlyBreakdown.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>
                  {item._id.month}/{item._id.year} - {item._id.type === 'tithe' ? 'Dízimos' : 'Ofertas'}
                </span>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(item.totalAmount)}</div>
                  <div className="text-sm text-gray-600">{item.count} contribuições</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Contributors */}
      {memberContributions?.memberContributions && (
        <div className="card mb-6">
          <h3 className="font-medium mb-4">Principais Contribuintes</h3>
          <div className="space-y-2">
            {memberContributions.memberContributions.slice(0, 10).map((contribution: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{contribution.member?.name || 'Nome não disponível'}</div>
                  <div className="text-sm text-gray-600">
                    {contribution.totalCount} contribuições
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(contribution.totalAmount)}</div>
                  <div className="text-sm text-gray-600">
                    D: {formatCurrency(contribution.totalTithes)} | 
                    O: {formatCurrency(contribution.totalOfferings)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Status Summary */}
      {paymentStatus && (
        <div className="card">
          <h3 className="font-medium mb-4">Status dos Pagamentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentStatus.statusSummary?.map((status: any, index: number) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded">
                <div className="text-xl font-bold">
                  {status.count}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {status._id === 'pending' ? 'Pendentes' :
                   status._id === 'validated' ? 'Validados' :
                   status._id === 'rejected' ? 'Rejeitados' : status._id}
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency(status.totalAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PastorDashboard;