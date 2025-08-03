const express = require('express');
const authMiddleware = require('../middleware/auth');
const sapService = require('../services/sapService');

const router = express.Router();

/**
 * @route   GET /api/customer/dashboard
 * @desc    Get customer dashboard data
 * @access  Private
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    
    // Fetch customer dashboard data from SAP
    const dashboardData = await sapService.getCustomerDashboard(customerId);
    
    if (!dashboardData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch dashboard data'
      });
    }

    res.json({
      success: true,
      data: dashboardData.data
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/customer/profile
 * @desc    Get customer profile information
 * @access  Private
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    
    // Fetch customer profile from SAP
    const profileData = await sapService.getCustomerProfile(customerId);
    
    if (!profileData.success) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    res.json({
      success: true,
      data: profileData.data
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/customer/inquiries
 * @desc    Get customer inquiries
 * @access  Private
 */
router.get('/inquiries', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    const { page = 1, limit = 10, status } = req.query;
    
    // Fetch customer inquiries from SAP
    const inquiriesData = await sapService.getCustomerInquiries(customerId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });
    
    if (!inquiriesData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch inquiries'
      });
    }

    res.json({
      success: true,
      data: inquiriesData.data,
      pagination: inquiriesData.pagination
    });

  } catch (error) {
    console.error('Inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiries',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/customer/sales-orders
 * @desc    Get customer sales orders
 * @access  Private
 */
router.get('/sales-orders', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    const { page = 1, limit = 10, status } = req.query;
    
    // Fetch customer sales orders from SAP
    const salesOrdersData = await sapService.getCustomerSalesOrders(customerId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });
    
    if (!salesOrdersData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch sales orders'
      });
    }

    res.json({
      success: true,
      data: salesOrdersData.data,
      pagination: salesOrdersData.pagination
    });

  } catch (error) {
    console.error('Sales Orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/customer/deliveries
 * @desc    Get customer deliveries
 * @access  Private
 */
router.get('/deliveries', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    const { page = 1, limit = 10, status } = req.query;
    
    // Fetch customer deliveries from SAP
    const deliveriesData = await sapService.getCustomerDeliveries(customerId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });
    
    if (!deliveriesData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch deliveries'
      });
    }

    res.json({
      success: true,
      data: deliveriesData.data,
      pagination: deliveriesData.pagination
    });

  } catch (error) {
    console.error('Deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deliveries',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/customer/orders
 * @desc    Get customer orders (legacy endpoint)
 * @access  Private
 */
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    const { page = 1, limit = 10, status } = req.query;
    
    // Fetch customer orders from SAP
    const ordersData = await sapService.getCustomerOrders(customerId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });
    
    if (!ordersData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch orders'
      });
    }

    res.json({
      success: true,
      data: ordersData.data,
      pagination: ordersData.pagination
    });

  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Financial Sheet Endpoints

/**
 * @route   GET /api/customer/financial/invoices
 * @desc    Get customer invoices for financial sheet
 * @access  Private
 */
router.get('/financial/invoices', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    
    // Fetch customer invoices from SAP
    const invoicesData = await sapService.getCustomerInvoices(customerId);
    
    if (!invoicesData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch invoices'
      });
    }

    res.json({
      success: true,
      data: invoicesData.data
    });

  } catch (error) {
    console.error('Invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/customer/financial/payments
 * @desc    Get customer payments for financial sheet
 * @access  Private
 */
router.get('/financial/payments', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    
    // Fetch customer payments from SAP
    const paymentsData = await sapService.getCustomerPayments(customerId);
    
    if (!paymentsData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch payments'
      });
    }

    res.json({
      success: true,
      data: paymentsData.data
    });

  } catch (error) {
    console.error('Payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/customer/financial/memos
 * @desc    Get customer credit/debit memos for financial sheet
 * @access  Private
 */
router.get('/financial/memos', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    
    // Fetch customer memos from SAP
    const memosData = await sapService.getCustomerMemos(customerId);
    
    if (!memosData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch credit/debit memos'
      });
    }

    res.json({
      success: true,
      data: memosData.data
    });

  } catch (error) {
    console.error('Memos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching credit/debit memos',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/customer/financial/aging
 * @desc    Get customer aging report for financial sheet
 * @access  Private
 */
router.get('/financial/aging', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    
    // Fetch customer aging report from SAP
    const agingData = await sapService.getCustomerAging(customerId);
    
    if (!agingData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch aging report'
      });
    }

    res.json({
      success: true,
      data: agingData.data
    });

  } catch (error) {
    console.error('Aging error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching aging report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/customer/financial/summary
 * @desc    Get customer financial summary for financial sheet
 * @access  Private
 */
router.get('/financial/summary', authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    
    // Fetch customer financial summary from SAP
    const summaryData = await sapService.getCustomerFinancialSummary(customerId);
    
    if (!summaryData.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch financial summary'
      });
    }

    res.json({
      success: true,
      data: summaryData.data
    });

  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
