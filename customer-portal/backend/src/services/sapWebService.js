const axios = require('axios');
const xml2js = require('xml2js');

class SAPWebService {
  constructor() {
    // SAP Configuration from environment variables with fallback
    this.config = {
      baseUrl: process.env.SAP_BASE_URL || 'http://AZKTLDS5CP.kcloud.com:8000',
      serviceEndpoint: process.env.SAP_SERVICE_PATH || '/sap/bc/srt/scs/sap/zfy_portal_service',
      client: process.env.SAP_CLIENT || '100',
      username: process.env.SAP_USER || 'K901703',
      password: process.env.SAP_PASSWORD || 'Bhavadharani@123',
      namespace: 'urn:sap-com:document:sap:rfc:functions',
      soapNamespace: 'http://www.w3.org/2003/05/soap-envelope'
    };
    
    // Create Basic Auth header
    this.authHeader = 'Basic ' + Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
    
    this.parser = new xml2js.Parser({ explicitArray: false });
    this.builder = new xml2js.Builder({
      rootName: 'soap:Envelope',
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    
    console.log('🔧 SAP Web Service Configuration:');
    console.log(`   Base URL: ${this.config.baseUrl}`);
    console.log(`   Service: ${this.config.serviceEndpoint}`);
    console.log(`   Client: ${this.config.client}`);
    console.log(`   Username: ${this.config.username}`);
  }

  /**
   * Create SOAP envelope for SAP requests
   */
  createSoapEnvelope(functionName, parameters) {
    const envelope = {
      '$': {
        'xmlns:soap': this.config.soapNamespace,
        'xmlns:n0': this.config.namespace
      },
      'soap:Header': '',
      'soap:Body': {
        [`n0:${functionName}`]: {
          '$': { 'xmlns:n0': this.config.namespace },
          ...parameters
        }
      }
    };

    return this.builder.buildObject(envelope);
  }

  /**
   * Send SOAP request to SAP
   */
  async sendSoapRequest(soapBody) {
    try {
      const url = `${this.config.baseUrl}${this.config.serviceEndpoint}?sap-client=${this.config.client}`;
      
      const headers = {
        'Content-Type': 'text/xml;charset=UTF-8',
        'Authorization': this.authHeader,
        'SOAPAction': ''
      };

      console.log('SAP Request URL:', url);
      console.log('SAP Request Body:', soapBody);

      const response = await axios.post(url, soapBody, { 
        headers,
        timeout: 30000 // 30 second timeout
      });

      console.log('SAP Response Status:', response.status);
      console.log('SAP Response Data:', response.data);

      return response.data;
    } catch (error) {
      console.error('SAP Request Error:', error.message);
      if (error.response) {
        console.error('SAP Error Response:', error.response.data);
        console.error('SAP Error Status:', error.response.status);
      }
      throw new Error(`SAP Web Service Error: ${error.message}`);
    }
  }

  /**
   * Parse SAP SOAP response
   */
  async parseSoapResponse(xmlResponse) {
    try {
      const result = await this.parser.parseStringPromise(xmlResponse);
      return result;
    } catch (error) {
      console.error('XML Parsing Error:', error.message);
      throw new Error(`Failed to parse SAP response: ${error.message}`);
    }
  }

  /**
   * Authenticate user with SAP
   */
  async authenticateUser(customerId, password) {
    try {
      const soapBody = this.createSoapEnvelope('ZFY_PORTAL_1', {
        'CUSTOMER_ID': customerId,
        'PASSWORD': password
      });

      const response = await this.sendSoapRequest(soapBody);
      const parsedResponse = await this.parseSoapResponse(response);

      // Extract the response value
      const responseBody = parsedResponse?.['env:Envelope']?.['env:Body']?.['n0:ZFY_PORTAL_1Response'];
      const output = responseBody?.OUTPUT;

      console.log('Authentication Response:', output);

      return {
        success: output === 'Login Successful',
        message: output || 'Unknown response from SAP',
        rawResponse: parsedResponse
      };
    } catch (error) {
      console.error('SAP Authentication Error:', error.message);
      return {
        success: false,
        message: `Authentication failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get customer information from SAP
   */
  async getCustomerInfo(customerId) {
    try {
      // This would be another SAP function call to get customer details
      // For now, we'll return a structure based on successful authentication
      
      const soapBody = this.createSoapEnvelope('ZFY_GET_CUSTOMER_INFO', {
        'CUSTOMER_ID': customerId
      });

      // If this specific function doesn't exist in SAP yet, we can simulate the structure
      // You would replace this with the actual SAP function call
      
      return {
        success: true,
        data: {
          customerId: customerId,
          name: 'John Doe', // This would come from SAP
          email: 'john.doe@company.com', // This would come from SAP
          phone: '+1-555-0123', // This would come from SAP
          address: '123 Business St, City, State 12345' // This would come from SAP
        }
      };
    } catch (error) {
      console.error('Get Customer Info Error:', error.message);
      return {
        success: false,
        message: `Failed to get customer info: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get dashboard data from SAP
   */
  async getDashboardData(customerId) {
    try {
      // This would be SAP function calls to get dashboard metrics
      // You would implement the actual SAP functions for:
      // - Total inquiries
      // - Sales orders
      // - Deliveries
      // - Outstanding amounts
      
      const soapBody = this.createSoapEnvelope('ZFY_GET_DASHBOARD_DATA', {
        'CUSTOMER_ID': customerId
      });

      // For now, returning structured data that would come from SAP
      return {
        success: true,
        data: {
          totalInquiries: 15,
          totalSalesOrders: 8,
          totalDeliveries: 12,
          outstandingAmount: 25750.50,
          inquiryConversionRate: 67,
          averageOrderValue: 18500.00,
          deliveryPerformance: 95,
          recentInquiries: [],
          recentSalesOrders: [],
          recentDeliveries: []
        }
      };
    } catch (error) {
      console.error('Get Dashboard Data Error:', error.message);
      return {
        success: false,
        message: `Failed to get dashboard data: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get inquiries from SAP
   */
  async getInquiries(customerId) {
    try {
      const soapBody = this.createSoapEnvelope('ZFY_GET_INQUIRIES', {
        'CUSTOMER_ID': customerId
      });

      // This would be the actual SAP call
      return {
        success: true,
        data: [] // Would be populated with actual inquiry data from SAP
      };
    } catch (error) {
      console.error('Get Inquiries Error:', error.message);
      return {
        success: false,
        message: `Failed to get inquiries: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get sales orders from SAP
   */
  async getSalesOrders(customerId) {
    try {
      const soapBody = this.createSoapEnvelope('ZFY_GET_SALES_ORDERS', {
        'CUSTOMER_ID': customerId
      });

      return {
        success: true,
        data: [] // Would be populated with actual sales order data from SAP
      };
    } catch (error) {
      console.error('Get Sales Orders Error:', error.message);
      return {
        success: false,
        message: `Failed to get sales orders: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get deliveries from SAP
   */
  async getDeliveries(customerId) {
    try {
      const soapBody = this.createSoapEnvelope('ZFY_GET_DELIVERIES', {
        'CUSTOMER_ID': customerId
      });

      return {
        success: true,
        data: [] // Would be populated with actual delivery data from SAP
      };
    } catch (error) {
      console.error('Get Deliveries Error:', error.message);
      return {
        success: false,
        message: `Failed to get deliveries: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get financial data from SAP
   */
  async getFinancialData(customerId) {
    try {
      const soapBody = this.createSoapEnvelope('ZFY_GET_FINANCIAL_DATA', {
        'CUSTOMER_ID': customerId
      });

      return {
        success: true,
        data: {
          summary: {
            totalInvoiced: 125000.00,
            totalPaid: 99249.50,
            totalOutstanding: 25750.50,
            averagePaymentDays: 28
          },
          invoices: [],
          payments: [],
          agingReport: [],
          memos: []
        }
      };
    } catch (error) {
      console.error('Get Financial Data Error:', error.message);
      return {
        success: false,
        message: `Failed to get financial data: ${error.message}`,
        error: error.message
      };
    }
  }
}

module.exports = SAPWebService;
