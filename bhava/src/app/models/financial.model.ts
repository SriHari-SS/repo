// Financial Transaction Models for Vendor Portal

export interface Invoice {
  invoiceNumber: string;
  invoiceType: 'STANDARD' | 'CREDIT_MEMO' | 'DEBIT_MEMO' | 'PREPAYMENT';
  poNumber: string;
  grNumber?: string;
  vendorId: string;
  companyCode: string;
  invoiceDate: Date;
  postingDate: Date;
  dueDate: Date;
  paymentTerms: string;
  currency: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  discountAmount?: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'BLOCKED' | 'PARTIALLY_PAID';
  paymentStatus: 'OPEN' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  items: InvoiceItem[];
  taxDetails: TaxDetail[];
  paymentHistory: PaymentRecord[];
  documentUrl?: string;
  remarks?: string;
  approver?: string;
  approvalDate?: Date;
}

export interface InvoiceItem {
  itemNumber: string;
  materialNumber: string;
  materialDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineAmount: number;
  taxCode: string;
  taxAmount: number;
  glAccount: string;
  costCenter?: string;
  plant?: string;
  deliveryDate: Date;
}

export interface TaxDetail {
  taxCode: string;
  taxDescription: string;
  taxRate: number;
  taxBaseAmount: number;
  taxAmount: number;
  jurisdiction?: string;
}

export interface PaymentRecord {
  paymentId: string;
  paymentDate: Date;
  paymentMethod: 'BANK_TRANSFER' | 'CHECK' | 'WIRE' | 'ACH' | 'CREDIT_CARD';
  paidAmount: number;
  currency: string;
  paymentReference: string;
  bankDetails?: BankDetails;
  clearingDocument?: string;
  exchangeRate?: number;
}

export interface BankDetails {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
}

export interface AgingReport {
  vendorId: string;
  vendorName: string;
  currency: string;
  asOfDate: Date;
  totalOutstanding: number;
  agingBuckets: AgingBucket[];
  overdueAmount: number;
  averageDaysOutstanding: number;
}

export interface AgingBucket {
  periodDescription: string; // "Current", "1-30 days", "31-60 days", etc.
  daysFrom: number;
  daysTo: number;
  amount: number;
  invoiceCount: number;
  percentage: number;
}

export interface PaymentAging {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  currentDate: Date;
  agingDays: number;
  agingCategory: 'CURRENT' | 'OVERDUE_1_30' | 'OVERDUE_31_60' | 'OVERDUE_61_90' | 'OVERDUE_90_PLUS';
  outstandingAmount: number;
  originalAmount: number;
  paidAmount: number;
  currency: string;
}

export interface CreditDebitMemo {
  memoNumber: string;
  memoType: 'CREDIT_MEMO' | 'DEBIT_MEMO';
  referenceInvoice: string;
  vendorId: string;
  companyCode: string;
  memoDate: Date;
  postingDate: Date;
  currency: string;
  amount: number;
  taxAmount: number;
  netAmount: number;
  reason: string;
  reasonCode: string;
  status: 'PENDING' | 'APPROVED' | 'POSTED' | 'REJECTED';
  items: MemoItem[];
  approver?: string;
  approvalDate?: Date;
  documentUrl?: string;
  createdBy: string;
  createdDate: Date;
}

export interface MemoItem {
  itemNumber: string;
  description: string;
  materialNumber?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  amount: number;
  taxCode: string;
  taxAmount: number;
  glAccount: string;
  reason: string;
}

export interface FinancialSummary {
  vendorId: string;
  currency: string;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  creditMemoTotal: number;
  debitMemoTotal: number;
  averagePaymentDays: number;
  invoiceCount: {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
  };
  memoCount: {
    creditMemos: number;
    debitMemos: number;
  };
  lastPaymentDate?: Date;
  nextDueDate?: Date;
}

export interface PaymentHistory {
  paymentId: string;
  paymentDate: Date;
  invoiceNumbers: string[];
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  processingDate?: Date;
  bankDetails?: BankDetails;
}

// API Response Interfaces
export interface InvoiceResponse {
  success: boolean;
  message: string;
  invoices: Invoice[];
  totalCount: number;
  totalAmount: number;
  pagination?: PaginationInfo;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  payments: PaymentHistory[];
  totalCount: number;
  totalAmount: number;
  pagination?: PaginationInfo;
}

export interface MemoResponse {
  success: boolean;
  message: string;
  memos: CreditDebitMemo[];
  totalCount: number;
  pagination?: PaginationInfo;
}

export interface AgingResponse {
  success: boolean;
  message: string;
  agingReport: AgingReport;
  paymentAging: PaymentAging[];
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Filter and Search Interfaces
export interface InvoiceFilter {
  status?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  paymentStatus?: string[];
  invoiceType?: string[];
}

export interface PaymentFilter {
  dateFrom?: Date;
  dateTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  paymentMethod?: string[];
  status?: string[];
}

export interface MemoFilter {
  memoType?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  status?: string[];
}
