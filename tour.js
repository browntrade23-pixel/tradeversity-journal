/* Tradeversity phone tour: a short "video" of the platform on a phone.
   It plays the REAL app in demo mode (?demo=1, made-up data, nothing saved) inside a phone frame,
   taps through the main features and shows a caption for each scene (EN / FR / AR, from the site language).
   Open it with Tour.open(). */
(function(){
const css=`
.tour-ov{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:radial-gradient(900px 500px at 50% -10%,rgba(58,72,224,.35),transparent 70%),rgba(3,4,8,.94);backdrop-filter:blur(6px);color:#f5f7fa;font-family:Inter,system-ui,sans-serif}
.tour-box{display:flex;flex-direction:column;align-items:center;gap:10px;max-width:100vw}
.tour-bar{display:flex;gap:4px;width:var(--pw);max-width:94vw}
.tour-bar i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden}.tour-bar i b{display:block;height:100%;width:0;background:#fff}
.tour-bar i.done b{width:100%}
.tour-phone{position:relative;width:var(--pw);height:var(--ph);border-radius:calc(46px*var(--s));padding:calc(12px*var(--s));background:linear-gradient(145deg,#2a2d38,#0d0e13);box-shadow:0 0 0 1px rgba(255,255,255,.12),0 30px 80px -20px rgba(58,72,224,.55),0 0 0 calc(2px*var(--s)) #000 inset;box-sizing:border-box}
.tour-scr{position:relative;width:100%;height:100%;border-radius:calc(36px*var(--s));overflow:hidden;background:#050608}
.tour-scr iframe{position:absolute;left:0;top:0;width:390px;height:844px;border:0;transform-origin:0 0;transform:scale(var(--s));pointer-events:none}
.tour-notch{position:absolute;top:calc(18px*var(--s));left:50%;transform:translateX(-50%);width:calc(110px*var(--s));height:calc(30px*var(--s));border-radius:99px;background:#000;z-index:3}
.tour-cap{width:var(--pw);max-width:94vw;min-height:64px;text-align:center;display:flex;flex-direction:column;justify-content:center;gap:2px}
.tour-cap b{font-size:17px;line-height:1.35;font-weight:800;letter-spacing:-.2px;text-shadow:0 2px 12px rgba(0,0,0,.6);animation:tourCap .45s ease}
.tour-cap small{font-size:12px;color:#a0a6b8;letter-spacing:1.4px;text-transform:uppercase}
html[lang=ar] .tour-cap b{font-family:Cairo,Inter,sans-serif;font-size:18px}
@keyframes tourCap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.tour-ctrl{display:flex;gap:8px}
.tour-ctrl button{width:42px;height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;font-size:16px;cursor:pointer}
.tour-ctrl button:hover{background:rgba(58,72,224,.3);border-color:rgba(110,124,245,.7)}
.tour-load{position:absolute;inset:0;display:grid;place-items:center;color:#a0a6b8;font-size:13px;z-index:2;background:#050608}
.tour-end{position:absolute;inset:0;z-index:4;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px;background:radial-gradient(500px 400px at 50% 0%,rgba(58,72,224,.45),transparent 70%),#050608}
.tour-end.on{display:flex;animation:tourCap .6s ease}
.tour-end h2{margin:0;font-size:calc(30px*var(--s) + 6px);font-weight:900;letter-spacing:-.5px}
.tour-end p{margin:0;color:#a0a6b8;font-size:14px}
.tour-end .tour-url{font-weight:800;color:#f5b942;font-size:16px}
.tour-end a{display:inline-block;margin-top:6px;padding:11px 20px;border-radius:999px;background:linear-gradient(180deg,#ffd27a,#f5b942);color:#1b1305;font-weight:800;text-decoration:none}
`;
const L=()=>{const l=(window.I18N&&I18N.lang)||"en";return ["en","fr","ar"].includes(l)?l:"en"};
/* the scenes: what the app does + the caption */
const SC=[
 {d:6000,c:{en:"Your day at a glance: discipline score, streaks and a live background.",fr:"Votre journée en un coup d'œil : score de discipline, séries et un fond animé.",ar:"يومك في لمحة: نقاط الانضباط، السلاسل وخلفية حيّة."},
  run:async T=>{T.x('go("today")');T.top();await T.wait(1500);await T.scrollTo("#view .td-score",true)}},
 {d:7500,c:{en:"Start my session: red news, your plan, your risk and your limits on one screen.",fr:"Démarrer ma session : news rouges, plan, risque et limites sur un seul écran.",ar:"ابدأ جلستي: الأخبار الحمراء، خطتك، مخاطرتك وحدودك في شاشة واحدة."},
  run:async T=>{T.x('if(S.view!=="today")go("today")');T.top();await T.wait(300);await T.tap('[data-td="session"]',true);await T.wait(2200);
    try{const b=T.q(".modal .ss-chk");if(b)b.scrollIntoView({block:"center",behavior:"smooth"})}catch(e){}await T.wait(900);
    for(const k of ["news","plan","risk","limit"]){const c=T.q(`[data-ss="${k}"]`);if(c){c.checked=true;c.dispatchEvent(new w.Event("change",{bubbles:true}))}await T.wait(250)}}},
 {d:6000,c:{en:"Prop firm limits: a warning at 70% and 90% of your daily loss and drawdown.",fr:"Limites de la prop firm : alerte à 70 % et 90 % de la perte journalière et du drawdown.",ar:"حدود شركة التمويل: تنبيه عند 70% و90% من الخسارة اليومية والتراجع."},
  run:async T=>{T.x("closeModal()");T.x('if(S.view!=="today")go("today")');await T.wait(400);await T.scrollTo("#view .lim-card",true)}},
 {d:4200,c:{en:"Your trading journal, in your pocket.",fr:"Votre journal de trading, dans votre poche.",ar:"يوميات التداول في جيبك."},
  run:async T=>{T.x('go("journal")');T.top()}},
 {d:9000,c:{en:"Log a trade in seconds: P&L, commissions, emotions and your chart.",fr:"Ajoutez un trade en quelques secondes : P&L, commissions, émotions et votre graphique.",ar:"سجّل صفقة في ثوانٍ: الربح، العمولات، المشاعر وصورة الشارت."},
  run:async T=>{await T.tap("#addT");T.x("editTrade(null)");await T.wait(900);
    await T.type('#tf [name=symbol]',"NQ");await T.type('#tf [name=qty]',"2");await T.type('#tf [name=pnl]',"640");
    await T.wait(400);await T.scrollTo("#live");await T.wait(900);await T.tap('#emo .pill[data-e="Calm"]',true);await T.tap('#emo .pill[data-e="Disciplined"]',true);await T.scrollTo("#emo")}},
 {d:6500,c:{en:"Every trade with your notes and screenshot. Tap ✎ to edit it anytime.",fr:"Chaque trade avec vos notes et votre capture. Touchez ✎ pour le modifier à tout moment.",ar:"كل صفقة مع ملاحظاتك وصورتها. اضغط ✎ لتعديلها في أي وقت."},
  run:async T=>{T.x("closeModal()");T.x('if(S.view!=="journal")go("journal")');await T.wait(400);await T.scrollTo("#view .day",true)}},
 {d:6500,c:{en:"Import your Tradovate, NinjaTrader or MT5 file: stats calculated instantly.",fr:"Importez votre fichier Tradovate, NinjaTrader ou MT5 : statistiques calculées instantanément.",ar:"استورد ملف Tradovate أو NinjaTrader أو MT5: تُحسب الإحصائيات فوراً."},
  run:async T=>{T.x("closeModal()");T.x('if(S.view!=="journal")go("journal")');await T.wait(400);await T.scrollTo("#view .imf-card",true)}},
 {d:6500,c:{en:"Statistics: net P&L, win rate, profit factor, drawdown.",fr:"Statistiques : P&L net, win rate, profit factor, drawdown.",ar:"الإحصائيات: صافي الربح، نسبة النجاح، معامل الربح، السحب."},
  run:async T=>{T.x('S.acct="Apex 50K";S.range="all";go("stats")');T.top();await T.wait(700);await T.scrollTo("#view .grid.g4",true)}},
 {d:7000,c:{en:"Your prop firm rules, live: profit target, daily loss limit, max drawdown.",fr:"Vos règles de prop firm en direct : objectif, perte journalière, drawdown max.",ar:"قواعد شركة التمويل مباشرة: هدف الربح، حد الخسارة اليومي، أقصى سحب."},
  run:async T=>{T.x('if(S.view!=="stats"||S.acct!=="Apex 50K"){S.acct="Apex 50K";S.range="all";go("stats")}');await T.wait(400);await T.scrollTo("#rulesCard",true)}},
 {d:6000,c:{en:"Your P&L calendar: every green and red day at a glance.",fr:"Votre calendrier P&L : chaque jour vert et rouge en un coup d'œil.",ar:"تقويم الأرباح: كل يوم أخضر وأحمر في لمحة."},
  run:async T=>{T.x('if(S.view!=="stats"){S.acct="Apex 50K";S.range="all";go("stats")}');await T.wait(400);await T.scrollTo("#view .cal",true)}},
 {d:7000,c:{en:"Plan tomorrow tonight: bias, key levels, max loss, max trades.",fr:"Préparez demain ce soir : biais, niveaux clés, perte max, nombre de trades.",ar:"خطط للغد الليلة: الاتجاه، المستويات المهمة، أقصى خسارة وعدد الصفقات."},
  run:async T=>{T.x('go("plan")');T.top();await T.wait(800);await T.scrollTo("#view .bias-card",true,"Directional bias")}},
 {d:7500,c:{en:"Red folder news with a countdown, and what each news means.",fr:"Les news rouges avec compte à rebours, et ce que signifie chaque news.",ar:"الأخبار الحمراء مع عدّ تنازلي، ومعنى كل خبر."},
  run:async T=>{T.x('S._newsTab="today";go("news")');T.top();await T.wait(1800);T.x("openNewsInfo(S.news[0])")}},
 {d:6500,c:{en:"Notifications: red news in 5 minutes, journal and plan reminders.",fr:"Notifications : news rouge dans 5 minutes, rappels journal et plan.",ar:"الإشعارات: خبر أحمر بعد 5 دقائق، تذكير اليوميات والخطة."},
  run:async T=>{T.x("closeModal()");T.top();await T.wait(500);await T.tap("#ntfBell");T.x('document.getElementById("ntfBell").click()')}},
 {d:7000,c:{en:"Search anything: type “risk NQ 20” and the calculator is ready.",fr:"Cherchez tout : tapez « risk NQ 20 » et le calculateur est prêt.",ar:"ابحث عن أي شيء: اكتب «risk NQ 20» وتجهز الحاسبة."},
  run:async T=>{T.x('document.getElementById("ntfPanel")&&document.getElementById("ntfPanel").classList.add("hidden")');T.top();await T.wait(300);
    await T.tap("#cmdBtn",true);await T.wait(700);await T.type("#cmdQ","risk NQ 20");await T.wait(1600);
    T.x('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter"}))')}},
 {d:6000,c:{en:"Risk calculator: how many contracts for your stop.",fr:"Calculateur de risque : combien de contrats pour votre stop.",ar:"حاسبة المخاطرة: كم عقداً تأخذ حسب وقف الخسارة."},
  run:async T=>{T.x('const p=document.getElementById("ntfPanel");p&&p.classList.add("hidden");if(S.view!=="risk")go("risk")');T.top();await T.wait(900);await T.scrollTo("#view .card",true)}},
 {d:7500,c:{en:"Prop firm tracker: rules by account size, prices and BROWN23 discounts.",fr:"Prop firm tracker : règles par taille de compte, prix et réductions BROWN23.",ar:"متتبع شركات التمويل: القواعد حسب حجم الحساب، الأسعار وخصومات BROWN23."},
  run:async T=>{T.x('S._pfId="bulenox";S._pfSz=null;go("propfirms");S._pfId="bulenox";render()');T.top();await T.wait(1200);await T.scrollTo("#szCard",true)}},
 {d:5500,c:{en:"And our free ICT indicator for TradingView.",fr:"Et notre indicateur ICT gratuit pour TradingView.",ar:"ومؤشر ICT المجاني على TradingView."},
  run:async T=>{T.x('go("indicator")');T.top()}},
 {d:6500,end:true,c:{en:"Free for Tradeversity students.",fr:"Gratuit pour les étudiants Tradeversity.",ar:"مجاني لطلاب Tradeversity."},run:async T=>{T.x("closeModal()");T.x('go("journal")');T.top()}}
];
const END={en:["Start journaling today","Join free and verify your Telegram to get access.","Join now"],fr:["Commencez votre journal aujourd'hui","Inscrivez-vous gratuitement et vérifiez votre Telegram pour accéder.","Rejoindre"],ar:["ابدأ يومياتك اليوم","سجّل مجاناً وتحقق من تيليغرام للحصول على الوصول.","انضم الآن"]};
const TITLE={en:"Platform tour",fr:"Visite de la plateforme",ar:"جولة في المنصة"};

let ov,ifr,w,idx=0,timer=null,playing=true,startedAt=0,left=0,token=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* helpers used by the scenes (they act inside the demo app) */
const T={
  x:code=>{try{return w.eval(code)}catch(e){console.warn("tour",e)}},
  q:sel=>{try{for(const s of sel.split(/\s*,\s*/)){const e=w.document.querySelector(s);if(e)return e}}catch(e){}return null},
  wait:ms=>sleep(ms),
  top:()=>{try{w.scrollTo({top:0})}catch(e){}},
  hl:el=>{if(!el)return;w.document.querySelectorAll(".tour-hl").forEach(x=>x.classList.remove("tour-hl"));el.classList.add("tour-hl");setTimeout(()=>el.classList.remove("tour-hl"),2600)},
  async scrollTo(sel,hl,text){let el=T.q(sel);
    if(!el&&text){el=[...w.document.querySelectorAll("#view .card")].find(c=>c.innerText.toUpperCase().includes(text.toUpperCase()))}
    if(!el)return;el.scrollIntoView({block:"center",behavior:"smooth"});await sleep(700);if(hl)T.hl(el)},
  async tap(sel,doClick){const el=T.q(sel);if(!el)return;el.scrollIntoView({block:"center",behavior:"smooth"});await sleep(450);
    const r=el.getBoundingClientRect(),d=w.document.createElement("div");d.className="tour-tap";d.style.left=(r.left+r.width/2)+"px";d.style.top=(r.top+r.height/2)+"px";
    w.document.body.appendChild(d);setTimeout(()=>d.remove(),950);await sleep(350);if(doClick)el.click()},
  async type(sel,val){const el=T.q(sel);if(!el)return;el.scrollIntoView({block:"center"});el.focus();el.value="";
    for(const ch of String(val)){el.value+=ch;el.dispatchEvent(new w.Event("input",{bubbles:true}));await sleep(110)}el.dispatchEvent(new w.Event("change",{bubbles:true}));await sleep(200)}
};
function size(){const s=Math.min(1,(innerHeight-190)/844,(innerWidth-24)/390);ov.style.setProperty("--s",s);ov.style.setProperty("--pw",(390*s+24*s)+"px");ov.style.setProperty("--ph",(844*s+24*s)+"px")}
function bar(){ov.querySelector(".tour-bar").innerHTML=SC.map((_,i)=>`<i class="${i<idx?"done":""}"><b ${i===idx?'id="tourNow"':""}></b></i>`).join("")}
function anim(){const b=ov&&ov.querySelector("#tourNow");if(!b)return;const sc=SC[idx],done=playing?(sc.d-left)+(Date.now()-startedAt):(sc.d-left);b.style.width=Math.min(100,done/sc.d*100)+"%";if(ov)requestAnimationFrame(anim)}
async function show(i){if(!ov)return;idx=Math.max(0,Math.min(SC.length-1,i));const my=++token;clearTimeout(timer);const sc=SC[idx],l=L();
  ov.querySelector(".tour-end").classList.toggle("on",!!sc.end);
  ov.querySelector(".tour-cap").innerHTML=`<small>${idx+1} / ${SC.length} · ${TITLE[l]}</small><b>${sc.c[l]}</b>`;bar();
  left=sc.d;startedAt=Date.now();if(playing)timer=setTimeout(()=>{if(my===token)next()},left);
  try{await sc.run(T)}catch(e){console.warn("tour scene",e)}}
function next(){if(idx<SC.length-1)show(idx+1);else{playing=false;setPlay()}}
function setPlay(){const b=ov.querySelector("[data-t=play]");b.textContent=playing?"⏸":"▶";b.title=playing?"Pause":"Play"}
function toggle(){if(!playing){playing=true;startedAt=Date.now();if(idx===SC.length-1&&left<=0){show(0)}else timer=setTimeout(()=>next(),left)}else{playing=false;clearTimeout(timer);left=Math.max(0,left-(Date.now()-startedAt))}setPlay()}
function close(){clearTimeout(timer);token++;if(ov){ov.remove();ov=null}document.removeEventListener("keydown",key);window.removeEventListener("resize",size)}
function key(e){if(e.key==="Escape")close();else if(e.key==="ArrowRight")show(idx+1);else if(e.key==="ArrowLeft")show(idx-1);else if(e.key===" "){e.preventDefault();toggle()}}
function open(){if(ov)return;if(!document.getElementById("tourCss")){const st=document.createElement("style");st.id="tourCss";st.textContent=css;document.head.appendChild(st)}
  const l=L();ov=document.createElement("div");ov.className="tour-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-label",TITLE[l]);
  ov.innerHTML=`<div class="tour-box"><div class="tour-bar"></div>
    <div class="tour-phone"><div class="tour-scr"><div class="tour-notch"></div><div class="tour-load">Loading the tour…</div><iframe title="Tradeversity demo" src="${location.pathname}?demo=1#journal"></iframe>
      <div class="tour-end"><h2>${END[l][0]}</h2><p>${END[l][1]}</p><span class="tour-url">jointradeversity.com</span><a href="${location.pathname}" data-t="join">${END[l][2]}</a></div></div></div>
    <div class="tour-cap"></div>
    <div class="tour-ctrl"><button type="button" data-t="prev" title="Back">◀</button><button type="button" data-t="play" title="Pause">⏸</button><button type="button" data-t="next" title="Next">▶</button><button type="button" data-t="again" title="Restart">↺</button><button type="button" data-t="close" title="Close">✕</button></div></div>`;
  document.body.appendChild(ov);size();window.addEventListener("resize",size);document.addEventListener("keydown",key);
  ov.querySelector("[data-t=close]").onclick=close;ov.querySelector("[data-t=play]").onclick=toggle;
  ov.querySelector("[data-t=prev]").onclick=()=>show(idx-1);ov.querySelector("[data-t=next]").onclick=()=>show(idx+1);
  ov.querySelector("[data-t=again]").onclick=()=>{playing=true;setPlay();show(0)};
  ov.querySelector("[data-t=join]").onclick=e=>{e.preventDefault();close();if(document.getElementById("tabSignup")&&!document.getElementById("auth").classList.contains("hidden"))document.getElementById("tabSignup").click()};
  ov.addEventListener("click",e=>{if(e.target===ov)close()});
  ifr=ov.querySelector("iframe");playing=true;idx=0;
  const wait=async()=>{for(let i=0;i<80;i++){try{w=ifr.contentWindow;if(w&&w.__demoReady)break}catch(e){}await sleep(150)}
    /* inside the demo: no welcome tour on top, and the animated section backgrounds on */
    T.x('try{localStorage.setItem(tourKey(),"1");localStorage.setItem("tv_bg","3d");const x=document.querySelector(".tour-x,#tourSkip");x&&x.click()}catch(e){}');
    const ld=ov&&ov.querySelector(".tour-load");if(ld)ld.remove();if(ov){setPlay();show(0);requestAnimationFrame(anim)}};
  wait()}
window.Tour={open,close,go:i=>show(i)};
})();
