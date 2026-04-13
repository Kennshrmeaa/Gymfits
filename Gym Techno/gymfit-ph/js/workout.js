/* ============================================================
   GymFit PH — Workout System
   3-level programs (Beginner/Intermediate/Advanced),
   weight recommendation engine, BMI-based advice,
   exercise logging, rest timer, completion tracking
============================================================ */

// ===== WORKOUT PANEL =====

// ===== WEIGHT RECOMMENDATION ENGINE =====
// Returns recommended weight (kg) for an exercise based on user's bodyweight, BMI, and experience
function getRecommendedWeight(exercise, userWeight, bmi, experience) {
  if(!userWeight) return null;
  const w = userWeight;
  const exp = experience || 'beginner';

  // Multipliers per experience level
  const mult = { beginner: 1, intermediate: 1.35, advanced: 1.7 };
  const m = mult[exp] || 1;

  // BMI adjustment: overweight/obese users start lighter on lower-body
  const bmiAdj = bmi && bmi >= 30 ? 0.85 : bmi && bmi >= 25 ? 0.92 : 1;

  // Exercise-specific base ratios (% of bodyweight for beginners)
  const ratios = {
    'Bench Press':         { ratio: 0.50, unit: 'kg', round: 2.5 },
    'Incline DB Press':    { ratio: 0.20, unit: 'kg/hand', round: 2 },
    'Overhead Press':      { ratio: 0.30, unit: 'kg', round: 2.5 },
    'Arnold Press':        { ratio: 0.15, unit: 'kg/hand', round: 2 },
    'Chest Dips':          { ratio: 0,    unit: 'bodyweight', round: 0 },
    'Cable Fly':           { ratio: 0.12, unit: 'kg/hand', round: 2 },
    'Deadlift':            { ratio: 0.70, unit: 'kg', round: 2.5, bmiOvr: 0.80 },
    'Barbell Row':         { ratio: 0.45, unit: 'kg', round: 2.5 },
    'Pull-Ups / Lat Pulldown': { ratio: 0.55, unit: 'kg', round: 2.5 },
    'Lat Pulldown':        { ratio: 0.55, unit: 'kg', round: 2.5 },
    'Face Pulls':          { ratio: 0.18, unit: 'kg', round: 2 },
    'Dumbbell Curl':       { ratio: 0.13, unit: 'kg/hand', round: 2 },
    'Hammer Curl':         { ratio: 0.13, unit: 'kg/hand', round: 2 },
    'Cable Row':           { ratio: 0.45, unit: 'kg', round: 2.5 },
    'Barbell Squat':       { ratio: 0.65, unit: 'kg', round: 2.5, bmiOvr: 0.75 },
    'Romanian Deadlift':   { ratio: 0.55, unit: 'kg', round: 2.5 },
    'Leg Press':           { ratio: 1.10, unit: 'kg', round: 5 },
    'Walking Lunges':      { ratio: 0.18, unit: 'kg/hand', round: 2 },
    'Goblet Squat':        { ratio: 0.25, unit: 'kg', round: 2.5 },
    'Hip Thrust':          { ratio: 0.80, unit: 'kg', round: 5 },
    'Calf Raises':         { ratio: 0.80, unit: 'kg', round: 5 },
    'Tricep Pushdown':     { ratio: 0.18, unit: 'kg', round: 2 },
    'Skull Crushers':      { ratio: 0.20, unit: 'kg', round: 2.5 },
    'Close-Grip Bench':    { ratio: 0.40, unit: 'kg', round: 2.5 },
    'Lateral Raises':      { ratio: 0.06, unit: 'kg/hand', round: 1 },
    'Front Raises':        { ratio: 0.06, unit: 'kg/hand', round: 1 },
    'Plank':               { ratio: 0,    unit: 'bodyweight', round: 0 },
    'Cable Crunches':      { ratio: 0.20, unit: 'kg', round: 2 },
    'Hanging Leg Raises':  { ratio: 0,    unit: 'bodyweight', round: 0 },
    'Russian Twist':       { ratio: 0.08, unit: 'kg', round: 2 },
  };

  const data = ratios[exercise];
  if(!data || data.ratio === 0) return null; // bodyweight exercise
  if(data.unit === 'bodyweight') return null;

  const bmiFactored = (data.bmiOvr && bmi >= 30) ? data.bmiOvr : bmiAdj;
  let kg = w * data.ratio * m * bmiFactored;
  // Round to nearest step
  kg = Math.max(data.round, Math.round(kg / data.round) * data.round);

  return { kg, unit: data.unit };
}


// ===== WORKOUT PROGRAMS (Beginner / Intermediate / Advanced) =====
const WORKOUT_PROGRAMS = {
  beginner: {
    label: 'Beginner',
    description: '3 days/week · Focus on form, basic movements, full body strength',
    color: '#4ade80',
    days: {
      upper: {
        title:'UPPER BODY A', meta:'Chest · Shoulders · Triceps · ~40 min', time:'40 min', label:'Day 1',
        exercises:[
          {name:'Bench Press',         sets:3, reps:10, rest:90,  tip:'Keep feet flat, back slightly arched, bar to lower chest'},
          {name:'Overhead Press',      sets:3, reps:10, rest:90,  tip:'Stand tall, core tight, push bar straight overhead'},
          {name:'Incline DB Press',    sets:3, reps:12, rest:75,  tip:'30–45° incline, lower dumbbells to chest level slowly'},
          {name:'Tricep Pushdown',     sets:3, reps:15, rest:60,  tip:'Keep elbows pinned to sides, full extension at bottom'},
          {name:'Lateral Raises',      sets:3, reps:15, rest:45,  tip:'Slight bend in elbow, raise to shoulder height only'},
        ]
      },
      back: {
        title:'BACK & BICEPS', meta:'Back · Biceps · Core · ~45 min', time:'45 min', label:'Day 2',
        exercises:[
          {name:'Deadlift',                    sets:3, reps:8,  rest:120, tip:'Hinge at hips, bar stays close to shins, back flat'},
          {name:'Pull-Ups / Lat Pulldown',     sets:3, reps:8,  rest:90,  tip:'Full range — dead hang to chin over bar'},
          {name:'Barbell Row',                 sets:3, reps:10, rest:90,  tip:'Lean forward 45°, pull bar to lower chest'},
          {name:'Dumbbell Curl',               sets:3, reps:12, rest:60,  tip:'Keep elbows fixed, squeeze bicep at top'},
          {name:'Face Pulls',                  sets:3, reps:15, rest:45,  tip:'Pull to face level, elbows at shoulder height'},
        ]
      },
      legs: {
        title:'LEGS & GLUTES', meta:'Quads · Hamstrings · Glutes · ~50 min', time:'50 min', label:'Day 3', prem:true,
        exercises:[
          {name:'Barbell Squat',       sets:3, reps:10, rest:120, tip:'Feet shoulder-width, knees track toes, depth to parallel'},
          {name:'Romanian Deadlift',   sets:3, reps:10, rest:90,  tip:'Hinge at hips, soft knee, feel hamstring stretch'},
          {name:'Leg Press',           sets:3, reps:12, rest:90,  tip:'Feet shoulder-width, don\'t lock knees at top'},
          {name:'Walking Lunges',      sets:3, reps:20, rest:60,  tip:'Long stride, back knee nearly touches floor'},
          {name:'Calf Raises',         sets:4, reps:20, rest:45,  tip:'Full stretch at bottom, pause and squeeze at top'},
        ]
      },
      shoulders: {
        title:'SHOULDERS & CORE', meta:'Delts · Traps · Core · ~35 min', time:'35 min', label:'Day 4', prem:true,
        exercises:[
          {name:'Overhead Press',      sets:3, reps:10, rest:90,  tip:'Brace core, avoid arching lower back'},
          {name:'Arnold Press',        sets:3, reps:12, rest:75,  tip:'Rotate palms as you press — great for all 3 delt heads'},
          {name:'Lateral Raises',      sets:3, reps:15, rest:45,  tip:'Control the descent — 3 seconds down'},
          {name:'Plank',               sets:3, reps:'30s', rest:45, tip:'Straight line from head to heels, squeeze glutes'},
          {name:'Cable Crunches',      sets:3, reps:15, rest:45,  tip:'Contract abs, not just bending at hips'},
        ]
      }
    }
  },

  intermediate: {
    label: 'Intermediate',
    description: '4 days/week · Higher volume, progressive overload, compound focus',
    color: '#f97316',
    days: {
      upper: {
        title:'PUSH (Chest/Shoulders)', meta:'Chest · Front/Side Delts · Triceps · ~50 min', time:'50 min', label:'Day 1',
        exercises:[
          {name:'Bench Press',         sets:4, reps:8,  rest:90,  tip:'Add 2.5kg when you hit all reps with good form'},
          {name:'Incline DB Press',    sets:3, reps:10, rest:75,  tip:'Go heavier than beginner — controlled 3-second descent'},
          {name:'Cable Fly',           sets:3, reps:12, rest:60,  tip:'Full stretch, squeeze chest hard at peak contraction'},
          {name:'Overhead Press',      sets:4, reps:8,  rest:90,  tip:'Bar path: straight up past forehead, elbows slightly forward'},
          {name:'Lateral Raises',      sets:4, reps:15, rest:45,  tip:'Cheat slightly on last 2 reps of each set to overload'},
          {name:'Skull Crushers',      sets:3, reps:12, rest:60,  tip:'Bar to forehead, elbows pointed at ceiling throughout'},
        ]
      },
      back: {
        title:'PULL (Back/Biceps)', meta:'Back · Biceps · Rear Delts · ~55 min', time:'55 min', label:'Day 2',
        exercises:[
          {name:'Deadlift',            sets:4, reps:6,  rest:120, tip:'Brace hard, drive through floor, full hip extension at top'},
          {name:'Pull-Ups / Lat Pulldown', sets:4, reps:10, rest:90, tip:'Avoid swinging — if cheating, reduce weight'},
          {name:'Cable Row',           sets:3, reps:10, rest:75,  tip:'Chest tall, pull to belly button, hold 1 second'},
          {name:'Face Pulls',          sets:3, reps:15, rest:45,  tip:'External rotation — crucial for shoulder health'},
          {name:'Dumbbell Curl',       sets:3, reps:12, rest:60,  tip:'Slow negative (3 sec down) for more bicep time under tension'},
          {name:'Hammer Curl',         sets:3, reps:12, rest:45,  tip:'Neutral grip targets brachialis — helps build arm thickness'},
        ]
      },
      legs: {
        title:'LEGS (Quad Focus)', meta:'Quads · Glutes · Core · ~60 min', time:'60 min', label:'Day 3', prem:true,
        exercises:[
          {name:'Barbell Squat',       sets:4, reps:8,  rest:120, tip:'High bar: more quad. Low bar: more posterior chain.'},
          {name:'Leg Press',           sets:3, reps:10, rest:90,  tip:'High foot placement = more glutes. Low = more quads.'},
          {name:'Walking Lunges',      sets:3, reps:20, rest:75,  tip:'Add dumbbells — 3 seconds down to build quad strength'},
          {name:'Hip Thrust',          sets:4, reps:12, rest:75,  tip:'Drive through heels, squeeze glutes hard at top'},
          {name:'Calf Raises',         sets:4, reps:20, rest:45,  tip:'Loaded stretch is key — pause 1 sec at bottom'},
        ]
      },
      shoulders: {
        title:'SHOULDERS & ARMS', meta:'Full Delts · Biceps · Triceps · ~55 min', time:'55 min', label:'Day 4', prem:true,
        exercises:[
          {name:'Overhead Press',      sets:4, reps:8,  rest:90,  tip:'Compete version: lower to clavicle, press to full lock'},
          {name:'Arnold Press',        sets:3, reps:12, rest:75,  tip:'Full rotation on the way up AND down'},
          {name:'Lateral Raises',      sets:4, reps:15, rest:45,  tip:'Cable version gives better constant tension than DB'},
          {name:'Close-Grip Bench',    sets:3, reps:10, rest:75,  tip:'Hands shoulder-width, elbows close to body'},
          {name:'Dumbbell Curl',       sets:3, reps:12, rest:60,  tip:'Supinate fully at top — pinky higher than thumb'},
          {name:'Hanging Leg Raises',  sets:3, reps:15, rest:45,  tip:'Full hang, raise legs to 90° — no swinging'},
        ]
      }
    }
  },

  advanced: {
    label: 'Advanced',
    description: '5 days/week · High intensity, advanced techniques, strength & hypertrophy split',
    color: '#E8001A',
    days: {
      upper: {
        title:'CHEST & TRICEPS', meta:'Chest Focus · Triceps · Anterior Delts · ~60 min', time:'60 min', label:'Day 1',
        exercises:[
          {name:'Bench Press',         sets:5, reps:'5',  rest:120, tip:'85% of 1RM. Focus on explosive press, controlled descent'},
          {name:'Incline DB Press',    sets:4, reps:10,   rest:90,  tip:'Full ROM — elbows at 75°, not flared. Use heavier weight.'},
          {name:'Cable Fly',           sets:4, reps:12,   rest:60,  tip:'Try cross-body cables for upper chest emphasis'},
          {name:'Chest Dips',          sets:3, reps:12,   rest:75,  tip:'Lean forward to hit chest — add weight with dip belt'},
          {name:'Skull Crushers',      sets:4, reps:10,   rest:75,  tip:'Use EZ bar. Lower to just above forehead.'},
          {name:'Tricep Pushdown',     sets:3, reps:15,   rest:45,  tip:'Superset with overhead extension for full tricep pump'},
        ]
      },
      back: {
        title:'BACK & BICEPS', meta:'Back Thickness & Width · Bicep Peak · ~65 min', time:'65 min', label:'Day 2',
        exercises:[
          {name:'Deadlift',            sets:4, reps:'5',  rest:180, tip:'90%+ of 1RM. Straps allowed. Focus on bar path.'},
          {name:'Pull-Ups / Lat Pulldown', sets:4, reps:8,  rest:90, tip:'Weighted pull-ups preferred. Full dead hang between reps.'},
          {name:'Barbell Row',         sets:4, reps:8,   rest:90,  tip:'Pendlay rows: bar to floor each rep. More back activation.'},
          {name:'Cable Row',           sets:3, reps:12,  rest:75,  tip:'Use wide grip and close grip on alternating sets'},
          {name:'Face Pulls',          sets:4, reps:15,  rest:45,  tip:'High reps, rear delt focus, crucial for shoulder longevity'},
          {name:'Hammer Curl',         sets:4, reps:10,  rest:60,  tip:'Cross-body variation for brachialis emphasis'},
        ]
      },
      legs: {
        title:'LEGS — POWER & HYPERTROPHY', meta:'Full Lower Body · ~70 min', time:'70 min', label:'Day 3', prem:true,
        exercises:[
          {name:'Barbell Squat',       sets:5, reps:'5',  rest:180, tip:'85–90% 1RM. Use belt at working sets. Depth matters.'},
          {name:'Romanian Deadlift',   sets:4, reps:10,  rest:90,  tip:'Full stretch at bottom, bar stays against shins'},
          {name:'Leg Press',           sets:4, reps:12,  rest:90,  tip:'High foot placement + full ROM = max glute/ham activation'},
          {name:'Hip Thrust',          sets:4, reps:12,  rest:75,  tip:'Heavy barbell version — 1.5× bodyweight target'},
          {name:'Goblet Squat',        sets:3, reps:15,  rest:60,  tip:'Use as a finisher — deep squat, stay on heels'},
          {name:'Calf Raises',         sets:5, reps:20,  rest:45,  tip:'Slow negative 3 sec, pause 1 sec at stretch position'},
        ]
      },
      shoulders: {
        title:'SHOULDERS & ARMS', meta:'Full Delts · Arms · Core · ~65 min', time:'65 min', label:'Day 4', prem:true,
        exercises:[
          {name:'Overhead Press',      sets:5, reps:'5',  rest:120, tip:'Seated version for more shoulder isolation at heavy weights'},
          {name:'Arnold Press',        sets:4, reps:10,  rest:75,  tip:'Pause at bottom for 1 second to remove momentum'},
          {name:'Lateral Raises',      sets:5, reps:15,  rest:45,  tip:'Cable lateral raise with partial reps at top — high volume'},
          {name:'Close-Grip Bench',    sets:4, reps:8,   rest:90,  tip:'4 plates on working set — tricep size builder'},
          {name:'Dumbbell Curl',       sets:4, reps:10,  rest:60,  tip:'Incline curls for full bicep stretch at bottom'},
          {name:'Russian Twist',       sets:4, reps:20,  rest:45,  tip:'Weighted: hold plate or medicine ball, feet elevated'},
        ]
      }
    }
  }
};

const DAY_ORDER=['upper','back','legs','shoulders'];

// Swap youtubeUrl values here to curate the in-app proper-form video library.
const EXERCISE_VIDEO_LIBRARY = {
  'Bench Press': {
    title: 'Bench Press Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=-i0wwCo_WiA',
    channel: 'Colossus Fitness'
  },
  'Overhead Press': {
    title: 'Overhead Press Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=NAtsHyowOXg',
    channel: 'Colossus Fitness'
  },
  'Incline DB Press': {
    title: 'Incline Dumbbell Press Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=lpYnADCkxRU',
    channel: 'PowerliftingTechnique'
  },
  'Tricep Pushdown': {
    title: 'Tricep Pushdown Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=mRmIthbCSNI',
    channel: 'Colossus Fitness'
  },
  'Lateral Raises': {
    title: 'Lateral Raise Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=IXeRFh9nUwk',
    channel: 'Colossus Fitness'
  },
  'Deadlift': {
    title: 'Deadlift Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=_LhYspMFUmY',
    channel: 'CanditoTrainingHQ'
  },
  'Pull-Ups / Lat Pulldown': {
    title: 'Lat Pulldown Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZxgD_89klTQ',
    channel: 'Colossus Fitness'
  },
  'Barbell Row': {
    title: 'Barbell Row Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=vmHbJ_JmUS4',
    channel: 'Colossus Fitness'
  },
  'Face Pulls': {
    title: 'Face Pull Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=7bLivsAhDFY',
    channel: 'Colossus Fitness'
  },
  'Barbell Squat': {
    title: 'Barbell Squat Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=sbBxvzHwzFU',
    channel: 'Colossus Fitness'
  },
  'Romanian Deadlift': {
    title: 'Romanian Deadlift Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=PnBREGM7pE0',
    channel: 'synergyfitnessteam'
  },
  'Leg Press': {
    title: 'Leg Press Proper Form',
    youtubeUrl: 'https://www.youtube.com/watch?v=K5n2vg3oZa4',
    channel: 'Colossus Fitness'
  }
};

// State
let curDay='upper',curExIdx=0,curSet=1,restInt=null,restSec=60,totalSetsLogged=0;

function getYouTubeVideoId(url=''){
  const value=(url||'').trim();
  if(!value)return '';
  try{
    const parsed=new URL(value);
    if(parsed.hostname.includes('youtu.be'))return parsed.pathname.replace(/^\/+/,'');
    const queryId=parsed.searchParams.get('v');
    if(queryId)return queryId;
    const parts=parsed.pathname.split('/').filter(Boolean);
    const embedIdx=parts.indexOf('embed');
    if(embedIdx!==-1&&parts[embedIdx+1])return parts[embedIdx+1];
    return parts[parts.length-1]||'';
  }catch(err){
    return value.split('/').pop().split('?')[0];
  }
}

function buildYouTubeWatchUrl(url=''){
  const videoId=getYouTubeVideoId(url);
  return videoId?`https://www.youtube.com/watch?v=${videoId}`:'';
}

function buildYouTubeEmbedUrl(url=''){
  const videoId=getYouTubeVideoId(url);
  return videoId?`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`:'';
}

function getExerciseSearchUrl(exerciseName=''){
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} proper form tutorial`)}`;
}

function getExerciseVideo(exerciseName=''){
  const video=EXERCISE_VIDEO_LIBRARY[exerciseName];
  if(!video)return null;
  const watchUrl=buildYouTubeWatchUrl(video.youtubeUrl);
  const embedUrl=buildYouTubeEmbedUrl(video.youtubeUrl);
  if(!watchUrl||!embedUrl)return null;
  return { ...video, watchUrl, embedUrl };
}

function renderExerciseVideo(exercise){
  const card=document.getElementById('wo-video-card');
  if(!card)return;
  if(!exercise){
    card.style.display='none';
    card.innerHTML='';
    return;
  }

  const video=getExerciseVideo(exercise.name);
  const searchUrl=getExerciseSearchUrl(exercise.name);
  const tipText=exercise.tip||'Watch the movement once, then copy the range of motion with a lighter warm-up set first.';

  card.style.display='block';
  if(video){
    card.innerHTML=`
      <div class="row between wrap mb12">
        <div>
          <div class="video-kicker">Proper Form Video</div>
          <div class="display" style="font-size:24px;color:#fff">${exercise.name}</div>
        </div>
        <div class="badge badge-red" style="font-size:11px">YOUTUBE</div>
      </div>
      <div class="video-grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));align-items:start">
        <div class="video-card">
          <div class="video-frame">
            <iframe src="${video.embedUrl}" title="${video.title}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>
        </div>
        <div class="video-card" style="justify-content:center;height:100%">
          <div class="video-meta">
            <div class="video-title">${video.title}</div>
            <div class="video-copy">Match your setup, tempo, and range before logging a working set. ${tipText}</div>
            <div class="video-copy">Suggested source: ${video.channel}</div>
          </div>
          <div class="video-actions">
            <a class="btn btn-red btn-sm" href="${video.watchUrl}" target="_blank" rel="noopener noreferrer">WATCH ON YOUTUBE</a>
            <a class="btn btn-dark btn-sm" href="${searchUrl}" target="_blank" rel="noopener noreferrer">SEARCH MORE</a>
          </div>
        </div>
      </div>`;
    return;
  }

  card.innerHTML=`
    <div class="video-kicker mb8">Proper Form Video</div>
    <div class="video-grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));align-items:center">
      <div class="video-frame empty">
        <div>
          <div class="display" style="font-size:28px;color:#fff;margin-bottom:8px">NO CURATED VIDEO YET</div>
          <div class="video-copy">This movement does not have a pinned tutorial in the app yet, but you can open YouTube results for ${exercise.name} instantly.</div>
        </div>
      </div>
      <div class="video-card">
        <div class="video-title">${exercise.name}</div>
        <div class="video-copy">${tipText}</div>
        <div class="video-actions">
          <a class="btn btn-red btn-sm" href="${searchUrl}" target="_blank" rel="noopener noreferrer">SEARCH YOUTUBE</a>
        </div>
      </div>
    </div>`;
}

function getActiveProgram(user){
  const level=getCurrentProgramLevel(user);
  return WORKOUT_PROGRAMS[level]||WORKOUT_PROGRAMS.beginner;
}

function getAvailableWorkoutDays(user){
  const prog=getActiveProgram(user);
  const prem=isPrem();
  return DAY_ORDER.filter(k=>{
    const day=prog.days[k];
    return day&&(!day.prem||prem);
  });
}

function getCompletedWorkoutDays(user){
  ensureUserFields(user);
  return user.completedWorkoutDays||{};
}

function getCompletedWorkoutCount(user){
  const completed=getCompletedWorkoutDays(user);
  return getAvailableWorkoutDays(user).filter(k=>!!completed[k]).length;
}

function isProgramCycleComplete(user){
  const available=getAvailableWorkoutDays(user);
  return available.length>0&&available.every(k=>!!getCompletedWorkoutDays(user)[k]);
}

function resetWorkoutState(){
  curExIdx=0;
  curSet=1;
  totalSetsLogged=0;
  clearInterval(restInt);
  restInt=null;
}

function getSuggestedProgramLevel(user){
  const level=getCurrentProgramLevel(user);
  if(level==='beginner')return 'intermediate';
  if(level==='intermediate')return 'advanced';
  return 'advanced';
}

function queueProgramDecision(user){
  ensureUserFields(user);
  if(user.pendingProgramDecision)return user.pendingProgramDecision;

  const currentLevel=getCurrentProgramLevel(user);
  const suggestedLevel=getSuggestedProgramLevel(user);
  const availableDays=getAvailableWorkoutDays(user);
  const completedWeek=user.currentProgramWeek||1;
  const completedAt=dateStr();
  const lastHistory=user.programHistory[user.programHistory.length-1];

  if(!lastHistory||lastHistory.level!==currentLevel||lastHistory.week!==completedWeek||lastHistory.completedAt!==completedAt){
    user.programHistory.push({
      level:currentLevel,
      week:completedWeek,
      completedAt,
      daysCompleted:availableDays.length
    });
  }

  user.pendingProgramDecision={
    completedLevel:currentLevel,
    suggestedLevel,
    completedWeek,
    completedAt,
    availableDays:[...availableDays]
  };

  return user.pendingProgramDecision;
}

function getNextDay(day){
  const available=getAvailableWorkoutDays(me());
  const idx=available.indexOf(day);
  if(idx===-1)return available[0]||DAY_ORDER[0];
  return available[idx+1]||available[0]||DAY_ORDER[0];
}

function getNextSuggestedWorkoutDay(user,fromDay){
  const available=getAvailableWorkoutDays(user);
  if(!available.length)return DAY_ORDER[0];

  const completed=getCompletedWorkoutDays(user);
  const startIdx=Math.max(available.indexOf(fromDay),-1);

  for(let i=startIdx+1;i<available.length;i++){
    if(!completed[available[i]])return available[i];
  }

  const firstUndone=available.find(day=>!completed[day]);
  return firstUndone||available[0];
}

function isWorkoutDayLocked(user,day){
  return !!(user&&!user.pendingProgramDecision&&getCompletedWorkoutDays(user)[day]);
}

function redirectToNextUnlockedWorkoutDay(user,day){
  if(!isWorkoutDayLocked(user,day))return false;
  const nextDay=getNextSuggestedWorkoutDay(user,day);
  const prog=getActiveProgram(user);
  if(nextDay&&nextDay!==day){
    curDay=nextDay;
    resetWorkoutState();
    buildWorkoutPanel(user,{openDecisionModal:false});
    const nextWorkout=prog.days[nextDay];
    toast(`${prog.days[day].label} is already saved for this cycle. Continue with ${nextWorkout.label} next.`, 'info', 5200);
  } else {
    toast('This workout day is already saved for the current cycle.', 'info', 4500);
  }
  return true;
}

function buildWorkoutPanel(user,options={}){
  ensureUserFields(user);
  const prem=isPrem();
  const pills=document.getElementById('day-pills');
  if(!pills)return;
  pills.innerHTML='';
  const completedDays=getCompletedWorkoutDays(user);
  const availableDays=getAvailableWorkoutDays(user);
  const prog=getActiveProgram(user);

  // BMI + experience recommendation banner
  const banner=document.getElementById('wo-bmi-banner');
  const bannerText=document.getElementById('wo-bmi-text');
  if(banner&&bannerText){
    const bmi=user.bmi;
    const cycle=user.currentProgramWeek||1;
    let msg=`<strong style="color:#fff">Program: ${prog.label}</strong> — ${prog.description}<br>`;
    msg+=`Cycle progress: <strong style="color:var(--red3)">${getCompletedWorkoutCount(user)}/${availableDays.length}</strong> workout day${availableDays.length!==1?'s':''} completed.<br>`;
    if(bmi){
      const cat=bmi<18.5?'Underweight':bmi<25?'Normal Weight':bmi<30?'Overweight':'Obese';
      msg+=`BMI: <strong style="color:var(--red3)">${bmi} (${cat})</strong> · `;
      if(bmi>=30)msg+='Using reduced starting weights for lower-body exercises. Focus on form first.';
      else if(bmi>=25)msg+='Slightly reduced lower-body weights. Build up progressively.';
      else if(bmi<18.5)msg+='Underweight: eat in surplus and prioritize compound lifts with moderate weight.';
      else msg+='Good BMI range — recommended weights are based on your bodyweight.';
    } else {
      msg+=`Week ${cycle}: <span style="color:var(--txt4)">Log your BMI in the BMI Tracker for personalised weight recommendations.</span>`;
    }
    bannerText.innerHTML=msg;
    banner.style.display='block';
  }

  DAY_ORDER.forEach(k=>{
    const wo=prog.days[k];
    if(!wo)return;
    const btn=document.createElement('button');
    const isLocked=wo.prem&&!prem;
    const isDone=!!completedDays[k];
    const isCurrent=k===curDay;

    let label=wo.label+': '+wo.title.split(' ')[0];
    if(isLocked)label+=' 🔒';
    else if(isDone)label+=' ✅';

    btn.className='pill'+(isCurrent?' on':'');
    btn.style.cssText=isDone?'border-color:rgba(34,197,94,0.5);color:#4ade80;background:rgba(34,197,94,0.08)':'';
    btn.textContent=label;
    btn.onclick=()=>{
      if(isLocked){toast('🔒 Days 3+ require Premium (₱99/mo)','err');return;}
      if(isDone&&!user.pendingProgramDecision){
        redirectToNextUnlockedWorkoutDay(user,k);
        return;
      }
      if(user.pendingProgramDecision&&!isDone){showProgramDecisionModal(user);return;}
      if(k!==curDay){curDay=k;resetWorkoutState();}
      document.querySelectorAll('#day-pills .pill').forEach(p=>p.classList.remove('on'));
      btn.classList.add('on');
      showWorkoutActive();
      renderExercises();
    };
    pills.appendChild(btn);
  });

  // Auto-set current day to first uncompleted
  const firstUndone=availableDays.find(k=>!completedDays[k]);
  if(firstUndone&&!user.pendingProgramDecision&&firstUndone!==curDay){
    curDay=firstUndone;
    resetWorkoutState();
  } else if(!availableDays.includes(curDay)) {
    curDay=availableDays[0]||DAY_ORDER[0];
    resetWorkoutState();
  }

  const totalDone=getCompletedWorkoutCount(user);
  const wbEl=document.getElementById('wo-week-badge');
  if(wbEl)wbEl.textContent='Week '+(user.currentProgramWeek||1)+' · '+totalDone+'/'+availableDays.length+' done';

  const subEl=document.getElementById('wo-subtitle');
  if(subEl)subEl.textContent=prog.label+' Program · '+prog.description;

  if(!options.keepDoneScreen){
    showWorkoutActive();
    renderExercises();
  }

  if(user.pendingProgramDecision&&options.openDecisionModal!==false){
    showProgramDecisionModal(user);
  }
}

function showWorkoutActive(){
  const done=document.getElementById('wo-done-screen');
  const active=document.getElementById('wo-active-screen');
  if(done)done.style.display='none';
  if(active)active.style.display='block';
}

function renderExercises(){
  const user=me();
  if(!user)return;
  if(isWorkoutDayLocked(user,curDay)){
    const nextDay=getNextSuggestedWorkoutDay(user,curDay);
    if(nextDay!==curDay){
      curDay=nextDay;
      resetWorkoutState();
      buildWorkoutPanel(user,{openDecisionModal:false});
      return;
    }
  }
  const prog=getActiveProgram(user);
  const wo=prog.days[curDay];
  const exList=document.getElementById('wo-ex-list');
  if(!exList||!wo)return;
  document.getElementById('wo-day-title').textContent=wo.title;
  document.getElementById('wo-day-meta').textContent=wo.meta;
  document.getElementById('wo-day-time').textContent=wo.time;

  exList.innerHTML='';
  wo.exercises.forEach((ex,i)=>{
    const isDone=i<curExIdx;
    const isActive=i===curExIdx;
    const div=document.createElement('div');
    div.className='ex-row'+(isDone?' done':isActive?' active':' upcoming');

    // Recommended weight
    let weightHtml='';
    if(user&&user.weight){
      const rec=getRecommendedWeight(ex.name,user.weight,user.bmi,getCurrentProgramLevel(user));
      if(rec){
        const wColor=isDone?'#4ade80':isActive?'var(--red3)':'var(--txt4)';
        weightHtml=`<div style="font-size:11px;color:${wColor};font-weight:700;margin-top:2px">💪 ~${rec.kg}${rec.unit==='kg/hand'?'kg/hand':'kg'} recommended</div>`;
      } else {
        // bodyweight exercise
        weightHtml=`<div style="font-size:11px;color:var(--txt4);margin-top:2px">Bodyweight</div>`;
      }
    } else {
      weightHtml=`<div style="font-size:11px;color:var(--txt4);margin-top:2px;font-style:italic">Log BMI for weight rec</div>`;
    }

    // Form tip
    const tipHtml=ex.tip?`<div style="font-size:11px;color:var(--txt4);margin-top:3px;font-style:italic">💡 ${ex.tip}</div>`:'';

    div.innerHTML=`
      <div class="ex-icon" style="background:${isDone?'rgba(34,197,94,0.15)':isActive?'var(--red4)':'var(--bg4)'}">
        ${isDone?'✅':isActive?'⚡':'⭕'}
      </div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px;color:#fff">${ex.name}</div>
        <div style="font-size:12px;color:var(--txt3)">${ex.sets} sets × ${ex.reps} reps · ${ex.rest}s rest</div>
        ${weightHtml}
        ${isActive?tipHtml:''}
      </div>
      ${isDone?'<div class="badge badge-green" style="font-size:11px">DONE ✓</div>':isActive?'<div class="badge badge-red" style="font-size:11px">ACTIVE</div>':''}`;
    exList.appendChild(div);
  });

  // Exercise progress bar
  const pct=Math.round((curExIdx/wo.exercises.length)*100);
  const progBar=document.getElementById('wo-ex-prog-bar');
  if(progBar)progBar.style.width=pct+'%';
  const progText=document.getElementById('wo-ex-progress');
  if(progText)progText.textContent=curExIdx+'/'+wo.exercises.length+' done';

  // Timer panel
  const cur=wo.exercises[curExIdx];
  if(cur){
    document.getElementById('cur-ex-name').textContent=cur.name;
    document.getElementById('cur-set-num').textContent=curSet;
    document.getElementById('cur-set-total').textContent=cur.sets;
    renderExerciseVideo(cur);
    restSec=cur.rest;
    document.getElementById('rest-disp').textContent=cur.rest;
    document.getElementById('rest-btn').textContent='⏱ START REST '+cur.rest+'s';
    const timerCard=document.getElementById('wo-timer-card');
    if(timerCard)timerCard.style.display='flex';
  } else {
    renderExerciseVideo(null);
    completeWorkout();
  }
}

function logSet(){
  const user=me();
  if(user&&user.pendingProgramDecision){showProgramDecisionModal(user);return;}
  if(redirectToNextUnlockedWorkoutDay(user,curDay))return;
  const prog=getActiveProgram(user);
  const wo=prog.days[curDay];
  const cur=wo&&wo.exercises[curExIdx];
  if(!cur)return;
  totalSetsLogged++;
  clearInterval(restInt);restInt=null;

  if(curSet<cur.sets){
    curSet++;
    document.getElementById('cur-set-num').textContent=curSet;
    toast('Set '+curSet+' of '+cur.sets+' logged ✓','ok');
    startRest(cur.rest);
  } else {
    curSet=1;
    curExIdx++;
    if(curExIdx>=wo.exercises.length){
      completeWorkout();
    } else {
      toast('💪 '+cur.name+' complete! Next: '+wo.exercises[curExIdx].name,'ok',3000);
      renderExercises();
    }
  }
}

function completeWorkout(){
  clearInterval(restInt);restInt=null;
  renderExerciseVideo(null);
  const user=me();
  if(!user)return;
  ensureUserFields(user);
  const today=dateStr();
  const prog=getActiveProgram(user);
  const wo=prog.days[curDay];
  const alreadyCounted=!!user.completedWorkoutDays[curDay];

  if(alreadyCounted&&!user.pendingProgramDecision){
    redirectToNextUnlockedWorkoutDay(user,curDay);
    return;
  }

  user.completedWorkoutDays[curDay]=today;
  user.completedDays=user.completedWorkoutDays;
  user.workoutsDone=(user.workoutsDone||0)+1;
  user.workoutHistory=user.workoutHistory||[];
  user.workoutHistory.unshift({
    date:today,
    day:curDay,
    title:wo.title,
    level:getCurrentProgramLevel(user),
    week:user.currentProgramWeek||1,
    exercises:wo.exercises.length,
    sets:wo.exercises.reduce((sum,ex)=>sum+ex.sets,0)
  });
  if(user.workoutHistory.length>60)user.workoutHistory.length=60;
  user.workoutLog=user.workoutLog||[];
  if(!user.workoutLog.includes(today))user.workoutLog.push(today);
  user.lastActivity=today;
  user.streak=(user.streak||0);
  const yesterday=dateStr(-1);
  if(user.lastStreakDate===yesterday)user.streak++;
  else if(user.lastStreakDate!==today)user.streak=1;
  user.lastStreakDate=today;
  user.bestStreak=Math.max(user.streak,user.bestStreak||1);

  const cycleComplete=isProgramCycleComplete(user);
  if(cycleComplete){
    queueProgramDecision(user);
  }

  S.users[user.email]=user;
  save();
  updateStreakDisplay(user);
  renderHomeWeek(user);

  const nextDay=getNextSuggestedWorkoutDay(user,curDay);
  const nextWo=prog.days[nextDay];
  const completedCount=getCompletedWorkoutCount(user);

  const doneScreen=document.getElementById('wo-done-screen');
  const activeScreen=document.getElementById('wo-active-screen');
  if(doneScreen)doneScreen.style.display='block';
  if(activeScreen)activeScreen.style.display='none';

  const doneMsg=document.getElementById('wo-done-msg');
  if(doneMsg)doneMsg.textContent='You crushed '+wo.title+'! All '+wo.exercises.length+' exercises done. 🔥';
  const doneEx=document.getElementById('wo-done-exercises');
  if(doneEx)doneEx.textContent=wo.exercises.length;
  const doneSets=document.getElementById('wo-done-sets');
  if(doneSets)doneSets.textContent=wo.exercises.reduce((s,e)=>s+e.sets,0);
  const doneStreak=document.getElementById('wo-done-streak');
  if(doneStreak){const s=user?user.streak||1:1;doneStreak.textContent=s+'🔥';}

  const nextMsg=document.getElementById('wo-done-next-msg');
  const nextBtn=document.getElementById('wo-next-day-btn');
  if(cycleComplete){
    const suggestion=user.pendingProgramDecision&&user.pendingProgramDecision.suggestedLevel;
    const suggestionLabel=WORKOUT_PROGRAMS[suggestion]?.label||prog.label;
    const currentLevel=getCurrentProgramLevel(user);
    if(nextMsg){
      nextMsg.textContent=suggestion===currentLevel
        ?'You completed this cycle. Choose whether to repeat the same program with a fresh progress reset.'
        :'Cycle complete. We recommend trying the '+suggestionLabel+' program next, or you can stay on your current one.';
    }
    if(nextBtn){
      nextBtn.textContent='CHOOSE NEXT PROGRAM →';
      nextBtn.onclick=()=>showProgramDecisionModal(me());
    }
  } else if(nextWo){
    if(nextMsg)nextMsg.textContent='Next up: '+nextWo.label+' — '+nextWo.title;
    if(nextBtn){nextBtn.textContent='START '+nextWo.label.toUpperCase()+' →';nextBtn.onclick=goToNextDay;}
  }

  buildWorkoutPanel(user||{}, { keepDoneScreen:true, openDecisionModal:false });
  if(cycleComplete){
    toast('Program cycle complete! Choose whether to keep this plan or start the suggested one.','ok',6500);
    setTimeout(()=>showProgramDecisionModal(me()),300);
  } else {
    toast('Day saved! Cycle progress: '+completedCount+'/'+getAvailableWorkoutDays(user).length+' complete.','ok',5000);
  }
}

function goToNextDay(){
  const user=me();
  if(!user)return;
  if(user.pendingProgramDecision){showProgramDecisionModal(user);return;}
  const nextDay=getNextSuggestedWorkoutDay(user,curDay);
  curDay=nextDay;
  resetWorkoutState();
  showWorkoutActive();
  buildWorkoutPanel(user||{});
  const panel=document.getElementById('panel-workout');
  if(panel)panel.scrollIntoView({behavior:'smooth',block:'start'});
}

// Rest timer
function startRest(sec){
  clearInterval(restInt);
  restSec=sec;
  const btn=document.getElementById('rest-btn');
  const disp=document.getElementById('rest-disp');
  restInt=setInterval(()=>{
    restSec--;
    if(disp)disp.textContent=restSec;
    if(btn)btn.textContent='⏸ STOP ('+restSec+'s)';
    if(restSec<=0){
      clearInterval(restInt);restInt=null;
      if(btn){const wo=getActiveProgram(me()).days[curDay];const cur=wo&&wo.exercises[curExIdx];btn.textContent='⏱ START REST '+(cur?cur.rest:60)+'s';}
      if(disp){const wo=getActiveProgram(me()).days[curDay];const cur=wo&&wo.exercises[curExIdx];disp.textContent=cur?cur.rest:60;}
      toast('✅ Rest done! Time to lift 💪','ok');
    }
  },1000);
}
function toggleRest(){
  if(restInt){
    clearInterval(restInt);restInt=null;
    const prog=getActiveProgram(me());
    const wo=prog.days[curDay];const cur=wo&&wo.exercises[curExIdx];const s=cur?cur.rest:60;
    const btn=document.getElementById('rest-btn');const disp=document.getElementById('rest-disp');
    if(btn)btn.textContent='⏱ START REST '+s+'s';
    if(disp)disp.textContent=s;
    return;
  }
  const prog=getActiveProgram(me());
  const wo=prog.days[curDay];const cur=wo&&wo.exercises[curExIdx];
  startRest(cur?cur.rest:60);
}


function showProgramDecisionModal(user){
  if(!user||!user.pendingProgramDecision)return;

  const decision=user.pendingProgramDecision;
  const currentLabel=WORKOUT_PROGRAMS[decision.completedLevel]?.label||decision.completedLevel;
  const suggestedLabel=WORKOUT_PROGRAMS[decision.suggestedLevel]?.label||decision.suggestedLevel;
  const sameLevel=decision.suggestedLevel===decision.completedLevel;

  const title=document.getElementById('program-modal-title');
  const summary=document.getElementById('program-modal-summary');
  const recommendation=document.getElementById('program-modal-recommendation');
  const reason=document.getElementById('program-modal-reason');
  const stayBtn=document.getElementById('program-stay-btn');
  const switchBtn=document.getElementById('program-switch-btn');

  if(title)title.textContent=`${currentLabel} cycle complete.`;
  if(summary)summary.textContent=`You finished all ${decision.availableDays.length} workout days for Week ${decision.completedWeek}. Your progress is saved, and you can now either repeat the same program or move into the suggested next one.`;
  if(recommendation)recommendation.textContent=sameLevel?`Recommended: start a fresh ${currentLabel} cycle`:`Recommended: move up to ${suggestedLabel}`;
  if(reason){
    reason.textContent=sameLevel
      ?'You are already on the highest program. Reset your completed days and start a new cycle to keep progressing.'
      :`If you want more challenge, switch to ${suggestedLabel}. If you want to reinforce technique first, stay on ${currentLabel}.`;
  }
  if(stayBtn)stayBtn.textContent=`STAY ON ${currentLabel.toUpperCase()}`;
  if(switchBtn)switchBtn.textContent=sameLevel?`START NEW ${currentLabel.toUpperCase()} CYCLE →`:`SWITCH TO ${suggestedLabel.toUpperCase()} →`;

  openModal('program-modal');
}

function chooseProgramPath(choice){
  const user=me();
  if(!user||!user.pendingProgramDecision)return;

  const decision=user.pendingProgramDecision;
  const currentLevel=decision.completedLevel;
  const targetLevel=choice==='switch'?decision.suggestedLevel:currentLevel;
  const changedLevel=targetLevel!==currentLevel;

  user.completedWorkoutDays={};
  user.completedDays=user.completedWorkoutDays;
  user.pendingProgramDecision=null;
  user.programCompleted=false;
  user.programLevel=targetLevel;
  user.experience=targetLevel;
  user.currentProgramWeek=changedLevel?1:(decision.completedWeek||user.currentProgramWeek||1)+1;

  curDay=getAvailableWorkoutDays(user)[0]||'upper';
  resetWorkoutState();

  S.users[user.email]=user;
  save();

  closeModal('program-modal');
  renderDashboard(user);
  showPanel('workout');
  toast(
    changedLevel
      ?`Switched to the ${WORKOUT_PROGRAMS[targetLevel].label} program. Progress reset for the new cycle.`
      :`Progress reset. ${WORKOUT_PROGRAMS[targetLevel].label} Week ${user.currentProgramWeek} is ready.`,
    'ok',
    5500
  );
}

// ===== HOME WEEK BARS =====
function renderHomeWeek(user){
  ensureUserFields(user);
  const bars=document.getElementById('home-week-bars');if(!bars)return;
  const log=user.workoutLog||[];
  const completedDays=getCompletedWorkoutDays(user);
  const prog=getActiveProgram(user);
  const availableDays=getAvailableWorkoutDays(user);
  const today=new Date();
  const dayOfWeek=today.getDay();
  const monday=new Date(today);
  monday.setDate(today.getDate()-(dayOfWeek===0?6:dayOfWeek-1));
  let doneCount=0;
  bars.innerHTML='';
  for(let i=0;i<7;i++){
    const d=new Date(monday);d.setDate(monday.getDate()+i);
    const ds=d.toISOString().slice(0,10);
    const done=log.includes(ds);
    const isToday=ds===dateStr();
    if(done)doneCount++;
    const col=document.createElement('div');
    col.style.cssText='flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%';
    const h=done?48:isToday?14:10;
    col.innerHTML=`<div style="width:100%;border-radius:3px 3px 0 0;height:${h}px;background:${done?'var(--red)':isToday?'rgba(232,0,26,0.3)':'var(--bg4)'};${isToday&&!done?'border:1.5px dashed rgba(232,0,26,0.4)':''}"></div>`;
    bars.appendChild(col);
  }
  document.getElementById('home-week-prog').textContent=doneCount+'/7 days';
  const pct=Math.round((doneCount/7)*100);
  const pb=document.getElementById('home-prog-bar');if(pb)pb.style.width=pct+'%';
  const pp=document.getElementById('home-prog-pct');if(pp)pp.textContent=pct+'%';

  // Today's workout label — show next uncompleted day
  const nextUndone=availableDays.find(k=>!completedDays[k]);
  const tw=document.getElementById('home-today-workout');
  const tm=document.getElementById('home-today-meta');
  if(user.pendingProgramDecision){
    if(tw)tw.textContent='Program cycle complete';
    if(tm)tm.textContent='Choose whether to repeat your current plan or switch to the suggested next program.';
    return;
  }
  const todayWo=nextUndone?prog.days[nextUndone]:prog.days[availableDays[0]];
  if(tw&&todayWo)tw.textContent=todayWo.label+': '+todayWo.title;
  if(tm&&todayWo)tm.textContent=todayWo.meta;
}
