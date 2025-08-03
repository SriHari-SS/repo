const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3002; // Using different port to avoid conflicts

app.use(cors());
app.use(bodyParser.json());

// 🔐 SAP Auth Credentials (Your credentials)
const SAP_USERNAME = 'K901703';
const SAP_PASSWORD = 'Bhavadharani@123';
const AUTH_HEADER = 'Basic ' + Buffer.from(`${SAP_USERNAME}:${SAP_PASSWORD}`).toString('base64');

// 🌐 SAP URL (Your URL)
const SAP_LOGIN_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfy_portal_service?sap-client=100';

// ✅ Customer Login Test Endpoint
app.post('/api/customer-login', async (req, res) => {
  const { customerId, password } = req.body;
  
  // Create SOAP envelope using your exact format
  const xml = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
              xmlns:n0="urn:sap-com:document:sap:rfc:functions">
<soap:Header/>
<soap:Body>
<n0:ZFY_PORTAL_1 xmlns:n0="urn:sap-com:document:sap:rfc:functions">
<CUSTOMER_ID>${customerId}</CUSTOMER_ID>
<PASSWORD>${password}</PASSWORD>
</n0:ZFY_PORTAL_1>
</soap:Body>
</soap:Envelope>`;

  try {
    console.log('🔗 Sending request to SAP...');
    console.log('URL:', SAP_LOGIN_URL);
    console.log('Auth Header:', AUTH_HEADER);
    console.log('SOAP Body:', xml);

    const response = await axios.post(SAP_LOGIN_URL, xml, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'Authorization': AUTH_HEADER
      },
      timeout: 30000
    });

    console.log('✅ SAP Response received');
    console.log('Status:', response.status);
    console.log('Response:', response.data);

    // Extract OUTPUT value from response
    const match = response.data.match(/<OUTPUT>(.*?)<\/OUTPUT>/);
    const output = match ? match[1] : 'UNKNOWN';

    res.json({
      success: output === 'Login Successful',
      message: output,
      sapResponse: response.data,
      status: response.status
    });

  } catch (error) {
    console.error('❌ SOAP call failed:', error.message);
    
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Customer login failed', 
      details: error.message,
      response: error.response?.data
    });
  }
});

// Test endpoint to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'SAP Test Server is running!',
    sapUrl: SAP_LOGIN_URL,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SAP Test Server running on http://localhost:${PORT}`);
  console.log(`📡 SAP URL: ${SAP_LOGIN_URL}`);
  console.log(`🔑 Using credentials: ${SAP_USERNAME}`);
  console.log('');
  console.log('Test endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/test`);
  console.log(`  POST http://localhost:${PORT}/api/customer-login`);
  console.log('');
  console.log('Test with:');
  console.log('  Customer ID: 0000000003');
  console.log('  Password: 12345');
});
