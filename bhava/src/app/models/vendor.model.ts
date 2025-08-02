export interface VendorLoginRequest {
  vendorId: string;
  password: string;
}

export interface VendorLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  vendorData?: VendorData;
}

export interface VendorData {
  vendorId: string;
  vendorName: string;
  email: string;
  status: string;
  lastLogin?: Date;
}

export interface VendorProfile extends VendorData {
  // Company Information
  companyName: string;
  companyCode: string;
  registrationNumber: string;
  vatNumber?: string;
  taxId?: string;
  
  // Contact Information
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  secondaryContactName?: string;
  secondaryContactEmail?: string;
  secondaryContactPhone?: string;
  
  // Address Information
  addresses: VendorAddress[];
  
  // Business Information
  businessType: string;
  industryCode: string;
  currency: string;
  paymentTerms: string;
  creditLimit: number;
  
  // Bank Information
  bankDetails: BankDetail[];
  
  // SAP Specific
  sapVendorGroup: string;
  purchasingOrganization: string[];
  accountGroup: string;
  reconAccount: string;
  
  // Status and Dates
  createdDate: Date;
  lastModifiedDate: Date;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  blockingStatus?: 'POSTING' | 'PAYMENT' | 'ALL' | null;
  
  // Compliance
  certifications: Certification[];
  documents: VendorDocument[];
}

export interface VendorAddress {
  id: string;
  type: 'HEADQUARTERS' | 'BILLING' | 'SHIPPING' | 'REMIT_TO';
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  isPrimary: boolean;
}

export interface BankDetail {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  iban?: string;
  swiftCode?: string;
  currency: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'CURRENT';
  isPrimary: boolean;
}

export interface Certification {
  id: string;
  name: string;
  certifyingBody: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  certificateNumber: string;
}

export interface VendorDocument {
  id: string;
  name: string;
  type: 'CONTRACT' | 'CERTIFICATE' | 'TAX_FORM' | 'INSURANCE' | 'OTHER';
  uploadDate: Date;
  expiryDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING_REVIEW';
  fileSize: number;
  fileName: string;
}

export interface VendorProfileResponse {
  success: boolean;
  message: string;
  vendorProfile?: VendorProfile;
  lastSyncDate?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errorCode?: string;
}
