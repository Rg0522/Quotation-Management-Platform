// Auth types
export type Role = "manager" | "sales_rep" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Quotation types
export type QuotationStatus = "Pending" | "Approved" | "Rejected";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface Reply {
  id: number;
  author: string;
  role: Role;
  text: string;
  timestamp: string;
}

export interface Comment {
  id: number;
  author: string;
  role: Role;
  text: string;
  timestamp: string;
  replies?: Reply[];
  _repliesLoaded?: boolean;
}

export interface Quotation {
  id: string;
  client: string;
  amount: number;
  status: QuotationStatus;
  last_updated: string;
  description?: string;
  lineItems?: LineItem[];
  subtotal?: number;
  tax?: number;
  freight?: number;
  comments: Comment[];
  _lastModifiedBy?: string;
  _lastModifiedAt?: string;
}

// API types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface ListFilters {
  search?: string;
  status?: QuotationStatus | "";
  page: number;
}

export interface OptimisticUpdateState {
  id: string;
  status: "pending" | "success" | "error";
  previousValue?: any;
  error?: string;
}
