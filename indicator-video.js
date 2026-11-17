/* Animated explainer for the TRADEVERSITY NQ v1.3 indicator.
   Plays like a short video: an animated chart + the settings panel, with English and Arabic subtitles.
   Settings come from the real indicator (Inputs tab, read Nov 2026). */
(function(){
/* high resolution: 1200x600 drawing space, TradingView-style price scale on the right and time axis at the bottom */
const W=1200,H=600,N=64,X0=24,PX=W-132,DX=(PX-X0-70)/N,TOP=24,BOT=H-84;
/* ---------- fake but realistic NQ price path (seeded so it is always the same) ---------- */
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(23),C=[];let p=100;
const gauss=()=>(R()+R()+R()+R()-2)/1.15;
/* every candle is built from 16 simulated ticks, so bodies and wicks look like a real market */
for(let i=0;i<N;i++){
  let drift=0,vol=.45,v0=.35;
  if(i<16){drift=.02;vol=.32;v0=.25}                // Asia: tight range, low volume
  else if(i<24){drift=.5;vol=.55;v0=.55}            // London: run up
  else if(i<32){drift=-.25;vol=.5;v0=.45}           // London: pull back
  else if(i<40){drift=.05;vol=.32;v0=.3}            // pre-market
  if(i===40){p+=2.6}                                // 9:30 open gaps up = RTH gap
  if(i>=40&&i<44){drift=.1;vol=.6;v0=.8}
  if(i>=44&&i<47){drift=-1.7;vol=.25;v0=1}          // displacement down = first FVG
  if(i>=47&&i<56){drift=-.3;vol=.55;v0=.6}
  if(i>=56){drift=.55;vol=.55;v0=.65}
  const o=p;let h=o,l=o;
  for(let k=0;k<16;k++){p+=drift/16+gauss()*vol*.32;h=Math.max(h,p);l=Math.min(l,p)}
  const c=p;C.push({o,h,l,c,v:v0*(.7+R()*.6)+Math.abs(c-o)*.25})}
const lo=Math.min(...C.map(c=>c.l))-3,hi=Math.max(...C.map(c=>c.h))+3;
const Y=v=>BOT-(v-lo)/(hi-lo)*(BOT-TOP),XI=i=>X0+i*DX+DX/2,XE=PX;
const PRICE=v=>(21480+(v-100)*28).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const TIMES=[[0,"18:00"],[8,"20:00"],[16,"00:00"],[24,"02:00"],[32,"08:00"],[40,"09:30"],[48,"10:30"],[56,"11:30"],[63,"12:15"]];
const rangeHL=(a,b)=>{let h=-1e9,l=1e9;for(let i=a;i<=b;i++){h=Math.max(h,C[i].h);l=Math.min(l,C[i].l)}return{h,l}};
let fvg=null;for(let i=45;i<N-1;i++){if(C[i-1].l>C[i+1].h){fvg={i,top:C[i-1].l,bot:C[i+1].h};break}if(C[i-1].h<C[i+1].l){fvg={i,top:C[i+1].l,bot:C[i-1].h};break}}
const asia=rangeHL(0,15),lon=rangeHL(16,31),pm=rangeHL(32,39),mid=C[16].o,gapT=Math.max(C[39].c,C[40].o),gapB=Math.min(C[39].c,C[40].o);
const day=rangeHL(0,N-1),PDH=day.h+1.4,PDL=day.l-1.2,PWH=hi-.6,PML=lo+.5;
/* candles build one by one like a live chart (green = bullish, black = bearish), then the drawings appear */
const CC=32,B=N*CC+300;
const BULL="#089981",BEAR="#131722";
const VMAX=Math.max(...C.map(c=>c.v)),VH=62;
const snap=v=>Math.round(v*2)/2;
/* crisp candles: wick + body snapped to half pixels, TradingView proportions, volume bars underneath */
const candles=()=>C.map((c,i)=>{const x=snap(XI(i)),up=c.c>=c.o,col=up?BULL:BEAR,bw=Math.max(4,Math.round(DX*.7));
  const yt=snap(Math.min(Y(c.o),Y(c.c))),hb=Math.max(1.5,snap(Math.abs(Y(c.o)-Y(c.c)))),vh=Math.max(2,c.v/VMAX*VH);
  return `<g class="cdl${i===N-1?" live":""}" style="animation-delay:${i*CC}ms">
   <rect x="${x-bw/2}" y="${BOT-vh}" width="${bw}" height="${vh}" fill="${up?"rgba(8,153,129,.22)":"rgba(19,23,34,.16)"}"/>
   <line x1="${x}" x2="${x}" y1="${snap(Y(c.h))}" y2="${snap(Y(c.l))}" stroke="${col}" stroke-width="1.6" stroke-linecap="butt"/>
   <rect x="${x-bw/2}" y="${yt}" width="${bw}" height="${hb}" fill="${col}" stroke="${col}" stroke-width=".8" shape-rendering="crispEdges"/></g>`}).join("");
/* chart frame: grid, price scale with prices, time axis, live price line */
const frame=()=>{let g="";const steps=8;for(let k=0;k<=steps;k++){const v=lo+(hi-lo)*k/steps,y=Y(v);g+=`<line x1="${X0}" x2="${PX}" y1="${y}" y2="${y}" stroke="#eef0f4" stroke-width="1"/><text x="${PX+12}" y="${y+6}" class="tx-ax">${PRICE(v)}</text>`}
  TIMES.forEach(([i,t])=>{const x=XI(i);g+=`<line x1="${x}" x2="${x}" y1="${TOP}" y2="${BOT}" stroke="#f1f3f6" stroke-width="1"/><text x="${x}" y="${BOT+26}" class="tx-ax" text-anchor="middle">${t}</text>`});
  return g+`<line x1="${PX}" x2="${PX}" y1="0" y2="${H}" stroke="#e1e4ea" stroke-width="1.5"/><line x1="0" x2="${W}" y1="${BOT+6}" y2="${BOT+6}" stroke="#e1e4ea" stroke-width="1.5"/>`};
const tag=(v,col,a)=>`<g class="pop" style="animation-delay:${a}ms"><rect x="${PX+4}" y="${Y(v)-13}" width="${W-PX-8}" height="26" rx="4" fill="${col}"/><text x="${(PX+W)/2}" y="${Y(v)+6}" class="tx-tag" text-anchor="middle">${PRICE(v)}</text></g>`;
const livePrice=()=>{const c=C[N-1],col=c.c>=c.o?BULL:BEAR;return `<g class="pop" style="animation-delay:${N*CC}ms"><line x1="${X0}" x2="${PX}" y1="${Y(c.c)}" y2="${Y(c.c)}" stroke="${col}" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/></g>`+tag(c.c,col,N*CC)};
/* ---------- drawing helpers: each drawing grows from its start to the right edge, with its price tag on the scale ---------- */
const lbl=(x,y,t,col,end)=>`<text x="${x}" y="${y}" fill="${col}" class="tx-l" ${end?'text-anchor="end"':""}>${t}</text>`;
const G=(a,inner)=>`<g class="grow" style="animation-delay:${B+(a||0)}ms">${inner}</g>`;
const line=(y,col,t,a,dash)=>G(a,`<line x1="${X0}" x2="${XE}" y1="${Y(y)}" y2="${Y(y)}" stroke="${col}" stroke-width="2.4" ${dash?'stroke-dasharray="10 7"':""}/>${lbl(XE-10,Y(y)-8,t,col,1)}`)+tag(y,col,B+(a||0)+700);
const segLine=(i0,y,col,t,a,dash)=>G(a,`<line x1="${XI(i0)}" x2="${XE}" y1="${Y(y)}" y2="${Y(y)}" stroke="${col}" stroke-width="2.4" ${dash?'stroke-dasharray="10 7"':""}/>${lbl(XE-10,Y(y)-8,t,col,1)}`)+tag(y,col,B+(a||0)+700);
/* ext = box extended to the right edge of the chart */
const box=(i0,i1,top,bot,fill,stroke,t,a,ext)=>{const x=XI(i0)-DX/2,w=ext?XE-x:(i1-i0+1)*DX;
  return G(a,`<rect x="${x}" y="${Y(top)}" width="${w}" height="${Math.max(3,Y(bot)-Y(top))}" fill="${fill}" stroke="${stroke}" stroke-width="2" rx="3"/>${t?lbl(x+6,Y(top)-9,t,stroke):""}`)};
const fibs=(i0,top,bot,col,a)=>[.25,.5,.75].map((f,k)=>{const y=top-(top-bot)*f;return G((a||0)+k*160,`<line x1="${XI(i0)-DX/2}" x2="${XE}" y1="${Y(y)}" y2="${Y(y)}" stroke="${col}" stroke-width="1.6" stroke-dasharray="4 5"/>${lbl(XE-10,Y(y)-5,f,col,1)}`)}).join("");
const sessBands=()=>[[0,15,"ASIA"],[16,31,"LONDON"],[32,39,"PRE-MARKET"],[40,63,"NEW YORK"]].map(([a,b,t])=>`<rect x="${XI(a)-DX/2}" y="${H-14}" width="${(b-a+1)*DX-4}" height="4" rx="2" fill="#e6e9ef"/><text x="${(XI(a)+XI(b))/2}" y="${H-22}" class="tx-s" text-anchor="middle">${t}</text>`).join("");
/* light-chart palette */
const K={asia:"#c98a00",asiaF:"rgba(245,185,66,.14)",lon:"#2962ff",lonF:"rgba(41,98,255,.07)",mac:"#7e57c2",macF:"rgba(126,87,194,.10)",pm:"#00897b",
 fvg:"#d81b60",fvgF:"rgba(216,27,96,.09)",fvgFib:"#e8799f",mid:"#455a64",gap:"#ef6c00",gapF:"rgba(239,108,0,.10)",gapFib:"#f4a261",
 pdh:"#089981",pdl:"#e53935",pwh:"#2962ff",pml:"#7e57c2",nw:"#00838f",nwF:"rgba(0,131,143,.10)",nwFib:"#4fb3bd"};
/* ---------- scenes ---------- */
const S=[
 {t:["Meet the indicator","تعرّف على المؤشر"],rows:[],
  en:"TRADEVERSITY NQ v1.3 draws the ICT levels on your Nasdaq chart for you.",
  ar:"مؤشر TRADEVERSITY NQ v1.3 يرسم لك مستويات ICT على رسم ناسداك تلقائيًا.",
  draw:()=>`<g class="pop" style="animation-delay:${B}ms"><rect x="${PX/2-330}" y="${H/2-90}" width="660" height="140" rx="20" fill="rgba(255,255,255,.95)" stroke="#e3e6ec" stroke-width="2"/><text x="${PX/2}" y="${H/2-22}" text-anchor="middle" class="tx-big">TRADEVERSITY NQ</text><text x="${PX/2}" y="${H/2+22}" text-anchor="middle" class="tx-sub">Advanced ICT &amp; Liquidity Engine · v1.3</text></g>`+sessBands()},
 {t:["Timezone","المنطقة الزمنية"],sec:"TIMEZONE",rows:[["Timezone","America/New_York"]],
  en:"Everything runs on New York time, like ICT teaches. Keep America/New_York.",
  ar:"كل شيء يعمل بتوقيت نيويورك كما يعلّم ICT. اترك America/New_York.",
  draw:()=>sessBands()},
 {t:["Asia & London sessions","جلستا آسيا ولندن"],sec:"1. SESSIONS (ASIA & LONDON)",rows:[["Show Sessions","☑"],["Display Mode","Today Only"],["Asia Box / Border / Line Color","🎨"],["London Box / Border / Line Color","🎨"],["Text Color","🎨"]],
  en:"Asia and London ranges are drawn as boxes. Their highs and lows are liquidity the market often runs.",
  ar:"نطاقا آسيا ولندن يُرسمان كمربعات. قممهما وقيعانهما سيولة يذهب إليها السوق غالبًا.",
  draw:()=>box(0,15,asia.h,asia.l,K.asiaF,K.asia,"Asia",0)+box(16,31,lon.h,lon.l,K.lonF,K.lon,"London",500)+segLine(15,asia.h,K.asia,"Asia H",900,1)+segLine(15,asia.l,K.asia,"Asia L",1100,1)+segLine(31,lon.h,K.lon,"London H",1300,1)+segLine(31,lon.l,K.lon,"London L",1500,1)+sessBands()},
 {t:["Macros","الماكرو"],sec:"2. MACROS (ALL WINDOWS)",rows:[["Show Macros","☑"],["Display Mode","Today Only"],["Box / Border / Text Color","🎨"]],
  en:"Macros are short ICT time windows when price often makes a fast move. Each window gets its own box.",
  ar:"الماكرو نوافذ زمنية قصيرة في ICT يتحرك فيها السعر بسرعة غالبًا. كل نافذة لها مربع خاص.",
  draw:()=>{const m1=rangeHL(42,44),m2=rangeHL(52,54);return box(42,44,m1.h+.4,m1.l-.4,K.macF,K.mac,"Macro 9:50",0,1)+box(52,54,m2.h+.4,m2.l-.4,K.macF,K.mac,"Macro 10:50",700,1)+sessBands()}},
 {t:["Pre-market high & low","قمة وقاع ما قبل الافتتاح"],sec:"3. PREMARKET HIGH/LOW",rows:[["Show Premarket H/L","☑"],["Display Mode","Today Only"],["Line / Text Color","🎨"]],
  en:"The pre-market high and low before 9:30. Watch for a sweep of one of them after the open.",
  ar:"قمة وقاع ما قبل افتتاح 9:30. راقب كسر أحدهما (Sweep) بعد الافتتاح.",
  draw:()=>segLine(32,pm.h,K.pm,"PM High",0)+segLine(32,pm.l,K.pm,"PM Low",300)+sessBands()},
 {t:["First Presented FVG","أول فجوة FVG"],sec:"4. FIRST PRESENTED FVG",rows:[["Show FP.FVG","☑"],["Display Mode","All Week"],["Box / Border / Fib Levels Color","🎨"],["Min FVG Size (Points)","⇕"]],
  en:"The first fair value gap after the open, with its fib levels. Min FVG Size hides gaps that are too small.",
  ar:"أول فجوة قيمة عادلة بعد الافتتاح مع مستويات فيبوناتشي. Min FVG Size يُخفي الفجوات الصغيرة جدًا.",
  draw:()=>fvg?box(fvg.i-1,fvg.i+1,fvg.top,fvg.bot,K.fvgF,K.fvg,"FP.FVG",0,1)+fibs(fvg.i-1,fvg.top,fvg.bot,K.fvgFib,600)+sessBands():sessBands()},
 {t:["Midnight Open","افتتاح منتصف الليل"],sec:"5. MIDNIGHT OPEN",rows:[["Show Midnight Open","☑"],["Display Mode","Today Only"],["Today Line Color","🎨"],["Previous Days Color","🎨"],["Line Width","1"]],
  en:"The New York midnight open: price above it = premium, below it = discount. Past days can get a different color.",
  ar:"افتتاح منتصف الليل بتوقيت نيويورك: فوقه منطقة غلاء (Premium) وتحته منطقة خصم (Discount).",
  draw:()=>segLine(16,mid,K.mid,"Midnight open",0,1)+sessBands()},
 {t:["RTH Gap","فجوة الجلسة الرسمية"],sec:"6. RTH GAP",rows:[["Show RTH Gap","☑"],["Display Mode","Today Only"],["Box / Border / Fib Line Color","🎨"],["Fib Line Width","1"],["Auto-hide when gap is filled","☐"]],
  en:"The gap between yesterday's close and the 9:30 open, with fib lines. Turn on auto-hide to remove it once filled.",
  ar:"الفجوة بين إغلاق الأمس وافتتاح 9:30 مع خطوط فيبوناتشي. فعّل الإخفاء التلقائي لحذفها بعد امتلائها.",
  draw:()=>box(39,40,gapT,gapB,K.gapF,K.gap,"RTH gap",0,1)+fibs(39,gapT,gapB,K.gapFib,500)+sessBands()},
 {t:["HTF levels & NWOG","مستويات الإطار الكبير و NWOG"],sec:"7. HTF LEVELS & NWOG",rows:[["Show PDH/PDL","☐"],["Show PWH/PWL","☐"],["Show PMH/PML","☐"],["Line colors · Line Width","🎨"],["Show NWOG","☐"],["NWOG Box / Border / Fib Color","🎨"]],
  en:"Previous day, week and month highs and lows, plus the New Week Opening Gap (NWOG). Tick the ones you want.",
  ar:"قمم وقيعان اليوم والأسبوع والشهر السابق، مع فجوة افتتاح الأسبوع الجديد (NWOG). فعّل ما تحتاجه.",
  draw:()=>line(PDH,K.pdh,"PDH",0)+line(PDL,K.pdl,"PDL",250)+line(PWH,K.pwh,"PWH",500,1)+line(PML,K.pml,"PML",750,1)+box(0,1,C[0].o+.9,C[0].o-.9,K.nwF,K.nw,"NWOG",1000,1)+fibs(0,C[0].o+.9,C[0].o-.9,K.nwFib,1300)+sessBands()},
 {t:["Display Mode","وضع العرض"],sec:"DISPLAY MODE",rows:[["Today Only","clean chart"],["All Week","whole week"]],
  en:"Each section has a Display Mode: Today Only keeps the chart clean, All Week shows every day of the week.",
  ar:"كل قسم فيه وضع عرض: Today Only لرسم نظيف، و All Week لعرض كل أيام الأسبوع.",
  draw:()=>box(0,15,asia.h,asia.l,K.asiaF,K.asia,"Asia",0)+box(16,31,lon.h,lon.l,K.lonF,K.lon,"London",200)+segLine(16,mid,K.mid,"Midnight open",400,1)+(fvg?box(fvg.i-1,fvg.i+1,fvg.top,fvg.bot,K.fvgF,K.fvg,"FP.FVG",600,1):"")+line(PDH,K.pdh,"PDH",800)+sessBands()},
 {t:["Save your settings","احفظ إعداداتك"],sec:"",rows:[["Defaults","↺ reset"],["Ok","✓ save"]],
  en:"Click Ok to save, Defaults resets. Remember: this indicator makes your drawings easy, it does not take trades for you.",
  ar:"اضغط Ok للحفظ، و Defaults للإرجاع. تذكّر: هذا المؤشر يسهّل رسوماتك، ولا يأخذ الصفقات بدلًا عنك.",
  draw:()=>`<g class="pop" style="animation-delay:${B}ms"><rect x="${PX/2-330}" y="${H/2-86}" width="660" height="140" rx="20" fill="rgba(255,255,255,.95)" stroke="#e3e6ec" stroke-width="2"/><text x="${PX/2}" y="${H/2-18}" text-anchor="middle" class="tx-big">Plan · Levels · Execution</text><text x="${PX/2}" y="${H/2+24}" text-anchor="middle" class="tx-sub">TRADEVERSITY</text></g>`+sessBands()}
];
const SCENE_MS=9500;
function mount(root){
  root.innerHTML=`<div class="tvx" data-notr>
   <div class="tvx-screen">
    <svg class="tvx-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
     <rect width="${W}" height="${H}" fill="#ffffff"/>${frame()}
     <text x="${X0+4}" y="${TOP+20}" class="tx-sym">MNQ1! · 5m · CME</text><text x="${X0+4}" y="${TOP+44}" class="tx-ind">TRADEVERSITY NQ v1.3</text>
     <g class="tvx-c"></g><g class="tvx-lp"></g><g class="tvx-o"></g></svg>
    <div class="tvx-panel"><div class="tvx-ph"><b>TRADEVERSITY NQ</b><span>Inputs · Style · Visibility</span></div><div class="tvx-rows"></div></div>
    <div class="tvx-title"></div>
    <div class="tvx-subs"><div class="tvx-en"></div><div class="tvx-ar" dir="rtl" lang="ar"></div></div>
    <button type="button" class="tvx-big" aria-label="Play">▶</button>
   </div>
   <div class="tvx-ctrl"><button type="button" class="tvx-pp" aria-label="Play">▶</button><button type="button" class="tvx-pv" aria-label="Previous">⏮</button><button type="button" class="tvx-nx" aria-label="Next">⏭</button><button type="button" class="tvx-fs" aria-label="Full screen" title="Full screen">⛶</button>
    <div class="tvx-bar">${S.map((s,i)=>`<button type="button" class="tvx-seg" data-i="${i}" title="${s.t[0]}"><i></i></button>`).join("")}</div><span class="tvx-n"></span></div>
   <div class="tvx-chips">${S.map((s,i)=>`<button type="button" class="tvx-chip" data-i="${i}"><b>${i+1}</b> ${s.t[0]}<span dir="rtl">${s.t[1]}</span></button>`).join("")}</div>
  </div>`;
  const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
  let cur=0,playing=false,t0=0,elapsed=0,raf=0;
  const show=i=>{cur=(i+S.length)%S.length;const s=S[cur];
    $(".tvx-c").innerHTML=candles();$(".tvx-lp").innerHTML=livePrice();$(".tvx-o").innerHTML=s.draw();
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
  let started=false;
  const setPlay=v=>{playing=v;if(v)started=true;root.querySelector(".tvx").classList.toggle("playing",v);root.querySelector(".tvx").classList.toggle("paused",started&&!v);$(".tvx-pp").textContent=v?"⏸":"▶";$(".tvx-pp").setAttribute("aria-label",v?"Pause":"Play");
    cancelAnimationFrame(raf);if(v){t0=performance.now()-elapsed;raf=requestAnimationFrame(tick)}};
  const toggle=()=>{if(!playing&&cur===S.length-1&&elapsed>=SCENE_MS)show(0);setPlay(!playing)};
  $(".tvx-pp").onclick=toggle;$(".tvx-big").onclick=()=>{show(cur);setPlay(true)};$(".tvx-screen").addEventListener("click",e=>{if(e.target.closest("button"))return;toggle()});
  $(".tvx-pv").onclick=()=>{show(cur-1);if(playing)setPlay(true)};$(".tvx-nx").onclick=()=>{show(cur+1);if(playing)setPlay(true)};
  $$("[data-i]").forEach(b=>b.onclick=()=>{show(Number(b.dataset.i));setPlay(true)});
  $(".tvx-fs").onclick=()=>{const sc=root.querySelector(".tvx");if(document.fullscreenElement)document.exitFullscreen();else if(sc.requestFullscreen)sc.requestFullscreen().catch(()=>{});else if(sc.webkitRequestFullscreen)sc.webkitRequestFullscreen()};
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&playing)setPlay(false)});
  show(0);
  return{stop:()=>setPlay(false)}}
window.TVX={mount};
})();
