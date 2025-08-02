// Models for business transaction data from SAP ERP

export interface RequestForQuotation {
  rfqNumber: string;
  rfqType: string;
  description: string;
  requestingCompany: string;
  purchasingOrganization: string;
  purchasingGroup: string;
  createdDate: Date;
  quotationDeadline: Date;
  status: 'OPEN' | 'SUBMITTED' | 'EXPIRED' | 'AWARDED' | 'REJECTED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  totalEstimatedValue: number;
  currency: string;
  items: RFQItem[];
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  terms?: string;
  attachments?: DocumentAttachment[];
}

export interface RFQItem {
  itemNumber: string;
  materialNumber: string;
  materialDescription: string;
  quantity: number;
  unit: string;
  deliveryDate: Date;
  plantLocation: string;
  technicalSpecifications?: string;
  estimatedUnitPrice?: number;
}

export interface PurchaseOrder {
  poNumber: string;
  poType: string;
  description: string;
  companyCode: string;
  purchasingOrganization: string;
  purchasingGroup: string;
  createdDate: Date;
  expectedDeliveryDate: Date;
  status: 'OPEN' | 'PARTIALLY_DELIVERED' | 'FULLY_DELIVERED' | 'CANCELLED' | 'BLOCKED';
  totalValue: number;
  currency: string;
  paymentTerms: string;
  incoterms: string;
  deliveryAddress: DeliveryAddress;
  items: POItem[];
  releaseStrategy?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  contactPerson: string;
  contactEmail: string;
  specialInstructions?: string;
}

export interface POItem {
  itemNumber: string;
  materialNumber: string;
  materialDescription: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: Date;
  plant: string;
  storageLocation?: string;
  accountAssignment?: string;
  taxCode?: string;
}

export interface GoodsReceipt {
  grNumber: string;
  grType: string;
  poNumber: string;
  deliveryNote: string;
  receivedDate: Date;
  postingDate: Date;
  status: 'POSTED' | 'REVERSED' | 'PENDING' | 'QUALITY_CHECK';
  receivedBy: string;
  plant: string;
  storageLocation: string;
  totalValue: number;
  currency: string;
  items: GRItem[];
  qualityInspection?: QualityInspection;
  movementType: string;
  documentReference?: string;
  remarks?: string;
}

export interface GRItem {
  itemNumber: string;
  materialNumber: string;
  materialDescription: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  batchNumber?: string;
  serialNumbers?: string[];
  expiryDate?: Date;
  qualityStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING_INSPECTION' | 'BLOCKED';
  storageLocation: string;
  bin?: string;
}

export interface DeliveryAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface QualityInspection {
  inspectionLot: string;
  inspectionDate: Date;
  inspector: string;
  result: 'PASSED' | 'FAILED' | 'PENDING';
  remarks?: string;
  certificates?: DocumentAttachment[];
}

export interface DocumentAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  description?: string;
  downloadUrl?: string;
}

// Dashboard summary interfaces
export interface BusinessTransactionSummary {
  rfqSummary: {
    total: number;
    open: number;
    submitted: number;
    awarded: number;
    expired: number;
  };
  poSummary: {
    total: number;
    open: number;
    partiallyDelivered: number;
    fullyDelivered: number;
    totalValue: number;
  };
  grSummary: {
    total: number;
    posted: number;
    pending: number;
    qualityCheck: number;
    totalValue: number;
  };
}

// API Response interfaces
export interface RFQResponse {
  success: boolean;
  message: string;
  rfqs: RequestForQuotation[];
  totalCount: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface POResponse {
  success: boolean;
  message: string;
  purchaseOrders: PurchaseOrder[];
  totalCount: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface GRResponse {
  success: boolean;
  message: string;
  goodsReceipts: GoodsReceipt[];
  totalCount: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
