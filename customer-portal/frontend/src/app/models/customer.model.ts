export interface Customer {
  customerId: string;
  name: string;
  email?: string;
  company?: string;
  lastLogin?: string;
}

export interface LoginRequest {
  customerId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  customerData?: Customer;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Enhanced Dashboard Data with Business Transactions
export interface DashboardData {
  // Summary Statistics
  totalInquiries: number;
  totalSalesOrders: number;
  totalDeliveries: number;
  outstandingAmount: number;
  
  // Recent Transactions
  recentInquiries: Inquiry[];
  recentSalesOrders: SalesOrder[];
  recentDeliveries: Delivery[];
  
  // Performance Metrics
  inquiryConversionRate: number;
  averageOrderValue: number;
  deliveryPerformance: number;
}

// Inquiry Data Structure
export interface Inquiry {
  inquiryNumber: string;
  inquiryDate: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Quoted' | 'Converted' | 'Closed';
  items: InquiryItem[];
  totalValue?: number;
  validUntil?: string;
  salesRep?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface InquiryItem {
  materialNumber: string;
  description: string;
  quantity: number;
  unit: string;
  requestedDeliveryDate?: string;
  estimatedPrice?: number;
}

// Sales Order Data Structure
export interface SalesOrder {
  orderNumber: string;
  orderDate: string;
  requestedDeliveryDate: string;
  orderValue: number;
  currency: string;
  status: 'Created' | 'Confirmed' | 'In Production' | 'Ready for Delivery' | 'Delivered' | 'Invoiced' | 'Completed';
  items: SalesOrderItem[];
  customerPO?: string;
  salesRep?: string;
  deliveryAddress?: string;
  paymentTerms?: string;
}

export interface SalesOrderItem {
  lineItem: string;
  materialNumber: string;
  description: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
  status: string;
}

// Delivery Data Structure
export interface Delivery {
  deliveryNumber: string;
  deliveryDate: string;
  trackingNumber?: string;
  status: 'Planned' | 'In Transit' | 'Delivered' | 'Returned' | 'Cancelled';
  items: DeliveryItem[];
  carrier?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  deliveryAddress: string;
  weight?: number;
  volume?: number;
  relatedSalesOrder: string;
}

export interface DeliveryItem {
  materialNumber: string;
  description: string;
  deliveredQuantity: number;
  unit: string;
  batchNumber?: string;
  serialNumbers?: string[];
}

// Legacy interfaces for backward compatibility
export interface Order {
  orderNumber: string;
  date: string;
  amount: number;
  status: string;
}

export interface CustomerProfile {
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  company?: string;
}
