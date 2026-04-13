/* ============================================================
   GymFit — Authentication & Subscription
   Signup, login, logout, email verification, subscription checkout
============================================================ */

// ===== MODAL =====
function openModal(id){
  const el=document.getElementById(id);
  if(!el)return;
  el.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(id){
  const el=document.getElementById(id);
  if(!el)return;
  el.classList.remove('open');
  if(id==='auth-modal')resetSignupVerification();
  if(id==='sub-modal')resetPaymentErrors();
  if(!document.querySelector('.overlay.open'))document.body.style.overflow='';
}


// ===== HELPERS =====
function showErr(id,v){const e=document.getElementById(id);if(e)e.style.display=v?'block':'none';}
function clearErrs(...ids){ids.forEach(id=>showErr(id,false));}
function getPlanPrice(plan){return plan==='annual'?799:plan==='monthly'?99:0;}
function getPlanLabel(plan){return plan==='annual'?'Premium Annual':plan==='monthly'?'Premium Monthly':'Free Trial';}
function getPlanDurationLabel(plan){return plan==='annual'?'1 year':'1 month';}
function getPlanExpiry(now,plan){
  const expiry=new Date(now);
  if(plan==='annual')expiry.setFullYear(expiry.getFullYear()+1);
  else expiry.setMonth(expiry.getMonth()+1);
  return expiry.toISOString();
}
function getPlanButtonLabel(plan){
  return plan==='free'
    ?'VERIFY EMAIL & CREATE ACCOUNT →'
    :plan==='monthly'
      ?'VERIFY EMAIL & CONTINUE TO ₱99/mo →'
      :'VERIFY EMAIL & CONTINUE TO ₱799/yr →';
}
function getPaymentMethodLabel(method){
  return method==='gcash'
    ?'GCash'
    :method==='maya'
      ?'Maya'
      :method==='card'
        ?'Credit/Debit Card'
        :'Bank Transfer';
}


// ===== AUTH MODAL =====
let signupPlan='free';
let pendingSignup=null;

function openAuth(mode){
  if(S.sess&&mode==='signup'){goDb();return;}
  openModal('auth-modal');
  switchTab(mode);
}
function switchTab(mode){
  ['f-login','f-signup','f-forgot'].forEach(f=>{const el=document.getElementById(f);if(el)el.style.display='none';});
  document.getElementById('tab-li').classList.remove('on');
  document.getElementById('tab-su').classList.remove('on');

  if(mode!=='signup')resetSignupVerification(false);

  if(mode==='login'){
    document.getElementById('f-login').style.display='flex';
    document.getElementById('tab-li').classList.add('on');
    document.getElementById('auth-title').textContent='WELCOME BACK';
    document.getElementById('auth-sub').textContent='Log in to your GymFit account';
  } else if(mode==='signup'){
    document.getElementById('f-signup').style.display='flex';
    document.getElementById('tab-su').classList.add('on');
    document.getElementById('auth-title').textContent='JOIN GYMFIT';
    document.getElementById('auth-sub').textContent='Create your account and verify your email';
    updateSignupCTA();
  } else {
    document.getElementById('f-forgot').style.display='flex';
    document.getElementById('auth-title').textContent='RESET PASSWORD';
    document.getElementById('auth-sub').textContent='We\'ll send a reset link to your email';
  }
}
function pickPlan(p,el){
  signupPlan=p;
  document.querySelectorAll('#plan-opts .plan-opt').forEach(e=>e.classList.remove('on'));
  if(el)el.classList.add('on');
  updateSignupCTA();
}
function updateSignupCTA(){
  const b=document.getElementById('su-btn');
  if(b)b.textContent=getPlanButtonLabel(signupPlan);
}

function collectSignupData(){
  return {
    name:document.getElementById('su-name').value.trim(),
    email:document.getElementById('su-email').value.trim().toLowerCase(),
    pw:document.getElementById('su-pw').value,
    goal:document.getElementById('su-goal').value||'lose',
    experience:document.getElementById('su-exp').value||'beginner',
    terms:document.getElementById('terms').checked,
    requestedPlan:signupPlan
  };
}

function clearSignupForm(){
  const name=document.getElementById('su-name');
  const email=document.getElementById('su-email');
  const pw=document.getElementById('su-pw');
  const goal=document.getElementById('su-goal');
  const exp=document.getElementById('su-exp');
  const terms=document.getElementById('terms');

  if(name)name.value='';
  if(email)email.value='';
  if(pw)pw.value='';
  if(goal)goal.value='';
  if(exp)exp.value='';
  if(terms)terms.checked=false;

  signupPlan='free';
  document.querySelectorAll('#plan-opts .plan-opt').forEach(e=>e.classList.remove('on'));
  const freePlan=document.getElementById('pl-free');
  if(freePlan)freePlan.classList.add('on');
  updateSignupCTA();

  if(pw)pwStrength(pw);
}

function resetSignupVerification(clearPending=true){
  const wrap=document.getElementById('su-otp-wrap');
  const otp=document.getElementById('su-otp');
  const email=document.getElementById('su-email');
  const note=document.getElementById('su-otp-note');
  const help=document.getElementById('su-otp-help');
  const status=document.getElementById('su-otp-status');

  if(wrap)wrap.style.display='none';
  if(otp)otp.value='';
  if(email)email.readOnly=false;
  if(note)note.textContent='Codes expire in 5 minutes.';
  if(help)help.innerHTML='Enter the 6-digit code sent to <strong style="color:#fff" id="su-otp-email">your@email.com</strong>.';
  if(status){
    status.style.display='none';
    status.innerHTML='';
  }
  clearErrs('su-name-err','su-email-err','su-pw-err','terms-err','su-otp-err');
  updateSignupCTA();

  if(clearPending){
    pendingSignup=null;
    clearOTPState();
  }
}

function showSignupVerification(data,otpState=null){
  const wrap=document.getElementById('su-otp-wrap');
  const emailLabel=document.getElementById('su-otp-email');
  const help=document.getElementById('su-otp-help');
  const note=document.getElementById('su-otp-note');
  const status=document.getElementById('su-otp-status');
  const emailInput=document.getElementById('su-email');
  if(wrap)wrap.style.display='block';
  if(emailLabel)emailLabel.textContent=data.email;
  if(emailInput)emailInput.readOnly=true;
  if(otpState&&otpState.mode==='local'){
    if(help){
      help.innerHTML='No Gmail verification message was sent because the local verification server is offline for this setup.';
    }
    if(note){
      note.textContent='Use the local 6-digit code below on this device, or start the verification backend to send a real Gmail OTP.';
    }
    if(status){
      status.style.display='block';
      status.innerHTML=`
        <div style="font-size:11px;color:var(--red3);font-weight:700;letter-spacing:1px;margin-bottom:6px">LOCAL SIGNUP CODE</div>
        <div style="font-size:12px;color:var(--txt2);margin-bottom:8px">The email service is offline right now, so this code is shown locally instead of being emailed.</div>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#fff;font-family:'Barlow Condensed',sans-serif">${otpState.code||'------'}</div>
      `;
    }
  } else {
    if(help){
      help.innerHTML='Enter the 6-digit code sent to <strong style="color:#fff" id="su-otp-email">your@email.com</strong>.';
      const refreshedEmailLabel=document.getElementById('su-otp-email');
      if(refreshedEmailLabel)refreshedEmailLabel.textContent=data.email;
    }
    if(note){
      note.textContent=otpState&&otpState.note
        ?otpState.note
        :'Codes expire in 5 minutes. Resend is available after 60 seconds.';
    }
    if(status){
      status.style.display='none';
      status.innerHTML='';
    }
  }
  const otp=document.getElementById('su-otp');
  if(otp)otp.focus();
}

async function doSignup(){
  const data=collectSignupData();
  clearErrs('su-name-err','su-email-err','su-pw-err','terms-err','su-otp-err');

  let ok=true;
  if(!data.name){showErr('su-name-err',true);ok=false;}
  if(!data.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){showErr('su-email-err',true);ok=false;}
  if(data.pw.length<8){showErr('su-pw-err',true);ok=false;}
  if(!data.terms){showErr('terms-err',true);ok=false;}
  if(!ok)return;

  if(S.users[data.email]){
    toast('Email already registered. Please log in instead.','err');
    return;
  }

  pendingSignup=data;
  let otpState;
  try{
    otpState=await sendOTP(data.email);
    if(!otpState)return;
  }catch(err){
    toast(err.message||'Could not send the verification code right now.','err',6000);
    return;
  }

  showSignupVerification(data,otpState);
  toast(
    otpState.mode==='local'
      ?'Use the local 6-digit code shown under the OTP field to finish signup.'
      :'Enter the 6-digit verification code to finish your signup.',
    otpState.mode==='local'?'info':'info',
    5500
  );
}

function editSignupEmail(){
  resetSignupVerification(false);
  pendingSignup=null;
  clearOTPState();
  const email=document.getElementById('su-email');
  if(email)email.focus();
}

async function resendSignupOTP(){
  if(!pendingSignup){
    toast('Complete the signup form first.','info');
    return;
  }
  try{
    const otpState=await resendOTP(pendingSignup.email);
    if(!otpState)return;
    showSignupVerification(pendingSignup,otpState);
  }catch(err){
    toast(err.message||'Could not resend the verification code.','err');
  }
}

async function verifySignupOTP(){
  if(!pendingSignup){
    toast('Start signup first so we know which email to verify.','err');
    return;
  }

  const otp=document.getElementById('su-otp').value.trim();
  clearErrs('su-otp-err');

  if(!/^\d{6}$/.test(otp)){
    showErr('su-otp-err',true);
    return;
  }

  try{
    await verifyOTP(otp,pendingSignup.email);
  }catch(err){
    toast(err.message||'Verification failed.','err');
    return;
  }

  const now=new Date().toISOString();
  const user={
    name:pendingSignup.name,
    email:pendingSignup.email,
    pw:pendingSignup.pw,
    goal:pendingSignup.goal,
    experience:pendingSignup.experience,
    programLevel:pendingSignup.experience,
    plan:'free',
    emailVerified:true,
    joined:now,
    lastLogin:now,
    lastActivity:dateStr(),
    streak:1,
    bestStreak:1,
    workoutsDone:0,
    weightLog:[],
    bmiLog:[],
    workoutLog:[],
    workoutHistory:[],
    nutritionLog:{},
    sets:{},
    paymentHistory:[],
    completedWorkoutDays:{},
    currentProgramWeek:1,
    programHistory:[],
    pendingProgramDecision:null
  };

  ensureUserFields(user);
  S.users[user.email]=user;
  S.sess={email:user.email,name:user.name,plan:user.plan};
  save();

  const requestedPlan=pendingSignup.requestedPlan;
  pendingSignup=null;
  resetSignupVerification(false);
  clearSignupForm();
  closeModal('auth-modal');
  enterDb(user);

  if(requestedPlan&&requestedPlan!=='free'){
    toast(`Email verified. Continue your ${getPlanLabel(requestedPlan)} payment to activate premium.`, 'ok', 5500);
    openSubscribe(requestedPlan);
  } else {
    toast(`Welcome to GymFit, ${user.name.split(' ')[0]}!`, 'ok');
  }
}


// ===== LOGIN =====
async function doLogin(){
  const email=document.getElementById('li-email').value.trim().toLowerCase();
  const pw=document.getElementById('li-pw').value;
  clearErrs('li-email-err','li-pw-err');

  let ok=true;
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showErr('li-email-err',true);ok=false;}
  if(!pw){showErr('li-pw-err',true);ok=false;}
  if(!ok)return;

  const user=S.users[email];
  if(!user||user.pw!==pw){toast('Incorrect email or password.','err');return;}
  if(user.emailVerified===false){toast('Please verify your email first before logging in.','err');return;}

  const today=dateStr();
  const yesterday=dateStr(-1);
  if(user.lastActivity===yesterday){user.streak=(user.streak||0)+1;}
  else if(user.lastActivity!==today){user.streak=1;}
  user.bestStreak=Math.max(user.streak,user.bestStreak||1);
  user.lastActivity=today;
  user.lastLogin=new Date().toISOString();
  ensureUserFields(user);
  S.users[email]=user;
  S.sess={email,name:user.name,plan:user.plan};
  save();
  await syncServerSubscription(user);
  closeModal('auth-modal');
  enterDb(me()||user);
  toast('Welcome back, '+user.name.split(' ')[0]+'!','ok');
}


// ===== FORGOT =====
function doForgot(){
  const email=document.getElementById('fg-email').value.trim();
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showErr('fg-err',true);return;}
  showErr('fg-err',false);
  toast('Reset link sent to '+email+' (simulated)','ok');
  switchTab('login');
}


// ===== LOGOUT =====
function doLogout(){S.sess=null;save();goLand();toast('Logged out successfully.','info');}


// ===== SUBSCRIBE MODAL =====
let subPlan='monthly',subPay='gcash';

function selectSubPlanOption(){
  document.querySelectorAll('#sub-monthly-opt,#sub-annual-opt').forEach(e=>e.classList.remove('on'));
  const el=document.getElementById('sub-'+subPlan+'-opt');
  if(el)el.classList.add('on');
}

function selectPayOption(){
  document.querySelectorAll('#pay-gcash,#pay-maya,#pay-card,#pay-bank').forEach(e=>e.classList.remove('on'));
  const el=document.getElementById('pay-'+subPay);
  if(el)el.classList.add('on');
}

function resetPaymentErrors(){
  clearErrs('pay-field-err','pay-confirm-err');
}

function openSubscribe(plan){
  subPlan=plan||'monthly';
  subPay='gcash';
  selectSubPlanOption();
  selectPayOption();

  const msgEl=document.getElementById('sub-msg');
  if(msgEl)msgEl.style.display=S.sess?'none':'block';

  const btn=document.getElementById('sub-btn');
  if(btn)btn.disabled=!S.sess;

  const confirm=document.getElementById('pay-confirm');
  if(confirm)confirm.checked=false;

  updatePayDetail();
  resetPaymentErrors();
  openModal('sub-modal');
}
function pickSubPlan(p,el){
  subPlan=p;
  selectSubPlanOption();
  if(el)el.classList.add('on');
  updatePayDetail();
}
function pickPay(p,el){
  subPay=p;
  selectPayOption();
  if(el)el.classList.add('on');
  const confirm=document.getElementById('pay-confirm');
  if(confirm)confirm.checked=false;
  updatePayDetail();
  resetPaymentErrors();
}

function updatePayDetail(){
  const payDetail=document.getElementById('pay-detail');
  const payFields=document.getElementById('pay-fields');
  const payConfirmText=document.getElementById('pay-confirm-text');
  const subSummary=document.getElementById('sub-summary');
  const subBtn=document.getElementById('sub-btn');
  const amount=getPlanPrice(subPlan);
  const user=me();

  const details={
    gcash:{
      body:'A secure PayMongo checkout page will open and ask the customer to log in to GCash, review the amount, and approve the subscription payment in the GCash app.',
      confirm:'I understand GymFit will open a secure PayMongo checkout for GCash in a new tab.',
      fields:`
        <div style="background:var(--bg4);border:1px solid var(--border2);border-radius:12px;padding:12px 14px;font-size:12px;color:var(--txt3);line-height:1.6">
          1. Continue to secure checkout.
          <br>2. Choose or confirm GCash.
          <br>3. Enter the real wallet details in PayMongo.
          <br>4. Approve the payment inside GCash.
        </div>`
    },
    maya:{
      body:'A secure PayMongo checkout page will open and ask the customer to log in to Maya, confirm the payment details, and authorize the subscription in the Maya app.',
      confirm:'I understand GymFit will open a secure PayMongo checkout for Maya in a new tab.',
      fields:`
        <div style="background:var(--bg4);border:1px solid var(--border2);border-radius:12px;padding:12px 14px;font-size:12px;color:var(--txt3);line-height:1.6">
          1. Continue to secure checkout.
          <br>2. Choose or confirm Maya.
          <br>3. Enter the real wallet details in PayMongo.
          <br>4. Approve the payment inside Maya.
        </div>`
    },
    card:{
      body:'A secure PayMongo checkout page will open and collect the real card details, perform 3-D Secure when required, and return the payment result through a webhook.',
      confirm:'I understand GymFit will open a secure PayMongo card checkout in a new tab.',
      fields:`
        <div style="background:var(--bg4);border:1px solid var(--border2);border-radius:12px;padding:12px 14px;font-size:12px;color:var(--txt3);line-height:1.6">
          1. Continue to secure checkout.
          <br>2. Enter the real card details in PayMongo.
          <br>3. Complete any OTP or 3-D Secure verification from the issuing bank.
          <br>4. Wait for GymFit to sync the successful payment.
        </div>`
    },
    bank:{
      body:'A secure PayMongo checkout page will open and guide the customer through the supported online banking or bank transfer payment flow for the selected plan.',
      confirm:'I understand GymFit will open a secure PayMongo bank checkout in a new tab.',
      fields:`
        <div style="background:var(--bg4);border:1px solid var(--border2);border-radius:12px;padding:12px 14px;font-size:12px;color:var(--txt3);line-height:1.6">
          1. Continue to secure checkout.
          <br>2. Select the supported bank inside PayMongo.
          <br>3. Follow the bank login or transfer instructions there.
          <br>4. Return here while GymFit checks the webhook result.
        </div>`
    }
  };

  const active=details[subPay];
  if(payDetail)payDetail.textContent=active.body;
  if(payFields)payFields.innerHTML=active.fields;
  if(payConfirmText)payConfirmText.textContent=active.confirm;
  if(subSummary){
    subSummary.innerHTML=`
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <span>Plan: <strong style="color:#fff">${getPlanLabel(subPlan)}</strong></span>
        <span>Amount: <strong style="color:#fff">₱${amount}</strong></span>
      </div>
      <div style="font-size:12px;color:var(--txt4);margin-top:6px">${user?`Account: ${user.email}`:'Log in to continue this checkout.'} · Preferred method: ${getPaymentMethodLabel(subPay)} · Billing cycle: ${getPlanDurationLabel(subPlan)}</div>`;
  }
  if(subBtn)subBtn.textContent=`CONTINUE TO SECURE CHECKOUT →`;
}

function collectPaymentDetails(){
  resetPaymentErrors();

  const confirm=document.getElementById('pay-confirm');
  const payment={
    plan:subPlan,
    method:subPay,
    amount:getPlanPrice(subPlan),
    status:'pending',
    requestedAt:new Date().toISOString()
  };

  if(!confirm||!confirm.checked){
    showErr('pay-confirm-err',true);
    return null;
  }

  return payment;
}

async function doSubscribe(){
  if(!S.sess){toast('Please log in first to subscribe.','err');return;}
  const user=me();
  if(!user){toast('User session not found. Please log in again.','err');return;}

  const payment=collectPaymentDetails();
  if(!payment)return;

  try{
    const checkout=await apiRequest('/subscriptions/create-checkout',{
      method:'POST',
      body:{
        email:user.email,
        name:user.name,
        plan:subPlan,
        preferredMethod:subPay
      }
    });

    user.pendingPayment={
      ...payment,
      method:subPay,
      preferredMethod:subPay,
      checkoutSessionId:checkout.checkoutSessionId||null,
      checkoutUrl:checkout.checkoutUrl,
      referenceNumber:checkout.referenceNumber||null,
      checkoutStatus:checkout.checkoutStatus||'active'
    };
    user.pendingProgramDecision=user.pendingProgramDecision||null;
    S.users[user.email]=user;
    save();

    closeModal('sub-modal');
    const popup=window.open(checkout.checkoutUrl,'_blank','noopener,noreferrer');
    if(!popup){
      window.location.href=checkout.checkoutUrl;
      return;
    }
    startSubscriptionPolling(user.email);
    toast(`Secure ${getPaymentMethodLabel(subPay)} checkout opened. Finish the payment there and GymFit will sync it automatically.`,'info',7000);
    renderDashboard(user);
  }catch(err){
    toast(err.message||'Could not start the secure checkout.','err',6000);
  }
}


// ===== PASSWORD UTILS =====
function eyeToggle(id,icon){const inp=document.getElementById(id);inp.type=inp.type==='password'?'text':'password';icon.textContent=inp.type==='password'?'👁':'🙈';}
function pwStrength(inp){
  const v=inp.value;const b=document.getElementById('pw-bar');const h=document.getElementById('pw-hint');
  if(!v){b.className='pw-bar';h.textContent='Enter a password';b.style.width='0';return;}
  if(v.length<8){b.className='pw-bar weak';h.textContent='Too short — min 8 characters';}
  else if(v.length<12||!/[A-Z]/.test(v)||!/[0-9]/.test(v)){b.className='pw-bar fair';h.textContent='Fair — add numbers or uppercase';}
  else{b.className='pw-bar strong';h.textContent='Strong password ✓';}
}


// ===== AUTH GUARDS =====
function reqAuth(action){
  if(!S.sess){toast('Please sign up or log in to access this!','info');openAuth('signup');return false;}
  if(action==='coach'&&!isPrem()){toast('Coach access requires Premium','err');return false;}
  goDb();return true;
}


// ===== FAQ =====
function faqToggle(btn){
  const a=btn.nextElementSibling;const ic=btn.querySelector('.faq-icon');
  const isOpen=a.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(x=>x.classList.remove('open'));
  document.querySelectorAll('.faq-icon').forEach(x=>{x.classList.remove('open');x.textContent='+';});
  if(!isOpen){a.classList.add('open');ic.classList.add('open');}
}
