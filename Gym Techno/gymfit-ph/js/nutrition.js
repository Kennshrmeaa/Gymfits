/* ============================================================
   GymFit — Nutrition System
   Food database (100+ staple and workout foods), food picker with
   quantity controls & category filters, meal logging,
   macro tracking, calorie progress bar, warning system
============================================================ */

// ===== NUTRITION =====
function food(cat,name,kcal,p,c,f,tags=''){
  return {cat,name,kcal,p,c,f,tags:String(tags||'').toLowerCase()};
}

const FOODS_RAW=[
  food('🍚 Staple Carbs','Steamed Rice (1 cup)',200,4,44,0,'kanin rice carb'),
  food('🍚 Staple Carbs','Brown Rice (1 cup)',216,5,45,2,'kanin whole grain'),
  food('🍚 Staple Carbs','Red Rice (1 cup)',215,5,45,2,'kanin whole grain'),
  food('🍚 Staple Carbs','Sinangag (Fried Rice)',280,5,48,7,'garlic rice'),
  food('🍚 Staple Carbs','Garlic Rice (1 cup)',250,4,43,6,'sinangag'),
  food('🍚 Staple Carbs','Lugaw / Arroz Caldo (1 bowl)',150,5,30,1,'porridge arroz caldo'),
  food('🍚 Staple Carbs','Pandesal (1 piece)',90,3,17,1,'bread bun'),
  food('🍚 Staple Carbs','Whole Wheat Bread (2 slices)',140,6,24,2,'toast bread'),
  food('🍚 Staple Carbs','Kamote (Sweet Potato, 100g)',86,2,20,0,'sweet potato'),
  food('🍚 Staple Carbs','Saba Banana (1 piece)',120,1,31,0,'banana plantain'),
  food('🍚 Staple Carbs','Champorado (1 cup)',260,6,50,5,'chocolate rice porridge'),
  food('🍚 Staple Carbs','Nilagang Mais (1 cob)',130,4,28,1,'corn'),
  food('🍚 Staple Carbs','Pancit Bihon (1 cup)',210,6,34,5,'noodles vermicelli'),
  food('🍚 Staple Carbs','Rice Noodles (1 cup cooked)',190,3,42,1,'noodles'),
  food('🍚 Staple Carbs','Gabi / Taro (100g)',142,1,34,0,'taro carb'),

  food('🍗 Proteins','Grilled Chicken Breast (150g)',165,31,0,3,'lean chicken'),
  food('🍗 Proteins','Chicken Inasal, Skinless (150g)',220,31,2,8,'grilled chicken'),
  food('🍗 Proteins','Chicken Thigh, Skinless (150g)',225,28,0,11,'chicken'),
  food('🍗 Proteins','Pork Adobo, Lean Cut (100g)',230,18,3,16,'adobo pork'),
  food('🍗 Proteins','Chicken Adobo, Lean Cut (150g)',240,30,4,9,'adobo chicken'),
  food('🍗 Proteins','Beef Tapa (100g)',210,22,5,11,'beef tapa'),
  food('🍗 Proteins','Lean Ground Beef (100g)',176,23,0,9,'beef giniling'),
  food('🍗 Proteins','Grilled Salmon (150g)',280,30,0,17,'fish omega3'),
  food('🍗 Proteins','Tuna Steak (150g)',210,32,0,8,'fish tuna'),
  food('🍗 Proteins','Fried Tilapia (150g)',190,29,0,8,'fish tilapia'),
  food('🍗 Proteins','Bangus Daing (150g)',220,28,0,12,'milkfish'),
  food('🍗 Proteins','Grilled Shrimp (150g)',160,31,1,3,'hipon shrimp'),
  food('🍗 Proteins','Squid Adobo (150g)',180,27,4,6,'pusit squid'),
  food('🍗 Proteins','Scrambled Eggs (3 eggs)',210,18,2,14,'eggs'),
  food('🍗 Proteins','Egg Whites (5 pieces)',85,18,1,0,'egg whites'),
  food('🍗 Proteins','Boiled Egg (1 piece)',70,6,1,5,'egg'),
  food('🍗 Proteins','Tinola Chicken (1 serving)',180,22,6,7,'tinola chicken soup'),
  food('🍗 Proteins','Sinigang na Isda (1 serving)',160,20,10,4,'fish soup'),
  food('🍗 Proteins','Sardinas sa Tomato (1 can)',190,22,1,11,'sardines'),
  food('🍗 Proteins','Tuna in Water (1 can)',120,26,0,1,'canned tuna'),
  food('🍗 Proteins','Grilled Pork Chop (150g)',280,28,0,18,'pork'),
  food('🍗 Proteins','Beef Bulalo (1 serving)',310,30,4,19,'beef soup'),
  food('🍗 Proteins','Tinapa (Smoked Fish, 80g)',140,20,0,7,'smoked fish'),
  food('🍗 Proteins','Tokwa (Tofu, 100g)',76,8,2,4,'tofu bean curd'),
  food('🍗 Proteins','Tofu Sisig, Light (1 serving)',210,16,8,11,'tokwa sisig'),

  food('🥦 Vegetables','Pinakbet (1 cup)',120,4,14,5,'vegetable stew'),
  food('🥦 Vegetables','Ampalaya Guisado (1 cup)',60,3,8,2,'bitter melon'),
  food('🥦 Vegetables','Kangkong Guisado (1 cup)',55,3,7,2,'water spinach'),
  food('🥦 Vegetables','Mongo / Munggo Soup (1 cup)',212,14,38,1,'mung bean mongo'),
  food('🥦 Vegetables','Chicharo (Snow Peas, 1 cup)',67,5,12,0,'peas'),
  food('🥦 Vegetables','Sayote (Chayote, 1 cup)',38,1,8,0,'chayote'),
  food('🥦 Vegetables','Broccoli (1 cup)',55,4,11,1,'broccoli'),
  food('🥦 Vegetables','Talong Ensalada (1 cup)',40,2,8,0,'eggplant'),
  food('🥦 Vegetables','Mixed Salad (1 bowl)',40,2,7,1,'lettuce greens'),
  food('🥦 Vegetables','Laing (1 cup)',280,5,14,23,'taro leaves coconut'),
  food('🥦 Vegetables','Ginisang Repolyo (1 cup)',50,2,9,1,'cabbage'),
  food('🥦 Vegetables','Pechay (1 cup cooked)',20,2,4,0,'bok choy'),
  food('🥦 Vegetables','Okra (1 cup)',35,2,7,0,'okra'),
  food('🥦 Vegetables','Sitaw (1 cup)',44,2,10,0,'string beans'),
  food('🥦 Vegetables','Kalabasa (1 cup)',49,2,12,0,'squash pumpkin'),
  food('🥦 Vegetables','Cauliflower (1 cup)',29,2,5,0,'cauliflower'),

  food('🍌 Fruits','Banana (1 piece)',90,1,23,0,'banana'),
  food('🍌 Fruits','Saba Banana (1 piece)',120,1,31,0,'banana plantain'),
  food('🍌 Fruits','Mango (1 medium)',100,1,25,0,'mango'),
  food('🍌 Fruits','Apple (1 medium)',80,0,21,0,'apple'),
  food('🍌 Fruits','Papaya (1 cup diced)',55,1,14,0,'papaya'),
  food('🍌 Fruits','Watermelon (1 cup)',46,1,11,0,'melon'),
  food('🍌 Fruits','Dalandan / Orange (1 piece)',65,1,16,0,'orange citrus'),
  food('🍌 Fruits','Jackfruit / Langka (1 cup)',155,3,40,0,'jackfruit'),
  food('🍌 Fruits','Pineapple (1 cup)',82,1,22,0,'pineapple'),
  food('🍌 Fruits','Grapes (1 cup)',104,1,27,0,'grapes'),
  food('🍌 Fruits','Avocado (1/2 medium)',120,2,6,11,'avocado'),
  food('🍌 Fruits','Guava (1 cup)',112,4,24,1,'bayabas'),
  food('🍌 Fruits','Melon / Cantaloupe (1 cup)',54,1,13,0,'melon cantaloupe'),
  food('🍌 Fruits','Dragon Fruit (1 cup)',102,2,22,0,'pitaya'),
  food('🍌 Fruits','Pomelo (1 cup)',72,1,18,0,'suha'),

  food('🥛 Drinks & Dairy','Whole Milk (1 glass, 240ml)',150,8,12,8,'milk'),
  food('🥛 Drinks & Dairy','Low-Fat Milk (1 glass, 240ml)',110,8,13,2,'milk'),
  food('🥛 Drinks & Dairy','Chocolate Milk (1 glass)',190,8,30,5,'milk recovery'),
  food('🥛 Drinks & Dairy','Whey Protein Shake (1 scoop)',130,25,5,2,'protein shake'),
  food('🥛 Drinks & Dairy','Whey Isolate Shake (1 scoop)',115,26,2,1,'protein isolate'),
  food('🥛 Drinks & Dairy','Peanut Butter (1 tbsp)',95,4,3,8,'spread nuts'),
  food('🥛 Drinks & Dairy','Greek Yogurt (1 cup)',130,17,9,4,'yogurt'),
  food('🥛 Drinks & Dairy','Plain Yogurt (1 cup)',150,9,17,4,'yogurt'),
  food('🥛 Drinks & Dairy','Cottage Cheese (1/2 cup)',90,13,4,2,'cheese protein'),
  food('🥛 Drinks & Dairy','Soy Milk, Unsweetened (1 glass)',80,7,4,4,'soy milk'),
  food('🥛 Drinks & Dairy','Milo (1 glass)',140,3,26,3,'chocolate drink'),
  food('🥛 Drinks & Dairy','Coconut Water (1 glass)',46,2,9,0,'buko water'),
  food('🥛 Drinks & Dairy','Taho (1 cup)',120,7,20,1,'soy taho'),
  food('🥛 Drinks & Dairy','Black Coffee (1 cup)',5,0,0,0,'coffee pre workout'),
  food('🥛 Drinks & Dairy','Electrolyte Drink (500ml)',90,0,22,0,'sports drink hydration'),

  food('🍿 Snacks','Oatmeal (80g dry)',300,10,54,6,'oats'),
  food('🍿 Snacks','Skyflakes Crackers (1 pack)',120,2,18,5,'crackers'),
  food('🍿 Snacks','Boiled Peanuts (1 cup)',285,12,18,18,'peanuts'),
  food('🍿 Snacks','Banana Chips (1 cup)',374,1,42,24,'banana chips'),
  food('🍿 Snacks','Chicharon (30g)',150,9,0,13,'pork rinds'),
  food('🍿 Snacks','Polvoron (1 piece)',110,2,16,4,'polvoron'),
  food('🍿 Snacks','Ensaymada (1 piece)',280,5,38,12,'bread pastry'),
  food('🍿 Snacks','Bread Roll w/ Peanut Butter',220,7,30,9,'bread peanut butter'),
  food('🍿 Snacks','Rice Cakes (2 pieces)',70,1,14,0,'rice cakes'),
  food('🍿 Snacks','Trail Mix (40g)',190,5,15,12,'nuts raisins'),
  food('🍿 Snacks','Protein Bar (1 piece)',210,20,22,7,'bar snack'),
  food('🍿 Snacks','Granola (1/2 cup)',220,5,32,8,'granola'),
  food('🍿 Snacks','Hard-Boiled Eggs (2 pieces)',140,12,2,10,'eggs snack'),
  food('🍿 Snacks','Tuna Sandwich (1 piece)',240,19,24,7,'sandwich tuna'),
  food('🍿 Snacks','Kutsinta (2 pieces)',140,2,33,0,'rice cake snack'),

  food('🏋️ Workout Fuel','Pre-Workout Banana + Black Coffee',95,1,23,0,'pre workout'),
  food('🏋️ Workout Fuel','Peanut Butter Banana Toast',245,8,31,10,'pre workout toast'),
  food('🏋️ Workout Fuel','Oats + Whey + Banana Bowl',410,31,58,6,'post workout oats'),
  food('🏋️ Workout Fuel','Chicken Breast + Rice Meal Prep',430,37,45,7,'meal prep'),
  food('🏋️ Workout Fuel','Chicken Adobo + Rice + Veg',500,33,48,14,'meal prep post workout'),
  food('🏋️ Workout Fuel','Tuna Sandwich on Wheat',290,27,28,7,'post workout sandwich'),
  food('🏋️ Workout Fuel','Greek Yogurt + Honey + Fruit',220,18,31,2,'snack post workout'),
  food('🏋️ Workout Fuel','Whey + Banana Post-Workout Shake',220,26,28,2,'recovery shake'),
  food('🏋️ Workout Fuel','Egg Whites + Rice Bowl',290,23,43,2,'recovery bowl'),
  food('🏋️ Workout Fuel','Salmon + Rice + Vegetables',520,34,43,21,'omega3 meal'),
  food('🏋️ Workout Fuel','Tofu Rice Bowl',360,18,45,11,'vegetarian workout meal'),
  food('🏋️ Workout Fuel','Beef Tapa + Garlic Rice + Egg',560,31,49,24,'silog recovery meal'),
  food('🏋️ Workout Fuel','Overnight Oats with Chia',320,12,46,9,'breakfast prep'),
  food('🏋️ Workout Fuel','Chocolate Milk Recovery Drink',190,8,30,5,'post workout recovery'),
  food('🏋️ Workout Fuel','Fruit Smoothie with Protein',260,25,30,3,'smoothie post workout')
];
const FOODS=FOODS_RAW.map((f,i)=>({...f,idx:i}));
let foodMeal='breakfast';
let activeFoodCat='all';

function openFoodPicker(meal){
  foodMeal=meal;
  const labels={breakfast:'Breakfast 🌅',lunch:'Lunch ☀️',dinner:'Dinner 🌙',snacks:'Snacks 🍌'};
  document.getElementById('food-modal-sub').textContent='Adding to '+labels[meal];
  document.getElementById('food-search').value='';
  activeFoodCat='all';
  // reset cat tabs
  document.querySelectorAll('#food-cat-tabs .pill').forEach(p=>p.classList.remove('on'));
  const firstTab=document.querySelector('#food-cat-tabs .pill');
  if(firstTab)firstTab.classList.add('on');
  renderFoodList(FOODS);
  openModal('food-modal');
  // scroll list to top
  const fl=document.getElementById('food-list');if(fl)fl.scrollTop=0;
}

function filterByCat(cat,btn){
  activeFoodCat=cat;
  document.querySelectorAll('#food-cat-tabs .pill').forEach(p=>p.classList.remove('on'));
  btn.classList.add('on');
  const q=document.getElementById('food-search').value||'';
  applyFoodFilter(q);
}

function filterFoods(q){
  applyFoodFilter(q);
}

function applyFoodFilter(q){
  let filtered=FOODS;
  if(activeFoodCat!=='all')filtered=filtered.filter(f=>f.cat===activeFoodCat);
  if(q){
    const query=q.toLowerCase();
    filtered=filtered.filter(f=>(`${f.name} ${f.cat} ${f.tags||''}`).toLowerCase().includes(query));
  }
  renderFoodList(filtered);
}

function renderFoodList(foods){
  const container=document.getElementById('food-list');
  if(!container)return;
  container.innerHTML='';
  if(foods.length===0){
    const empty=document.createElement('div');
    empty.style.cssText='padding:20px;text-align:center;font-size:13px;color:var(--txt4)';
    empty.textContent='No foods found. Try a different search.';
    container.appendChild(empty);
    return;
  }
  let lastCat='';
  foods.forEach(f=>{
    if(f.cat!==lastCat){
      lastCat=f.cat;
      const h=document.createElement('div');
      h.className='food-cat-header';
      h.style.cssText='position:sticky;top:0;z-index:2';
      h.textContent=f.cat;
      container.appendChild(h);
    }
    const row=document.createElement('div');
    row.className='food-item';
    row.style.cssText='display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--border2)';
    // quantity controls + add button
    row.innerHTML=`
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</div>
        <div style="font-size:11px;color:var(--txt3)" id="fd-info-${f.idx}">${f.kcal} kcal · P:${f.p}g · C:${f.c}g · F:${f.f}g <span style="color:var(--txt4)">per serving</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
        <button onclick="adjQty('${f.idx}',-1)" style="width:26px;height:26px;background:var(--bg4);border:1px solid var(--border2);border-radius:7px;color:#fff;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1">−</button>
        <span id="qty-${f.idx}" style="font-size:14px;font-weight:700;color:#fff;min-width:20px;text-align:center">1</span>
        <button onclick="adjQty('${f.idx}',1)" style="width:26px;height:26px;background:var(--bg4);border:1px solid var(--border2);border-radius:7px;color:#fff;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1">+</button>
        <button class="btn btn-red btn-sm" style="font-size:11px;padding:5px 11px;flex-shrink:0" onclick="addFood(${f.idx})">ADD</button>
      </div>`;
    container.appendChild(row);
  });
}

// Quantity state per food item
const foodQty={};
function adjQty(idx,delta){
  if(!foodQty[idx])foodQty[idx]=1;
  foodQty[idx]=Math.max(1,Math.min(20,foodQty[idx]+delta));
  const el=document.getElementById('qty-'+idx);
  if(el)el.textContent=foodQty[idx];
  // update info label with scaled macros
  const f=FOODS[parseInt(idx)];
  const q=foodQty[idx];
  const infoEl=document.getElementById('fd-info-'+idx);
  if(infoEl&&f){
    infoEl.innerHTML=`${Math.round(f.kcal*q)} kcal · P:${Math.round(f.p*q)}g · C:${Math.round(f.c*q)}g · F:${Math.round(f.f*q)}g <span style="color:var(--txt4)">× ${q} serving${q>1?'s':''}</span>`;
  }
}

function addFood(idx){
  const user=me();if(!user)return;
  const f=FOODS[parseInt(idx)];
  if(!f)return;
  const q=foodQty[idx]||1;
  const today=dateStr();
  if(!user.nutritionLog)user.nutritionLog={};
  if(!user.nutritionLog[today])user.nutritionLog[today]={breakfast:[],lunch:[],dinner:[],snacks:[]};
  const entry={
    name:f.name+(q>1?' × '+q:''),
    kcal:Math.round(f.kcal*q),
    p:Math.round(f.p*q),
    c:Math.round(f.c*q),
    f:Math.round(f.f*q),
    qty:q
  };
  user.nutritionLog[today][foodMeal].push(entry);
  S.users[user.email]=user;save();
  renderNutrition(user);
  // reset qty for this food
  foodQty[idx]=1;
  const qel=document.getElementById('qty-'+idx);if(qel)qel.textContent='1';
  const infoEl=document.getElementById('fd-info-'+idx);if(infoEl&&f)infoEl.innerHTML=`${f.kcal} kcal · P:${f.p}g · C:${f.c}g · F:${f.f}g <span style="color:var(--txt4)">per serving</span>`;
  toast('Added '+entry.name+' ✓','ok');
}

function renderNutrition(user){
  const today=dateStr();
  const log=(user.nutritionLog&&user.nutritionLog[today])||{breakfast:[],lunch:[],dinner:[],snacks:[]};
  const meals=['breakfast','lunch','dinner','snacks'];
  const mealLabels={breakfast:'No food logged. Tap + ADD FOOD.',lunch:'No food logged. Tap + ADD FOOD.',dinner:'No food logged. Tap + ADD FOOD.',snacks:'No snacks logged. Tap + ADD FOOD.'};
  let totKcal=0,totP=0,totC=0,totF=0;

  meals.forEach(m=>{
    const el=document.getElementById('log-'+m);if(!el)return;
    el.innerHTML='';
    (log[m]||[]).forEach((food,i)=>{
      totKcal+=food.kcal;totP+=food.p;totC+=food.c;totF+=food.f;
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05)';
      row.innerHTML=`
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${food.name}</div>
          <div style="font-size:11px;color:var(--txt3)">${food.kcal} kcal · P:${food.p}g · C:${food.c}g · F:${food.f}g</div>
        </div>
        <button onclick="removeFood('${m}',${i})" style="background:none;border:none;color:var(--txt4);cursor:pointer;font-size:18px;padding:2px 6px;flex-shrink:0;transition:color 0.15s" onmouseenter="this.style.color='var(--red3)'" onmouseleave="this.style.color='var(--txt4)'">✕</button>`;
      el.appendChild(row);
    });
    if((log[m]||[]).length===0){
      const empty=document.createElement('div');
      empty.style.cssText='padding:10px 14px;font-size:12px;color:var(--txt4);font-style:italic';
      empty.textContent=mealLabels[m];
      el.appendChild(empty);
    }
  });

  // Targets
  const tKcal=user.targetKcal||1950;
  const tP=user.targetProt||150;
  const tC=user.targetCarb||220;
  const tF=user.targetFat||55;

  // Macros display
  document.getElementById('nt-prot').textContent=totP+'g';
  document.getElementById('nt-carb').textContent=totC+'g';
  document.getElementById('nt-fat').textContent=totF+'g';
  document.getElementById('nt-prot-goal').textContent='/ '+tP+'g';
  document.getElementById('nt-carb-goal').textContent='/ '+tC+'g';
  document.getElementById('nt-fat-goal').textContent='/ '+tF+'g';

  // Remaining / over
  const rem=tKcal-totKcal;
  const remEl=document.getElementById('nt-remain');
  const remLbl=document.getElementById('nt-remain-lbl');
  if(rem<0){
    remEl.textContent='+'+Math.abs(rem);
    remEl.style.color='#EAB308';
    if(remLbl)remLbl.textContent='Over Goal';
  } else {
    remEl.textContent=rem;
    remEl.style.color='var(--green)';
    if(remLbl)remLbl.textContent='Remaining';
  }

  // Macro progress bars (cap at 100% visually, color changes when over)
  const protPct=Math.round(totP/tP*100);
  const carbPct=Math.round(totC/tC*100);
  const fatPct=Math.round(totF/tF*100);
  document.getElementById('nt-prot-bar').style.width=Math.min(100,protPct)+'%';
  document.getElementById('nt-prot-bar').style.background=protPct>100?'#EAB308':'var(--red)';
  document.getElementById('nt-carb-bar').style.width=Math.min(100,carbPct)+'%';
  document.getElementById('nt-carb-bar').style.background=carbPct>100?'#EAB308':'#FF9B57';
  document.getElementById('nt-fat-bar').style.width=Math.min(100,fatPct)+'%';
  document.getElementById('nt-fat-bar').style.background=fatPct>100?'#EAB308':'#FFCF57';

  // Calorie bar
  const kcalPct=Math.round(totKcal/tKcal*100);
  const kcalBar=document.getElementById('nt-kcal-bar');
  if(kcalBar){
    kcalBar.style.width=Math.min(110,kcalPct)+'%';
    if(kcalPct>100)kcalBar.style.background='#EAB308';
    else if(kcalPct>85)kcalBar.style.background='#f97316';
    else kcalBar.style.background='var(--red)';
  }
  const pctEl=document.getElementById('nt-kcal-pct');if(pctEl)pctEl.textContent=kcalPct+'%';
  const eatenEl=document.getElementById('nt-kcal-eaten');if(eatenEl)eatenEl.textContent=totKcal.toLocaleString()+' kcal eaten';
  const targetEl=document.getElementById('nt-kcal-target');if(targetEl)targetEl.textContent='Goal: '+tKcal.toLocaleString()+' kcal';
  document.getElementById('nutr-kcal-badge').textContent=totKcal.toLocaleString()+' / '+tKcal.toLocaleString()+' kcal';
  document.getElementById('nutr-date').textContent='Today — '+new Date().toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});

  // ===== WARNING LOGIC =====
  const warnings=[];
  if(totKcal>tKcal)warnings.push('🔥 Calories: You\'ve eaten '+(totKcal-tKcal)+' kcal over your '+tKcal+' kcal goal.');
  if(totP>tP*1.3)warnings.push('🥩 Protein: '+totP+'g eaten vs '+tP+'g goal — that\'s '+(totP-tP)+'g over. Excess protein gets stored as fat.');
  if(totC>tC*1.2)warnings.push('🍚 Carbs: '+totC+'g eaten vs '+tC+'g goal — consider reducing rice or starchy foods.');
  if(totF>tF*1.3)warnings.push('🧈 Fat: '+totF+'g eaten vs '+tF+'g goal — watch out for fried and oily foods.');
  const warnBanner=document.getElementById('nutr-warning');
  const warnMsg=document.getElementById('nutr-warning-msg');
  if(warnings.length>0&&warnBanner){
    warnBanner.style.display='flex';
    if(warnMsg)warnMsg.innerHTML=warnings.map(w=>'<div style="margin-bottom:4px">'+w+'</div>').join('');
  } else if(warnBanner){
    warnBanner.style.display='none';
  }
}

function removeFood(meal,idx){
  const user=me();if(!user)return;
  const today=dateStr();
  if(user.nutritionLog&&user.nutritionLog[today]&&user.nutritionLog[today][meal]){
    const removed=user.nutritionLog[today][meal][idx];
    user.nutritionLog[today][meal].splice(idx,1);
    S.users[user.email]=user;save();
    renderNutrition(user);
    if(removed)toast('Removed '+removed.name,'info');
  }
}


// ===== SUPPLEMENTS =====
const SUPP_DATA={
  lose:[
    {e:'⚡',name:'Creatine Monohydrate',dose:'5g daily',timing:'Any time',why:'Preserves muscle during calorie deficit. Improves workout intensity even when cutting.',tier:'ESSENTIAL'},
    {e:'🥛',name:'Whey Protein',dose:'25–30g per serving',timing:'Post-workout',why:'Helps hit daily protein targets. Keeps you full and prevents muscle loss during weight loss.',tier:'ESSENTIAL'},
    {e:'☀️',name:'Vitamin D3',dose:'2000–4000 IU daily',timing:'With a meal',why:'Boosts energy, immunity, and testosterone — critical for maintaining workouts during a cut.',tier:'RECOMMENDED'},
    {e:'🍵',name:'Green Tea Extract / Caffeine',dose:'200mg caffeine',timing:'Pre-workout',why:'Increases fat oxidation and workout intensity. Use caffeine wisely — cycle off on weekends.',tier:'OPTIONAL'},
  ],
  muscle:[
    {e:'⚡',name:'Creatine Monohydrate',dose:'5g daily',timing:'Post-workout',why:'The most studied muscle-building supplement. Increases strength, muscle volume, and recovery significantly.',tier:'ESSENTIAL'},
    {e:'🥛',name:'Whey Protein',dose:'25–30g per serving',timing:'Post-workout',why:'Rapidly digested protein to kickstart muscle protein synthesis after training.',tier:'ESSENTIAL'},
    {e:'☀️',name:'Vitamin D3 + Zinc',dose:'2000–4000 IU + 15mg',timing:'Morning',why:'Optimizes testosterone levels which directly impacts muscle growth and recovery speed.',tier:'RECOMMENDED'},
    {e:'💊',name:'Omega-3 Fish Oil',dose:'2–3g EPA/DHA daily',timing:'With meals',why:'Reduces exercise-induced inflammation and improves joint health for heavy lifters.',tier:'RECOMMENDED'},
    {e:'🔴',name:'Pre-Workout (with Beta-Alanine)',dose:'1 scoop',timing:'30 min pre-workout',why:'Increases training volume and intensity. Beta-alanine helps buffer lactic acid for more reps.',tier:'OPTIONAL'},
  ],
  fit:[
    {e:'⚡',name:'Creatine Monohydrate',dose:'5g daily',timing:'Any time',why:'Improves performance in any type of training — cardio and weights. Safe and proven.',tier:'ESSENTIAL'},
    {e:'🥛',name:'Whey Protein',dose:'25g per serving',timing:'Post-workout',why:'Convenient way to hit daily protein. Supports toning and lean muscle maintenance.',tier:'RECOMMENDED'},
    {e:'☀️',name:'Vitamin D3',dose:'2000 IU daily',timing:'Morning',why:'Improves energy levels, mood, and overall physical performance throughout the day.',tier:'RECOMMENDED'},
    {e:'💊',name:'Magnesium',dose:'300–400mg daily',timing:'Evening',why:'Improves sleep quality and muscle recovery. Many active people are deficient.',tier:'OPTIONAL'},
  ],
  maintain:[
    {e:'☀️',name:'Vitamin D3',dose:'2000–4000 IU daily',timing:'Morning',why:'Essential for long-term health — bones, immunity, mood, and hormone balance.',tier:'RECOMMENDED'},
    {e:'💊',name:'Omega-3 Fish Oil',dose:'2g EPA/DHA daily',timing:'With meals',why:'Heart health, joint health, and inflammation reduction for long-term wellness.',tier:'RECOMMENDED'},
    {e:'⚡',name:'Creatine Monohydrate',dose:'3–5g daily',timing:'Any time',why:'Maintains strength and muscle mass as you age. Safe for long-term daily use.',tier:'OPTIONAL'},
    {e:'🧴',name:'Multivitamin',dose:'1 tablet daily',timing:'With breakfast',why:'Covers any nutritional gaps in your diet. Ensure at least B12, Zinc, Magnesium are included.',tier:'OPTIONAL'},
  ]
};
function buildSupplements(user){
  const goal=user.goal||'lose';
  const supps=SUPP_DATA[goal]||SUPP_DATA.lose;
  const container=document.getElementById('supp-content');
  if(!container)return;
  container.innerHTML='';
  supps.forEach(s=>{
    const cls=s.tier==='ESSENTIAL'?'badge-red':s.tier==='RECOMMENDED'?'badge-yellow':'badge-dark';
    const div=document.createElement('div');
    div.className='card card-hover';
    div.innerHTML=`<div style="font-size:34px;margin-bottom:9px">${s.e}</div><div class="display" style="font-size:17px;margin-bottom:4px;color:#fff">${s.name}</div><div class="badge ${cls} mb8">${s.tier}</div><div style="font-size:12px;color:var(--txt3);margin-bottom:7px">📅 ${s.dose} · ⏰ ${s.timing}</div><p style="font-size:13px;color:var(--txt2);line-height:1.6">${s.why}</p>`;
    container.appendChild(div);
  });
}
