const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock vendor data
const mockVendor = {
  vendorId: 'VENDOR001',
  vendorName: 'ABC Supplies Inc.',
  email: 'contact@abcsupplies.com',
  status: 'ACTIVE',
  lastLogin: new Date()
};

// Mock login endpoint
app.post('/api/auth/vendor/login', (req, res) => {
  const { vendorId, password } = req.body;
  
  // Mock credentials - you can change these
  if (vendorId === 'VENDOR001' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token-12345',
      vendorData: mockVendor
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid vendor credentials'
    });
  }
});

// Mock profile endpoint
app.get('/api/vendor/profile/:vendorId', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // Mock comprehensive vendor profile
  const mockProfile = {
    ...mockVendor,
    companyName: 'ABC Supplies Inc.',
    companyCode: 'ABC001',
    registrationNumber: 'REG123456789',
    vatNumber: 'VAT987654321',
    taxId: 'TAX123456',
    primaryContactName: 'John Smith',
    primaryContactEmail: 'john.smith@abcsupplies.com',
    primaryContactPhone: '+1-555-0123',
    businessType: 'Corporation',
    industryCode: 'SUPPLY',
    currency: 'USD',
    paymentTerms: 'NET30',
    creditLimit: 100000,
    sapVendorGroup: 'DOMESTIC',
    purchasingOrganization: ['1000', '2000'],
    accountGroup: 'KRED',
    reconAccount: '2100000',
    createdDate: new Date('2020-01-15'),
    lastModifiedDate: new Date(),
    approvalStatus: 'APPROVED',
    blockingStatus: null,
    addresses: [
      {
        id: 'addr1',
        type: 'HEADQUARTERS',
        name: 'ABC Supplies HQ',
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        countryCode: 'US',
        isPrimary: true
      }
    ],
    bankDetails: [
      {
        id: 'bank1',
        bankName: 'First National Bank',
        bankCode: 'FNB001',
        accountNumber: '1234567890',
        iban: 'US12345678901234567890',
        swiftCode: 'FNBKUS33',
        currency: 'USD',
        accountType: 'CHECKING',
        isPrimary: true
      }
    ],
    certifications: [
      {
        id: 'cert1',
        name: 'ISO 9001:2015',
        certifyingBody: 'International Standards Organization',
        issueDate: new Date('2023-01-01'),
        expiryDate: new Date('2026-01-01'),
        status: 'ACTIVE',
        certificateNumber: 'ISO9001-2023-001'
      }
    ],
    documents: [
      {
        id: 'doc1',
        name: 'Master Service Agreement',
        type: 'CONTRACT',
        uploadDate: new Date('2024-01-15'),
        expiryDate: new Date('2025-01-15'),
        status: 'ACTIVE',
        fileSize: 2048576,
        fileName: 'MSA_ABC_Supplies_2024.pdf'
      }
    ]
  };

  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    vendorProfile: mockProfile,
    lastSyncDate: new Date()
  });
});

// Session validation endpoint
app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization;
  
  if (token && token.includes('mock-jwt-token')) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

// Business Transaction Summary endpoint
app.get('/api/summary/vendor/:vendorId', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // Mock business transaction summary
  const businessSummary = {
    rfqSummary: {
      total: 15,
      open: 8,
      submitted: 4,
      awarded: 2,
      expired: 1
    },
    poSummary: {
      total: 23,
      open: 12,
      partiallyDelivered: 7,
      fullyDelivered: 4,
      totalValue: 450000
    },
    grSummary: {
      total: 18,
      posted: 15,
      pending: 2,
      qualityCheck: 1,
      totalValue: 380000
    }
  };

  res.json(businessSummary);
});

// RFQ endpoints
app.get('/api/rfq/vendor/:vendorId', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // Mock RFQ data
  const mockRFQs = [
    {
      rfqNumber: 'RFQ-2024-001',
      rfqType: 'Standard',
      description: 'Supply of Office Equipment',
      requestingCompany: 'ABC Corp',
      purchasingOrganization: '1000',
      purchasingGroup: '001',
      createdDate: new Date('2024-01-15'),
      quotationDeadline: new Date('2024-02-15'),
      status: 'OPEN',
      priority: 'HIGH',
      totalEstimatedValue: 25000,
      currency: 'USD',
      contactPerson: 'John Buyer',
      contactEmail: 'john.buyer@abccorp.com',
      contactPhone: '+1-555-0123'
    },
    {
      rfqNumber: 'RFQ-2024-002',
      rfqType: 'Standard',
      description: 'IT Services Contract',
      requestingCompany: 'ABC Corp',
      purchasingOrganization: '1000',
      purchasingGroup: '002',
      createdDate: new Date('2024-01-20'),
      quotationDeadline: new Date('2024-02-20'),
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      totalEstimatedValue: 75000,
      currency: 'USD',
      contactPerson: 'Jane Procurement',
      contactEmail: 'jane.procurement@abccorp.com',
      contactPhone: '+1-555-0124'
    }
  ];

  res.json({
    success: true,
    message: 'RFQs retrieved successfully',
    rfqs: mockRFQs,
    totalCount: mockRFQs.length
  });
});

// Purchase Order endpoints
app.get('/api/po/vendor/:vendorId', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // Mock PO data
  const mockPOs = [
    {
      poNumber: 'PO-2024-001',
      poType: 'Standard',
      description: 'Supply Contract for Q1 2024',
      companyCode: '1000',
      purchasingOrganization: '1000',
      purchasingGroup: '001',
      createdDate: new Date('2024-01-10'),
      expectedDeliveryDate: new Date('2024-02-28'),
      status: 'OPEN',
      totalValue: 125000,
      currency: 'USD',
      paymentTerms: 'NET30',
      incoterms: 'FOB',
      approvalStatus: 'APPROVED',
      contactPerson: 'Mike Operations',
      contactEmail: 'mike.operations@abccorp.com'
    },
    {
      poNumber: 'PO-2024-002',
      poType: 'Standard',
      description: 'Maintenance Services',
      companyCode: '1000',
      purchasingOrganization: '1000',
      purchasingGroup: '002',
      createdDate: new Date('2024-01-15'),
      expectedDeliveryDate: new Date('2024-03-15'),
      status: 'PARTIALLY_DELIVERED',
      totalValue: 45000,
      currency: 'USD',
      paymentTerms: 'NET15',
      incoterms: 'EXW',
      approvalStatus: 'APPROVED',
      contactPerson: 'Sarah Logistics',
      contactEmail: 'sarah.logistics@abccorp.com'
    }
  ];

  res.json({
    success: true,
    message: 'Purchase Orders retrieved successfully',
    purchaseOrders: mockPOs,
    totalCount: mockPOs.length
  });
});

// Goods Receipt endpoints
app.get('/api/gr/vendor/:vendorId', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // Mock GR data
  const mockGRs = [
    {
      grNumber: 'GR-2024-001',
      grType: 'Standard',
      poNumber: 'PO-2024-001',
      deliveryNote: 'DN-2024-001',
      receivedDate: new Date('2024-01-25'),
      postingDate: new Date('2024-01-26'),
      status: 'POSTED',
      receivedBy: 'Warehouse Team',
      plant: '1000',
      storageLocation: '0001',
      totalValue: 62500,
      currency: 'USD',
      movementType: '101',
      remarks: 'First delivery of PO-2024-001'
    },
    {
      grNumber: 'GR-2024-002',
      grType: 'Standard',
      poNumber: 'PO-2024-002',
      deliveryNote: 'DN-2024-002',
      receivedDate: new Date('2024-01-30'),
      postingDate: new Date('2024-01-30'),
      status: 'QUALITY_CHECK',
      receivedBy: 'QC Team',
      plant: '1000',
      storageLocation: '0002',
      totalValue: 22500,
      currency: 'USD',
      movementType: '101',
      remarks: 'Under quality inspection'
    }
  ];

  res.json({
    success: true,
    message: 'Goods Receipts retrieved successfully',
    goodsReceipts: mockGRs,
    totalCount: mockGRs.length
  });
});

// Financial endpoints
app.get('/api/financial/summary/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  
  const mockFinancialSummary = {
    vendorId: vendorId,
    currency: 'USD',
    totalInvoiced: 750000,
    totalPaid: 620000,
    totalOutstanding: 130000,
    overdueAmount: 45000,
    creditMemoTotal: 5000,
    debitMemoTotal: 2000,
    averagePaymentDays: 28,
    invoiceCount: {
      total: 24,
      pending: 8,
      paid: 14,
      overdue: 2
    },
    memoCount: {
      creditMemos: 3,
      debitMemos: 1
    },
    lastPaymentDate: new Date('2024-01-25'),
    nextDueDate: new Date('2024-02-15')
  };

  res.json({
    success: true,
    financialSummary: mockFinancialSummary
  });
});

app.get('/api/financial/invoices/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  
  const mockInvoices = [
    {
      invoiceNumber: 'INV-2024-001',
      invoiceType: 'STANDARD',
      poNumber: 'PO-2024-001',
      grNumber: 'GR-2024-001',
      vendorId: vendorId,
      companyCode: '1000',
      invoiceDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      dueDate: new Date('2024-02-14'),
      paymentTerms: 'NET30',
      currency: 'USD',
      grossAmount: 125000,
      taxAmount: 12500,
      netAmount: 112500,
      status: 'APPROVED',
      paymentStatus: 'OPEN',
      items: [],
      taxDetails: [],
      paymentHistory: []
    },
    {
      invoiceNumber: 'INV-2024-002',
      invoiceType: 'STANDARD',
      poNumber: 'PO-2024-002',
      grNumber: 'GR-2024-002',
      vendorId: vendorId,
      companyCode: '1000',
      invoiceDate: new Date('2024-01-20'),
      postingDate: new Date('2024-01-21'),
      dueDate: new Date('2024-02-19'),
      paymentTerms: 'NET30',
      currency: 'USD',
      grossAmount: 85000,
      taxAmount: 8500,
      netAmount: 76500,
      status: 'PENDING',
      paymentStatus: 'OPEN',
      items: [],
      taxDetails: [],
      paymentHistory: []
    },
    {
      invoiceNumber: 'INV-2023-045',
      invoiceType: 'STANDARD',
      poNumber: 'PO-2023-045',
      grNumber: 'GR-2023-045',
      vendorId: vendorId,
      companyCode: '1000',
      invoiceDate: new Date('2023-12-15'),
      postingDate: new Date('2023-12-16'),
      dueDate: new Date('2024-01-14'),
      paymentTerms: 'NET30',
      currency: 'USD',
      grossAmount: 95000,
      taxAmount: 9500,
      netAmount: 85500,
      status: 'APPROVED',
      paymentStatus: 'PAID',
      items: [],
      taxDetails: [],
      paymentHistory: []
    },
    {
      invoiceNumber: 'INV-2023-040',
      invoiceType: 'STANDARD',
      poNumber: 'PO-2023-040',
      grNumber: 'GR-2023-040',
      vendorId: vendorId,
      companyCode: '1000',
      invoiceDate: new Date('2023-11-10'),
      postingDate: new Date('2023-11-11'),
      dueDate: new Date('2023-12-10'),
      paymentTerms: 'NET30',
      currency: 'USD',
      grossAmount: 75000,
      taxAmount: 7500,
      netAmount: 67500,
      status: 'APPROVED',
      paymentStatus: 'OVERDUE',
      items: [],
      taxDetails: [],
      paymentHistory: []
    }
  ];

  res.json({
    success: true,
    invoices: mockInvoices,
    totalCount: mockInvoices.length
  });
});

app.get('/api/financial/payments/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  
  const mockPayments = [
    {
      paymentId: 'PAY-2024-001',
      paymentDate: new Date('2024-01-25'),
      invoiceNumbers: ['INV-2023-045', 'INV-2023-046'],
      totalAmount: 185000,
      currency: 'USD',
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: 'TXN-2024-001',
      status: 'COMPLETED'
    },
    {
      paymentId: 'PAY-2024-002',
      paymentDate: new Date('2024-01-18'),
      invoiceNumbers: ['INV-2023-042'],
      totalAmount: 67500,
      currency: 'USD',
      paymentMethod: 'ACH',
      paymentReference: 'TXN-2024-002',
      status: 'COMPLETED'
    },
    {
      paymentId: 'PAY-2024-003',
      paymentDate: new Date('2024-01-30'),
      invoiceNumbers: ['INV-2023-047', 'INV-2023-048'],
      totalAmount: 125000,
      currency: 'USD',
      paymentMethod: 'WIRE',
      paymentReference: 'TXN-2024-003',
      status: 'PROCESSING'
    }
  ];

  res.json({
    success: true,
    payments: mockPayments,
    totalCount: mockPayments.length
  });
});

app.get('/api/financial/memos/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  
  const mockMemos = [
    {
      memoNumber: 'CM-2024-001',
      memoType: 'CREDIT_MEMO',
      referenceInvoice: 'INV-2023-042',
      vendorId: vendorId,
      companyCode: '1000',
      memoDate: new Date('2024-01-20'),
      postingDate: new Date('2024-01-21'),
      currency: 'USD',
      amount: 5000,
      taxAmount: 500,
      netAmount: 4500,
      reason: 'Quality issues with delivered goods',
      reasonCode: 'QUALITY',
      status: 'APPROVED',
      items: [],
      createdBy: 'John Procurement',
      createdDate: new Date('2024-01-20')
    },
    {
      memoNumber: 'DM-2024-001',
      memoType: 'DEBIT_MEMO',
      referenceInvoice: 'INV-2024-001',
      vendorId: vendorId,
      companyCode: '1000',
      memoDate: new Date('2024-01-22'),
      postingDate: new Date('2024-01-23'),
      currency: 'USD',
      amount: 2000,
      taxAmount: 200,
      netAmount: 1800,
      reason: 'Additional freight charges',
      reasonCode: 'FREIGHT',
      status: 'PENDING',
      items: [],
      createdBy: 'Sarah Logistics',
      createdDate: new Date('2024-01-22')
    },
    {
      memoNumber: 'CM-2024-002',
      memoType: 'CREDIT_MEMO',
      referenceInvoice: 'INV-2023-050',
      vendorId: vendorId,
      companyCode: '1000',
      memoDate: new Date('2024-01-15'),
      postingDate: new Date('2024-01-16'),
      currency: 'USD',
      amount: 3500,
      taxAmount: 350,
      netAmount: 3150,
      reason: 'Volume discount adjustment',
      reasonCode: 'DISCOUNT',
      status: 'APPROVED',
      items: [],
      createdBy: 'Mike Finance',
      createdDate: new Date('2024-01-15')
    }
  ];

  res.json({
    success: true,
    memos: mockMemos,
    totalCount: mockMemos.length
  });
});

app.get('/api/financial/aging/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  
  const mockAgingReport = {
    vendorId: vendorId,
    vendorName: 'ABC Supplies Inc.',
    currency: 'USD',
    asOfDate: new Date(),
    totalOutstanding: 130000,
    agingBuckets: [
      {
        periodDescription: 'Current',
        daysFrom: 0,
        daysTo: 0,
        amount: 75000,
        invoiceCount: 6,
        percentage: 57.7
      },
      {
        periodDescription: '1-30 days',
        daysFrom: 1,
        daysTo: 30,
        amount: 30000,
        invoiceCount: 2,
        percentage: 23.1
      },
      {
        periodDescription: '31-60 days',
        daysFrom: 31,
        daysTo: 60,
        amount: 20000,
        invoiceCount: 1,
        percentage: 15.4
      },
      {
        periodDescription: '60+ days',
        daysFrom: 61,
        daysTo: 999,
        amount: 5000,
        invoiceCount: 1,
        percentage: 3.8
      }
    ],
    overdueAmount: 55000,
    averageDaysOutstanding: 25
  };

  res.json({
    success: true,
    agingReport: mockAgingReport
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
  console.log('\nTest Credentials:');
  console.log('Vendor ID: VENDOR001');
  console.log('Password: password123');
});
