/* Earn2Trade partner code pop-up (BROWN23, -60%) + anonymous partner click counter for the public pages.
   Counts only: what happened (view / copy / link / close), which firm, which page. No account, no IP, no cookie.
   <script src="promo-e2t.js" data-place="landing" defer></script>   (data-popup="0" = count clicks only, no pop-up) */
(function(){
  var me=document.currentScript||{dataset:{}},PLACE=(me.dataset&&me.dataset.place)||"site",POP=!(me.dataset&&me.dataset.popup==="0");
  var SB="https://szovzzkukzuytkzieuae.supabase.co",KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6b3Z6emt1a3p1eXRremlldWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3ODIyMTgsImV4cCI6MjExMDM1ODIxOH0.hEcb4PhOIrKOZiwvMG6YQQHdR2zr1AhHOHmWeCSKJG0";
  var URL_E2T="https://www.earn2trade.com/?a_pid=BROWN23",CODE="BROWN23";
  var LOCAL=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  function track(kind,firm,place){if(LOCAL){(window.__affTest=window.__affTest||[]).push([kind,firm,place||PLACE]);return}try{fetch(SB+"/rest/v1/aff_clicks",{method:"POST",keepalive:true,headers:{"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json","Prefer":"return=minimal"},
    body:JSON.stringify({kind:kind,firm:String(firm||"").slice(0,40),place:String(place||PLACE).slice(0,40)})}).catch(function(){})}catch(e){}}
  window.TVAff={track:track};
  /* links to partner sites anywhere on the page are counted as "link" */
  document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||a.closest("#e2tPop"))return;var h=a.href.toLowerCase();
    var f=h.indexOf("earn2trade.com")>=0?"earn2trade":h.indexOf("bulenox.com")>=0?"bulenox":null;if(f)track("link",f,PLACE)},true);
  if(!POP)return;
  var T={en:["Partner offer","Earn2Trade evaluation","60% off with code","Copy","Copied","Get 60% off","Close","Education only. Most traders fail evaluations: only pay what you can afford to lose."],
    fr:["Offre partenaire","Évaluation Earn2Trade","-60 % avec le code","Copier","Copié","Obtenir -60 %","Fermer","Uniquement éducatif. La plupart des traders échouent aux évaluations : ne payez que ce que vous pouvez perdre."],
    ar:["عرض شريك","تقييم Earn2Trade","خصم 60% بالكود","نسخ","تم النسخ","احصل على خصم 60%","إغلاق","للتعليم فقط. معظم المتداولين يفشلون في التقييمات: لا تدفع إلا ما تستطيع خسارته."]};
  function hidden(){try{if(sessionStorage.getItem("tv_e2t_seen"))return true;var c=+localStorage.getItem("tv_e2t_closed")||0;return Date.now()-c<3*864e5}catch(e){return false}}
  function show(){if(hidden()||document.getElementById("e2tPop"))return;try{sessionStorage.setItem("tv_e2t_seen","1")}catch(e){}
    var l=(document.documentElement.lang||"en").slice(0,2),t=T[l]||T.en,rtl=l==="ar";
    var st=document.createElement("style");st.textContent="#e2tPop{position:fixed;z-index:9999;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translate(-50%,140%);width:min(420px,calc(100% - 24px));"
     +"border-radius:24px;padding:16px 16px 14px;color:#f3f4f7;font:14px/1.45 Geist,Inter,system-ui,sans-serif;background:radial-gradient(70% 90% at 100% 0%,rgba(190,50,70,.30),transparent 60%),radial-gradient(80% 100% at 0% 0%,rgba(60,90,200,.35),transparent 65%),rgba(16,18,26,.94);"
     +"border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px -20px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.10);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:transform .45s cubic-bezier(.2,.9,.25,1.1)}"
     +"#e2tPop.on{transform:translate(-50%,0)}#e2tPop .tg{display:inline-block;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#d9dce4}"
     +"#e2tPop .x{position:absolute;top:10px;inset-inline-end:10px;width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#c3c7d0;font-size:15px;cursor:pointer}"
     +"#e2tPop .hd{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:8px 0 10px}#e2tPop .hd b{font-size:16px}#e2tPop .hd small{display:block;color:#a3a8b5;font-size:12.5px}"
     +"#e2tPop .p{font-size:40px;font-weight:700;letter-spacing:-.04em;line-height:1}#e2tPop .cd{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px dashed rgba(232,207,165,.55);border-radius:14px;padding:8px 8px 8px 12px;background:rgba(232,207,165,.06)}"
     +"#e2tPop .cd b{font:700 19px 'Geist Mono',ui-monospace,monospace;letter-spacing:.12em;color:#f2dfbd}#e2tPop button.c,#e2tPop a.g{border-radius:999px;font:inherit;font-weight:650;cursor:pointer;text-decoration:none;text-align:center}"
     +"#e2tPop button.c{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#f3f4f7;padding:8px 14px}#e2tPop a.g{display:block;margin-top:10px;padding:12px;background:linear-gradient(180deg,#fff,#e6e8ee);color:#0d0f14}"
     +"#e2tPop .r{margin:8px 0 0;font-size:11px;color:#8b90a0}@media(prefers-reduced-motion:reduce){#e2tPop{transition:none}}";
    document.head.appendChild(st);
    var d=document.createElement("div");d.id="e2tPop";d.setAttribute("role","dialog");d.setAttribute("aria-label",t[1]);if(rtl)d.dir="rtl";
    d.innerHTML='<button class="x" type="button" aria-label="'+t[6]+'">✕</button><span class="tg">'+t[0]+'</span>'
     +'<div class="hd"><div><b>'+t[1]+'</b><small>'+t[2]+'</small></div><div class="p">-60%</div></div>'
     +'<div class="cd"><b>'+CODE+'</b><button class="c" type="button">'+t[3]+'</button></div>'
     +'<a class="g" href="'+URL_E2T+'" target="_blank" rel="sponsored noopener">'+t[5]+' ↗</a><p class="r">'+t[7]+'</p>';
    document.body.appendChild(d);requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add("on")})});
    track("view","earn2trade",PLACE+" popup");
    d.querySelector(".x").onclick=function(){d.classList.remove("on");try{localStorage.setItem("tv_e2t_closed",String(Date.now()))}catch(e){}track("close","earn2trade",PLACE+" popup");setTimeout(function(){d.remove()},500)};
    var cb=d.querySelector("button.c");cb.onclick=function(){var ok=function(){cb.textContent=t[4];setTimeout(function(){cb.textContent=t[3]},1600)};
      (navigator.clipboard?navigator.clipboard.writeText(CODE):Promise.reject()).then(ok,ok);track("copy","earn2trade",PLACE+" popup")};
    d.querySelector("a.g").onclick=function(){track("link","earn2trade",PLACE+" popup")};
    document.addEventListener("keydown",function k(e){if(e.key==="Escape"&&document.getElementById("e2tPop")){d.querySelector(".x").click();document.removeEventListener("keydown",k)}})}
  var go=function(){setTimeout(show,2500)};
  if(document.readyState==="complete")go();else addEventListener("load",go);
})();
