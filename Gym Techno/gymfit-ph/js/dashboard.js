/* ============================================================
   GymFit — Dashboard
   renderDashboard, panel switcher, settings, streak tracking
============================================================ */

// ===== ENTER DASHBOARD =====
function enterDb(user){
  refreshNav();
  goDb();
  renderDashboard(user);
}
function refreshNav(){
  // This now just refreshes the dashboard navbar user info
  // Landing nav is handled by refreshLandNav()
  if(S.sess){
    const u=me();if(!u)return;
    const init=(u.name||'A').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    // Dashboard navbar
    const dbAva=document.getElementById('db-nav-ava');
    if(dbAva)dbAva.textContent=init;
    const dbName=document.getElementById('db-nav-uname');
    if(dbName)dbName.textContent=u.name.split(' ')[0];
    const dbPlan=document.getElementById('db-nav-plan');
    if(dbPlan)dbPlan.textContent=u.plan==='free'?'Free Trial':u.plan==='annual'?'Premium Annual':'Premium Monthly';
  }
  refreshLandNav();
}
function renderDashboard(user){
  ensureUserFields(user);
  const prem=isPrem();
  const init=(user.name||'A').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  // dashboard navbar
  const dbAva=document.getElementById('db-nav-ava');if(dbAva)dbAva.textContent=init;
  const dbName=document.getElementById('db-nav-uname');if(dbName)dbName.textContent=user.name.split(' ')[0];
  const dbPln=document.getElementById('db-nav-plan');if(dbPln)dbPln.textContent=user.plan==='free'?'Free Trial':user.plan==='annual'?'Premium Annual':'Premium Monthly';
  // sidebar
  document.getElementById('db-ava').textContent=init;
  document.getElementById('db-uname2').textContent=user.name.split(' ')[0];
  const planLbl=prem?'PREMIUM ✓':'FREE TRIAL';
  const planCls=prem?'badge-green':'badge-yellow';
  ['db-plan-badge','set-plan-badge'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.innerHTML='<span class="badge '+planCls+'">'+planLbl+'</span>';
  });
  // home panel
  document.getElementById('home-welcome').textContent=user.name.split(' ')[0].toUpperCase();
  const ub=document.getElementById('home-upgrade');
  if(ub)ub.style.display=prem?'none':'flex';
  const wu=document.getElementById('wo-upgrade');
  if(wu)wu.style.display=prem?'none':'flex';
  const cl=document.getElementById('coach-lock-msg');
  if(cl)cl.style.display=prem?'none':'flex';
  // streaks
  updateStreakDisplay(user);
  // bmi
  if(user.bmi){updateBmiDisplay(user.bmi);}
  document.getElementById('home-weight').textContent=user.weight?user.weight+' kg':'-- kg';
  document.getElementById('home-bmi').textContent=user.bmi||'--';
  // settings
  document.getElementById('set-ava').textContent=init;
  document.getElementById('set-name-disp').textContent=user.name;
  document.getElementById('set-email-disp').textContent=user.email;
  document.getElementById('set-name').value=user.name;
  document.getElementById('set-email').value=user.email;
  document.getElementById('set-goal').value=user.goal||'lose';
  const setExp=document.getElementById('set-exp');
  if(setExp)setExp.value=getCurrentProgramLevel(user);
  // subscription info
  const si=document.getElementById('set-sub-info');
  if(si){
    if(prem){
      const expiry=user.subExpiry?new Date(user.subExpiry):null;
      const lastPayment=user.paymentHistory&&user.paymentHistory[0];
      let expiryHtml='';
      if(expiry){
        const now=new Date();
        const daysLeft=Math.ceil((expiry-now)/(1000*60*60*24));
        const expiryFmt=expiry.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});
        const daysColor=daysLeft<=7?'var(--red3)':daysLeft<=14?'#EAB308':'#4ade80';
        const planLabel=user.plan==='annual'?'Premium Annual':'Premium Monthly';
        const price=user.plan==='annual'?'₱799/yr':'₱99/mo';
        expiryHtml=`
          <div class="badge badge-green mb12">${planLabel} ACTIVE ✓</div>
          <div style="background:var(--bg3);border-radius:12px;padding:14px;border:1px solid var(--border2);margin-bottom:12px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:12px;color:var(--txt3);font-weight:700;letter-spacing:0.5px">SUBSCRIPTION STATUS</span>
              <span class="badge badge-green" style="font-size:11px">${price}</span>
            </div>
            <div style="font-size:13px;color:var(--txt2);margin-bottom:4px">📅 Expires: <strong style="color:#fff">${expiryFmt}</strong></div>
            <div style="font-size:13px;color:var(--txt2);margin-bottom:8px">⏳ Remaining: <strong style="color:${daysColor}">${daysLeft} day${daysLeft!==1?'s':''}</strong> left</div>
            <div style="height:5px;background:var(--bg4);border-radius:4px;overflow:hidden">
              <div style="height:100%;border-radius:4px;background:${daysColor};width:${Math.max(3,Math.min(100,Math.round(daysLeft/(user.plan==='annual'?365:30)*100)))}%;transition:width 0.5s"></div>
            </div>
            ${daysLeft<=7?'<div style="font-size:12px;color:var(--red3);margin-top:8px;font-weight:700">⚠️ Your subscription expires soon! Consider renewing.</div>':''}
          </div>
          ${lastPayment?`
          <div style="background:var(--bg3);border-radius:12px;padding:12px 14px;border:1px solid var(--border2);margin-bottom:12px">
            <div style="font-size:11px;color:var(--txt3);font-weight:700;letter-spacing:0.5px;margin-bottom:6px">LATEST PAYMENT</div>
            <div style="font-size:13px;color:var(--txt2);margin-bottom:3px">Method: <strong style="color:#fff;text-transform:capitalize">${lastPayment.method}</strong></div>
            <div style="font-size:13px;color:var(--txt2);margin-bottom:3px">Amount: <strong style="color:#fff">₱${lastPayment.amount}</strong></div>
            <div style="font-size:13px;color:var(--txt2)">Reference: <strong style="color:#fff">${lastPayment.reference||lastPayment.cardLast4||'Recorded'}</strong></div>
          </div>`:''}
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="openSubscribe('${user.plan}')" style="font-size:13px">🔄 RENEW PLAN</button>
            <button class="btn btn-dark btn-sm" onclick="cancelSub()" style="font-size:13px;color:var(--txt4)">Cancel Subscription</button>
          </div>`;
      } else {
        expiryHtml='<div class="badge badge-green mb12">PREMIUM ACTIVE ✓</div><p style="font-size:13px;color:var(--txt3)">Full access to all features.</p>';
      }
      si.innerHTML=expiryHtml;
    } else {
      if(user.pendingPayment){
        const startedAt=user.pendingPayment.requestedAt
          ?new Date(user.pendingPayment.requestedAt).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})
          :'Recently started';
        si.innerHTML=`
          <div class="badge badge-yellow mb12">PAYMENT PENDING</div>
          <p style="font-size:13px;color:var(--txt3);margin-bottom:11px">Your ${getPlanLabel(user.pendingPayment.plan)} checkout is still waiting for confirmation from the payment provider.</p>
          <div style="font-size:12px;color:var(--txt4);margin-bottom:10px">Started: ${startedAt}${user.pendingPayment.referenceNumber?` · Ref: ${user.pendingPayment.referenceNumber}`:''}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-red btn-sm" onclick="if(me()){startSubscriptionPolling(me().email);toast('Checking payment status now...','info');}" style="font-size:13px">CHECK PAYMENT STATUS →</button>
            ${user.pendingPayment.checkoutUrl?`<button class="btn btn-ghost btn-sm" onclick="window.open('${user.pendingPayment.checkoutUrl}','_blank','noopener,noreferrer')" style="font-size:13px">REOPEN CHECKOUT</button>`:''}
          </div>
          <div style="text-align:center;font-size:11px;color:var(--txt4);margin-top:8px">${getPaymentMethodLabel(user.pendingPayment.method||user.pendingPayment.preferredMethod||'gcash')} · Secure hosted checkout</div>`;
      } else {
        si.innerHTML=`
          <div class="badge badge-yellow mb12">FREE TRIAL</div>
          <p style="font-size:13px;color:var(--txt3);margin-bottom:11px">You're on the free plan. Limited to 2 workouts, sample meals, and 3 AI questions/day.</p>
          <button class="btn btn-red btn-full" onclick="openSubscribe('monthly')" style="font-size:14px;padding:12px">UPGRADE TO PREMIUM →</button>
          <div style="text-align:center;font-size:11px;color:var(--txt4);margin-top:8px">₱99/month · Cancel anytime · Full access instantly</div>`;
      }
    }
  }
  // workout panel
  buildWorkoutPanel(user);
  // supplements
  buildSupplements(user);
  // nutrition
  renderNutrition(user);
  // progress
  renderProgress(user);
  // home week bars
  renderHomeWeek(user);
  // AI quota
  updateAIStatus();
  // today's tip
  const tips=['Drink 8+ glasses of water today. Hydration improves performance by up to 25%.','Get 7-9 hours of sleep. Growth hormone is released during deep sleep — this is when you actually grow!','Eat protein with every meal. Aim for 0.8–1g per pound of bodyweight.','Don\'t skip warm-up. 5 minutes of dynamic stretching reduces injury risk significantly.','Progressive overload is key — try to add one more rep or a little more weight each week.','Rest days are not optional — muscles grow during rest, not during training.','Track your food. People who log meals lose 2x more weight than those who don\'t.'];
  document.getElementById('home-tip').textContent=tips[new Date().getDay()];
}


// ===== PANEL SWITCHER =====
function showPanel(name){
  document.querySelectorAll('.db-panel').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.sb-link').forEach(l=>l.classList.remove('on'));
  document.querySelectorAll('.db-tab').forEach(t=>t.classList.remove('on'));
  const p=document.getElementById('panel-'+name);if(p)p.classList.add('on');
  const sb=document.getElementById('sb-'+name);if(sb)sb.classList.add('on');
  const tabMap={home:0,workout:1,nutrition:2,ai:3,coach:4,progress:5,bmi:6,settings:7};
  const tabs=document.querySelectorAll('.db-tab');
  if(tabMap[name]!==undefined&&tabs[tabMap[name]])tabs[tabMap[name]].classList.add('on');
  // Panel-specific init
  if(name==='bmi')loadBmiPanel();
  if(name==='nutrition'){const u=me();if(u)renderNutrition(u);}
  if(name==='progress'){const u=me();if(u)renderProgress(u);}
  if(name==='ai'){
    // Personalize the greeting if db-ai-log is empty
    const aiLog=document.getElementById('db-ai-log');
    if(aiLog&&aiLog.children.length<=1){
      const u=me();
      const firstName=u?u.name.split(' ')[0]:'there';
      const goal=u?{lose:'lose weight',muscle:'build muscle',fit:'get fit',maintain:'stay healthy'}[u.goal]||'reach your goals':'reach your goals';
      const bmiInfo=u&&u.bmi?` Your current BMI is ${u.bmi}.`:'';
      aiLog.innerHTML='';
      addBubble('db-ai-log',`Hey ${firstName}! 👋 I'm your personal AI fitness coach.\n\nI know you want to ${goal}.${bmiInfo} I'm here to help you with workout plans, meal plans, calorie calculations, supplement advice, and anything else fitness-related.\n\nWhat do you need help with today?`,'ai','🤖 GYMFIT AI');
    }
    updateAIStatus();
  }
}


// ===== SETTINGS =====
function saveSettings(){
  const user=me();if(!user)return;
  const name=document.getElementById('set-name').value.trim();
  const goal=document.getElementById('set-goal').value;
  if(!name){toast('Name cannot be empty','err');return;}
  user.name=name;user.goal=goal;
  const exp=document.getElementById('set-exp').value;
  const currentLevel=getCurrentProgramLevel(user);
  const programChanged=!!(exp&&exp!==currentLevel);
  if(programChanged){
    user.experience=exp;
    user.programLevel=exp;
    user.currentProgramWeek=1;
    user.completedWorkoutDays={};
    user.completedDays=user.completedWorkoutDays;
    user.pendingProgramDecision=null;
  } else if(exp){
    user.experience=exp;
    user.programLevel=exp;
  }
  S.users[user.email]=user;S.sess.name=name;save();
  document.getElementById('home-welcome').textContent=name.split(' ')[0].toUpperCase();
  const dnu=document.getElementById('db-nav-uname');if(dnu)dnu.textContent=name.split(' ')[0];
  const dau=document.getElementById('db-uname2');if(dau)dau.textContent=name.split(' ')[0];
  document.getElementById('set-name-disp').textContent=name;
  buildSupplements(user);
  buildWorkoutPanel(user);
  renderHomeWeek(user);
  toast(programChanged?'Settings saved. Workout cycle reset for your new program.':'Settings saved ✓','ok');
}


// ===== STREAK =====
function dateStr(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return d.toISOString().slice(0,10);}
function checkStreak(user){
  const today=dateStr();
  const yesterday=dateStr(-1);
  if(!user.lastActivity){user.lastActivity=today;user.streak=1;return user;}
  if(user.lastActivity===today)return user;
  if(user.lastActivity===yesterday){user.streak=(user.streak||1)+1;}
  else{user.streak=1;} // missed a day — reset
  user.bestStreak=Math.max(user.streak,user.bestStreak||1);
  user.lastActivity=today;
  return user;
}
function updateStreakDisplay(user){
  const s=user.streak||1;
  ['streak-disp','home-streak','prog-streak'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.textContent=s;
  });
  document.getElementById('prog-workouts').textContent=user.workoutsDone||0;
}
