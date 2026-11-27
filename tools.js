/* Shared code for the public free-tool pages: language (EN/FR/AR, same saved choice as the help center), helpers.
   Nothing typed in these tools leaves the browser: no account, no cookies, no tracking. */
(function(){
  if(window.top!==window.self){try{window.top.location.replace(window.self.location.href)}catch(e){document.documentElement.style.display="none"}}
  var TV=window.TV={lang:"en",
    t:function(k,en){var d=(window.T&&window.T[TV.lang])||{};return d[k]!=null?d[k]:en},
    money:function(v,d){if(v==null||!isFinite(v))return "—";d=d==null?2:d;var s=Math.abs(v).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});return (v<0?"-$":"$")+s},
    pct:function(v,d){return isFinite(v)?(v*100).toFixed(d==null?0:d)+"%":"—"},
    num:function(v){var n=parseFloat(String(v==null?"":v).replace(",","."));return isFinite(n)?n:NaN},
    esc:function(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})},
    toast:function(m){var t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";t.setAttribute("role","status");document.body.appendChild(t)}
      t.textContent=m;t.classList.add("on");clearTimeout(TV._tt);TV._tt=setTimeout(function(){t.classList.remove("on")},1800)},
    setLang:function(l){if(["en","fr","ar"].indexOf(l)<0)l="en";TV.lang=l;var h=document.documentElement;h.lang=l;h.dir=l==="ar"?"rtl":"ltr";
      document.querySelectorAll("[data-t]").forEach(function(e){if(e._en==null)e._en=e.innerHTML;var d=(window.T&&window.T[l])||{};e.innerHTML=l!=="en"&&d[e.dataset.t]!=null?d[e.dataset.t]:e._en});
      document.querySelectorAll("[data-tp]").forEach(function(e){if(e._enp==null)e._enp=e.getAttribute("placeholder")||"";var d=(window.T&&window.T[l])||{};e.setAttribute("placeholder",l!=="en"&&d[e.dataset.tp]!=null?d[e.dataset.tp]:e._enp)});
      document.querySelectorAll("[data-l]").forEach(function(b){b.classList.toggle("on",b.dataset.l===l);b.setAttribute("aria-pressed",b.dataset.l===l)});
      try{localStorage.setItem("tvj_lang",l)}catch(e){}
      if(typeof window.onLang==="function")window.onLang()}};
  document.addEventListener("DOMContentLoaded",function(){
    var y=document.getElementById("yr");if(y)y.textContent=new Date().getFullYear();
    var tn=document.querySelector(".tnav"),on=tn&&tn.querySelector(".on");if(on){var r=on.getBoundingClientRect(),q=tn.getBoundingClientRect();if(r.right>q.right||r.left<q.left)tn.scrollLeft+=r.left-q.left-(q.width-r.width)/2}
    document.querySelectorAll("[data-l]").forEach(function(b){b.onclick=function(){TV.setLang(b.dataset.l)}});
    var s=null;try{s=localStorage.getItem("tvj_lang")}catch(e){}var nav=(navigator.language||"en").slice(0,2);
    TV.setLang(s||(["fr","ar"].indexOf(nav)>=0?nav:"en"))});
})();
