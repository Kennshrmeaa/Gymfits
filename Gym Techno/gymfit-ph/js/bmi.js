/* ============================================================
   GymFit — BMI Calculator & Tracker
   BMI calculation, live preview, persistent save, history log
============================================================ */

// ===== BMI =====
let selGen='m';
function pickGen(g){
  selGen=g;
  ['m','f'].forEach(v=>{const el=document.getElementById('gen-'+v);if(!el)return;
    if(v===g){el.style.background='var(--red4)';el.style.borderColor='var(--red)';el.querySelector('div:last-child').style.color='var(--red3)';}
    else{el.style.background='var(--bg3)';el.style.borderColor='var(--border2)';el.querySelector('div:last-child').style.color='var(--txt3)';}
  });calcBMI();
}
function calcBMI(){
  const h=parseFloat(document.getElementById('bmi-h').value)/100;
  const w=parseFloat(document.getElementById('bmi-w').value);
  const age=parseFloat(document.getElementById('bmi-age').value)||25;
  if(!h||!w||isNaN(h)||isNaN(w))return;
  const bmi=parseFloat((w/(h*h)).toFixed(1));
  document.getElementById('bmi-val').textContent=bmi;
  applyBmiUI(bmi,'bmi-needle','bmi-lbl','bmi-rec');
  let bmr=selGen==='m'?(10*w)+(6.25*h*100)-(5*age)+5:(10*w)+(6.25*h*100)-(5*age)-161;
  document.getElementById('bmi-kcal').textContent=Math.round(bmr*1.375).toLocaleString();
  document.getElementById('bmi-prot').textContent=Math.round(w*1.8)+'g';
}
function applyBmiUI(bmi,needleId,lblId,recId){
  let cat,pct,rec;
  if(bmi<18.5){cat='Underweight';pct=8;rec='Eat in a calorie surplus (+300–500 kcal) with high-protein foods to build healthy mass.';}
  else if(bmi<25){cat='Normal Weight';pct=35;rec='Build lean muscle with progressive overload and balanced nutrition. You\'re in a good range!';}
  else if(bmi<30){cat='Overweight';pct=62;rec='A moderate calorie deficit with strength training and cardio will help you reach a healthy weight.';}
  else{cat='Obese';pct=88;rec='Start with low-impact cardio and consult your doctor before beginning an exercise program.';}
  const n=document.getElementById(needleId);if(n)n.style.left=pct+'%';
  const l=document.getElementById(lblId);if(l)l.textContent=cat;
  const r=document.getElementById(recId);if(r)r.textContent=rec;
  return {cat,pct};
}
function liveDbBmi(){
  const h=parseFloat(document.getElementById('db-h').value)/100;
  const w=parseFloat(document.getElementById('db-w').value);
  const age=parseInt(document.getElementById('db-age').value)||22;
  if(!h||!w||isNaN(h)||isNaN(w))return;
  const bmi=parseFloat((w/(h*h)).toFixed(1));
  document.getElementById('db-bmi-val').textContent=bmi;
  applyBmiUI(bmi,'db-bmi-needle','db-bmi-cat','db-bmi-rec');
  // TDEE estimate (use male as default, slight underestimate)
  const bmr=(10*w)+(6.25*h*100)-(5*age)+5;
  const tdee=Math.round(bmr*1.375);
  const prot=Math.round(w*1.8);
  const ke=document.getElementById('bmi-kcal-rec');if(ke)ke.textContent=tdee.toLocaleString()+' kcal';
  const pe=document.getElementById('bmi-prot-rec');if(pe)pe.textContent=prot+'g protein';
}
function saveBMI(){
  const user=me();if(!user)return;
  const h=parseFloat(document.getElementById('db-h').value);
  const w=parseFloat(document.getElementById('db-w').value);
  const age=parseInt(document.getElementById('db-age').value)||22;
  if(!h||!w||h<50||h>300||w<20||w>500){toast('Please enter valid height (50–300 cm) and weight (20–500 kg)','err');return;}
  const bmi=parseFloat((w/((h/100)**2)).toFixed(1));
  user.bmi=bmi;user.weight=w;user.height=h;user.age=age;
  user.lastBmiUpdate=new Date().toISOString();
  // log weight history
  if(!user.weightLog)user.weightLog=[];
  if(!user.bmiLog)user.bmiLog=[];
  const today=dateStr();
  user.weightLog=user.weightLog.filter(e=>e.date!==today);
  user.bmiLog=user.bmiLog.filter(e=>e.date!==today);
  user.weightLog.push({date:today,weight:w});
  user.bmiLog.push({date:today,bmi});
  user.weightLog=user.weightLog.slice(-30);
  user.bmiLog=user.bmiLog.slice(-30);
  S.users[user.email]=user;save();
  // Update all BMI displays across the dashboard
  updateBmiDisplay(bmi);
  const hw=document.getElementById('home-weight');if(hw)hw.textContent=w+' kg';
  const hb=document.getElementById('home-bmi');if(hb)hb.textContent=bmi;
  const pb=document.getElementById('prog-bmi');if(pb)pb.textContent=bmi;
  const pw=document.getElementById('prog-weight');if(pw)pw.textContent=w+' kg';
  const pbb=document.getElementById('prog-bmi-badge');if(pbb)pbb.textContent='Current: '+bmi;
  renderProgress(user);
  toast('✅ BMI saved: '+bmi+' ('+w+'kg, '+h+'cm)','ok',4000);
}
function loadBmiPanel(){
  // Load saved values into BMI tracker inputs when panel opens
  const user=me();if(!user)return;
  if(user.height){const el=document.getElementById('db-h');if(el)el.value=user.height;}
  if(user.weight){const el=document.getElementById('db-w');if(el)el.value=user.weight;}
  if(user.age){const el=document.getElementById('db-age');if(el)el.value=user.age;}
  // Show last update time
  if(user.lastBmiUpdate){
    const d=new Date(user.lastBmiUpdate);
    const fmt=d.toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const el=document.getElementById('bmi-last-update');if(el)el.textContent='Last updated: '+fmt;
  }
  liveDbBmi();
}
function updateBmiDisplay(bmi){
  document.getElementById('db-bmi-val').textContent=bmi;
  applyBmiUI(bmi,'db-bmi-needle','db-bmi-cat','db-bmi-rec');
  document.getElementById('prog-bmi').textContent=bmi;
  document.getElementById('prog-bmi-badge').textContent='Current: '+bmi;
}
