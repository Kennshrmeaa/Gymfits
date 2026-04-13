/* ============================================================
   GymFit — AI Coaching System
   AI quota management, personalized system prompts,
   landing AI (with history), dashboard AI, coach chat
   Powered by Claude claude-sonnet-4-20250514 via Anthropic API
============================================================ */

// ===== AI QUOTA =====
function todayKey(){return dateStr();}
function getUsed(){return S.quota[todayKey()]||0;}
function canAI(){return isPrem()||getUsed()<3;}
function useAI(){S.quota[todayKey()]=(S.quota[todayKey()]||0)+1;save();updateAIStatus();}
function updateAIStatus(){
  const used=getUsed();const rem=Math.max(0,3-used);
  const prem=isPrem();
  const s=prem?'🟢 Unlimited':'🟢 '+rem+'/3 today';
  const q=prem?'Unlimited AI messages — Premium member':''+rem+' of 3 free messages remaining today';
  ['ai-lbl'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=prem?'🟢 Online · Unlimited':'🟢 Online · Free: '+rem+'/3 today';});
  const qd=document.getElementById('db-quota-disp');if(qd)qd.textContent=q;
  const ds=document.getElementById('db-ai-st');if(ds)ds.textContent=s;
}


// ===== AI SYSTEM =====
function buildAISys(){
  const u=me();
  let ctx='';
  if(u){
    const prem=isPrem();
    ctx=`\n\nUSER PROFILE:
- Name: ${u.name}
- Goal: ${u.goal==='lose'?'Lose Weight':u.goal==='muscle'?'Build Muscle':u.goal==='fit'?'Get Fit & Toned':'Maintain Health'}
- BMI: ${u.bmi||'not set'} ${u.bmi?'('+getBmiCat(u.bmi)+')':''}
- Weight: ${u.weight||'not set'}kg, Height: ${u.height||'not set'}cm, Age: ${u.age||'not set'}
- Workout streak: ${u.streak||0} days
- Plan: ${prem?'Premium':'Free Trial'}
- Joined: ${u.joined?new Date(u.joined).toLocaleDateString(undefined):'unknown'}

Use this profile to personalize every response. Address them by name when relevant. Tailor all workout and nutrition advice to their specific goal (${u.goal}), BMI (${u.bmi||'unknown'}), and stats.`;
  }
  return `You are an expert AI fitness coach for GymFit. You respond ONLY based on what the user asks — don't give unsolicited information. Be conversational, warm, and specific.

CAPABILITIES:
- Create personalized workout plans (weekly/monthly, with sets, reps, rest times)
- Build practical 7-day meal plans using everyday foods from the user's preferences and region, with macros
- Calculate BMI, TDEE, calorie targets, and macros based on user stats
- Explain exercise form, technique, and injury prevention
- Give supplement recommendations (creatine, whey, vitamins) based on goal
- Provide motivation, mindset coaching, and consistency tips
- Answer any fitness, nutrition, or health question directly and accurately

RULES:
- ONLY answer what the user asks. If they ask for a workout plan, give a workout plan. If they ask a simple question, answer it simply.
- Use globally accessible food examples unless the user asks for a specific cuisine or region
- Format workout plans clearly: Day 1 / Day 2 etc. with exercise name, sets × reps, rest
- Be encouraging but honest — don't sugarcoat important health information
- Keep responses focused and structured. Use bullet points or numbered lists for plans.${ctx}`;
}


// ===== LANDING AI (with conversation history) =====
let landingHistory=[];
async function sendAI(inpId,logId,typId){
  const inp=document.getElementById(inpId);const msg=inp.value.trim();if(!msg)return;
  if(!canAI()){toast('Daily limit (3/day) reached. Sign up or upgrade for more!','err');return;}
  addBubble(logId,msg,'user');inp.value='';autoH(inp);
  const tp=document.getElementById(typId);if(tp)tp.style.display='block';
  scrollLog(logId);useAI();
  landingHistory.push({role:'user',content:msg});
  if(landingHistory.length>16)landingHistory=landingHistory.slice(-16);
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1024,system:buildAISys(),messages:landingHistory})
    });
    if(tp)tp.style.display='none';
    if(!r.ok){
      const errData=await r.json().catch(()=>({}));
      addBubble(logId,'AI temporarily unavailable ('+r.status+'). Please try again in a moment.','ai','🤖 GYMFIT AI');
      landingHistory.pop();return;
    }
    const d=await r.json();
    const reply=d.content?.[0]?.text||'Sorry, please try again.';
    landingHistory.push({role:'assistant',content:reply});
    addBubble(logId,reply,'ai','🤖 GYMFIT AI');
  }catch(e){
    if(tp)tp.style.display='none';
    addBubble(logId,'Connection failed. Please check your internet and try again.','ai','🤖 GYMFIT AI');
    landingHistory.pop();
  }
  scrollLog(logId);
}
function sendQ(msg){document.getElementById('ai-inp').value=msg;sendAI('ai-inp','ai-log','ai-typing');}


// ===== DASHBOARD AI (persistent conversation per session) =====
let dbAiHistory=[];
async function dbSendAI(){
  if(!canAI()){
    addBubble('db-ai-log','You\'ve reached your 3 free messages for today. Upgrade to Premium (₱99/mo) for unlimited AI access!','ai','🤖 GYMFIT AI');
    toast('Upgrade for unlimited AI! ₱99/mo','err');return;
  }
  const inp=document.getElementById('db-ai-inp');const msg=inp.value.trim();if(!msg)return;
  addBubble('db-ai-log',msg,'user');inp.value='';autoH(inp);
  document.getElementById('db-typing').style.display='block';
  scrollLog('db-ai-log');useAI();
  dbAiHistory.push({role:'user',content:msg});
  if(dbAiHistory.length>20)dbAiHistory=dbAiHistory.slice(-20);
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1024,system:buildAISys(),messages:dbAiHistory})
    });
    document.getElementById('db-typing').style.display='none';
    if(!r.ok){
      const errData=await r.json().catch(()=>({}));
      addBubble('db-ai-log','AI temporarily unavailable ('+r.status+'). Please try again.','ai','🤖 GYMFIT AI');
      dbAiHistory.pop();return;
    }
    const d=await r.json();
    const reply=d.content?.[0]?.text||'Sorry, please try again.';
    dbAiHistory.push({role:'assistant',content:reply});
    addBubble('db-ai-log',reply,'ai','🤖 GYMFIT AI');
  }catch(e){
    document.getElementById('db-typing').style.display='none';
    addBubble('db-ai-log','Connection failed. Please check your internet and try again.','ai','🤖 GYMFIT AI');
    dbAiHistory.pop();
  }
  scrollLog('db-ai-log');
}
function dbQ(msg){document.getElementById('db-ai-inp').value=msg;dbSendAI();}
function getBmiCat(bmi){if(bmi<18.5)return'Underweight';if(bmi<25)return'Normal';if(bmi<30)return'Overweight';return'Obese';}


// ===== COACH CHAT =====
let curCoach='Marcus',coachH=[];
function buildCoachSys(name){
  const u=me();
  let ctx='';
  if(u){
    ctx=`\n\nCLIENT PROFILE:
- Name: ${u.name}
- Goal: ${u.goal==='lose'?'Lose Weight':u.goal==='muscle'?'Build Muscle':u.goal==='fit'?'Get Fit & Toned':'Maintain Health'}
- BMI: ${u.bmi||'not set'} ${u.bmi?'('+getBmiCat(u.bmi)+')':''}
- Weight: ${u.weight||'not set'}kg | Height: ${u.height||'not set'}cm | Age: ${u.age||'not set'}
- Current streak: ${u.streak||0} days
- Workouts completed: ${u.workoutsDone||0}

Use this info to give highly personalized coaching. Address them by first name (${u.name.split(' ')[0]}).`;
  }
  const sys={
    Marcus:`You are Coach Marcus, a certified strength and hypertrophy trainer at GymFit. You are direct, no-nonsense, and highly motivating. You specialize in muscle building, progressive overload, and strength training for beginners.

COACHING STYLE:
- Answer ONLY what the client asks — don't ramble
- Give specific, actionable advice with exact numbers (weights, reps, sets)
- Use short paragraphs and bullet points
- Push them to work harder but be realistic about beginner limitations
- Reference their profile data to make advice personal${ctx}`,
    Alyssa:`You are Coach Alyssa, a certified weight loss and HIIT trainer at GymFit. You are warm, energetic, and supportive. You specialize in sustainable fat loss, cardio programming, and HIIT workouts.

COACHING STYLE:
- Answer ONLY what the client asks
- Be encouraging and positive — celebrate small wins
- Give practical, sustainable advice (no crash diets or extreme measures)
- Use their actual stats to calculate realistic targets
- Reference the client's routine, budget, and lifestyle when relevant${ctx}`,
    Rico:`You are Coach Rico, a certified nutrition coach and body recomposition specialist at GymFit. You specialize in practical diet planning and making healthy eating realistic.

COACHING STYLE:
- Answer ONLY what the client asks
- Be practical and food-specific — use actual food names the client will recognize
- Give exact portion sizes, meal timing, and macro breakdowns
- Make diet advice fit into everyday life (family meals, budget, availability)
- Reference their goal and BMI when giving nutrition advice${ctx}`
  };
  return sys[name]||sys.Marcus;
}
const COACH_GREET_FN={
  Marcus:(u)=>`Hey ${u?u.name.split(' ')[0]:'there'}! 💪 I'm Coach Marcus. ${u&&u.goal==='muscle'?'I see you want to build muscle — good choice. ':''}${u&&u.bmi?'Your BMI is '+u.bmi+'. ':''}What do you want to work on today?`,
  Alyssa:(u)=>`Hi ${u?u.name.split(' ')[0]:'there'}! 🔥 I'm Coach Alyssa. ${u&&u.goal==='lose'?'Ready to lose that weight for good? ':''}${u&&u.weight?'At '+u.weight+'kg, ':''}I can help you build a plan that actually works. What's your biggest struggle right now?`,
  Rico:(u)=>`Hey ${u?u.name.split(' ')[0]:'there'}! 🥗 I'm Coach Rico. ${u&&u.goal?'Your goal is to '+u.goal+' — nutrition will be key. ':''}${u&&u.bmi?'BMI '+u.bmi+'. ':''}Tell me what you're eating on a typical day and I'll help you optimize it.`
};
function openCoach(name,spec){
  if(!isPrem()){toast('🔒 Coach access requires Premium (₱99/mo)','err');return;}
  curCoach=name;coachH=[];
  document.getElementById('coach-chat-title').textContent='COACH '+name.toUpperCase();
  document.getElementById('coach-chat-name2').textContent='Coach '+name;
  document.getElementById('coach-ava-icon').textContent={Marcus:'👨',Alyssa:'👩',Rico:'👨‍🦱'}[name]||'👨';
  const log=document.getElementById('coach-log');log.innerHTML='';
  const u=me();
  const greet=COACH_GREET_FN[name]?COACH_GREET_FN[name](u):'Hey! How can I help you today?';
  addBubble('coach-log',greet,'ai','Coach '+name);
  coachH.push({role:'assistant',content:greet});
  document.getElementById('coach-chat-area').style.display='block';
  document.getElementById('coach-chat-area').scrollIntoView({behavior:'smooth'});
}
async function sendCoach(){
  const inp=document.getElementById('coach-inp');const msg=inp.value.trim();if(!msg)return;
  addBubble('coach-log',msg,'user');inp.value='';autoH(inp);
  document.getElementById('coach-typing').style.display='block';scrollLog('coach-log');
  coachH.push({role:'user',content:msg});
  if(coachH.length>20)coachH=coachH.slice(-20);
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,system:buildCoachSys(curCoach),messages:coachH})
    });
    document.getElementById('coach-typing').style.display='none';
    if(!r.ok){
      addBubble('coach-log','Connection issue ('+r.status+'). Please try again.','ai','Coach '+curCoach);
      coachH.pop();return;
    }
    const d=await r.json();
    const reply=d.content?.[0]?.text||'Let me think about that...';
    coachH.push({role:'assistant',content:reply});
    addBubble('coach-log',reply,'ai','Coach '+curCoach);
  }catch(e){
    document.getElementById('coach-typing').style.display='none';
    addBubble('coach-log','Connection failed. Please check your internet and try again.','ai','Coach '+curCoach);
    coachH.pop();
  }
  scrollLog('coach-log');
}


// ===== CHAT HELPERS =====
function addBubble(logId,text,role,name){
  const log=document.getElementById(logId);if(!log)return;
  const div=document.createElement('div');
  div.className='bubble '+(role==='user'?'bubble-user':'bubble-ai');
  if(role==='ai'&&name)div.innerHTML='<div style="font-weight:700;color:var(--red3);margin-bottom:4px;font-size:11px">'+name+'</div>'+esc(text);
  else div.textContent=text;
  log.appendChild(div);scrollLog(logId);
}
function esc(t){return(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}
function scrollLog(id){const el=document.getElementById(id);if(el)setTimeout(()=>{el.scrollTop=el.scrollHeight;},60);}
function autoH(el){if(!el)return;el.style.height='auto';el.style.height=Math.min(el.scrollHeight,86)+'px';}
