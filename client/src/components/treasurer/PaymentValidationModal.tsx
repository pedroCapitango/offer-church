import React, { useState } from 'react';
import { Payment } from '../../types';
import { paymentService } from '../../services/api';
import { formatCurrency, formatDateTime, getTypeText, handleApiError } from '../../utils/helpers';

interface PaymentValidationModalProps {
  payment: Payment;
  onComplete: () => void;
  onCancel: () => void;
}

const PaymentValidationModal: React.FC<PaymentValidationModalProps> = ({
  payment,
  onComplete,
  onCancel
}) => {
  const [status, setStatus] = useState<'validated' | 'rejected'>('validated');
  const [validationNotes, setValidationNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await paymentService.validatePayment(payment._id, {
        status,
        validationNotes
      });
      onComplete();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-90vh overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            Validar Pagamento
          </h2>
          
          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h3 className="font-medium mb-2">Detalhes do Pagamento</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Membro:</strong> {payment.member.name}</div>
              <div><strong>Email:</strong> {payment.member.email}</div>
              <div><strong>Tipo:</strong> {getTypeText(payment.type)}</div>
              <div><strong>Valor:</strong> {formatCurrency(payment.amount)}</div>
              <div><strong>Data:</strong> {formatDateTime(payment.createdAt)}</div>
              {payment.description && (
                <div><strong>Descrição:</strong> {payment.description}</div>
              )}
              {payment.comments && (
                <div><strong>Comentários:</strong> {payment.comments}</div>
              )}
              {payment.proofFile && (
                <div><strong>Arquivo:</strong> {payment.proofFile.originalName}</div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Decisão</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="validated"
                    checked={status === 'validated'}
                    onChange={(e) => setStatus(e.target.value as 'validated')}
                    className="mr-2"
                  />
                  <span className="text-green-700">Validar Pagamento</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="rejected"
                    checked={status === 'rejected'}
                    onChange={(e) => setStatus(e.target.value as 'rejected')}
                    className="mr-2"
                  />
                  <span className="text-red-700">Rejeitar Pagamento</span>
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Observações {status === 'rejected' ? '(obrigatório)' : '(opcional)'}
              </label>
              <textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                className="form-input"
                rows={3}
                placeholder={
                  status === 'rejected' 
                    ? 'Explique o motivo da rejeição...' 
                    : 'Observações sobre a validação (opcional)...'
                }
                required={status === 'rejected'}
                maxLength={1000}
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || (status === 'rejected' && !validationNotes.trim())}
                className={`btn ${status === 'validated' ? 'btn-success' : 'btn-danger'}`}
              >
                {loading 
                  ? 'Processando...' 
                  : status === 'validated' 
                    ? 'Validar' 
                    : 'Rejeitar'
                }
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentValidationModal;