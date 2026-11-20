/* Cerebra by TDV explainer: a 45-second animated "video" of the course player, with sound,
   in the site language (EN / FR / AR). The animation is cerebra/intro.html (time-driven: seek(t)),
   played here in sync with cerebra/intro.m4a. Open it with CerebraIntro.open(). */
(function(){
const css=`
.ci-ov{position:fixed;inset:0;z-index:210;display:flex;align-items:center;justify-content:center;background:radial-gradient(900px 500px at 50% -10%,rgba(98,70,190,.38),transparent 70%),rgba(3,3,8,.95);backdrop-filter:blur(6px);color:#f5f7fa;font-family:Inter,system-ui,sans-serif}
.ci-box{display:flex;flex-direction:column;align-items:center;gap:10px}
.ci-frame{position:relative;width:calc(540px*var(--s));height:calc(960px*var(--s));border-radius:calc(26px*var(--s) + 6px);overflow:hidden;background:#04040a;box-shadow:0 0 0 1px rgba(245,185,66,.35),0 30px 90px -20px rgba(245,185,66,.35),0 0 120px -20px rgba(98,70,190,.6)}
.ci-frame iframe{position:absolute;left:0;top:0;width:540px;height:960px;border:0;transform-origin:0 0;transform:scale(var(--s));pointer-events:none}
.ci-load{position:absolute;inset:0;display:grid;place-items:center;color:#a0a6b8;font-size:13px;background:#04040a;z-index:2}
.ci-bar{width:calc(540px*var(--s));height:3px;border-radius:3px;background:rgba(255,255,255,.16);overflow:hidden}.ci-bar b{display:block;height:100%;width:0;background:linear-gradient(90deg,#f5b942,#ffd27a)}
.ci-ctrl{display:flex;gap:8px}
.ci-ctrl button{width:42px;height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;font-size:16px;cursor:pointer}
.ci-ctrl button:hover{background:rgba(245,185,66,.18);border-color:rgba(245,185,66,.6)}
.ci-tap{position:absolute;inset:0;z-index:3;cursor:pointer}
`;
const L=()=>{const l=(window.I18N&&I18N.lang)||"en";return ["en","fr","ar"].includes(l)?l:"en"};
let ov,ifr,w,au,DUR=44.5,t=0,playing=false,last=0,raf=0,muted=false;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function size(){if(!ov)return;const s=Math.min(1,(innerHeight-90)/960,(innerWidth-20)/540);ov.style.setProperty("--s",s)}
function frame(now){if(!ov)return;
  if(playing){if(au&&!au.paused&&!au.ended&&au.readyState>2)t=au.currentTime;else t+=(now-last)/1000;
    if(t>=DUR){t=DUR;setPlay(false)}}
  last=now;try{w&&w.seek&&w.seek(t)}catch(e){}
  const b=ov.querySelector(".ci-bar b");if(b)b.style.width=Math.min(100,t/DUR*100)+"%";
  raf=requestAnimationFrame(frame)}
function setPlay(on){playing=on;const b=ov&&ov.querySelector("[data-c=play]");if(b){b.textContent=on?"⏸":"▶";b.title=on?"Pause":"Play"}
  if(!au)return;if(on){try{if(Math.abs(au.currentTime-t)>.25)au.currentTime=t;au.muted=muted;const p=au.play();if(p)p.catch(()=>{})}catch(e){}}else au.pause()}
function toggle(){if(!playing&&t>=DUR)t=0;setPlay(!playing)}
function restart(){t=0;if(au)try{au.currentTime=0}catch(e){}setPlay(true)}
function mute(){muted=!muted;if(au)au.muted=muted;const b=ov.querySelector("[data-c=mute]");b.textContent=muted?"🔇":"🔊"}
function close(){cancelAnimationFrame(raf);if(au){au.pause();au=null}if(ov){ov.remove();ov=null}document.removeEventListener("keydown",key);removeEventListener("resize",size)}
function key(e){if(e.key==="Escape")close();else if(e.key===" "){e.preventDefault();toggle()}else if(e.key==="ArrowRight"){t=Math.min(DUR,t+5);if(au)au.currentTime=t}else if(e.key==="ArrowLeft"){t=Math.max(0,t-5);if(au)au.currentTime=t}}
function open(){if(ov)return;if(!document.getElementById("ciCss")){const st=document.createElement("style");st.id="ciCss";st.textContent=css;document.head.appendChild(st)}
  const l=L();ov=document.createElement("div");ov.className="ci-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Cerebra by TDV");
  ov.innerHTML=`<div class="ci-box"><div class="ci-frame"><div class="ci-load">…</div><iframe title="Cerebra by TDV" src="cerebra/intro.html?lang=${l}&v=1"></iframe><div class="ci-tap"></div></div>
    <div class="ci-bar"><b></b></div>
    <div class="ci-ctrl"><button type="button" data-c="play" title="Pause">⏸</button><button type="button" data-c="again" title="Restart">↺</button><button type="button" data-c="mute" title="Sound">🔊</button><button type="button" data-c="close" title="Close">✕</button></div></div>`;
  document.body.appendChild(ov);size();addEventListener("resize",size);document.addEventListener("keydown",key);
  ov.querySelector("[data-c=play]").onclick=toggle;ov.querySelector("[data-c=again]").onclick=restart;ov.querySelector("[data-c=mute]").onclick=mute;ov.querySelector("[data-c=close]").onclick=close;
  ov.querySelector(".ci-tap").onclick=toggle;ov.addEventListener("click",e=>{if(e.target===ov)close()});
  /* the sound starts inside this click, so phones allow it */
  au=new Audio("cerebra/intro.m4a?v=1");au.preload="auto";au.muted=true;try{au.play().then(()=>{if(!playing)au.pause();au.muted=muted}).catch(()=>{})}catch(e){}
  ifr=ov.querySelector("iframe");t=0;
  (async()=>{for(let i=0;i<100&&ov;i++){try{w=ifr.contentWindow;if(w&&w.ready){await w.ready;break}}catch(e){}await sleep(100)}
    if(!ov)return;try{if(w.DUR)DUR=w.DUR}catch(e){}
    const ld=ov.querySelector(".ci-load");if(ld)ld.remove();last=performance.now();setPlay(true);raf=requestAnimationFrame(frame)})()}
window.CerebraIntro={open,close};
})();
