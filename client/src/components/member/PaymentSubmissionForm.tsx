import React, { useState } from 'react';
import { paymentService } from '../../services/api';
import { handleApiError } from '../../utils/helpers';

interface PaymentSubmissionFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const PaymentSubmissionForm: React.FC<PaymentSubmissionFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    type: 'tithe' as 'tithe' | 'offering',
    amount: '',
    description: '',
    comments: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor, selecione um arquivo de comprovante');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Por favor, insira um valor válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('amount', formData.amount);
      submitData.append('description', formData.description);
      submitData.append('comments', formData.comments);
      submitData.append('proofFile', file);

      await paymentService.submitPayment(submitData);
      onSubmit();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Limite de 5MB.');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Tipo de arquivo não permitido. Use imagens, PDF ou documentos Word.');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Enviar Dízimo/Oferta</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Tipo</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'tithe' | 'offering' }))}
            className="form-select"
            required
          >
            <option value="tithe">Dízimo</option>
            <option value="offering">Oferta</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="form-input"
            placeholder="0,00"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Descrição (opcional)</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="form-input"
            placeholder="Ex: Dízimo referente ao mês de Janeiro"
            maxLength={500}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Comentários/Especificações (opcional)</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
            className="form-input"
            rows={3}
            placeholder="Comentários adicionais sobre a contribuição"
            maxLength={1000}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Comprovante de Pagamento</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="form-input"
            accept="image/*,.pdf,.doc,.docx"
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            Formatos aceitos: JPG, PNG, PDF, DOC, DOCX (máx. 5MB)
          </p>
          {file && (
            <p className="text-sm text-green-600 mt-1">
              Arquivo selecionado: {file.name}
            </p>
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentSubmissionForm;