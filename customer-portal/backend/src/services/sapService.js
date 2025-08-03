const axios = require('axios');
const soap = require('soap');
const bcrypt = require('bcryptjs');
const SAPWebService = require('./sapWebService');

class SapService {
  constructor() {
    this.sapBaseUrl = process.env.SAP_BASE_URL || 'http://your-sap-server:8000';
    this.sapClient = process.env.SAP_CLIENT || '100';
    this.sapUser = process.env.SAP_USER;
    this.sapPassword = process.env.SAP_PASSWORD;
    this.authHeader = null;
    
    // Initialize SAP SOAP Web Service
    this.sapWebService = new SAPWebService();
  }

  /**
   * Initialize SAP connection with authentication
   */
  async initialize() {
    try {
      if (this.authHeader) {
        return true;
      }

      // Create basic auth header for SAP Web Services
      const credentials = Buffer.from(`${this.sapUser}:${this.sapPassword}`).toString('base64');
      this.authHeader = `Basic ${credentials}`;
      
      console.log('SAP service initialized');
      return true;
    } catch (error) {
      console.error('SAP initialization error:', error);
      throw new Error('Failed to initialize SAP connection');
    }
  }

  /**
   * Make HTTP request to SAP Web Service
   * @param {string} endpoint - SAP endpoint
   * @param {Object} data - Request data
   * @param {string} method - HTTP method
   * @returns {Object} - Response data
   */
  async callSapWebService(endpoint, data = {}, method = 'POST') {
    try {
      await this.initialize();

      const config = {
        method: method,
        url: `${this.sapBaseUrl}${endpoint}`,
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
          'sap-client': this.sapClient
        },
        timeout: 30000
      };

      if (method === 'POST' || method === 'PUT') {
        config.data = data;
      } else if (method === 'GET') {
        config.params = data;
      }

      const response = await axios(config);
      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('SAP Web Service call error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'SAP service error',
        error: error.message
      };
    }
  }

  /**
   * Check if customer exists in SAP standard table
   * @param {string} customerId - Customer ID to check
   * @returns {Object} - Success status and customer data
   */
  async checkCustomerExists(customerId) {
    try {
      // Call SAP Web Service to check customer in standard table (e.g., KNA1)
      const result = await this.callSapWebService('/sap/bc/rest/customer/check', {
        customerId: customerId.toUpperCase().padStart(10, '0')
      });

      if (result.success && result.data && result.data.exists) {
        return {
          success: true,
          customerData: {
            customerId: result.data.customerId,
            name: result.data.name,
            city: result.data.city
          }
        };
      }

      // If SAP service returns success:false or no data, fall back to development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SAP service not available, falling back to simulation');
        return this.simulateCustomerCheck(customerId);
      }

      return {
        success: false,
        message: 'Customer not found in system'
      };

    } catch (error) {
      console.error('Error checking customer existence:', error);
      
      // Fallback for development - simulate SAP response
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating SAP customer check');
        return this.simulateCustomerCheck(customerId);
      }

      return {
        success: false,
        message: 'Error connecting to SAP system'
      };
    }
  }

    /**
   * Authenticate customer using SAP SOAP Web Service
   * @param {string} customerId - Customer ID
   * @param {string} password - Customer password
   * @returns {Object} - Authentication result
   */
  async authenticateCustomer(customerId, password) {
    try {
      console.log(`Attempting SAP SOAP authentication for customer: ${customerId}`);
      
      // Use SAP SOAP Web Service for authentication
      const result = await this.sapWebService.authenticateUser(customerId, password);

      if (result.success) {
        console.log('SAP SOAP authentication successful');
        
        // Get additional customer information if authentication is successful
        const customerInfo = await this.sapWebService.getCustomerInfo(customerId);
        
        return {
          success: true,
          customerData: {
            customerId: customerId,
            name: customerInfo.data?.name || 'John Doe',
            email: customerInfo.data?.email || 'customer@company.com',
            company: customerInfo.data?.company || 'Default Company',
            phone: customerInfo.data?.phone || '+1-555-0123',
            address: customerInfo.data?.address || 'Default Address',
            lastLogin: new Date().toISOString()
          }
        };
      }

      // If SAP SOAP service returns success:false, check development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SAP SOAP authentication failed, falling back to simulation');
        return this.simulateAuthentication(customerId, password);
      }

      return {
        success: false,
        message: result.message || 'Invalid credentials'
      };

    } catch (error) {
      console.error('Error in SAP SOAP authentication:', error);
      
      // Fallback for development - simulate authentication
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating SAP authentication due to error');
        return this.simulateAuthentication(customerId, password);
      }

      return {
        success: false,
        message: 'Authentication service unavailable'
      };
    }
  }

  /**
   * Get customer dashboard data using SAP SOAP Web Service
   * @param {string} customerId - Customer ID
   * @returns {Object} - Dashboard data
   */
  async getCustomerDashboard(customerId) {
    try {
      console.log(`Fetching dashboard data for customer: ${customerId}`);
      
      // Use SAP SOAP Web Service for dashboard data
      const result = await this.sapWebService.getDashboardData(customerId);

      if (result.success && result.data) {
        console.log('SAP SOAP dashboard data retrieved successfully');
        return {
          success: true,
          data: {
            totalInquiries: result.data.totalInquiries || 0,
            totalSalesOrders: result.data.totalSalesOrders || 0,
            totalDeliveries: result.data.totalDeliveries || 0,
            outstandingAmount: result.data.outstandingAmount || 0,
            inquiryConversionRate: result.data.inquiryConversionRate || 0,
            averageOrderValue: result.data.averageOrderValue || 0,
            deliveryPerformance: result.data.deliveryPerformance || 0,
            recentInquiries: result.data.recentInquiries || [],
            recentSalesOrders: result.data.recentSalesOrders || [],
            recentDeliveries: result.data.recentDeliveries || []
          }
        };
      }

      // If SAP SOAP service returns success:false, fall back to development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SAP SOAP dashboard service failed, falling back to simulation');
        return this.simulateDashboardData(customerId);
      }

      return {
        success: false,
        message: result.message || 'Unable to fetch dashboard data'
      };

    } catch (error) {
      console.error('Error fetching SAP SOAP dashboard data:', error);
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Using simulated dashboard data due to error');
        return this.simulateDashboardData(customerId);
      }

      return {
        success: false,
        message: 'Unable to fetch dashboard data'
      };
    }
  }

  /**
   * Get customer profile information
   * @param {string} customerId - Customer ID
   * @returns {Object} - Profile data
   */
  async getCustomerProfile(customerId) {
    try {
      // Use SOAP web service for customer profile
      const profileData = await this.soapService.getCustomerProfile(customerId);
      
      if (profileData) {
        return {
          success: true,
          data: {
            customerId: profileData.customerId || customerId,
            name: profileData.name || 'N/A',
            email: profileData.email || 'N/A',
            phone: profileData.phone || 'N/A',
            address: profileData.address || 'N/A',
            city: profileData.city || 'N/A',
            country: profileData.country || 'N/A',
            company: profileData.company || 'N/A'
          }
        };
      }

      // If SAP SOAP service fails, fall back to development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SAP SOAP profile service not available, falling back to simulation');
        return this.simulateProfileData(customerId);
      }

      return {
        success: false,
        message: 'Customer profile not found'
      };

    } catch (error) {
      console.error('Error fetching profile data:', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating customer profile data');
        return this.simulateProfileData(customerId);
      }

      return {
        success: false,
        message: 'Unable to fetch profile data'
      };
    }
  }

  /**
   * Get customer orders
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options (page, limit, status)
   * @returns {Object} - Orders data
   */
  async getCustomerOrders(customerId, options = {}) {
    try {
      // Use SOAP web service for customer orders
      const ordersData = await this.soapService.getCustomerOrders(customerId, options);
      
      if (ordersData && ordersData.orders) {
        return {
          success: true,
          data: ordersData.orders || [],
          pagination: ordersData.pagination || {
            page: options.page || 1,
            limit: options.limit || 10,
            total: ordersData.orders.length || 0
          }
        };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SAP SOAP orders service not available, falling back to simulation');
        return this.simulateOrdersData(customerId, options);
      }

      return {
        success: false,
        message: 'Unable to fetch orders'
      };

    } catch (error) {
      console.error('Error fetching orders:', error);
      
      if (process.env.NODE_ENV === 'development') {
        return this.simulateOrdersData(customerId, options);
      }

      return {
        success: false,
        message: 'Unable to fetch orders'
      };
    }
  }

  /**
   * Get customer inquiries
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Object} - Inquiries data
   */
  async getCustomerInquiries(customerId, options = {}) {
    try {
      // Use SOAP web service for inquiries
      const inquiriesData = await this.soapService.getCustomerInquiries(customerId, options);
      
      if (inquiriesData && inquiriesData.inquiries) {
        return {
          success: true,
          data: inquiriesData.inquiries,
          pagination: inquiriesData.pagination || {
            currentPage: options.page || 1,
            totalPages: Math.ceil((inquiriesData.inquiries.length || 0) / (options.limit || 10)),
            totalItems: inquiriesData.inquiries.length || 0
          }
        };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SAP SOAP inquiries service not available, falling back to simulation');
        return this.simulateInquiriesData(customerId, options);
      }

      return {
        success: false,
        message: 'Unable to fetch inquiries'
      };
    } catch (error) {
      console.error('Error fetching inquiries data:', error);
      
      if (process.env.NODE_ENV === 'development') {
        return this.simulateInquiriesData(customerId, options);
      }

      return {
        success: false,
        message: 'Unable to fetch inquiries'
      };
    }
  }

  /**
   * Get customer sales orders
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Object} - Sales orders data
   */
  async getCustomerSalesOrders(customerId, options = {}) {
    try {
      // Use SOAP web service for sales orders
      const salesOrdersData = await this.soapService.getCustomerSalesOrders(customerId, options);
      
      if (salesOrdersData && salesOrdersData.salesOrders) {
        return {
          success: true,
          data: salesOrdersData.salesOrders,
          pagination: salesOrdersData.pagination || {
            currentPage: options.page || 1,
            totalPages: Math.ceil((salesOrdersData.salesOrders.length || 0) / (options.limit || 10)),
            totalItems: salesOrdersData.salesOrders.length || 0
          }
        };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SAP SOAP sales orders service not available, falling back to simulation');
        return this.simulateSalesOrdersData(customerId, options);
      }

      return {
        success: false,
        message: 'Unable to fetch sales orders'
      };
    } catch (error) {
      console.error('Error fetching sales orders data:', error);
      
      if (process.env.NODE_ENV === 'development') {
        return this.simulateSalesOrdersData(customerId, options);
      }

      return {
        success: false,
        message: 'Unable to fetch sales orders'
      };
    }
  }

  /**
   * Get customer deliveries
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Object} - Deliveries data
   */
  async getCustomerDeliveries(customerId, options = {}) {
    try {
      // Use SOAP web service for deliveries
      const deliveriesData = await this.soapService.getCustomerDeliveries(customerId, options);
      
      if (deliveriesData && deliveriesData.deliveries) {
        return {
          success: true,
          data: deliveriesData.deliveries,
          pagination: deliveriesData.pagination || {
            currentPage: options.page || 1,
            totalPages: Math.ceil((deliveriesData.deliveries.length || 0) / (options.limit || 10)),
            totalItems: deliveriesData.deliveries.length || 0
          }
        };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SAP SOAP deliveries service not available, falling back to simulation');
        return this.simulateDeliveriesData(customerId, options);
      }

      return {
        success: false,
        message: 'Unable to fetch deliveries'
      };
    } catch (error) {
      console.error('Error fetching deliveries data:', error);
      
      if (process.env.NODE_ENV === 'development') {
        return this.simulateDeliveriesData(customerId, options);
      }

      return {
        success: false,
        message: 'Unable to fetch deliveries'
      };
    }
  }

  // Development mode simulation methods
  simulateCustomerCheck(customerId) {
    const testCustomers = ['CUST001', 'CUST002', 'TEST123', '0000000003', '3'];
    const normalizedCustomerId = customerId.toUpperCase();
    
    if (testCustomers.includes(normalizedCustomerId)) {
      return {
        success: true,
        customerData: {
          customerId: normalizedCustomerId === '3' ? '0000000003' : normalizedCustomerId,
          name: normalizedCustomerId === '0000000003' || normalizedCustomerId === '3' ? 'John Doe' : 'Test Customer',
          city: normalizedCustomerId === '0000000003' || normalizedCustomerId === '3' ? 'New York' : 'Test City'
        }
      };
    }
    return { success: false, message: 'Customer not found' };
  }

  simulateAuthentication(customerId, password) {
    // Simple test credentials for development
    const testCredentials = {
      'CUST001': 'password123',
      'CUST002': 'test456',
      'TEST123': 'demo789',
      '0000000003': '12345',
      '3': '12345'  // Also allow without leading zeros
    };

    const normalizedCustomerId = customerId.toUpperCase();
    
    if (testCredentials[normalizedCustomerId] === password) {
      return {
        success: true,
        customerData: {
          customerId: normalizedCustomerId,
          name: 'John Doe',
          email: 'john.doe@example.com',
          company: 'Sample Corporation',
          lastLogin: new Date().toISOString()
        }
      };
    }

    return { success: false, message: 'Invalid credentials' };
  }

  simulateDashboardData(customerId) {
    const recentInquiries = [
      {
        inquiryNumber: 'INQ-2025-001',
        inquiryDate: '2025-08-01',
        description: 'Request for industrial equipment quotation',
        status: 'In Progress',
        priority: 'High',
        totalValue: 15000,
        items: [
          { materialNumber: 'MAT-001', description: 'Industrial Pump', quantity: 2, unit: 'EA' },
          { materialNumber: 'MAT-002', description: 'Control Valve', quantity: 5, unit: 'EA' }
        ]
      },
      {
        inquiryNumber: 'INQ-2025-002',
        inquiryDate: '2025-07-30',
        description: 'Maintenance parts inquiry',
        status: 'Quoted',
        priority: 'Medium',
        totalValue: 8500,
        items: [
          { materialNumber: 'MAT-003', description: 'Bearing Assembly', quantity: 10, unit: 'EA' }
        ]
      }
    ];

    const recentSalesOrders = [
      {
        orderNumber: 'SO-2025-001',
        orderDate: '2025-07-28',
        requestedDeliveryDate: '2025-08-15',
        orderValue: 12500,
        currency: 'USD',
        status: 'Confirmed',
        customerPO: 'PO-ABC-2025-45',
        items: [
          {
            lineItem: '10',
            materialNumber: 'MAT-004',
            description: 'Hydraulic Cylinder',
            orderedQuantity: 3,
            deliveredQuantity: 0,
            unit: 'EA',
            unitPrice: 4166.67,
            totalPrice: 12500,
            deliveryDate: '2025-08-15',
            status: 'In Production'
          }
        ]
      }
    ];

    const recentDeliveries = [
      {
        deliveryNumber: 'DEL-2025-001',
        deliveryDate: '2025-07-25',
        trackingNumber: 'TRK-XYZ-789456',
        status: 'Delivered',
        carrier: 'DHL Express',
        relatedSalesOrder: 'SO-2025-099',
        deliveryAddress: '123 Business Avenue, New York, NY 10001',
        actualArrival: '2025-07-25T14:30:00Z',
        items: [
          {
            materialNumber: 'MAT-005',
            description: 'Electric Motor',
            deliveredQuantity: 1,
            unit: 'EA',
            batchNumber: 'BTH-2025-123'
          }
        ]
      }
    ];

    return {
      success: true,
      data: {
        // Enhanced metrics for business dashboard
        totalInquiries: 15,
        totalSalesOrders: 8,
        totalDeliveries: 12,
        outstandingAmount: 25750.50,
        inquiryConversionRate: 67,
        averageOrderValue: 18500,
        deliveryPerformance: 95,
        
        // Recent transaction data
        recentInquiries: recentInquiries,
        recentSalesOrders: recentSalesOrders,
        recentDeliveries: recentDeliveries
      }
    };
  }

  simulateProfileData(customerId) {
    // Provide realistic data based on customer ID
    const profileData = {
      '0000000003': {
        customerId: '0000000003',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        address: '123 Business Avenue',
        city: 'New York',
        country: 'United States',
        company: 'Acme Corporation'
      },
      '3': {
        customerId: '0000000003',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        address: '123 Business Avenue',
        city: 'New York',
        country: 'United States',
        company: 'Acme Corporation'
      }
    };

    const normalizedCustomerId = customerId.toUpperCase();
    const data = profileData[normalizedCustomerId] || {
      customerId: normalizedCustomerId,
      name: 'Sample Customer',
      email: 'customer@example.com',
      phone: '+1-555-0100',
      address: '456 Demo Street',
      city: 'Demo City',
      country: 'Demo Country',
      company: 'Demo Company'
    };

    return {
      success: true,
      data: data
    };
  }

  simulateOrdersData(customerId, options) {
    const orders = [
      { orderNumber: 'ORD-001', date: '2024-01-15', amount: 1250.00, status: 'Pending' },
      { orderNumber: 'ORD-002', date: '2024-01-10', amount: 875.25, status: 'Shipped' },
      { orderNumber: 'ORD-003', date: '2024-01-05', amount: 2100.75, status: 'Delivered' },
      { orderNumber: 'ORD-004', date: '2024-01-01', amount: 650.00, status: 'Delivered' },
      { orderNumber: 'ORD-005', date: '2023-12-28', amount: 1800.50, status: 'Delivered' }
    ];

    const page = options.page || 1;
    const limit = options.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      success: true,
      data: orders.slice(start, end),
      pagination: {
        page: page,
        limit: limit,
        total: orders.length
      }
    };
  }

  // Simulate inquiries data for development
  simulateInquiriesData(customerId) {
    return {
      success: true,
      data: [
        {
          inquiryNumber: 'INQ-2025-001',
          inquiryDate: '2025-08-01',
          description: 'Request for industrial equipment quotation',
          status: 'In Progress',
          priority: 'High',
          totalValue: 15000,
          validUntil: '2025-08-15',
          salesRep: 'John Smith',
          items: [
            { 
              materialNumber: 'MAT-001', 
              description: 'Industrial Pump Model X1', 
              quantity: 2, 
              unit: 'EA',
              unitPrice: 7500,
              totalPrice: 15000,
              specifications: '220V, 50Hz, IP65 Protection'
            },
            { 
              materialNumber: 'MAT-002', 
              description: 'Control Valve DN50', 
              quantity: 5, 
              unit: 'EA',
              unitPrice: 850,
              totalPrice: 4250,
              specifications: 'Stainless Steel, PN16'
            }
          ]
        },
        {
          inquiryNumber: 'INQ-2025-002',
          inquiryDate: '2025-07-30',
          description: 'Maintenance parts inquiry for Q3',
          status: 'Quoted',
          priority: 'Medium',
          totalValue: 8500,
          validUntil: '2025-08-10',
          salesRep: 'Sarah Johnson',
          items: [
            { 
              materialNumber: 'MAT-003', 
              description: 'Bearing Assembly SKF 6208', 
              quantity: 10, 
              unit: 'EA',
              unitPrice: 125,
              totalPrice: 1250,
              specifications: 'Deep groove ball bearing'
            },
            { 
              materialNumber: 'MAT-004', 
              description: 'Hydraulic Filter Element', 
              quantity: 20, 
              unit: 'EA',
              unitPrice: 65,
              totalPrice: 1300,
              specifications: '10 micron filtration'
            }
          ]
        },
        {
          inquiryNumber: 'INQ-2025-003',
          inquiryDate: '2025-07-25',
          description: 'Emergency spare parts requirement',
          status: 'Closed - Won',
          priority: 'Critical',
          totalValue: 22000,
          validUntil: '2025-07-30',
          salesRep: 'Mike Wilson',
          items: [
            { 
              materialNumber: 'MAT-005', 
              description: 'Emergency Motor 15kW', 
              quantity: 1, 
              unit: 'EA',
              unitPrice: 22000,
              totalPrice: 22000,
              specifications: '3-phase, 1450 RPM, IE3 efficiency'
            }
          ]
        }
      ]
    };
  }

  // Simulate sales orders data for development
  simulateSalesOrdersData(customerId) {
    return {
      success: true,
      data: [
        {
          orderNumber: 'SO-2025-001',
          orderDate: '2025-07-28',
          requestedDeliveryDate: '2025-08-15',
          confirmedDeliveryDate: '2025-08-15',
          orderValue: 12500,
          currency: 'USD',
          status: 'Confirmed',
          customerPO: 'PO-ABC-2025-45',
          paymentTerms: 'Net 30',
          incoterms: 'FCA Plant',
          salesRep: 'John Smith',
          items: [
            {
              lineItem: '10',
              materialNumber: 'MAT-004',
              description: 'Hydraulic Cylinder HSC-200',
              orderedQuantity: 3,
              deliveredQuantity: 0,
              unit: 'EA',
              unitPrice: 4166.67,
              totalPrice: 12500,
              deliveryDate: '2025-08-15',
              status: 'In Production',
              plant: 'Plant 001'
            }
          ]
        },
        {
          orderNumber: 'SO-2025-002',
          orderDate: '2025-07-20',
          requestedDeliveryDate: '2025-08-05',
          confirmedDeliveryDate: '2025-08-05',
          orderValue: 8750,
          currency: 'USD',
          status: 'Partially Delivered',
          customerPO: 'PO-ABC-2025-42',
          paymentTerms: 'Net 30',
          incoterms: 'CIF Destination',
          salesRep: 'Sarah Johnson',
          items: [
            {
              lineItem: '10',
              materialNumber: 'MAT-006',
              description: 'Pressure Sensor PSR-100',
              orderedQuantity: 25,
              deliveredQuantity: 15,
              unit: 'EA',
              unitPrice: 350,
              totalPrice: 8750,
              deliveryDate: '2025-08-05',
              status: 'Partially Delivered',
              plant: 'Plant 002'
            }
          ]
        },
        {
          orderNumber: 'SO-2025-003',
          orderDate: '2025-07-15',
          requestedDeliveryDate: '2025-07-30',
          confirmedDeliveryDate: '2025-07-30',
          orderValue: 45000,
          currency: 'USD',
          status: 'Delivered',
          customerPO: 'PO-ABC-2025-38',
          paymentTerms: 'Net 45',
          incoterms: 'DDP Destination',
          salesRep: 'Mike Wilson',
          items: [
            {
              lineItem: '10',
              materialNumber: 'MAT-007',
              description: 'Complete Pump Assembly PA-500',
              orderedQuantity: 1,
              deliveredQuantity: 1,
              unit: 'EA',
              unitPrice: 45000,
              totalPrice: 45000,
              deliveryDate: '2025-07-30',
              status: 'Delivered',
              plant: 'Plant 001'
            }
          ]
        }
      ]
    };
  }

  // Simulate deliveries data for development
  simulateDeliveriesData(customerId) {
    return {
      success: true,
      data: [
        {
          deliveryNumber: 'DEL-2025-001',
          deliveryDate: '2025-07-25',
          trackingNumber: 'TRK-XYZ-789456',
          status: 'Delivered',
          carrier: 'DHL Express',
          relatedSalesOrder: 'SO-2025-003',
          billOfLading: 'BOL-2025-445',
          deliveryAddress: '123 Business Avenue, New York, NY 10001',
          shippingAddress: 'Plant 001, Industrial Zone, Houston, TX 77001',
          estimatedArrival: '2025-07-25T12:00:00Z',
          actualArrival: '2025-07-25T14:30:00Z',
          weight: '850 kg',
          packageCount: 3,
          items: [
            {
              materialNumber: 'MAT-007',
              description: 'Complete Pump Assembly PA-500',
              deliveredQuantity: 1,
              unit: 'EA',
              batchNumber: 'BTH-2025-445',
              serialNumber: 'SN-PA500-2025-001',
              packageNumber: 'PKG-001'
            }
          ]
        },
        {
          deliveryNumber: 'DEL-2025-002',
          deliveryDate: '2025-07-22',
          trackingNumber: 'TRK-ABC-123789',
          status: 'In Transit',
          carrier: 'FedEx Ground',
          relatedSalesOrder: 'SO-2025-002',
          billOfLading: 'BOL-2025-442',
          deliveryAddress: '456 Manufacturing Street, Chicago, IL 60601',
          shippingAddress: 'Plant 002, Tech Park, Dallas, TX 75001',
          estimatedArrival: '2025-08-02T16:00:00Z',
          actualArrival: null,
          weight: '125 kg',
          packageCount: 2,
          items: [
            {
              materialNumber: 'MAT-006',
              description: 'Pressure Sensor PSR-100',
              deliveredQuantity: 15,
              unit: 'EA',
              batchNumber: 'BTH-2025-442',
              serialNumber: 'SN-PSR100-2025-015',
              packageNumber: 'PKG-002'
            }
          ]
        },
        {
          deliveryNumber: 'DEL-2025-003',
          deliveryDate: '2025-07-18',
          trackingNumber: 'TRK-UPS-456123',
          status: 'Delivered',
          carrier: 'UPS Next Day Air',
          relatedSalesOrder: 'SO-2025-001',
          billOfLading: 'BOL-2025-438',
          deliveryAddress: '789 Industrial Park, Detroit, MI 48201',
          shippingAddress: 'Plant 001, Industrial Zone, Houston, TX 77001',
          estimatedArrival: '2025-07-19T10:30:00Z',
          actualArrival: '2025-07-19T09:45:00Z',
          weight: '45 kg',
          packageCount: 1,
          items: [
            {
              materialNumber: 'MAT-008',
              description: 'Calibration Kit CK-PRO',
              deliveredQuantity: 1,
              unit: 'SET',
              batchNumber: 'BTH-2025-438',
              serialNumber: 'SN-CKPRO-2025-001',
              packageNumber: 'PKG-003'
            }
          ]
        }
      ]
    };
  }

  // Financial Sheet Methods

  /**
   * Get customer invoices for financial sheet
   * @param {string} customerId - Customer ID
   * @returns {Object} - Invoices data
   */
  async getCustomerInvoices(customerId) {
    try {
      // In production, this would call SAP RFC function
      // Example: await this.callSapRfc('Z_GET_CUSTOMER_INVOICES', { IV_CUSTOMER: customerId });

      // Mock data for development
      return {
        success: true,
        data: [
          {
            invoiceNumber: 'INV-2025-001',
            invoiceDate: '2025-07-15',
            dueDate: '2025-08-15',
            amount: 125000.00,
            taxAmount: 22500.00,
            totalAmount: 147500.00,
            status: 'pending',
            purchaseOrderNumber: 'PO-2025-001',
            description: 'Industrial Sensors and Equipment - Q3 2025',
            currency: 'INR',
            paymentTerms: 'Net 30',
            agingDays: 18
          },
          {
            invoiceNumber: 'INV-2025-002',
            invoiceDate: '2025-06-28',
            dueDate: '2025-07-28',
            amount: 87500.00,
            taxAmount: 15750.00,
            totalAmount: 103250.00,
            status: 'overdue',
            purchaseOrderNumber: 'PO-2025-002',
            description: 'Temperature Control Systems - June 2025',
            currency: 'INR',
            paymentTerms: 'Net 30',
            agingDays: 36
          },
          {
            invoiceNumber: 'INV-2025-003',
            invoiceDate: '2025-06-10',
            dueDate: '2025-07-10',
            amount: 245000.00,
            taxAmount: 44100.00,
            totalAmount: 289100.00,
            status: 'paid',
            purchaseOrderNumber: 'PO-2025-003',
            description: 'Process Automation Equipment - May 2025',
            currency: 'INR',
            paymentTerms: 'Net 30',
            agingDays: 0
          },
          {
            invoiceNumber: 'INV-2025-004',
            invoiceDate: '2025-07-01',
            dueDate: '2025-08-01',
            amount: 156000.00,
            taxAmount: 28080.00,
            totalAmount: 184080.00,
            status: 'partial',
            purchaseOrderNumber: 'PO-2025-004',
            description: 'Flow Measurement Devices - July 2025',
            currency: 'INR',
            paymentTerms: 'Net 30',
            agingDays: 2
          },
          {
            invoiceNumber: 'INV-2025-005',
            invoiceDate: '2025-05-20',
            dueDate: '2025-06-20',
            amount: 98000.00,
            taxAmount: 17640.00,
            totalAmount: 115640.00,
            status: 'overdue',
            purchaseOrderNumber: 'PO-2025-005',
            description: 'Pressure Relief Valves - May 2025',
            currency: 'INR',
            paymentTerms: 'Net 30',
            agingDays: 45
          }
        ]
      };
    } catch (error) {
      console.error('SAP get invoices error:', error);
      return {
        success: false,
        message: 'Failed to fetch invoices from SAP'
      };
    }
  }

  /**
   * Get customer payments for financial sheet
   * @param {string} customerId - Customer ID
   * @returns {Object} - Payments data
   */
  async getCustomerPayments(customerId) {
    try {
      // In production, this would call SAP RFC function
      // Example: await this.callSapRfc('Z_GET_CUSTOMER_PAYMENTS', { IV_CUSTOMER: customerId });

      // Mock data for development
      return {
        success: true,
        data: [
          {
            paymentId: 'PAY-2025-001',
            invoiceNumber: 'INV-2025-003',
            paymentDate: '2025-07-12',
            amount: 289100.00,
            paymentMethod: 'bank_transfer',
            reference: 'REF-BT-2025-001',
            status: 'completed',
            currency: 'INR'
          },
          {
            paymentId: 'PAY-2025-002',
            invoiceNumber: 'INV-2025-004',
            paymentDate: '2025-07-25',
            amount: 100000.00,
            paymentMethod: 'bank_transfer',
            reference: 'REF-BT-2025-002',
            status: 'completed',
            currency: 'INR'
          },
          {
            paymentId: 'PAY-2025-003',
            invoiceNumber: 'INV-2024-015',
            paymentDate: '2025-07-08',
            amount: 156000.00,
            paymentMethod: 'check',
            reference: 'CHK-2025-001',
            status: 'completed',
            currency: 'INR'
          },
          {
            paymentId: 'PAY-2025-004',
            invoiceNumber: 'INV-2024-020',
            paymentDate: '2025-06-28',
            amount: 78500.00,
            paymentMethod: 'bank_transfer',
            reference: 'REF-BT-2025-004',
            status: 'completed',
            currency: 'INR'
          },
          {
            paymentId: 'PAY-2025-005',
            invoiceNumber: 'INV-2025-001',
            paymentDate: '2025-08-05',
            amount: 75000.00,
            paymentMethod: 'bank_transfer',
            reference: 'REF-BT-2025-005',
            status: 'pending',
            currency: 'INR'
          }
        ]
      };
    } catch (error) {
      console.error('SAP get payments error:', error);
      return {
        success: false,
        message: 'Failed to fetch payments from SAP'
      };
    }
  }

  /**
   * Get customer credit/debit memos for financial sheet
   * @param {string} customerId - Customer ID
   * @returns {Object} - Memos data
   */
  async getCustomerMemos(customerId) {
    try {
      // In production, this would call SAP RFC function
      // Example: await this.callSapRfc('Z_GET_CUSTOMER_MEMOS', { IV_CUSTOMER: customerId });

      // Mock data for development
      return {
        success: true,
        data: [
          {
            memoNumber: 'CM-2025-001',
            type: 'credit',
            date: '2025-07-20',
            amount: 15000.00,
            reason: 'Product return - defective items',
            invoiceReference: 'INV-2025-002',
            status: 'active',
            description: 'Credit for returned defective temperature sensors',
            currency: 'INR'
          },
          {
            memoNumber: 'DM-2025-001',
            type: 'debit',
            date: '2025-07-18',
            amount: 5000.00,
            reason: 'Additional shipping charges',
            invoiceReference: 'INV-2025-001',
            status: 'applied',
            description: 'Express delivery charges for urgent order',
            currency: 'INR'
          },
          {
            memoNumber: 'CM-2025-002',
            type: 'credit',
            date: '2025-06-25',
            amount: 8500.00,
            reason: 'Volume discount adjustment',
            invoiceReference: 'INV-2025-003',
            status: 'applied',
            description: 'Quarterly volume discount retroactive adjustment',
            currency: 'INR'
          },
          {
            memoNumber: 'DM-2025-002',
            type: 'debit',
            date: '2025-07-10',
            amount: 2500.00,
            reason: 'Late payment fee',
            invoiceReference: 'INV-2024-025',
            status: 'active',
            description: 'Late payment penalty for overdue invoice',
            currency: 'INR'
          },
          {
            memoNumber: 'CM-2025-003',
            type: 'credit',
            date: '2025-05-30',
            amount: 12000.00,
            reason: 'Settlement discount',
            invoiceReference: null,
            status: 'applied',
            description: 'Early payment settlement discount',
            currency: 'INR'
          }
        ]
      };
    } catch (error) {
      console.error('SAP get memos error:', error);
      return {
        success: false,
        message: 'Failed to fetch credit/debit memos from SAP'
      };
    }
  }

  /**
   * Get customer aging report for financial sheet
   * @param {string} customerId - Customer ID
   * @returns {Object} - Aging data
   */
  async getCustomerAging(customerId) {
    try {
      // In production, this would call SAP RFC function
      // Example: await this.callSapRfc('Z_GET_CUSTOMER_AGING', { IV_CUSTOMER: customerId });

      // Mock data for development
      return {
        success: true,
        data: [
          {
            period: 'Current',
            daysRange: '0 days',
            amount: 147500.00,
            count: 1,
            percentage: 25.8
          },
          {
            period: '1-30 Days',
            daysRange: '1-30 days',
            amount: 184080.00,
            count: 1,
            percentage: 32.2
          },
          {
            period: '31-60 Days',
            daysRange: '31-60 days',
            amount: 103250.00,
            count: 1,
            percentage: 18.1
          },
          {
            period: '61-90 Days',
            daysRange: '61-90 days',
            amount: 115640.00,
            count: 1,
            percentage: 20.2
          },
          {
            period: '90+ Days',
            daysRange: '90+ days',
            amount: 21500.00,
            count: 2,
            percentage: 3.7
          }
        ]
      };
    } catch (error) {
      console.error('SAP get aging error:', error);
      return {
        success: false,
        message: 'Failed to fetch aging report from SAP'
      };
    }
  }

  /**
   * Get customer financial summary for financial sheet
   * @param {string} customerId - Customer ID
   * @returns {Object} - Financial summary data
   */
  async getCustomerFinancialSummary(customerId) {
    try {
      // Use SOAP web service for financial data
      const financialData = await this.soapService.getCustomerFinancialData(customerId);
      
      if (financialData && financialData.summary) {
        return {
          success: true,
          data: financialData.summary
        };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SAP SOAP financial service not available, using mock data');
        return {
          success: true,
          data: {
            totalInvoiced: 2485000.00,
            totalPaid: 1913030.00,
            totalOutstanding: 571970.00,
            totalCreditMemos: 35500.00,
            totalDebitMemos: 7500.00,
            averagePaymentDays: 28,
            currency: 'INR'
          }
        };
      }

      return {
        success: false,
        message: 'Unable to fetch financial summary'
      };
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          data: {
            totalInvoiced: 2485000.00,
            totalPaid: 1913030.00,
            totalOutstanding: 571970.00,
            totalCreditMemos: 35500.00,
            totalDebitMemos: 7500.00,
            averagePaymentDays: 28,
            currency: 'INR'
          }
        };
      }

      return {
        success: false,
        message: 'Failed to fetch financial summary from SAP'
      };
    }
  }
}

module.exports = new SapService();
