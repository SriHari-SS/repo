const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3000;
 
// Middleware
app.use(cors());
app.use(bodyParser.json()); // Important to parse JSON request body
 
// SAP config
const SAP_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfy_portal_service?sap-client=100';
const SAP_USERNAME = 'K901703';
const SAP_PASSWORD = 'BhavadharaniSri@1526';
 
// Routes
app.post('/custlogin', async (req, res) => {
  const { customerId, password } = req.body;
  console.log('Login request received:', customerId, password);
  if (!customerId || !password) {
    return res.status(400).json({ message: 'Customer ID and password are required.' });
  }
 
  const soapEnvelope = `
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:n0="urn:sap-com:document:sap:rfc:functions">
<soap:Header/>
<soap:Body>
<n0:ZFY_PORTAL_1 xmlns:n0="urn:sap-com:document:sap:rfc:functions">
<CUSTOMER_ID>${customerId}</CUSTOMER_ID>
<PASSWORD>${password}</PASSWORD>
</n0:ZFY_PORTAL_1>
</soap:Body>
</soap:Envelope>
  `;
 
  try {
    const response = await axios.post(SAP_URL, soapEnvelope, {
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
        'Authorization': 'Basic ' + Buffer.from(`${SAP_USERNAME}:${SAP_PASSWORD}`).toString('base64')
      },
      timeout: 15000
    });
 
    console.log('SAP response received.', response.data);
 
    if (response.data.includes('<EV_RESULT>')) {
      return res.json({
        message: 'Login Successful',
        rawResponse: response.data
      });
    } else {
      return res.status(401).json({
        message: 'Invalid credentials.',
        rawResponse: response.data
      });
    }
  } catch (err) {
    console.error('SAP login failed:', err.message);
    if (err.response?.data) {
      console.error('SAP Error Response Body:', err.response.data);
    }
    res.status(500).json({
      message: 'Login failed',
      error: err.message
    });
  }
});
 
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 
app.post('/custprofile', async (req, res) => {
  const { customerId } = req.body;
 
  const soapBody = `
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:n0="urn:sap-com:document:sap:rfc:functions">
<soap:Header/>
<soap:Body>
<n0:ZFM_CUST_PRO>
<CUSTOMER_ID>${customerId}</CUSTOMER_ID>
</n0:ZFM_CUST_PRO>
</soap:Body>
</soap:Envelope>
  `;
 
  try {
    const response = await axios.post('http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfm_profile?sap-client=100', soapBody, {
      headers: {
        'Content-Type': 'application/soap+xml;charset=UTF-8',
        'Authorization': 'Basic ' + Buffer.from(`${SAP_USERNAME}:${SAP_PASSWORD}`).toString('base64'),
        'Cookie': 'sap-usercontext=sap-client=100'
      },
      timeout: 10000
    });
 
    const x2js = new X2JS();
    const jsonResponse = x2js.xml2js(response.data);
    const profile = jsonResponse?.Envelope?.Body?.ZFM_CUST_PROResponse;
 
    if (profile) {
      return res.send(profile);
    } else {
      throw new Error('ZFM_CUST_PROResponse not found');
    }
  } catch (error) {
    console.error('🔴 Profile request error:', error.message);
    res.status(500).json({ error: 'SAP request failed' });
  }
});
 
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});