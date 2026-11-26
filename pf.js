/* TRADEVERSITY prop firm tracker page (loaded on demand by index.html). Shares index.html's globals (S, API, $, esc, I18N…). Split out on 2026-11-26 to make the app lighter. */
function pfVal(f,sec,key){const L=pfLoc(f)[sec]||[],i=(f[sec]||[]).findIndex(x=>x[0]===key);return i>=0&&L[i]?L[i][1]:"—"}
function pfCompare(){const P=window.PropFirms,ids=S._pfCmp||[],F=ids.map(id=>P.firms.find(x=>x.id===id)).filter(Boolean);if(F.length<2){toast(I18N.t("Pick at least 2 firms to compare"));return}
  const rows=[["Type",f=>f.type==="cfd"?"💹 CFD":"📈 Futures"],["Algeria",f=>(PFDZ[f.dz]||PFDZ.check)[0]+" "+I18N.t((PFDZ[f.dz]||PFDZ.check)[1])],["From",f=>{const v=pfFrom(f.id);return v?money(v,0):"—"}],
    ["Discount",f=>cpBadge(f.id)||"—"],["Sizes",f=>f.sizes.join(" · ")],["Profit target",f=>pfVal(f,"eval","t")],["Drawdown",f=>pfVal(f,"eval","dd")],["Daily loss",f=>pfVal(f,"eval","dl")],
    ["Consistency (evaluation)",f=>pfVal(f,"eval","cons")],["Consistency (funded)",f=>pfVal(f,"funded","cons")],["Profit split",f=>pfVal(f,"payout","split")],["Minimum payout",f=>pfVal(f,"payout","min")],["Payout timing",f=>pfVal(f,"payout","freq")]];
  openModal(`<div class="mhead"><h2>⇄ <span>Compare prop firms</span></h2><button class="x" id="mx">×</button></div>
   <div class="tw"><table class="t pf-cmp"><tr><th></th>${F.map(f=>`<th>${pfLogo(f)}<b data-notr>${esc(f.name)}</b></th>`).join("")}</tr>
   ${rows.map(([l,fn])=>`<tr><td><b>${esc(I18N.t(l))}</b></td>${F.map(f=>`<td data-notr>${l==="Discount"?fn(f):esc(fn(f))}</td>`).join("")}</tr>`).join("")}
   <tr><td></td>${F.map(f=>`<td><button class="btn sm pri" type="button" data-cmpopen="${f.id}">${esc(I18N.t("Open"))} ›</button></td>`).join("")}</tr></table></div>
   <p class="mut" style="font-size:12px;margin:10px 0 0"><span>Rules checked in November 2026 from public sources. Always confirm on the firm's official website before buying.</span></p>`);
  $("#mx").onclick=closeModal;$$("[data-cmpopen]").forEach(b=>b.onclick=()=>{closeModal();S._pfId=b.dataset.cmpopen;render();window.scrollTo(0,0)})}
function pfQuiz(){const P=window.PropFirms,A={type:S._pfType||"futures",budget:"any",dz:"yes",dd:"any"};
  const q=(k,t,opts)=>`<div class="qz-q"><b>${esc(I18N.t(t))}</b><div class="seg" data-qz="${k}">${opts.map(([v,l])=>`<button type="button" data-v="${v}" class="${A[k]===v?"on":""}">${esc(I18N.t(l))}</button>`).join("")}</div></div>`;
  const results=()=>{let L=P.firms.filter(f=>f.type===A.type);if(A.dz==="yes")L=L.filter(f=>f.dz==="yes"||f.dz==="likely");
    if(A.budget!=="any")L=L.filter(f=>{const v=pfFrom(f.id);return v!=null&&v<=Number(A.budget)});
    if(A.dd==="eod")L=L.filter(f=>/end.?of.?day|eod|static/i.test((f.eval||[]).map(x=>x[1]).join(" ")));
    L=L.map(f=>({f,p:pfFrom(f.id)})).sort((a,b)=>(!!cpBadge(b.f.id)-!!cpBadge(a.f.id))||((a.p??1e9)-(b.p??1e9))).slice(0,6);
    return L.length?L.map(({f,p})=>`<button type="button" class="qz-r" data-qzopen="${f.id}">${pfLogo(f)}<span><b data-notr>${esc(f.name)}</b>${cpBadge(f.id)}<small class="mut">${p?`<span>From</span> <span data-notr>${money(p,0)}</span> · `:""}<span data-notr>${esc(pfVal(f,"eval","dd"))}</span></small></span><span class="pf-go">›</span></button>`).join("")
      :`<p class="mut">${esc(I18N.t("No firm matches all your answers. Try a bigger budget or any drawdown type."))}</p>`};
  openModal(`<div class="mhead"><h2>🧭 <span>Find my prop firm</span></h2><button class="x" id="mx">×</button></div>
   ${q("type","What do you trade?",[["futures","📈 Futures"],["cfd","💹 CFD"]])}${q("budget","Your budget for one account",[["100","≤ $100"],["200","≤ $200"],["any","Any"]])}
   ${q("dd","Drawdown type",[["eod","End of day / static"],["any","Any"]])}${q("dz","I live in Algeria",[["yes","Yes"],["no","No"]])}
   <h3 style="margin:14px 0 8px">✨ <span>Best matches</span></h3><div id="qzRes" class="qz-res">${results()}</div>`);
  const bind=()=>$$("[data-qzopen]").forEach(b=>b.onclick=()=>{closeModal();S._pfId=b.dataset.qzopen;render();window.scrollTo(0,0)});bind();$("#mx").onclick=closeModal;
  $$("[data-qz]").forEach(s=>$$("button",s).forEach(b=>b.onclick=()=>{A[s.dataset.qz]=b.dataset.v;$$("button",s).forEach(x=>x.classList.toggle("on",x===b));$("#qzRes").innerHTML=results();bind()}))}
function vPropFirms(el){const P=window.PropFirms;if(!P){el.innerHTML='<div class="card empty">Loading…</div>';return}
  if(S._pfId){const f=P.firms.find(x=>x.id===S._pfId);if(f)return vPropFirm(el,f);S._pfId=null}
  const type=S._pfType||"futures",q=(S._pfQ||"").trim().toLowerCase(),dzOnly=!!S._pfDz,favs=pfFavs(),cmp=S._pfCmp||(S._pfCmp=[]);
  const list=P.firms.filter(f=>f.type===type&&(!q||f.name.toLowerCase().includes(q))&&(!dzOnly||f.dz==="yes"||f.dz==="likely")&&(!S._pfFavOnly||favs.includes(f.id)));
  const cnt=t=>P.firms.filter(f=>f.type===t).length,cntDz=t=>P.firms.filter(f=>f.type===t&&f.dz==="yes").length;
  let letter="";
  el.innerHTML=`<h1>Prop firm tracker</h1><p class="sub">Rules, hidden rules, payouts and Algeria availability of ${P.firms.length} prop firms. Tap a firm to see everything.</p>
   <div class="rtabs" role="tablist">
    <button type="button" data-pft="futures" class="${type==="futures"?"on":""}"><span class="rt-ic">📈</span><span class="rt-tx"><b>Futures prop firms</b><small>${cnt("futures")} <span>firms</span> · ${cntDz("futures")} 🇩🇿</small></span></button>
    <button type="button" data-pft="cfd" class="${type==="cfd"?"on":""}"><span class="rt-ic">💹</span><span class="rt-tx"><b>CFD prop firms</b><small>${cnt("cfd")} <span>firms</span> · ${cntDz("cfd")} 🇩🇿</small></span></button></div>
   <div class="pf-tools"><input class="i" id="pfQ" placeholder="Search a prop firm…" value="${esc(S._pfQ||"")}" data-noswipe>
    <label class="pf-dz"><input type="checkbox" id="pfDz" ${dzOnly?"checked":""}> <span>🇩🇿 Only firms open to Algeria</span></label>
    <label class="pf-dz"><input type="checkbox" id="pfFav" ${S._pfFavOnly?"checked":""}> <span>⭐ My favourites</span></label>
    <button type="button" class="btn sm pri" id="pfQuizB">🧭 <span>Find my prop firm</span></button></div>
   <div class="pf-legend">${Object.values(PFDZ).map(d=>`<span class="dz-b ${d[2]}">${d[0]} <span>${d[1]}</span></span>`).join("")}</div>
   <div class="pf-bar"><span class="mut">${list.length} <span>firms</span></span></div>
   <div class="pf-list">${list.length?list.map(f=>{const L=f.name.replace(/^The /,"").charAt(0).toUpperCase();const h=L!==letter?(letter=L,`<div class="pf-letter"><span>${L}</span></div>`):"";
     const mini=(ic,t,items,cl)=>items&&items.length?`<div class="pf-mini ${cl}"><h4>${ic} <span>${t}</span></h4><ul>${items.map(pfLi).join("")}</ul></div>`:"";
     f=Object.assign({},f,pfLoc(f));
     return `${h}<div class="pf-item ${f.type}"><button type="button" class="pf-row" data-pf="${f.id}">${pfLogo(f)}<span class="pf-tx"><b data-notr>${esc(f.name)}</b>${cpBadge(f.id)}<span class="pf-szp" data-notr>${f.sizes.map(s=>sizeChip(f,s)).join("")}</span></span>${dzBadge(f)}<span class="pf-go">›</span></button>
      <div class="pf-acts"><button type="button" class="pf-a ${favs.includes(f.id)?"on":""}" data-pfav="${f.id}">${favs.includes(f.id)?"★":"☆"} <span>${favs.includes(f.id)?"Favourite":"Add to favourites"}</span></button><button type="button" class="pf-a ${cmp.includes(f.id)?"on":""}" data-pcmp="${f.id}">⇄ <span>${cmp.includes(f.id)?"In comparison":"Compare"}</span></button></div>
      <details class="pf-rules" data-pfr="${f.id}"${(S._pfOpen||{})[f.id]?" open":""}><summary><span class="pfr-show">📖 <span>Show rules</span> ▾</span><span class="pfr-hide">▴ <span>Hide rules</span></span></summary>
       <div class="pf-grid">${mini("📝","Evaluation: rules",f.eval,"r")}${mini("🕵️","Evaluation: hidden rules",f.evalH,"h")}${mini("🏦","Funded: rules",f.funded,"r f")}${mini("🕵️","Funded: hidden rules",f.fundedH,"h")}</div>
       ${mini("💸","Withdrawal conditions",f.payout,"p")}</details></div>`}).join("")
     :`<div class="card empty">No prop firm found.</div>`}</div>
   <div class="card pf-common"><h3>🕵️ Rules that hide in almost every prop firm</h3><p class="mut" style="font-size:13px;margin-top:-4px">Read the FAQ and terms for these before you pay. They break more accounts than the profit target.</p>
    <div class="pfc-grid">${pfCommon().map(([ic,t,d])=>`<div class="pfc" data-notr><span class="pfc-ic">${ic}</span><div><b>${esc(t)}</b><p>${esc(d)}</p></div></div>`).join("")}</div></div>
   <p class="mut pf-disc">ℹ️ <span>Rules checked in November 2026 from public sources. Prop firms change rules often: always confirm on the firm's official website before buying. Algeria availability comes from published restricted-country lists; ✅ means accepted, ⛔ means restricted.</span></p>`;
  $$("[data-pft]",el).forEach(b=>b.onclick=()=>{S._pfType=b.dataset.pft;render()});
  $$("[data-pf]",el).forEach(b=>b.onclick=()=>{S._pfId=b.dataset.pf;S._couponTried=false;render();window.scrollTo(0,0)});
  const qi=$("#pfQ",el);qi.oninput=()=>{S._pfQ=qi.value;const p=qi.selectionStart;render();const n=$("#pfQ");n.focus();n.setSelectionRange(p,p)};
  $("#pfDz",el).onchange=e=>{S._pfDz=e.target.checked;render()};
  /* each firm opens / closes its own rules; remembered while you browse */
  $$("details[data-pfr]",el).forEach(d=>d.ontoggle=()=>{S._pfOpen=S._pfOpen||{};S._pfOpen[d.dataset.pfr]=d.open});
  $("#pfFav",el).onchange=e=>{S._pfFavOnly=e.target.checked;render()};$("#pfQuizB",el).onclick=pfQuiz;
  $$("[data-pfav]",el).forEach(b=>b.onclick=()=>{const F=pfFavs(),id=b.dataset.pfav,i=F.indexOf(id);if(i>=0)F.splice(i,1);else F.push(id);try{localStorage.setItem(pfFavKey,JSON.stringify(F))}catch(e){}settingsPush();render()});
  $$("[data-pcmp]",el).forEach(b=>b.onclick=()=>{const C=S._pfCmp,id=b.dataset.pcmp,i=C.indexOf(id);if(i>=0)C.splice(i,1);else{if(C.length>=3){toast(I18N.t("You can compare up to 3 firms"));return}C.push(id)}render()});
  let tray=$("#pfTray");if(!tray){tray=document.createElement("div");tray.id="pfTray";document.body.appendChild(tray)}
  tray.className=S._pfCmp.length&&S.view==="propfirms"&&!S._pfId?"on":"";tray.innerHTML=`<span>⇄ <b data-notr>${S._pfCmp.length}/3</b> <span>${esc(I18N.t("firms to compare"))}</span></span><button type="button" class="btn sm pri" id="pfCmpGo">${esc(I18N.t("Compare"))}</button><button type="button" class="btn sm" id="pfCmpX">✕</button>`;
  $("#pfCmpGo").onclick=pfCompare;$("#pfCmpX").onclick=()=>{S._pfCmp=[];render()}}
function vPropFirm(el,f){const d=PFDZ[f.dz]||PFDZ.check;f=Object.assign({},f,pfLoc(f));
  const sec=(ic,t,items,cl)=>items&&items.length?`<div class="card pf-sec ${cl||""}"><h3>${ic} ${t}</h3><ul>${items.map(pfLi).join("")}</ul></div>`:"";
  el.innerHTML=`<div class="page pf-page">
   <div class="row" style="justify-content:space-between;margin-bottom:14px"><button class="btn sm" id="pfBack">← <span>All prop firms</span></button>
    <a class="btn sm" href="${PF_AFF[f.id]||"https://"+f.site}" target="_blank" rel="${PF_AFF[f.id]?"sponsored noopener":"noopener nofollow"}">↗ <span>Official website</span></a></div>
   <div class="pf-hero ${f.type}">${pfLogo(f,64)}<div><h1 data-notr>${esc(f.name)}</h1><div class="pf-meta"><span class="kind-b ${f.type==="cfd"?"cfd":"fut"}">${f.type==="cfd"?"💹 CFD":"📈 Futures"}</span> <span class="mut" data-notr>${esc(f.site)}</span></div></div></div>
   <div class="dz-box ${d[2]}"><span class="dz-flag">🇩🇿</span><div><b>${d[0]} ${d[1]}</b>${f.dzNote?`<p data-notr>${esc(f.dzNote)}</p>`:f.dz==="yes"?`<p>Algeria is not on this firm's restricted list.</p>`:f.dz==="no"?`<p>Algeria is on this firm's restricted-country list. A payout can be refused even after you pass.</p>`:`<p>Not confirmed. Ask the firm's support before paying.</p>`}</div></div>
   <div class="card pf-sec sz-card" id="szCard">${sizeCard(f)}</div>
   <div class="pf-cols">
    ${sec("📝","Evaluation phase: rules",f.eval)}
    ${sec("🕵️","Evaluation phase: hidden rules",f.evalH,"hid")}
    ${sec("🏦","Funded phase: rules",f.funded)}
    ${sec("🕵️","Funded phase: hidden rules",f.fundedH,"hid")}
   </div>
   ${sec("💸","Withdrawal conditions",f.payout,"pay")}
   <p class="mut pf-disc">ℹ️ <span>Checked in November 2026. Rules change often and can differ between plans. Confirm everything on the official website before buying.</span></p>
  </div>`;
  $("#pfBack").onclick=()=>{S._pfId=null;render();window.scrollTo(0,0)};bindSizeCard(f)}
const usd=v=>v==null||v===""?null:typeof v==="number"?money(v,0):"$"+String(v).replace(/^~/,"≈ ");
/* price text: numbers are USD; text keeps its note ("139/mo", "≈ 150–160", "≈96 (€89)") */
const priceTxt=v=>{if(v==null||v==="")return null;if(typeof v==="number")return money(v,v%1?2:0);const s=String(v).trim();
  return (s[0]==="≈"?"≈ $"+s.slice(1).trim():"$"+s).replace("/mo"," / "+I18N.t("month"))};
const firstNum=v=>typeof v==="number"?v:(m=>m?Number(m[0].replace(/,/g,"")):null)(String(v||"").match(/[\d,]+(\.\d+)?/));
const progHas=(P,s)=>!!(P&&(P.pct||(P.rows&&P.rows[s])));
/* price of one size: from a given plan, or the cheapest plan that has it */
function sizePrice(id,s,pi){const D=(window.PF_SIZES||{})[id];if(!D)return null;const ps=pi!=null?[D.progs[pi]]:D.progs;let best=null,bv=null;
  ps.forEach(P=>{if(!P)return;const raw=(P.rows&&P.rows[s]&&P.rows[s].price)??(P.prices&&P.prices[s]);if(raw==null)return;const v=firstNum(raw);if(best==null||(v!=null&&(bv==null||v<bv))){best=raw;bv=v}});return best}
/* one size in the list: firms with my coupon show the official price crossed out and the coupon price,
   taken from the plan the code works on (e.g. Bulenox Option 1) */
function sizeChip(f,s){const k=Object.keys(COUPONS).find(c=>COUPONS[c][f.id]),d=k&&COUPONS[k][f.id],D=(window.PF_SIZES||{})[f.id];
  if(d&&D){const pi=d.prog?D.progs.findIndex(p=>p.name.startsWith(d.prog)):null,p=sizePrice(f.id,s,pi!=null&&pi>=0?pi:null),v=firstNum(p);
    if(v!=null){const mo=/\/mo/.test(String(p)),a=v*(1-d.pct/100),m=x=>money(x,x%1?2:0)+(mo?"/"+I18N.t("mo"):"");
      return `<span class="pf-sz cp"><b>${esc(s)}</b><s>${m(v)}</s><i>${m(a)}</i></span>`}}
  const p=sizePrice(f.id,s);return `<span class="pf-sz"><b>${esc(s)}</b>${p!=null?`<i>${esc(priceTxt(p))}</i>`:""}</span>`}
/* badge in the list for firms that have one of my coupon codes */
function cpBadge(id){const k=Object.keys(COUPONS).find(c=>COUPONS[c][id]);if(!k)return "";const d=COUPONS[k][id];
  return `<span class="pf-cp">🏷️ <b data-notr>-${d.pct}%</b> <span>with</span> <b data-notr>${esc(k)}</b>${d.prog?` <span class="mut" data-notr>(${esc(d.prog)})</span>`:""}</span>`}
/* cheapest listed price of a firm (for the list) */
function pfFrom(id){const D=(window.PF_SIZES||{})[id];if(!D)return null;let m=null;
  D.progs.forEach(P=>{Object.values(P.rows||{}).forEach(r=>{const v=firstNum(r.price);if(v&&(m==null||v<m))m=v});Object.values(P.prices||{}).forEach(p=>{const v=firstNum(p);if(v&&(m==null||v<m))m=v})});return m}
function sizeCard(f){const D=(window.PF_SIZES||{})[f.id],progs=D?D.progs:[];
  /* firms without a clear size list: show example sizes so percentages still turn into dollars */
  const ex=!szNum(f.sizes[0]),SZ=ex?["$10K","$25K","$50K","$100K","$200K"]:f.sizes;f={...f,sizes:SZ};
  if(!S._pfSz||S._pfSz.id!==f.id){const def=f.sizes.find(s=>progHas(progs[0],s)&&s!==f.sizes[0])||f.sizes.find(s=>progHas(progs[0],s))||f.sizes[0];S._pfSz={id:f.id,size:def,p:0}}
  /* if the chosen size is not in this plan, switch to a plan that has it */
  if(progs.length&&!progHas(progs[S._pfSz.p],S._pfSz.size)){const k=progs.findIndex(P=>progHas(P,S._pfSz.size));if(k>=0)S._pfSz.p=k}
  const sel=S._pfSz,pi=Math.min(sel.p,Math.max(0,progs.length-1)),P=progs[pi],size=sel.size,n=szNum(size);
  let tiles="",cover=true;
  /* the price only changes AFTER the user clicks Apply with a code that works on this firm */
  const cc=(S._coupon||"").trim().toUpperCase(),deal=S._couponTried&&dealFor(cc,f.id,P);
  const priceTile=raw=>{const v=firstNum(raw),mo=/\/mo/.test(String(raw));
    if(!deal||v==null)return tile("💳","Price",esc(priceTxt(raw)),"","price");
    const a=v*(1-deal.pct/100),m=x=>money(x,x%1?2:0)+(mo?" / "+I18N.t("month"):"");
    return `<div class="sz-t price disc"><span class="sz-l">💳 <span>Price</span> <span class="cp-pct" data-notr>-${deal.pct}%</span></span><b class="mono" data-notr>${m(a)}</b><small><s data-notr>${m(v)}</s> · <span>with</span> <span data-notr>${esc(cc)}</span></small></div>`};
  const tile=(ic,lb,val,sub,cl)=>val==null?"":`<div class="sz-t ${cl||""}"><span class="sz-l">${ic} <span>${lb}</span></span><b class="mono" data-notr>${val}</b>${sub?`<small>${sub}</small>`:""}</div>`;
  if(P&&P.pct){const q=P.pct,$p=v=>money(n*v/100,0);
    tiles+=q.t1!=null?tile("🎯",q.t2!=null?"Profit target · phase 1":"Profit target",$p(q.t1),`${q.t1}%`,"good"):"";
    tiles+=q.t2!=null?tile("🎯","Profit target · phase 2",$p(q.t2),`${q.t2}%`,"good"):"";
    tiles+=q.dl!=null?tile("📉","Daily loss limit",$p(q.dl),`${q.dl}%`,"bad"):"";
    tiles+=q.dd!=null?tile("🛑","Max drawdown",$p(q.dd),`${q.dd}% · ${esc(I18N.t(P.ddT||""))}`,"bad"):"";
    tiles+=q.dd!=null?tile("⚠️","Account fails below",money(n-n*q.dd/100,0),"Starting balance minus max drawdown","warn"):"";
    tiles+=P.prices&&P.prices[size]!=null?priceTile(P.prices[size]):""}
  else if(P&&P.rows&&P.rows[size]){const r=P.rows[size];
    tiles+=tile("🎯","Profit target",usd(r.t),r.t&&typeof r.t==="number"?`${+(r.t/n*100).toFixed(1)}%`:"","good");
    tiles+=tile("🛑","Max drawdown",usd(r.dd),esc(I18N.t(P.ddT||"")),"bad");
    tiles+=r.dl===0?tile("📉","Daily loss limit",esc(I18N.t("None")),"","good"):typeof r.dl==="string"?tile("📉","Daily loss limit",esc(r.dl),"","bad"):tile("📉","Daily loss limit",usd(r.dl),"","bad");
    tiles+=tile("📊","Max contracts",r.ct!=null?esc(r.ct):null,"");
    tiles+=tile("📅","Minimum trading days",r.days!=null?String(r.days):null,"");
    tiles+=r.price!=null?priceTile(r.price):"";
    tiles+=typeof r.dd==="number"?tile("⚠️","Account fails below",money(n-r.dd,0),"At the start, before the drawdown trails","warn"):""}
  else cover=false;
  return `<h3>💰 <span>Choose your account size</span></h3>${ex?`<p class="mut" style="font-size:12.5px;margin:-4px 0 8px">ℹ️ <span>Example sizes: check which sizes this firm sells on its website.</span></p>`:""}
   <div class="sz-pick" data-noswipe>${f.sizes.map(s=>{const p=sizePrice(f.id,s,pi);return `<button type="button" class="sz-b ${s===size?"on":""}" data-sz="${s}">${s}${p!=null?`<small data-notr>${esc(priceTxt(p))}</small>`:""}</button>`}).join("")}</div>
   ${progs.length>1?`<div class="sz-progs">${progs.map((p,i)=>`<button type="button" class="sz-p ${i===pi?"on":""}" data-szp="${i}" data-notr>${esc(p.name)}</button>`).join("")}</div>`:P?`<div class="mut sz-pn" data-notr>${esc(P.name)}</div>`:""}
   ${cover&&tiles?`<div class="sz-grid">${tiles}</div>${P.note?`<p class="sz-note" data-notr>💡 ${esc(P.note)}</p>`:""}${couponBox(f,P,size)}`
     :`<div class="sz-none">ℹ️ <span>No numbers for this size in this plan yet. Try another size.</span></div>`}
   <p class="mut" style="font-size:12px;margin:10px 0 0" data-notr>${esc(f.plans||"")}</p>
   <p class="mut sz-src"><span>Figures reported by review sites, checked November 2026. Confirm on the official website before buying.</span></p>`}
/* ---------- partner coupon codes: which firm each code works on, the discount and the offer link ----------
   To add a code for another firm: COUPONS.CODE = { firmId:{pct:XX, url:"https://..."} } */
const dealFor=(code,fid,P)=>{const d=COUPONS[code]&&COUPONS[code][fid];return d&&(!d.prog||(P&&P.name.startsWith(d.prog)))?d:null};
/* the coupon box only shows on firms that have one of my codes, already filled in */
const firmCode=fid=>Object.keys(COUPONS).find(k=>COUPONS[k][fid]);
function couponBox(f,P,size){const own=firmCode(f.id);if(!own)return "";
  if(S._couponFirm!==f.id){S._couponFirm=f.id;S._coupon=own;S._couponTried=false}
  const raw=P&&((P.rows&&P.rows[size]&&P.rows[size].price)??(P.prices&&P.prices[size]));
  const code=(S._coupon||"").trim().toUpperCase(),c=code&&COUPONS[code],deal=c&&dealFor(code,f.id,P);let res="";
  if(code&&S._couponTried){
    if(!c)res=`<div class="cp-res bad">✖ <span>This code doesn't exist.</span></div>`;
    else if(!deal&&c[f.id]&&c[f.id].prog){const k=(((window.PF_SIZES||{})[f.id]||{progs:[]}).progs).findIndex(p=>p.name.startsWith(c[f.id].prog));
      res=`<div class="cp-res warn">ℹ️ <span>On this firm the code works on this plan only:</span> <b data-notr>${esc(c[f.id].prog)}</b> ${k>=0?`<button type="button" class="btn sm" data-cpprog="${k}">➜ <span>Switch plan</span></button>`:""}</div>`}
    else if(!deal){const ids=Object.keys(c),nm=id=>(PropFirms.firms.find(x=>x.id===id)||{}).name||id;
      res=`<div class="cp-res warn">ℹ️ <span>This code works on</span> <b data-notr>${ids.map(id=>esc(nm(id))).join(", ")}</b><span>, not on this firm.</span> ${ids.map(id=>`<button type="button" class="btn sm" data-cpgo="${id}">➜ <span data-notr>${esc(nm(id))}</span></button>`).join(" ")}</div>`}
    else{const v=firstNum(raw),mo=/\/mo/.test(String(raw)),after=v!=null?v*(1-deal.pct/100):null;
      res=`<div class="cp-res good"><div class="cp-top">✅ <b data-notr>${esc(code)}</b> <span>applied:</span> <span class="cp-pct" data-notr>-${deal.pct}%</span></div>
       ${v!=null?`<div class="cp-prices"><span class="cp-old mono" data-notr>${money(v,v%1?2:0)}${mo?" / "+esc(I18N.t("month")):""}</span><span class="cp-arrow">→</span><span class="cp-new mono" data-notr>${money(after,after%1?2:0)}${mo?" / "+esc(I18N.t("month")):""}</span>
         <span class="cp-save"><span>You save</span> <b class="mono" data-notr>${money(v-after,(v-after)%1?2:0)}</b></span></div>`:""}
       <div class="cp-steps"><b>Next step:</b> <span>open the offer, then use the code</span> <b class="cp-code mono" data-notr>${esc(code)}</b> <span>at checkout.</span></div>
       <div class="cp-acts"><a class="btn pri cp-go" href="${deal.url}" target="_blank" rel="sponsored noopener" data-cpcode="${esc(code)}">🎁 <span>Get this offer</span></a>
        <button type="button" class="btn cp-copy" data-cpcopy="${esc(code)}">📋 <span>Copy code</span></button></div>
       <small class="mut"><span>Opening the offer also copies the code for you: paste it at checkout if it is not already applied.</span></small></div>`}}
  return `<div class="cp-box"><div class="cp-l">🏷️ <b>My coupon code for this firm</b> <span class="mut">· <span>click Apply to see your discount</span></span></div>
    <div class="cp-form"><input class="i cp-in" id="cpIn" value="${esc(S._coupon||"")}" placeholder="${esc(own)}" autocomplete="off" data-noswipe><button type="button" class="btn pri cp-apply" id="cpApply">Apply</button></div>${res}</div>`}
/* copy the code (used by "Copy code" and when opening the offer) */
async function copyCode(t){try{await navigator.clipboard.writeText(t)}catch(e){const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy")}catch(_){}a.remove()}toast(I18N.t("Code copied")+": "+t)}
function bindSizeCard(f){const c=$("#szCard");if(!c)return;
  const ci=$("#cpIn",c),ca=$("#cpApply",c);
  if(ca){const ap=()=>{S._coupon=ci.value;S._couponTried=true;if(String(ci.value).trim())affTrack("apply",f.id,ca);c.innerHTML=sizeCard(f);bindSizeCard(f)};ca.onclick=ap;ci.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();ap()}};
    /* editing the code hides the old result until Apply is clicked again */
    ci.oninput=()=>{if(S._couponTried){S._couponTried=false;S._coupon=ci.value;const p=ci.selectionStart;c.innerHTML=sizeCard(f);bindSizeCard(f);const n=$("#cpIn",c);n.focus();n.setSelectionRange(p,p)}}}
  $$("[data-cpcopy]",c).forEach(b=>b.onclick=()=>{copyCode(b.dataset.cpcopy);affTrack("copy",f.id,b)});
  $$("a[data-cpcode]",c).forEach(a=>a.addEventListener("click",()=>copyCode(a.dataset.cpcode)));
  $$("[data-cpprog]",c).forEach(b=>b.onclick=()=>{S._pfSz.p=Number(b.dataset.cpprog);c.innerHTML=sizeCard(f);bindSizeCard(f)});
  $$("[data-cpgo]",c).forEach(b=>b.onclick=()=>{S._pfId=b.dataset.cpgo;S._pfSz=null;S._couponTried=false;render();window.scrollTo(0,0)});
  $$("[data-sz]",c).forEach(b=>b.onclick=()=>{S._pfSz.size=b.dataset.sz;S._couponTried=false;c.innerHTML=sizeCard(f);bindSizeCard(f)});
  /* a plan button always shows a size that exists in that plan */
  $$("[data-szp]",c).forEach(b=>b.onclick=()=>{const k=Number(b.dataset.szp),P=((window.PF_SIZES||{})[f.id]||{progs:[]}).progs[k];S._pfSz.p=k;S._couponTried=false;
    if(P&&P.rows&&!P.rows[S._pfSz.size]){const s=Object.keys(P.rows)[0];if(s)S._pfSz.size=s}c.innerHTML=sizeCard(f);bindSizeCard(f)})}

