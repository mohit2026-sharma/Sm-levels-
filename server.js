const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const BASE = 'https://apiconnect.angelbroking.com';
app.post('/login', async (req, res) => {
  try {
    const { apiKey, clientId, mpin } = req.body;
    const r = await fetch(`${BASE}/rest/auth/angelbroking/user/v1/loginByPassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UserType': 'USER', 'X-SourceID': 'WEB', 'X-ClientLocalIP': '192.168.1.1', 'X-ClientPublicIP': '106.193.147.98', 'X-MACAddress': 'fe80::216e', 'X-PrivateKey': apiKey },
      body: JSON.stringify({ clientcode: clientId, password: mpin })
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ status: false, message: e.message }); }
});
app.post('/candle', async (req, res) => {
  try {
    const { apiKey, token, symboltoken, fromdate, todate } = req.body;
    const r = await fetch(`${BASE}/rest/secure/angelbroking/historical/v1/getCandleData`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-PrivateKey': apiKey, 'X-UserType': 'USER', 'X-SourceID': 'WEB', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ exchange: 'NSE', symboltoken, interval: 'ONE_DAY', fromdate, todate })
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ status: false, message: e.message }); }
});
app.post('/ltp', async (req, res) => {
  try {
    const { apiKey, token, symboltoken } = req.body;
    const r = await fetch(`${BASE}/rest/secure/angelbroking/market/v1/quote/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-PrivateKey': apiKey, 'X-UserType': 'USER', 'X-SourceID': 'WEB', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ mode: 'LTP', exchangeTokens: { NSE: [symboltoken] } })
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ status: false, message: e.message }); }
});
app.get('/', (req, res) => res.send('SM Levels Server Running!'));
app.listen(process.env.PORT || 3000, () => console.log('Server started'));
