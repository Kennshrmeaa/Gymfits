const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {URL}=require('url');

const APP_USER_AGENT='gymfit-ph-backend/1.0';
const PORT=Number(process.env.PORT||8787);
const APP_URL=process.env.APP_URL||'http://localhost:3000/';
const RESEND_API_KEY=process.env.RESEND_API_KEY||'';
const RESEND_FROM_EMAIL=process.env.RESEND_FROM_EMAIL||'';
const RESEND_FROM_NAME=process.env.RESEND_FROM_NAME||'GymFit PH';
const PAYMONGO_SECRET_KEY=process.env.PAYMONGO_SECRET_KEY||'';
const PAYMONGO_WEBHOOK_SECRET=process.env.PAYMONGO_WEBHOOK_SECRET||'';
const OTP_SECRET=process.env.OTP_SECRET||'change-this-otp-secret';

const DATA_DIR=path.join(__dirname,'data');
const STORE_PATH=path.join(DATA_DIR,'store.json');

const defaultStore=()=>({
  otpRequests:{},
  verifiedEmails:{},
  checkouts:{},
  subscriptions:{},
  webhookEvents:{}
});

function loadStore(){
  try{
    if(!fs.existsSync(STORE_PATH))return defaultStore();
    const raw=fs.readFileSync(STORE_PATH,'utf8');
    return {...defaultStore(),...JSON.parse(raw||'{}')};
  }catch(err){
    console.error('Failed to load store:',err);
    return defaultStore();
  }
}

let store=loadStore();

function saveStore(){
  fs.mkdirSync(DATA_DIR,{recursive:true});
  fs.writeFileSync(STORE_PATH,JSON.stringify(store,null,2));
}

function pruneStore(){
  const now=Date.now();
  Object.entries(store.otpRequests).forEach(([email,record])=>{
    if(!record||record.expiresAt<=now)delete store.otpRequests[email];
  });
}

function json(res,status,payload){
  const body=JSON.stringify(payload);
  res.writeHead(status,{
    'Content-Type':'application/json; charset=utf-8',
    'Content-Length':Buffer.byteLength(body),
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'Content-Type, Paymongo-Signature',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS'
  });
  res.end(body);
}

function noContent(res,status=204){
  res.writeHead(status,{
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'Content-Type, Paymongo-Signature',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS'
  });
  res.end();
}

function readBody(req){
  return new Promise((resolve,reject)=>{
    const chunks=[];
    req.on('data',chunk=>chunks.push(chunk));
    req.on('end',()=>resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error',reject);
  });
}

function parseJson(text){
  if(!text)return {};
  return JSON.parse(text);
}

function fail(res,status,message,extra={}){
  json(res,status,{ok:false,message,...extra});
}

function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim());
}

function normalizeEmail(email){
  return String(email||'').trim().toLowerCase();
}

function planDefinition(plan){
  if(plan==='annual'){
    return {plan:'annual',label:'Premium Annual',amountMinor:79900,years:1};
  }
  return {plan:'monthly',label:'Premium Monthly',amountMinor:9900,months:1};
}

function paymentMethodTypes(preferredMethod){
  if(preferredMethod==='gcash')return ['gcash'];
  if(preferredMethod==='maya')return ['paymaya'];
  if(preferredMethod==='card')return ['card'];
  if(preferredMethod==='bank')return ['dob_bpi','dob_ubp','brankas_bdo','brankas_landbank','brankas_metrobank'];
  return ['card','gcash','paymaya'];
}

function hashOtp(email,code){
  return crypto.createHmac('sha256',OTP_SECRET).update(`${normalizeEmail(email)}:${code}`).digest('hex');
}

function generateOtp(){
  return crypto.randomInt(100000,1000000).toString();
}

function addSubscriptionExpiry(fromIso,plan){
  const date=new Date(fromIso);
  if(plan==='annual'){
    date.setFullYear(date.getFullYear()+1);
  }else{
    date.setMonth(date.getMonth()+1);
  }
  return date.toISOString();
}

function nowIso(){
  return new Date().toISOString();
}

function buildAppUrl(status,email,plan){
  const target=new URL(APP_URL);
  target.searchParams.set('checkout',status);
  target.searchParams.set('email',email);
  target.searchParams.set('plan',plan);
  return target.toString();
}

function paymongoAuthHeader(){
  return `Basic ${Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64')}`;
}

async function sendVerificationEmail(email,code){
  if(!RESEND_API_KEY||!RESEND_FROM_EMAIL){
    throw new Error('Backend email OTP is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in backend/.env.');
  }

  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{
      Authorization:`Bearer ${RESEND_API_KEY}`,
      'Content-Type':'application/json',
      'User-Agent':APP_USER_AGENT
    },
    body:JSON.stringify({
      from:`${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to:[email],
      subject:'Your GymFit PH verification code',
      html:`
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
          <h2 style="margin:0 0 16px">Verify your GymFit PH email</h2>
          <p style="margin:0 0 12px">Use this one-time code to finish creating your account:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0;color:#b91c1c">${code}</div>
          <p style="margin:0 0 8px">This code expires in 5 minutes.</p>
          <p style="margin:0;color:#6b7280">If you did not request this, you can ignore this email.</p>
        </div>
      `,
      text:`Your GymFit PH verification code is ${code}. It expires in 5 minutes.`
    })
  });

  if(!response.ok){
    const text=await response.text();
    throw new Error(`Email provider rejected the OTP request: ${text}`);
  }
}

async function createCheckoutSession({email,name,plan,preferredMethod}){
  if(!PAYMONGO_SECRET_KEY){
    throw new Error('PayMongo is not configured. Set PAYMONGO_SECRET_KEY in backend/.env.');
  }

  const planInfo=planDefinition(plan);
  const successUrl=buildAppUrl('success',email,plan);
  const cancelUrl=buildAppUrl('cancelled',email,plan);

  const response=await fetch('https://api.paymongo.com/v1/checkout_sessions',{
    method:'POST',
    headers:{
      Authorization:paymongoAuthHeader(),
      'Content-Type':'application/json',
      Accept:'application/json',
      'User-Agent':APP_USER_AGENT
    },
    body:JSON.stringify({
      data:{
        attributes:{
          description:`${planInfo.label} subscription for ${email}`,
          line_items:[
            {
              currency:'PHP',
              amount:planInfo.amountMinor,
              name:`GymFit PH ${planInfo.label}`,
              quantity:1,
              description:`${planInfo.label} subscription`
            }
          ],
          payment_method_types:paymentMethodTypes(preferredMethod),
          send_email_receipt:true,
          show_description:true,
          show_line_items:true,
          success_url:successUrl,
          cancel_url:cancelUrl,
          metadata:{
            customer_email:email,
            customer_name:name||'',
            selected_plan:plan,
            preferred_method:preferredMethod
          }
        }
      }
    })
  });

  const payload=await response.json().catch(()=>({}));
  if(!response.ok){
    const detail=payload.errors?.[0]?.detail||payload.message||'Unknown PayMongo error';
    throw new Error(`Could not create the PayMongo checkout session: ${detail}`);
  }

  const session=payload.data;
  const record={
    email,
    plan,
    label:planInfo.label,
    preferredMethod,
    amountMinor:planInfo.amountMinor,
    amount:planInfo.amountMinor/100,
    checkoutSessionId:session.id,
    checkoutUrl:session.attributes.checkout_url,
    referenceNumber:session.attributes.reference_number||null,
    checkoutStatus:session.attributes.status||'active',
    status:'pending',
    requestedAt:nowIso(),
    updatedAt:nowIso(),
    provider:'paymongo',
    source:'paymongo_checkout_session'
  };

  store.checkouts[session.id]=record;
  store.subscriptions[email]={...(store.subscriptions[email]||{}),...record};
  saveStore();
  return record;
}

async function retrieveCheckoutSession(checkoutSessionId){
  if(!PAYMONGO_SECRET_KEY){
    throw new Error('PayMongo is not configured.');
  }

  const response=await fetch(`https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`,{
    method:'GET',
    headers:{
      Authorization:paymongoAuthHeader(),
      Accept:'application/json',
      'User-Agent':APP_USER_AGENT
    }
  });

  const payload=await response.json().catch(()=>({}));
  if(!response.ok){
    const detail=payload.errors?.[0]?.detail||payload.message||'Unknown PayMongo error';
    throw new Error(`Could not retrieve the checkout session: ${detail}`);
  }

  return payload.data;
}

function selectPaymentResource(resource){
  const payments=resource?.attributes?.payments
    ||resource?.attributes?.payment_intent?.attributes?.payments
    ||[];
  const first=payments[0]||null;
  return first?.data||first||null;
}

function activateSubscriptionFromCheckout(record,checkoutResource){
  const paymentResource=selectPaymentResource(checkoutResource);
  const paymentAttrs=paymentResource?.attributes||{};
  const intentStatus=checkoutResource?.attributes?.payment_intent?.attributes?.status;
  const paymentStatus=paymentAttrs.status;
  const checkoutStatus=checkoutResource?.attributes?.status;
  const isPaid=intentStatus==='succeeded'||paymentStatus==='paid'||checkoutStatus==='paid';

  if(!isPaid)return null;

  const activatedAt=paymentAttrs.paid_at
    ?new Date(paymentAttrs.paid_at*1000).toISOString()
    :nowIso();

  const subscription={
    email:record.email,
    plan:record.plan,
    label:planDefinition(record.plan).label,
    preferredMethod:record.preferredMethod,
    amountMinor:paymentAttrs.amount||record.amountMinor,
    amount:(paymentAttrs.amount||record.amountMinor)/100,
    checkoutSessionId:checkoutResource.id,
    checkoutUrl:checkoutResource.attributes.checkout_url||record.checkoutUrl,
    referenceNumber:checkoutResource.attributes.reference_number||record.referenceNumber||null,
    checkoutStatus:checkoutStatus||record.checkoutStatus||'paid',
    status:'active',
    provider:'paymongo',
    source:paymentAttrs.source?.type||record.preferredMethod||'paymongo_checkout_session',
    requestedAt:record.requestedAt||nowIso(),
    activatedAt,
    expiresAt:addSubscriptionExpiry(activatedAt,record.plan),
    updatedAt:nowIso(),
    livemode:!!checkoutResource.attributes.livemode,
    paymentId:paymentResource?.id||null,
    lastPayment:{
      paymentId:paymentResource?.id||null,
      method:record.preferredMethod||paymentAttrs.source?.type||'paymongo',
      amount:(paymentAttrs.amount||record.amountMinor)/100,
      reference:checkoutResource.attributes.reference_number||record.referenceNumber||null,
      paidAt:activatedAt,
      status:'paid',
      source:'paymongo'
    }
  };

  store.checkouts[checkoutResource.id]={
    ...record,
    checkoutStatus:checkoutStatus||'paid',
    status:'paid',
    updatedAt:nowIso(),
    paymentId:paymentResource?.id||null
  };
  store.subscriptions[record.email]=subscription;
  saveStore();
  return subscription;
}

async function reconcileSubscription(email){
  const current=store.subscriptions[email];
  if(!current)return {status:'inactive'};

  if(current.status==='active'&&current.expiresAt&&new Date(current.expiresAt)<new Date()){
    store.subscriptions[email]={status:'inactive',email,updatedAt:nowIso()};
    saveStore();
    return store.subscriptions[email];
  }

  if(current.status==='pending'&&current.checkoutSessionId&&PAYMONGO_SECRET_KEY){
    const checkoutResource=await retrieveCheckoutSession(current.checkoutSessionId).catch(()=>null);
    if(checkoutResource){
      const activated=activateSubscriptionFromCheckout(current,checkoutResource);
      if(activated)return activated;
      store.subscriptions[email]={
        ...current,
        checkoutStatus:checkoutResource.attributes.status||current.checkoutStatus||'active',
        referenceNumber:checkoutResource.attributes.reference_number||current.referenceNumber||null,
        updatedAt:nowIso()
      };
      saveStore();
    }
  }

  return store.subscriptions[email]||{status:'inactive'};
}

function parsePaymongoSignature(headerValue){
  return String(headerValue||'')
    .split(',')
    .map(part=>part.trim())
    .reduce((acc,part)=>{
      const [key,value='']=part.split('=');
      if(key)acc[key]=value;
      return acc;
    },{});
}

function verifyPaymongoSignature(rawBody,headerValue,livemode){
  if(!PAYMONGO_WEBHOOK_SECRET)return true;
  const parsed=parsePaymongoSignature(headerValue);
  if(!parsed.t)return false;
  const expected=crypto
    .createHmac('sha256',PAYMONGO_WEBHOOK_SECRET)
    .update(`${parsed.t}.${rawBody}`)
    .digest('hex');
  return (livemode?parsed.li:parsed.te)===expected;
}

async function handleSendOtp(req,res){
  const body=parseJson(await readBody(req));
  const email=normalizeEmail(body.email);

  if(!isValidEmail(email))return fail(res,400,'Enter a valid email address.');

  pruneStore();
  const existing=store.otpRequests[email];
  const now=Date.now();
  if(existing&&existing.cooldownUntil>now){
    return fail(res,429,`Please wait ${Math.ceil((existing.cooldownUntil-now)/1000)}s before requesting another code.`);
  }

  const code=generateOtp();
  await sendVerificationEmail(email,code);

  store.otpRequests[email]={
    codeHash:hashOtp(email,code),
    expiresAt:now+(5*60*1000),
    cooldownUntil:now+(60*1000),
    attempts:0,
    lastSentAt:nowIso()
  };
  saveStore();

  return json(res,200,{ok:true,cooldownInSec:60,expiresInSec:300});
}

async function handleVerifyOtp(req,res){
  const body=parseJson(await readBody(req));
  const email=normalizeEmail(body.email);
  const code=String(body.code||'').trim();

  if(!isValidEmail(email))return fail(res,400,'Enter a valid email address.');
  if(!/^\d{6}$/.test(code))return fail(res,400,'Enter the 6-digit verification code.');

  pruneStore();
  const record=store.otpRequests[email];
  if(!record)return fail(res,400,'No verification code is waiting for this email. Request a new one first.');
  if(record.expiresAt<Date.now()){
    delete store.otpRequests[email];
    saveStore();
    return fail(res,400,'That verification code already expired. Request a new one.');
  }

  if(hashOtp(email,code)!==record.codeHash){
    record.attempts=(record.attempts||0)+1;
    saveStore();
    return fail(res,400,'The verification code is incorrect.');
  }

  delete store.otpRequests[email];
  store.verifiedEmails[email]={verifiedAt:nowIso()};
  saveStore();
  return json(res,200,{ok:true,verifiedAt:store.verifiedEmails[email].verifiedAt});
}

async function handleCreateCheckout(req,res){
  const body=parseJson(await readBody(req));
  const email=normalizeEmail(body.email);
  const plan=body.plan==='annual'?'annual':'monthly';
  const preferredMethod=String(body.preferredMethod||'gcash');
  const name=String(body.name||'').trim();

  if(!isValidEmail(email))return fail(res,400,'Enter a valid customer email before starting checkout.');
  if(!['gcash','maya','card','bank'].includes(preferredMethod)){
    return fail(res,400,'Unsupported payment method selection.');
  }

  const checkout=await createCheckoutSession({email,name,plan,preferredMethod});
  return json(res,200,{ok:true,...checkout});
}

async function handleSubscriptionStatus(req,res,url){
  const email=normalizeEmail(url.searchParams.get('email'));
  if(!isValidEmail(email))return fail(res,400,'Enter a valid email address.');

  const subscription=await reconcileSubscription(email).catch(err=>({status:'error',message:err.message}));
  return json(res,200,{ok:true,subscription});
}

async function handlePaymongoWebhook(req,res){
  const rawBody=await readBody(req);
  const payload=parseJson(rawBody);
  const attrs=payload?.data?.attributes||{};
  const eventType=attrs.type;
  const resource=attrs.data;
  const livemode=!!attrs.livemode;

  if(!verifyPaymongoSignature(rawBody,req.headers['paymongo-signature'],livemode)){
    return fail(res,400,'Invalid PayMongo webhook signature.');
  }

  const eventId=payload?.data?.id||`${eventType}:${Date.now()}`;
  if(store.webhookEvents[eventId]){
    return json(res,200,{ok:true,duplicate:true});
  }
  store.webhookEvents[eventId]={receivedAt:nowIso(),type:eventType};

  if(eventType==='checkout_session.payment.paid'&&resource?.id&&store.checkouts[resource.id]){
    activateSubscriptionFromCheckout(store.checkouts[resource.id],resource);
  }

  saveStore();
  return json(res,200,{ok:true});
}

async function router(req,res){
  if(req.method==='OPTIONS')return noContent(res);
  pruneStore();

  const url=new URL(req.url,`http://${req.headers.host}`);

  try{
    if(req.method==='GET'&&url.pathname==='/api/health'){
      return json(res,200,{
        ok:true,
        services:{
          emailOtpConfigured:Boolean(RESEND_API_KEY&&RESEND_FROM_EMAIL),
          paymongoConfigured:Boolean(PAYMONGO_SECRET_KEY),
          paymongoWebhookSignatureConfigured:Boolean(PAYMONGO_WEBHOOK_SECRET)
        }
      });
    }

    if(req.method==='POST'&&url.pathname==='/api/auth/send-otp'){
      return handleSendOtp(req,res);
    }

    if(req.method==='POST'&&url.pathname==='/api/auth/verify-otp'){
      return handleVerifyOtp(req,res);
    }

    if(req.method==='POST'&&url.pathname==='/api/subscriptions/create-checkout'){
      return handleCreateCheckout(req,res);
    }

    if(req.method==='GET'&&url.pathname==='/api/subscriptions/status'){
      return handleSubscriptionStatus(req,res,url);
    }

    if(req.method==='POST'&&url.pathname==='/api/paymongo/webhook'){
      return handlePaymongoWebhook(req,res);
    }

    return fail(res,404,'Endpoint not found.');
  }catch(err){
    console.error('API error:',err);
    return fail(res,500,err.message||'Internal server error.');
  }
}

const server=http.createServer(router);
server.listen(PORT,()=>{
  console.log(`GymFit PH API running at http://localhost:${PORT}`);
  console.log(`Frontend origin expected at ${APP_URL}`);
});
