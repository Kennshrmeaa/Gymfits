/* ============================================================
   GymFit PH — Navigation
   Landing <-> Dashboard switching, mobile menus, routing
============================================================ */

// ===== NAV =====
function scr(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'});}
function toggleMob(id){const m=document.getElementById(id);if(m)m.classList.toggle('open');}
function closeMob(id){const m=document.getElementById(id||'land-mob');if(m)m.classList.remove('open');document.getElementById('land-mob').classList.remove('open');document.getElementById('db-mob').classList.remove('open');}
function mbnActive(el){document.querySelectorAll('.mbn-item').forEach(i=>i.classList.remove('on'));el.classList.add('on');}
function goHome(){return S.sess?(goDb(),false):(goLand(),false);}

function goLand(){
  document.getElementById('land').style.display='block';
  document.getElementById('db').style.display='none';
  document.getElementById('mbn').style.display='flex';
  // Show landing navbar, hide dashboard navbar
  document.getElementById('navbar-land').style.display='flex';
  document.getElementById('navbar-db').style.display='none';
  // Close any open mob menus
  document.getElementById('land-mob').classList.remove('open');
  document.getElementById('db-mob').classList.remove('open');
  // Update landing nav login state
  refreshLandNav();
}

function goDb(){
  if(!S.sess){openAuth('login');return;}
  document.getElementById('land').style.display='none';
  document.getElementById('db').style.display='block';
  document.getElementById('mbn').style.display='none';
  // Show dashboard navbar, hide landing navbar
  document.getElementById('navbar-land').style.display='none';
  document.getElementById('navbar-db').style.display='flex';
  // Close any open mob menus
  document.getElementById('land-mob').classList.remove('open');
  document.getElementById('db-mob').classList.remove('open');
  showPanel('home');
}

function refreshLandNav(){
  const loggedIn=!!S.sess;
  // Landing navbar action buttons
  const lo=document.getElementById('land-nav-out');
  const li=document.getElementById('land-nav-in');
  if(lo)lo.style.display=loggedIn?'none':'flex';
  if(li)li.style.display=loggedIn?'flex':'none';
  // Landing mob menu buttons
  const lmo=document.getElementById('land-mob-out');
  const lmi=document.getElementById('land-mob-in');
  if(lmo)lmo.style.display=loggedIn?'none':'flex';
  if(lmi)lmi.style.display=loggedIn?'flex':'none';
  if(loggedIn&&S.sess){
    const u=me();
    if(!u)return;
    const init=(u.name||'A').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    const lna=document.getElementById('land-nav-ava');
    if(lna)lna.textContent=init;
  }
}