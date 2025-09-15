import React, { useState, useEffect } from 'react';
import { Payment } from '../../types';
import { paymentService, reportService } from '../../services/api';
import { formatCurrency, formatDateTime, getStatusColor, getStatusText, getTypeText, handleApiError } from '../../utils/helpers';
import PaymentValidationModal from './PaymentValidationModal';

const TreasurerDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    memberName: ''
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPayments({
        page: currentPage,
        limit: 10,
        status: filters.status || undefined,
        type: filters.type || undefined,
        memberName: filters.memberName || undefined
      });
      setPayments(response.items);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const stats = await reportService.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [currentPage, filters]);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const handleValidatePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowValidationModal(true);
  };

  const handleValidationComplete = () => {
    setShowValidationModal(false);
    setSelectedPayment(null);
    loadPayments();
    loadDashboardStats();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  if (loading && payments.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-4">Dashboard do Tesoureiro</h1>
        
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
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-medium text-gray-600 mb-2">Pendências</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Pendentes:</span>
                  <span className="font-bold text-yellow-600">
                    {dashboardStats.pendingCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Membros Ativos:</span>
                  <span className="font-bold">
                    {dashboardStats.activeMembersCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="form-select"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="validated">Validado</option>
            <option value="rejected">Rejeitado</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="form-select"
          >
            <option value="">Todos os tipos</option>
            <option value="tithe">Dízimo</option>
            <option value="offering">Oferta</option>
          </select>
          
          <input
            type="text"
            placeholder="Nome do membro"
            value={filters.memberName}
            onChange={(e) => handleFilterChange('memberName', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-600">Nenhum pagamento encontrado.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment._id} className="card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">
                    {getTypeText(payment.type)} - {payment.member.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {payment.member.email} | {formatDateTime(payment.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {formatCurrency(payment.amount)}
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(payment.status)}`}>
                    {getStatusText(payment.status)}
                  </span>
                </div>
              </div>
              
              {payment.description && (
                <p className="text-gray-700 mb-2">
                  <strong>Descrição:</strong> {payment.description}
                </p>
              )}
              
              {payment.comments && (
                <p className="text-gray-700 mb-2">
                  <strong>Comentários:</strong> {payment.comments}
                </p>
              )}
              
              <div className="flex justify-between items-center mt-4">
                <div>
                  {payment.proofFile && (
                    <span className="text-sm text-gray-600">
                      📎 {payment.proofFile.originalName}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {payment.status === 'pending' && (
                    <button
                      onClick={() => handleValidatePayment(payment)}
                      className="btn btn-primary text-sm"
                    >
                      Validar
                    </button>
                  )}
                  
                  {payment.validatedAt && (
                    <span className="text-sm text-gray-600">
                      Validado em {formatDateTime(payment.validatedAt)}
                      {payment.validatedBy && ` por ${payment.validatedBy.name}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Anterior
          </button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && selectedPayment && (
        <PaymentValidationModal
          payment={selectedPayment}
          onComplete={handleValidationComplete}
          onCancel={() => setShowValidationModal(false)}
        />
      )}
    </div>
  );
};

export default TreasurerDashboard;