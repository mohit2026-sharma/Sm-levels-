const express=require('express');
const fetch=require('node-fetch');
const cors=require('cors');
const path=require('path');
const app=express();
app.use(cors({origin:'*'}));
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
const DHAN='https://api.dhan.co';

function getPrevTradingDay(){
  const d=new Date();
  d.setDate(d.getDate()-1);
  while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()-1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

app.post('/login',async(req,res)=>{try{const{accessToken,clientId}=req.body;const r=await fetch(`${DHAN}/v2/fundlimit`,{headers:{'access-token':accessToken,'client-id':clientId,'Content-Type':'application/json'}});const d=await r.json();res.json(r.ok?{status:true,data:{accessToken,clientId}}:{status:false,message:d.message||'Invalid'});}catch(e){res.status(500).json({status:false,message:e.message});}});

app.post('/candle',async(req,res)=>{try{const{accessToken,clientId,securityId}=req.body;const date=getPrevTradingDay();const r=await fetch(`${DHAN}/v2/charts/historical`,{method:'POST',headers:{'access-token':accessToken,'client-id':clientId,'Content-Type':'application/json'},body:JSON.stringify({securityId,exchangeSegment:'NSE_EQ',instrument:'EQUITY',interval:'D',fromDate:date,toDate:date})});res.json(await r.json());}catch(e){res.status(500).json({status:false,message:e.message});}});

app.post('/ltp',async(req,res)=>{try{const{accessToken,clientId,securityId}=req.body;const r=await fetch(`${DHAN}/v2/marketfeed/ltp`,{method:'POST',headers:{'access-token':accessToken,'client-id':clientId,'Content-Type':'application/json'},body:JSON.stringify({NSE_EQ:[parseInt(securityId)]})});res.json(await r.json());}catch(e){res.status(500).json({status:false,message:e.message});}});

app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(process.env.PORT||3000,()=>console.log('Server started'));
