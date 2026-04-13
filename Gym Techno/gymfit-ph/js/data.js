/* ============================================================
   GymFit PH — Data & State
   localStorage persistence, session management, save/load
============================================================ */

// ===== DATA =====
const S={
  users:JSON.parse(localStorage.getItem('bg_users')||'{}'),
  sess:JSON.parse(localStorage.getItem('bg_sess')||'null'),
  quota:JSON.parse(localStorage.getItem('bg_quota')||'{}')
};

const API_BASE=(window.GYMFIT_API_BASE||(
  location.hostname==='localhost'||location.hostname==='127.0.0.1'
    ?'http://localhost:8787/api'
    :'/api'
)).replace(/\/$/,'');

function normalizeList(value){
  return Array.isArray(value)?value:[];
}

function normalizeRecord(value){
  return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
}

function normalizeCompletedWorkoutDays(primary,fallback){
  const sourceCandidates=[primary,fallback];
  for(let i=0;i<sourceCandidates.length;i++){
    const source=sourceCandidates[i];
    if(Array.isArray(source)){
      return source.reduce((acc,day)=>{
        if(typeof day==='string'&&day)acc[day]=true;
        return acc;
      },{});
    }
    if(source&&typeof source==='object'){
      return {...source};
    }
  }
  return {};
}

function getCurrentProgramLevel(user){
  return user&&(
    user.programLevel
    ||user.experience
    ||(user.pendingProgramDecision&&user.pendingProgramDecision.completedLevel)
  )||'beginner';
}

// New fields helpers
function ensureUserFields(user){
  if(!user) return;

  user.weightLog=normalizeList(user.weightLog);
  user.bmiLog=normalizeList(user.bmiLog);
  user.workoutLog=normalizeList(user.workoutLog);
  user.workoutHistory=normalizeList(user.workoutHistory);
  user.paymentHistory=normalizeList(user.paymentHistory);
  user.programHistory=normalizeList(user.programHistory);
  user.weekStats=normalizeList(user.weekStats);
  user.nutritionLog=normalizeRecord(user.nutritionLog);
  user.sets=normalizeRecord(user.sets);
  user.completedWorkoutDays=normalizeCompletedWorkoutDays(user.completedWorkoutDays,user.completedDays);

  const defaults={
    bmi:null,
    weight:null,
    height:null,
    age:null,
    streak:1,
    bestStreak:1,
    workoutsDone:0,
    weightLog:user.weightLog,
    bmiLog:user.bmiLog,
    workoutLog:user.workoutLog,
    workoutHistory:user.workoutHistory,
    nutritionLog:user.nutritionLog,
    sets:user.sets,
    paymentHistory:user.paymentHistory,
    pendingPayment: user.pendingPayment || null,
    programLevel: getCurrentProgramLevel(user),
    currentProgramWeek: user.currentProgramWeek || 1,
    programHistory: user.programHistory,
    programCompleted: user.programCompleted || false,
    weekStats: user.weekStats,
    completedWorkoutDays: user.completedWorkoutDays,
    pendingProgramDecision: user.pendingProgramDecision || null
  };

  Object.keys(defaults).forEach(key=>{
    if(user[key]===undefined||user[key]===null){
      user[key]=defaults[key];
    }
  });

  if(typeof user.emailVerified!=='boolean'){
    user.emailVerified=true;
  }

  user.completedDays=user.completedWorkoutDays;
}

function save(){localStorage.setItem('bg_users',JSON.stringify(S.users));localStorage.setItem('bg_sess',JSON.stringify(S.sess));localStorage.setItem('bg_quota',JSON.stringify(S.quota));}
function me(){
  const user = S.sess ? S.users[S.sess.email] : null;
  if (user) ensureUserFields(user);
  return user;
}

async function apiRequest(path,options={}){
  const url=path.startsWith('http')?path:`${API_BASE}${path.startsWith('/')?'':'/'}${path}`;
  const headers={Accept:'application/json',...(options.headers||{})};
  const init={method:options.method||'GET',headers};

  if(options.body!==undefined){
    init.body=typeof options.body==='string'?options.body:JSON.stringify(options.body);
    if(!headers['Content-Type'])headers['Content-Type']='application/json';
  }

  let response;
  try{
    response=await fetch(url,init);
  }catch(err){
    const wrapped=new Error('Could not connect to the GymFit verification server.');
    wrapped.isNetworkError=true;
    wrapped.cause=err;
    wrapped.url=url;
    throw wrapped;
  }
  const text=await response.text();
  let payload={};
  if(text){
    try{payload=JSON.parse(text);}catch{payload={message:text};}
  }

  if(!response.ok){
    const err=new Error(payload.message||payload.error||`Request failed with ${response.status}`);
    err.status=response.status;
    err.payload=payload;
    throw err;
  }

  return payload;
}

async function apiHealth(){
  return apiRequest('/health');
}

async function syncServerSubscription(user){
  if(!user||!user.email)return user;

  try{
    const payload=await apiRequest(`/subscriptions/status?email=${encodeURIComponent(user.email)}`);
    const sub=payload.subscription;
    if(!sub)return user;

    if(sub.status==='active'){
      user.plan=sub.plan||user.plan||'free';
      user.subStart=sub.activatedAt||user.subStart||null;
      user.subExpiry=sub.expiresAt||user.subExpiry||null;
      user.subPayMethod=sub.preferredMethod||sub.source||user.subPayMethod||null;
      user.pendingPayment=null;

      if(sub.lastPayment){
        user.paymentHistory=user.paymentHistory||[];
        const already=user.paymentHistory.find(p=>
          (p.paymentId&&sub.lastPayment.paymentId&&p.paymentId===sub.lastPayment.paymentId)
          ||(
            p.reference&&sub.lastPayment.reference
            &&p.reference===sub.lastPayment.reference
            &&p.paidAt===sub.lastPayment.paidAt
          )
        );
        if(!already)user.paymentHistory.unshift(sub.lastPayment);
      }

      if(S.sess)S.sess.plan=user.plan;
      S.users[user.email]=user;
      save();
    } else if(sub.status==='pending'){
      user.pendingPayment={
        checkoutSessionId:sub.checkoutSessionId||null,
        checkoutUrl:sub.checkoutUrl||null,
        referenceNumber:sub.referenceNumber||null,
        checkoutStatus:sub.checkoutStatus||'active',
        plan:sub.plan||(user.pendingPayment&&user.pendingPayment.plan)||'monthly',
        method:sub.preferredMethod||(user.pendingPayment&&user.pendingPayment.method)||null,
        preferredMethod:sub.preferredMethod||(user.pendingPayment&&user.pendingPayment.preferredMethod)||null,
        amount:sub.amount||(user.pendingPayment&&user.pendingPayment.amount)||null,
        requestedAt:sub.requestedAt||new Date().toISOString()
      };
      S.users[user.email]=user;
      save();
    } else if(sub.status==='inactive'&&user.pendingPayment){
      user.pendingPayment=null;
      S.users[user.email]=user;
      save();
    }
  }catch(err){
    // The frontend should still work offline; the API is optional at runtime.
    console.warn('Subscription sync failed:',err);
  }

  return user;
}

let subscriptionPoller=null;
function stopSubscriptionPolling(){
  if(subscriptionPoller){
    clearInterval(subscriptionPoller);
    subscriptionPoller=null;
  }
}
function startSubscriptionPolling(email){
  stopSubscriptionPolling();
  if(!email)return;
  let attempts=0;
  const runCheck=async()=>{
    attempts++;
    const user=S.users[email];
    if(!user){stopSubscriptionPolling();return;}
    await syncServerSubscription(user);
    const latest=me()||user;
    if(latest.plan!=='free'||!latest.pendingPayment||attempts>=90){
      stopSubscriptionPolling();
      if(latest.plan!=='free'){
        refreshNav();
        renderDashboard(latest);
        toast(`Payment confirmed. ${latest.plan==='annual'?'Premium Annual':'Premium Monthly'} is now active.`,'ok',6500);
      }
    }
  };

  subscriptionPoller=setInterval(runCheck,10000);
  runCheck();
}

function isPrem(){
  const u=me();
  if(!u||u.plan==='free')return false;
  // Check if subscription has expired
  if(u.subExpiry){
    const expiry=new Date(u.subExpiry);
    if(expiry<new Date()){
      // auto-expire: downgrade to free
      u.plan='free';u.subExpiry=null;u.subStart=null;
      S.users[u.email]=u;if(S.sess)S.sess.plan='free';save();
      return false;
    }
  }
  return true;
}
function cancelSub(){
  const user=me();if(!user)return;
  if(!confirm('Cancel your Premium subscription? You will keep access until your billing period ends.'))return;
  user.subCancelled=true;
  S.users[user.email]=user;save();
  renderDashboard(user);
  toast('Subscription cancelled. Access continues until expiry.','info',5000);
}


// ===== TOAST =====
let tT;
function toast(msg,type='info',ms=3200){
  const el=document.getElementById('toast');
  el.textContent=msg;el.className='toast show '+type;
  clearTimeout(tT);tT=setTimeout(()=>{el.className='toast';},ms);
}
