import React, { useState, useEffect } from 'react';
import { Payment } from '../../types';
import { paymentService } from '../../services/api';
import { formatCurrency, formatDateTime, getStatusColor, getStatusText, getTypeText, handleApiError } from '../../utils/helpers';
import PaymentSubmissionForm from './PaymentSubmissionForm';

const MemberDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getMyPayments({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined
      });
      setPayments(response.items);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [currentPage, statusFilter]);

  const handlePaymentSubmitted = () => {
    setShowSubmissionForm(false);
    loadPayments();
  };

  const downloadReceipt = async (paymentId: string) => {
    try {
      const receiptData = await paymentService.downloadReceipt(paymentId);
      alert('Comprovante disponível para download: ' + JSON.stringify(receiptData.receiptInfo, null, 2));
    } catch (err) {
      alert(handleApiError(err));
    }
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
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-4">Meus Dízimos e Ofertas</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <button
            onClick={() => setShowSubmissionForm(true)}
            className="btn btn-primary"
          >
            Enviar Novo Dízimo/Oferta
          </button>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="validated">Validado</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
            <PaymentSubmissionForm
              onSubmit={handlePaymentSubmitted}
              onCancel={() => setShowSubmissionForm(false)}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-600">Nenhum dízimo ou oferta encontrado.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment._id} className="card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{getTypeText(payment.type)}</h3>
                  <p className="text-gray-600 text-sm">
                    {formatDateTime(payment.createdAt)}
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
              
              {payment.validatedAt && (
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Validado em:</strong> {formatDateTime(payment.validatedAt)}
                  {payment.validatedBy && ` por ${payment.validatedBy.name}`}
                </p>
              )}
              
              {payment.validationNotes && (
                <p className="text-gray-700 mb-2">
                  <strong>Observações da validação:</strong> {payment.validationNotes}
                </p>
              )}
              
              {payment.status === 'validated' && payment.receiptGenerated && (
                <button
                  onClick={() => downloadReceipt(payment._id)}
                  className="btn btn-success text-sm"
                >
                  Baixar Comprovante
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
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
    </div>
  );
};

export default MemberDashboard;