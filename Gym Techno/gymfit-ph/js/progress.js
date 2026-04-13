/* ============================================================
   GymFit PH — Progress Tracking
   BMI history charts, weight log, achievements
============================================================ */

// ===== PROGRESS =====
function renderProgress(user){
  // BMI bars
  const barsEl=document.getElementById('prog-bmi-bars');
  const labsEl=document.getElementById('prog-bmi-labels');
  if(barsEl&&user.bmiLog&&user.bmiLog.length>0){
    const logs=user.bmiLog.slice(-7);
    const maxBmi=Math.max(...logs.map(e=>e.bmi),30);
    barsEl.innerHTML='';
    labsEl.innerHTML='';
    logs.forEach(e=>{
      const pct=Math.round((e.bmi/maxBmi)*100);
      const bar=document.createElement('div');
      bar.style.cssText=`flex:1;display:flex;flex-direction:column;align-items:center;gap:3px`;
      bar.innerHTML=`<div style="width:100%;border-radius:3px 3px 0 0;height:${pct*0.55}px;background:var(--red);position:relative"><div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--txt3);white-space:nowrap;font-weight:700">${e.bmi}</div></div>`;
      barsEl.appendChild(bar);
      const lb=document.createElement('span');
      lb.textContent=e.date.slice(5);
      labsEl.appendChild(lb);
    });
  } else if(barsEl){
    barsEl.innerHTML='<div style="font-size:13px;color:var(--txt4);padding:10px">Log your weight in BMI Tracker to see history here.</div>';
  }
  // Weight log
  const wll=document.getElementById('weight-log-list');
  if(wll){
    wll.innerHTML='';
    if(user.weightLog&&user.weightLog.length>0){
      [...user.weightLog].reverse().forEach(e=>{
        const row=document.createElement('div');
        row.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border2);font-size:13px';
        row.innerHTML=`<span style="color:var(--txt3)">${e.date}</span><span style="font-weight:700;color:#fff">${e.weight} kg</span>`;
        wll.appendChild(row);
      });
    } else {
      wll.innerHTML='<div style="font-size:13px;color:var(--txt4);padding:8px 0">No weight logged yet. Go to BMI Tracker to start!</div>';
    }
  }
  // Achievements
  const ach=document.getElementById('achievements');
  if(ach){
    const list=[
      {done:true,icon:'🔥',name:'Started!'},
      {done:(user.streak||0)>=3,icon:'⚡',name:'3-Day Streak'},
      {done:(user.streak||0)>=7,icon:'🏅',name:'7-Day Streak'},
      {done:(user.workoutsDone||0)>=1,icon:'💪',name:'First Workout'},
      {done:(user.workoutsDone||0)>=10,icon:'🏆',name:'10 Workouts'},
      {done:!!(user.bmi),icon:'📊',name:'Tracked BMI'},
    ];
    ach.innerHTML='';
    list.forEach(a=>{
      const div=document.createElement('div');
      div.style.textAlign='center';
      div.innerHTML=`<div style="width:46px;height:46px;border-radius:50%;background:${a.done?'var(--red4)':'var(--bg4)'};border:2px solid ${a.done?'var(--red)':'var(--border2)'};display:flex;align-items:center;justify-content:center;font-size:19px;opacity:${a.done?1:0.3}">${a.icon}</div><div style="font-size:10px;color:var(--txt3);margin-top:4px">${a.name}</div>`;
      ach.appendChild(div);
    });
  }
}