/* ============================================================
   GymFit PH — App Entry Point
   DOMContentLoaded init: restore session, boot landing or dashboard
============================================================ */

function handleCheckoutReturn(user){
  const params=new URLSearchParams(window.location.search);
  const status=params.get('checkout');
  const email=(params.get('email')||'').trim().toLowerCase();

  if(!status)return;

  const sameUser=user&&user.email&&(!email||user.email===email);
  if(status==='success'&&sameUser){
    toast('Payment submitted. Confirming with the payment provider now...','info',6000);
    startSubscriptionPolling(user.email);
  } else if(status==='cancelled'&&sameUser){
    toast('Checkout was cancelled. You can reopen it anytime from Settings.','info',5500);
  }

  const cleanUrl=`${window.location.pathname}${window.location.hash||''}`;
  window.history.replaceState({},document.title,cleanUrl);
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded',async()=>{
  calcBMI();
  if(S.sess&&S.users[S.sess.email]){
    const user=checkStreak(S.users[S.sess.email]);
    S.users[user.email]=user;save();
    await syncServerSubscription(user);
    refreshNav();
    const sessionUser=me()||user;
    enterDb(sessionUser);
    handleCheckoutReturn(sessionUser);
  } else {
    goLand();
    updateAIStatus();
    handleCheckoutReturn(null);
  }
});
