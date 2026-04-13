// GymFit PH — Email OTP Authentication with local fallback

const OTP_FALLBACK_KEY='bg_local_otp';

let otpEmail='';
let otpCooldownUntil=0;

function getOTPRemainingSeconds(){
  return Math.max(0,Math.ceil((otpCooldownUntil-Date.now())/1000));
}

function hasEmailJsConfig(){
  // Kept for backward compatibility with existing UI copy.
  return false;
}

function normalizeOTPEmail(email){
  return String(email||'').trim().toLowerCase();
}

function generateOTPCode(){
  return String(Math.floor(100000+Math.random()*900000));
}

function readLocalOTPRecord(){
  try{
    return JSON.parse(sessionStorage.getItem(OTP_FALLBACK_KEY)||'null');
  }catch{
    return null;
  }
}

function writeLocalOTPRecord(record){
  if(!record){
    sessionStorage.removeItem(OTP_FALLBACK_KEY);
    return;
  }
  sessionStorage.setItem(OTP_FALLBACK_KEY,JSON.stringify(record));
}

function isOTPServerUnavailable(err){
  return !!(
    err&&(
      err.isNetworkError
      ||/failed to fetch/i.test(err.message||'')
      ||/could not connect/i.test(err.message||'')
      ||/network/i.test(err.message||'')
    )
  );
}

function buildOTPFallback(email){
  const code=generateOTPCode();
  const record={
    email,
    code,
    mode:'local',
    expiresAt:Date.now()+(5*60*1000),
    cooldownUntil:Date.now()+(60*1000)
  };

  writeLocalOTPRecord(record);
  otpEmail=email;
  otpCooldownUntil=record.cooldownUntil;

  return {
    ok:true,
    mode:'local',
    email,
    code,
    cooldownInSec:60,
    expiresInSec:300,
    note:`Local setup detected. The email server is offline, so use this code here instead: ${code}. It expires in 5 minutes.`
  };
}

function clearOTPState(){
  otpEmail='';
  otpCooldownUntil=0;
  writeLocalOTPRecord(null);
}

async function sendOTP(email){
  const normalized=normalizeOTPEmail(email);

  try{
    const payload=await apiRequest('/auth/send-otp',{
      method:'POST',
      body:{email:normalized}
    });

    writeLocalOTPRecord(null);
    otpEmail=normalized;
    otpCooldownUntil=Date.now()+((payload.cooldownInSec||60)*1000);
    toast(`Verification code sent to ${normalized}.`,'ok');
    return {
      ok:true,
      mode:'server',
      email:normalized,
      cooldownInSec:payload.cooldownInSec||60,
      expiresInSec:payload.expiresInSec||300,
      note:'Codes expire in 5 minutes. Resend is available after 60 seconds.'
    };
  }catch(err){
    if(!isOTPServerUnavailable(err))throw err;

    const fallback=buildOTPFallback(normalized);
    toast('Verification server is offline. Using a local signup code for this device.','info',6500);
    return fallback;
  }
}

async function verifyOTP(inputOTP,email){
  const normalizedEmail=normalizeOTPEmail(email||otpEmail);
  const normalizedCode=String(inputOTP||'').trim();
  const localRecord=readLocalOTPRecord();

  if(localRecord&&localRecord.email===normalizedEmail){
    if(localRecord.expiresAt<Date.now()){
      clearOTPState();
      throw new Error('The local verification code expired. Request a new one.');
    }
    if(localRecord.code!==normalizedCode){
      throw new Error('The verification code is incorrect.');
    }

    clearOTPState();
    toast('Email verified successfully.','ok');
    return {ok:true,mode:'local'};
  }

  await apiRequest('/auth/verify-otp',{
    method:'POST',
    body:{email:normalizedEmail,code:normalizedCode}
  });

  clearOTPState();
  toast('Email verified successfully.','ok');
  return {ok:true,mode:'server'};
}

async function resendOTP(email){
  const seconds=getOTPRemainingSeconds();
  if(seconds>0){
    toast(`Wait ${seconds}s before requesting another code.`,'info');
    return false;
  }
  return sendOTP(email);
}
