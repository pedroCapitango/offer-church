export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'validated':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'validated':
      return 'Validado';
    case 'rejected':
      return 'Rejeitado';
    default:
      return status;
  }
};

export const getTypeText = (type: string): string => {
  switch (type) {
    case 'tithe':
      return 'Dízimo';
    case 'offering':
      return 'Oferta';
    default:
      return type;
  }
};

export const getRoleText = (role: string): string => {
  switch (role) {
    case 'member':
      return 'Membro';
    case 'treasurer':
      return 'Tesoureiro';
    case 'pastor':
      return 'Pastor';
    default:
      return role;
  }
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors.map((err: any) => err.msg).join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado';
};