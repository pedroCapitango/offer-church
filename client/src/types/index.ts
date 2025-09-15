export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'member' | 'treasurer' | 'pastor';
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  member: User;
  type: 'tithe' | 'offering';
  amount: number;
  description?: string;
  comments?: string;
  proofFile: {
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
  };
  status: 'pending' | 'validated' | 'rejected';
  validatedBy?: User;
  validatedAt?: string;
  validationNotes?: string;
  receiptGenerated: boolean;
  receiptFile?: {
    filename: string;
    path: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface FinancialSummary {
  summary: {
    totalTithes: number;
    totalOfferings: number;
    grandTotal: number;
    titheCount: number;
    offeringCount: number;
  };
  breakdown: Array<{
    _id: string;
    totalAmount: number;
    count: number;
    avgAmount: number;
  }>;
  monthlyBreakdown: Array<{
    _id: {
      year: number;
      month: number;
      type: string;
    };
    totalAmount: number;
    count: number;
  }>;
}