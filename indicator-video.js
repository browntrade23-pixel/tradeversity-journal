/* Animated explainer for the TRADEVERSITY NQ v1.3 indicator.
   Plays like a short video: an animated chart + the settings panel, with English and Arabic subtitles.
   Settings come from the real indicator (Inputs tab, read Nov 2026). */
(function(){
const W=600,H=300,N=64,X0=16,DX=(W-90)/N;
/* ---------- fake but realistic NQ price path (seeded so it is always the same) ---------- */
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(23),C=[];let p=100;
for(let i=0;i<N;i++){
  let drift=0,vol=.45;
  if(i<16){drift=.02;vol=.35}                       // Asia: tight range
  else if(i<24){drift=.5;vol=.6}                    // London: run up
  else if(i<32){drift=-.25;vol=.55}                 // London: pull back
  else if(i<40){drift=.05;vol=.35}                  // pre-market
  else if(i===40){p+=2.6}                           // 9:30 open gaps up = RTH gap
  if(i>=40&&i<44){drift=.1;vol=.6}
  if(i>=44&&i<47){drift=-1.6;vol=.4}                // displacement down = first FVG
  if(i>=47&&i<56){drift=-.3;vol=.6}
  if(i>=56){drift=.55;vol=.6}
  const o=p,c=o+drift+(R()-.5)*vol*2;const h=Math.max(o,c)+R()*vol,l=Math.min(o,c)-R()*vol;C.push({o,h,l,c});p=c}
const lo=Math.min(...C.map(c=>c.l))-3,hi=Math.max(...C.map(c=>c.h))+3;
const Y=v=>H-26-(v-lo)/(hi-lo)*(H-44),XI=i=>X0+i*DX+DX/2,XE=W-74;
const rangeHL=(a,b)=>{let h=-1e9,l=1e9;for(let i=a;i<=b;i++){h=Math.max(h,C[i].h);l=Math.min(l,C[i].l)}return{h,l}};
let fvg=null;for(let i=45;i<N-1;i++){if(C[i-1].l>C[i+1].h){fvg={i,top:C[i-1].l,bot:C[i+1].h};break}if(C[i-1].h<C[i+1].l){fvg={i,top:C[i+1].l,bot:C[i-1].h};break}}
const asia=rangeHL(0,15),lon=rangeHL(16,31),pm=rangeHL(32,39),mid=C[16].o,gapT=Math.max(C[39].c,C[40].o),gapB=Math.min(C[39].c,C[40].o);
const day=rangeHL(0,N-1),PDH=day.h+1.4,PDL=day.l-1.2,PWH=hi-.6,PML=lo+.5;
const candles=()=>C.map((c,i)=>{const x=XI(i),up=c.c>=c.o,col=up?"#27c26c":"#ef5350";const yb=Math.min(Y(c.o),Y(c.c)),hb=Math.max(1.2,Math.abs(Y(c.o)-Y(c.c)));
  return `<g class="cdl" style="animation-delay:${i*14}ms"><line x1="${x}" x2="${x}" y1="${Y(c.h)}" y2="${Y(c.l)}" stroke="${col}" stroke-width="1"/><rect x="${x-DX*.32}" y="${yb}" width="${DX*.64}" height="${hb}" fill="${col}" rx=".6"/></g>`}).join("");
/* ---------- drawing helpers (each piece animates in) ---------- */
const lbl=(x,y,t,col)=>`<text x="${x}" y="${y}" fill="${col}" class="tx-l">${t}</text>`;
const line=(y,col,t,a,dash)=>`<g class="pop" style="animation-delay:${a||0}ms"><line class="draw" x1="${X0}" x2="${XE}" y1="${Y(y)}" y2="${Y(y)}" stroke="${col}" stroke-width="1.4" ${dash?'stroke-dasharray="5 4"':""}/>${lbl(XE+4,Y(y)+3,t,col)}</g>`;
const segLine=(i0,y,col,t,a,dash)=>`<g class="pop" style="animation-delay:${a||0}ms"><line class="draw" x1="${XI(i0)}" x2="${XE}" y1="${Y(y)}" y2="${Y(y)}" stroke="${col}" stroke-width="1.4" ${dash?'stroke-dasharray="5 4"':""}/>${lbl(XE+4,Y(y)+3,t,col)}</g>`;
const box=(i0,i1,top,bot,fill,stroke,t,a)=>`<g class="pop" style="animation-delay:${a||0}ms"><rect x="${XI(i0)-DX/2}" y="${Y(top)}" width="${(i1-i0+1)*DX}" height="${Math.max(2,Y(bot)-Y(top))}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" rx="2"/>${t?lbl(XI(i0)-DX/2+3,Y(top)-4,t,stroke):""}</g>`;
const fibs=(i0,top,bot,col,a)=>[.25,.5,.75].map((f,k)=>{const y=top-(top-bot)*f;return `<g class="pop" style="animation-delay:${(a||0)+k*180}ms"><line class="draw" x1="${XI(i0)-DX/2}" x2="${XE}" y1="${Y(y)}" y2="${Y(y)}" stroke="${col}" stroke-width=".9" stroke-dasharray="2 3"/>${lbl(XE+4,Y(y)+3,f,col)}</g>`}).join("");
const sessBands=()=>[[0,15,"Asia"],[16,31,"London"],[32,39,"Pre-market"],[40,63,"New York"]].map(([a,b,t])=>`<text x="${(XI(a)+XI(b))/2}" y="${H-8}" class="tx-s" text-anchor="middle">${t}</text>`).join("");
/* ---------- scenes ---------- */
const S=[
 {t:["Meet the indicator","تعرّف على المؤشر"],rows:[],
  en:"TRADEVERSITY NQ v1.3 draws the ICT levels on your Nasdaq chart for you.",
  ar:"مؤشر TRADEVERSITY NQ v1.3 يرسم لك مستويات ICT على رسم ناسداك تلقائيًا.",
  draw:()=>`<g class="pop"><text x="${W/2-30}" y="${H/2-10}" text-anchor="middle" class="tx-big">TRADEVERSITY NQ</text><text x="${W/2-30}" y="${H/2+14}" text-anchor="middle" class="tx-sub">Advanced ICT &amp; Liquidity Engine · v1.3</text></g>`},
 {t:["Timezone","المنطقة الزمنية"],sec:"TIMEZONE",rows:[["Timezone","America/New_York"]],
  en:"Everything runs on New York time, like ICT teaches. Keep America/New_York.",
  ar:"كل شيء يعمل بتوقيت نيويورك كما يعلّم ICT. اترك America/New_York.",
  draw:()=>sessBands()},
 {t:["Asia & London sessions","جلستا آسيا ولندن"],sec:"1. SESSIONS (ASIA & LONDON)",rows:[["Show Sessions","☑"],["Display Mode","Today Only"],["Asia Box / Border / Line Color","🎨"],["London Box / Border / Line Color","🎨"],["Text Color","🎨"]],
  en:"Asia and London ranges are drawn as boxes. Their highs and lows are liquidity the market often runs.",
  ar:"نطاقا آسيا ولندن يُرسمان كمربعات. قممهما وقيعانهما سيولة يذهب إليها السوق غالبًا.",
  draw:()=>box(0,15,asia.h,asia.l,"rgba(245,185,66,.12)","#f5b942","Asia",0)+box(16,31,lon.h,lon.l,"rgba(76,141,255,.12)","#4c8dff","London",500)+segLine(15,asia.h,"#f5b942","Asia H",900,1)+segLine(15,asia.l,"#f5b942","Asia L",1100,1)+segLine(31,lon.h,"#4c8dff","London H",1300,1)+sessBands()},
 {t:["Macros","الماكرو"],sec:"2. MACROS (ALL WINDOWS)",rows:[["Show Macros","☑"],["Display Mode","Today Only"],["Box / Border / Text Color","🎨"]],
  en:"Macros are short ICT time windows when price often makes a fast move. Each window gets its own box.",
  ar:"الماكرو نوافذ زمنية قصيرة في ICT يتحرك فيها السعر بسرعة غالبًا. كل نافذة لها مربع خاص.",
  draw:()=>{const m1=rangeHL(42,44),m2=rangeHL(52,54);return box(42,44,m1.h+.4,m1.l-.4,"rgba(160,123,255,.14)","#a07bff","Macro",0)+box(52,54,m2.h+.4,m2.l-.4,"rgba(160,123,255,.14)","#a07bff","Macro",600)+sessBands()}},
 {t:["Pre-market high & low","قمة وقاع ما قبل الافتتاح"],sec:"3. PREMARKET HIGH/LOW",rows:[["Show Premarket H/L","☑"],["Display Mode","Today Only"],["Line / Text Color","🎨"]],
  en:"The pre-market high and low before 9:30. Watch for a sweep of one of them after the open.",
  ar:"قمة وقاع ما قبل افتتاح 9:30. راقب كسر أحدهما (Sweep) بعد الافتتاح.",
  draw:()=>segLine(32,pm.h,"#2ec5c9","PM High",0)+segLine(32,pm.l,"#2ec5c9","PM Low",300)+sessBands()},
 {t:["First Presented FVG","أول فجوة FVG"],sec:"4. FIRST PRESENTED FVG",rows:[["Show FP.FVG","☑"],["Display Mode","All Week"],["Box / Border / Fib Levels Color","🎨"],["Min FVG Size (Points)","⇕"]],
  en:"The first fair value gap after the open, with its fib levels. Min FVG Size hides gaps that are too small.",
  ar:"أول فجوة قيمة عادلة بعد الافتتاح مع مستويات فيبوناتشي. Min FVG Size يُخفي الفجوات الصغيرة جدًا.",
  draw:()=>fvg?box(fvg.i,fvg.i+3,fvg.top,fvg.bot,"rgba(255,95,168,.16)","#ff5fa8","FP.FVG",0)+fibs(fvg.i,fvg.top,fvg.bot,"#ff9ac9",600)+sessBands():sessBands()},
 {t:["Midnight Open","افتتاح منتصف الليل"],sec:"5. MIDNIGHT OPEN",rows:[["Show Midnight Open","☑"],["Display Mode","Today Only"],["Today Line Color","🎨"],["Previous Days Color","🎨"],["Line Width","1"]],
  en:"The New York midnight open: price above it = premium, below it = discount. Past days can get a different color.",
  ar:"افتتاح منتصف الليل بتوقيت نيويورك: فوقه منطقة غلاء (Premium) وتحته منطقة خصم (Discount).",
  draw:()=>segLine(16,mid,"#e8ecf4","Midnight open",0,1)+sessBands()},
 {t:["RTH Gap","فجوة الجلسة الرسمية"],sec:"6. RTH GAP",rows:[["Show RTH Gap","☑"],["Display Mode","Today Only"],["Box / Border / Fib Line Color","🎨"],["Fib Line Width","1"],["Auto-hide when gap is filled","☐"]],
  en:"The gap between yesterday's close and the 9:30 open, with fib lines. Turn on auto-hide to remove it once filled.",
  ar:"الفجوة بين إغلاق الأمس وافتتاح 9:30 مع خطوط فيبوناتشي. فعّل الإخفاء التلقائي لحذفها بعد امتلائها.",
  draw:()=>box(39,46,gapT,gapB,"rgba(245,185,66,.18)","#f5b942","RTH gap",0)+fibs(39,gapT,gapB,"#ffd77a",500)+sessBands()},
 {t:["HTF levels & NWOG","مستويات الإطار الكبير و NWOG"],sec:"7. HTF LEVELS & NWOG",rows:[["Show PDH/PDL","☐"],["Show PWH/PWL","☐"],["Show PMH/PML","☐"],["Line colors · Line Width","🎨"],["Show NWOG","☐"],["NWOG Box / Border / Fib Color","🎨"]],
  en:"Previous day, week and month highs and lows, plus the New Week Opening Gap (NWOG). Tick the ones you want.",
  ar:"قمم وقيعان اليوم والأسبوع والشهر السابق، مع فجوة افتتاح الأسبوع الجديد (NWOG). فعّل ما تحتاجه.",
  draw:()=>line(PDH,"#27c26c","PDH",0)+line(PDL,"#ef5350","PDL",250)+line(PWH,"#4c8dff","PWH",500,1)+line(PML,"#a07bff","PML",750,1)+box(0,5,C[0].o+.9,C[0].o-.9,"rgba(46,197,201,.14)","#2ec5c9","NWOG",1000)+sessBands()},
 {t:["Display Mode","وضع العرض"],sec:"DISPLAY MODE",rows:[["Today Only","clean chart"],["All Week","whole week"]],
  en:"Each section has a Display Mode: Today Only keeps the chart clean, All Week shows every day of the week.",
  ar:"كل قسم فيه وضع عرض: Today Only لرسم نظيف، و All Week لعرض كل أيام الأسبوع.",
  draw:()=>box(0,15,asia.h,asia.l,"rgba(245,185,66,.12)","#f5b942","Asia",0)+box(16,31,lon.h,lon.l,"rgba(76,141,255,.12)","#4c8dff","London",200)+segLine(16,mid,"#e8ecf4","Midnight open",400,1)+(fvg?box(fvg.i,fvg.i+3,fvg.top,fvg.bot,"rgba(255,95,168,.16)","#ff5fa8","FP.FVG",600):"")+line(PDH,"#27c26c","PDH",800)+sessBands()},
 {t:["Save your settings","احفظ إعداداتك"],sec:"",rows:[["Defaults","↺ reset"],["Ok","✓ save"]],
  en:"Click Ok to save. Lost? Defaults puts everything back. Trade the levels with your plan, not alone.",
  ar:"اضغط Ok للحفظ. إذا ضعت، Defaults يُرجع كل شيء كما كان. تداول المستويات مع خطتك.",
  draw:()=>`<g class="pop"><text x="${W/2-30}" y="${H/2-6}" text-anchor="middle" class="tx-big">Plan · Levels · Execution</text><text x="${W/2-30}" y="${H/2+18}" text-anchor="middle" class="tx-sub">TRADEVERSITY</text></g>`}
];
const SCENE_MS=8000;
function mount(root){
  root.innerHTML=`<div class="tvx" data-notr>
   <div class="tvx-screen">
    <svg class="tvx-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><defs><pattern id="tvxg" width="40" height="30" patternUnits="userSpaceOnUse"><path d="M40 0H0V30" fill="none" stroke="rgba(255,255,255,.04)"/></pattern></defs>
     <rect width="${W}" height="${H}" fill="url(#tvxg)"/><g class="tvx-c">${candles()}</g><g class="tvx-o"></g></svg>
    <div class="tvx-panel"><div class="tvx-ph"><b>TRADEVERSITY NQ</b><span>Inputs · Style · Visibility</span></div><div class="tvx-rows"></div></div>
    <div class="tvx-title"></div>
    <div class="tvx-subs"><div class="tvx-en"></div><div class="tvx-ar" dir="rtl" lang="ar"></div></div>
    <button type="button" class="tvx-big" aria-label="Play">▶</button>
   </div>
   <div class="tvx-ctrl"><button type="button" class="tvx-pp" aria-label="Play">▶</button><button type="button" class="tvx-pv" aria-label="Previous">⏮</button><button type="button" class="tvx-nx" aria-label="Next">⏭</button>
    <div class="tvx-bar">${S.map((s,i)=>`<button type="button" class="tvx-seg" data-i="${i}" title="${s.t[0]}"><i></i></button>`).join("")}</div><span class="tvx-n"></span></div>
   <div class="tvx-chips">${S.map((s,i)=>`<button type="button" class="tvx-chip" data-i="${i}"><b>${i+1}</b> ${s.t[0]}<span dir="rtl">${s.t[1]}</span></button>`).join("")}</div>
  </div>`;
  const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
  let cur=0,playing=false,t0=0,elapsed=0,raf=0;
  const show=i=>{cur=(i+S.length)%S.length;const s=S[cur];
    $(".tvx-o").innerHTML=s.draw();
    $(".tvx-title").innerHTML=`<span>${cur+1}/${S.length}</span> ${s.t[0]} <em dir="rtl">${s.t[1]}</em>`;
    $(".tvx-en").textContent=s.en;$(".tvx-ar").textContent=s.ar;
    $$(".tvx-subs > div").forEach(d=>{d.classList.remove("in");void d.offsetWidth;d.classList.add("in")});
    $(".tvx-rows").innerHTML=(s.sec?`<div class="tvx-sec">${s.sec}</div>`:"")+(s.rows.length?s.rows.map((r,k)=>`<div class="tvx-row" style="animation-delay:${600+k*650}ms"><span>${r[0]}</span><b>${r[1]}</b></div>`).join(""):`<div class="tvx-row tvx-empty" style="animation-delay:300ms"><span>7 sections · 1 indicator</span><b>⚙️</b></div>`);
    root.querySelector(".tvx-panel").classList.toggle("hide",!s.rows.length&&cur===0);
    $$(".tvx-chip").forEach((c,k)=>c.classList.toggle("on",k===cur));
    $(".tvx-n").textContent=`${cur+1} / ${S.length}`;
    $$(".tvx-seg").forEach((g,k)=>g.querySelector("i").style.width=k<cur?"100%":"0%");
    elapsed=0;t0=performance.now()};
  const tick=now=>{if(!playing)return;if(!root.isConnected){playing=false;return}elapsed=now-t0;const f=Math.min(1,elapsed/SCENE_MS);$$(".tvx-seg")[cur].querySelector("i").style.width=f*100+"%";
    if(f>=1){if(cur===S.length-1){setPlay(false);$$(".tvx-seg")[cur].querySelector("i").style.width="100%";return}show(cur+1)}raf=requestAnimationFrame(tick)};
  const setPlay=v=>{playing=v;root.querySelector(".tvx").classList.toggle("playing",v);$(".tvx-pp").textContent=v?"⏸":"▶";$(".tvx-pp").setAttribute("aria-label",v?"Pause":"Play");
    cancelAnimationFrame(raf);if(v){t0=performance.now()-elapsed;raf=requestAnimationFrame(tick)}};
  const toggle=()=>{if(!playing&&cur===S.length-1&&elapsed>=SCENE_MS)show(0);setPlay(!playing)};
  $(".tvx-pp").onclick=toggle;$(".tvx-big").onclick=()=>{show(cur);setPlay(true)};$(".tvx-screen").addEventListener("click",e=>{if(e.target.closest("button"))return;toggle()});
  $(".tvx-pv").onclick=()=>{show(cur-1);if(playing)setPlay(true)};$(".tvx-nx").onclick=()=>{show(cur+1);if(playing)setPlay(true)};
  $$("[data-i]").forEach(b=>b.onclick=()=>{show(Number(b.dataset.i));setPlay(true)});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&playing)setPlay(false)});
  show(0);
  return{stop:()=>setPlay(false)}}
window.TVX={mount};
})();
