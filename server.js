const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dhan API
const DHAN = 'https://api.dhan.co';

app.post('/login', async (req, res) => {
  try {
    const { accessToken, clientId } = req.body;
    // Verify token by calling profile API
    const r = await fetch(`${DHAN}/v2/fundlimit`, {
      method: 'GET',
      headers: {
        'access-token': accessToken,
        'client-id': clientId,
        'Content-Type': 'application/json'
      }
    });
    const data = await r.json();
    if (r.ok) {
      res.json({ status: true, data: { accessToken, clientId } });
    } else {
      res.json({ status: false, message: data.message || 'Invalid credentials' });
    }
  } catch(e) { res.status(500).json({ status: false, message: e.message }); }
});

app.post('/candle', async (req, res) => {
  try {
    const { accessToken, clientId, securityId, fromDate, toDate } = req.body;
    const r = await fetch(`${DHAN}/v2/charts/historical`, {
      method: 'POST',
      headers: {
        'access-token': accessToken,
        'client-id': clientId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        securityId,
        exchangeSegment: 'NSE_EQ',
        instrument: 'EQUITY',
        interval: 'D',
        fromDate,
        toDate
      })
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ status: false, message: e.message }); }
});

app.post('/ltp', async (req, res) => {
  try {
    const { accessToken, clientId, securityId } = req.body;
    const r = await fetch(`${DHAN}/v2/marketfeed/ltp`, {
      method: 'POST',
      headers: {
        'access-token': accessToken,
        'client-id': clientId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        NSE_EQ: [parseInt(securityId)]
      })
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ status: false, message: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(process.env.PORT || 3000, () => console.log('Server started'));
