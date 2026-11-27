/* TRADEVERSITY admin screens (loaded on demand by index.html: loadAdmin()). Shares index.html's globals (S, API, $, esc, I18N…). */
function vStudent(el){const u=S.subject,ts=[...S.trades].sort((a,b)=>byDT(b,a)),st=calc(ts),d=discStreak(S.trades,S.plans);
  const tg=(u.telegram||"").replace(/^@/,"").replace(/^https?:\/\/t\.me\//,"").trim();
  const days=new Set(ts.map(t=>t.date)).size,plans=[...S.plans].sort((a,b)=>b.date.localeCompare(a.date));
  const field=(l,v)=>v&&String(v).trim()?`<div class="pf"><div class="pl">${l}</div><div class="pv notes" data-notr>${esc(v)}</div></div>`:"";
  const planCard=p=>{const bias=Object.entries(p.bias||{}).filter(([,v])=>v);const rules=Object.entries(p.rules||{});const dt=S.trades.filter(t=>t.date===p.date),dn=dt.reduce((a,t)=>a+tradeNet(t),0);
    return `<details class="plan-item"><summary><b data-notr>${esc(fmtDate(p.date))}</b>
      ${bias.length?`<span class="mut" data-notr>${bias.map(([k,v])=>`${esc(k)} ${v==="Bullish"?"▲":v==="Bearish"?"▼":v==="No trade"?"⛔":"•"}`).join(" · ")}</span>`:""}
      ${p.maxLoss?`<span class="tag"><span>Max loss</span> <span data-notr>$${esc(p.maxLoss)}</span></span>`:""}${p.maxTrades?`<span class="tag"><span>Max trades</span> <span data-notr>${esc(p.maxTrades)}</span></span>`:""}
      ${p.followed?`<span class="tag ${p.followed==="Yes"?"win":p.followed==="No"?"loss":""}"><span>Followed:</span> <span>${esc(p.followed)}</span></span>`:""}
      ${dt.length?`<span class="mono ${cls(dn)}" data-notr>${dt.length} · ${smoney(dn,0)}</span>`:""}</summary>
      <div class="plan-body">
        <div class="grid g4" style="margin-bottom:10px">${kpi("Max daily loss $",p.maxLoss?`$${esc(p.maxLoss)}`:"—")}${kpi("Daily profit target $",p.target?`$${esc(p.target)}`:"—")}${kpi("Max number of trades",esc(p.maxTrades||"—"))}${kpi("Risk per trade $",p.riskPerTrade?`$${esc(p.riskPerTrade)}`:"—")}</div>
        ${bias.length?`<div class="pf"><div class="pl">Directional bias</div><div class="pv" data-notr>${bias.map(([k,v])=>`<span class="tag ${v==="Bullish"?"long":v==="Bearish"?"short":""}">${esc(k)}: ${v==="No trade"?"⛔ ":""}${esc(I18N.t(v))}</span>`).join(" ")}</div></div>`:""}
        ${field("HTF narrative (Daily / 1H) & draw on liquidity",p.htf)}${field("Key levels (PDH, PDL, FVGs, opens…)",p.levels)}${field("News & events",p.news)}
        ${field("Entry model / A+ setup I'm waiting for",p.model)}${field("I will NOT trade if…",p.noTrade)}${field("Session",p.session)}${field("Mindset / goal for the day",p.mindset)}
        ${rules.length?`<div class="pf"><div class="pl">Pre-trade checklist</div><div class="pv">${rules.map(([r,v])=>`<div>${v?"✅":"⬜"} <span>${esc(r)}</span></div>`).join("")}</div></div>`:""}
        ${field("Review note",p.review)}
      </div></details>`};
  el.innerHTML=`<div class="card sf-head">
     <div class="sf-av">${esc((u.name||"?").trim().charAt(0).toUpperCase())}</div>
     <div class="sf-id"><h1 style="margin:0" data-notr>${esc(u.name||"—")}</h1>
       <div class="sf-links"><a class="lnk" href="mailto:${esc(u.email||"")}" data-notr>✉️ ${esc(u.email||"—")}</a>${tg?`<a class="lnk" href="https://t.me/${encodeURIComponent(tg)}" target="_blank" rel="noopener" data-notr>✈️ @${esc(tg)}</a>`:""}</div>
       <div class="mut" style="font-size:12px;margin-top:4px">${u.created_at?`<span>Joined</span> <span data-notr>${esc(fmtDate(u.created_at.slice(0,10)))}</span>`:""}${u.status?` · <span class="tag ${u.status==="approved"?"win":u.status==="rejected"?"loss":""}">${esc(u.status)}</span>`:""}</div></div>
   </div>
   <div class="grid g4" style="margin:12px 0">
     ${kpi("Net P&L",`<span class="${cls(st.net)}">${money(st.net)}</span>`,`${st.n} trades`)}
     ${kpi("Win rate",pct(st.wr),`${st.w}W · ${st.l}L · ${st.be}BE`)}
     ${kpi("Discipline streak",`${Math.min(d.streak,DISC.goal)} / ${DISC.goal}`,d.best?`<span>Best streak:</span> ${d.best}`:"")}
     ${kpi("Journaling days",days,"days with at least one trade")}
     ${kpi("Plans written",plans.length,plans[0]?fmtDate(plans[0].date):"")}
     ${kpi("Max drawdown",`<span class="neg">${money(-st.mdd,0)}</span>`,"peak to trough")}
     ${kpi("Avg R",isFinite(st.avgR)?st.avgR.toFixed(2)+"R":"—","from trades with a stop")}
   </div>
   ${S.readonly?"":a3Card(withNoTrade(calc(allF)).days,"j")}
   <div class="row" style="margin-bottom:12px"><button class="btn" data-goto="journal">📓 Full journal</button><button class="btn" data-goto="stats">📊 All statistics</button><button class="btn" data-goto="plan">🧭 Plan page</button></div>
   <div class="card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h3 style="margin:0">Latest trades</h3><span class="mut" style="font-size:12px">Click a trade to see every detail</span></div>
     ${ts.length?ts.slice(0,10).map(tcard).join(""):`<div class="empty">No trades yet.</div>`}
     ${ts.length>10?`<button class="btn sm" data-goto="journal">See all trades</button>`:""}</div>
   <div class="card"><h3>All plans <span class="mut" style="text-transform:none;letter-spacing:0">(${plans.length})</span></h3>
     ${plans.length?plans.map(planCard).join(""):`<div class="empty">No plans written yet.</div>`}</div>`;
  $$("[data-goto]",el).forEach(b=>b.onclick=()=>go(b.dataset.goto));
  bindTEdit(el);$$(".tcard",el).forEach(c=>c.onclick=()=>{S.view="journal";S.page=c.dataset.id;render();window.scrollTo(0,0)});
}
function admSummary(D){const {profs,trades,students,pending,disc,rows}=D;const today=todayStr(),d7=new Date();d7.setDate(d7.getDate()-6);const d7s=ymd(d7),sid=new Set(students.map(s=>s.id));
  const tw=trades.filter(t=>sid.has(t.user_id)&&t.date>=d7s&&t.date<=today),act=new Set(tw.map(t=>t.user_id)).size,net=tw.reduce((a,t)=>a+tradeNet(t),0);
  const broke=new Set(tw.filter(t=>t.followed==="No").map(t=>t.user_id)),risk=students.filter(s=>broke.has(s.id)),newU=profs.filter(p=>p.role!=="admin"&&(p.created_at||"").slice(0,10)>=d7s).length;
  const txt=`📊 Tradeversity · ${fmtDate(d7s)} → ${fmtDate(today)}\n\n👥 ${act}/${students.length} ${I18N.t("students active this week")}\n📈 ${tw.length} ${I18N.t("trades")} · ${smoney(net,0)}\n⚠️ ${risk.length} ${I18N.t("broke their plan")}${risk.length?": "+risk.slice(0,8).map(s=>s.name||"—").join(", "):""}\n🆕 ${newU} ${I18N.t("new sign-ups")}\n🔔 ${pending.length} ${I18N.t("waiting for approval")}\n\n— BROWN ALGO`;
  return {txt,html:`<div class="card adm-sum"><h3>📨 <span>Weekly summary</span></h3><p class="mut" style="font-size:12px;margin:0 0 8px"><span>Ready to copy or share on Telegram. With your Telegram connected, it is also sent to you automatically every Sunday.</span></p>
   <pre class="adm-sum-t" data-notr>${esc(txt)}</pre><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm" type="button" id="sumCopy">📋 <span>Copy</span></button><a class="btn sm pri" id="sumTg" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent("https://jointradeversity.com")}&text=${encodeURIComponent(txt)}">✈️ <span>Share on Telegram</span></a></div></div>`}}
function a3Card(days,key){const n=Object.keys(days).length,mode=S["_a3"+key]||(key==="j"?"cal":"mtn"),m=n>=2?mode:"cal";
  return `<div class="card a3-card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><h3 style="margin:0">✨ <span>3D view</span></h3>
    <div class="seg" data-a3seg="${key}"><button type="button" data-a3m="cal" class="${m==="cal"?"on":""}">📅 <span>3D calendar</span></button><button type="button" data-a3m="mtn" class="${m==="mtn"?"on":""}" ${n<2?"disabled":""} title="${n<2?esc(I18N.t("Appears after 2 trading days")):""}">🏔 <span>Equity mountain</span></button></div></div>
    <div id="a3_${key}" class="a3-box"></div><p class="mut a3-hint">${m==="cal"?`<span>Each day of the month is a column: green = profit, red = loss, grey = no trade yet. Tap a day to open it · drag to rotate.</span>`:`<span>Drag to rotate · tap a day to open it</span>`}</p></div>`}
function deleteUserBox(s,done){
  openModal(`<h3 style="margin-top:0">🗑 <span>Delete this user for good?</span></h3>
   <p style="margin:0 0 6px"><b data-notr>${esc(s.name||"—")}</b> <span class="mut" data-notr>${esc(s.email||"")}</span></p>
   <p class="mut" style="font-size:13px"><span>Their account, all their trades, plans, settings and shared links are deleted. This cannot be undone.</span></p>
   <p class="mut" style="font-size:13px;margin-bottom:6px"><span>To just take away their access and keep their data, use "Remove access" instead.</span></p>
   <label class="f"><span>Type DELETE to confirm</span><input class="i" id="duIn" autocomplete="off" placeholder="DELETE"></label>
   <div class="row" style="justify-content:flex-end;gap:8px;margin-top:12px"><button class="btn" id="duNo">Cancel</button><button class="btn danger" id="duYes" disabled>🗑 <span>Delete for good</span></button></div>`);
  const inp=$("#duIn"),yes=$("#duYes");$("#duNo").onclick=closeModal;inp.oninput=()=>{yes.disabled=inp.value.trim().toUpperCase()!=="DELETE"};setTimeout(()=>inp.focus(),50);
  yes.onclick=async()=>{yes.disabled=true;yes.textContent="…";
    try{const{data}=await Cloud.sb.auth.getSession();const tok=data&&data.session&&data.session.access_token;
      const r=await (await fetch(CONFIG.SUPABASE_URL+"/functions/v1/tg-reminders?deleteUser="+encodeURIComponent(s.id),{method:"POST",headers:{Authorization:"Bearer "+tok,apikey:CONFIG.SUPABASE_ANON_KEY}})).json();
      if(!r.ok)throw new Error(r.error==="cannot_delete_admin"?I18N.t("An admin account can't be deleted."):r.error||"error");
      closeModal();toast(I18N.t("User deleted for good"));done&&done()}
    catch(e){yes.disabled=false;yes.textContent=I18N.t("Delete for good");toast(I18N.t("Couldn't delete")+": "+(e.message||e))}}}
function contactLinks(s){const tg=(s.telegram||"").replace(/^@/,"").replace(/^https?:\/\/t\.me\//,"").trim();
  return `<div class="ct-links" data-notr>${tg?(s.tgOk?`<span class="ct ok" title="Telegram verified">✅</span>`:`<span class="ct warn" title="Telegram not verified yet">⚠️</span>`):""}${tg?`<a class="ct tg" href="https://t.me/${encodeURIComponent(tg)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Open the Telegram chat">✈️ @${esc(tg)}</a>`:""}${s.email?`<a class="ct em" href="mailto:${esc(s.email)}" onclick="event.stopPropagation()" title="Send an email">✉️ ${esc(s.email)}</a>`:""}</div>`}
function pfUpdatesCard(){const U=(window.PF_UPDATES||[]).slice(0,12);if(!U.length)return "";
  const seenKey="tv_pfupd_seen",last=(()=>{try{return localStorage.getItem(seenKey)||""}catch(e){return ""}})(),newest=U[0].date;
  const IC={price:"💲",discount:"🏷️",rule:"📝",firm:"🏦",algeria:"🇩🇿"};
  setTimeout(()=>{try{localStorage.setItem(seenKey,newest)}catch(e){}},1500);
  return `<div class="card pfu-card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3 style="margin:0">🔔 <span>Prop firm updates</span></h3>
     ${newest>last?`<span class="pfu-new">${U.filter(u=>u.date>last).length} <span>new</span></span>`:`<span class="mut" style="font-size:12px"><span>Checked automatically on the 1st and 15th</span></span>`}</div>
   <div class="pfu-list">${U.map(u=>`<div class="pfu-row ${u.date>last?"new":""}"><span class="pfu-ic">${IC[u.kind]||"•"}</span><div><b data-notr>${esc(u.firm)}</b> <span class="mut mono" style="font-size:11px" data-notr>${esc(fmtDate(u.date))}</span><p data-notr>${esc(u.text)}</p></div></div>`).join("")}</div></div>`}
function affCard(C){if(!C)return "";const now=Date.now(),inD=(c,d)=>now-new Date(c.created_at).getTime()<=d*864e5;
  const names=Object.fromEntries((((window.PropFirms||{}).firms)||[]).map(f=>[f.id,f.name]));
  const firms=[...new Set([...Object.keys(window.PF_AFF_LINKS||{}),...C.map(c=>c.firm)])];
  const per=firms.map(id=>{const r=C.filter(c=>c.firm===id),n=(k,d)=>r.filter(c=>c.kind===k&&inD(c,d)).length;
    const places={};r.filter(c=>c.kind==="link").forEach(c=>places[c.place||"—"]=(places[c.place||"—"]||0)+1);
    return {id,name:names[id]||id,l7:n("link",7),l30:n("link",30),l90:n("link",90),c30:n("copy",30),a30:n("apply",30),top:Object.entries(places).sort((a,b)=>b[1]-a[1]).slice(0,3)}}).sort((a,b)=>b.l30-a.l30||b.l90-a.l90);
  const tot=C.filter(c=>c.kind==="link"&&inD(c,30)).length;
  return `<div class="card aff-card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3 style="margin:0">🔗 <span>Affiliate & coupon clicks</span></h3><span class="mut" style="font-size:12px">${tot} <span>link clicks in 30 days</span></span></div>
   <div class="tw"><table class="t"><tr><th>Prop firm</th><th>Link clicks · 7 days</th><th>30 days</th><th>90 days</th><th>Code copied · 30 days</th><th>Coupon applied · 30 days</th><th>Clicked from</th></tr>
   ${per.map(p=>`<tr><td><b data-notr>${esc(p.name)}</b></td><td class="mono"><b>${p.l7}</b></td><td class="mono">${p.l30}</td><td class="mono">${p.l90}</td><td class="mono">${p.c30}</td><td class="mono">${p.a30}</td><td style="font-size:12px">${p.top.map(([k,v])=>`<span data-notr>${esc(I18N.t(k))}</span> <span class="mut">${v}</span>`).join(" · ")||"—"}</td></tr>`).join("")}</table></div>
   <p class="mut" style="font-size:12px;margin:8px 0 0">${I18N.t("Counts clicks on your affiliate links and BROWN23 buttons (login page, About, Prop firm tracker). A click is not a purchase: check sales in each firm's affiliate dashboard.")}</p></div>`}
async function vAdmin(el){
  /* every admin needs the two-step login: without it the database gives no admin rights, so ask for it first */
  if(S._needMfa){const lv=await MFA.level();if(lv.currentLevel==="aal2")S._needMfa=false}
  if(S._needMfa){el.innerHTML=`<div class="card" style="max-width:560px;margin:18px auto"><div id="admMfa"></div>
      <p class="mut" style="font-size:12.5px;margin:12px 0 0"><span>Two-step login is required for every admin. Set it up above with an authenticator app, then open Admin.</span></p>
      <button class="btn pri" type="button" id="admMfaGo" style="margin-top:12px">🔐 <span>Open Admin</span></button></div>`;
    mfaCard(el.querySelector("#admMfa"));
    el.querySelector("#admMfaGo").onclick=async()=>{const lv=await MFA.level();if(lv.currentLevel==="aal2"){S._needMfa=false;vAdmin(el)}else toast(I18N.t("Set up the two-step login first."))};
    return}
  el.innerHTML='<div class="empty">Loading students…</div>';
  let profs,trades,plans;try{[profs,trades,plans]=await withRetry(()=>Promise.all([API.listProfiles(),API.allTradesLite(),API.allPlans()]),()=>{el.innerHTML=`<div class="empty">${esc(I18N.t("Reconnecting…"))}</div>`})}
  catch(e){const net=isNetErr(e);
    el.innerHTML=`<div class="card empty" style="display:grid;gap:12px;justify-items:center"><div>${esc(net?I18N.t("Couldn't reach the server. Check your internet connection, then try again."):I18N.t("Couldn't load the admin data.")+" "+String(e.message||e))}</div><button class="btn pri" type="button" id="admRetry">${esc(I18N.t("Try again"))}</button></div>`;
    el.querySelector("#admRetry").onclick=()=>vAdmin(el);
    if(net)addEventListener("online",()=>{if(el.isConnected&&el.querySelector("#admRetry"))vAdmin(el)},{once:true});
    return}
  let clicks=null;try{clicks=API.affClicks?await API.affClicks():null}catch(e){clicks=null}
  S._rqReady=profs.filter(p=>p.role!=="admin"&&p.status==="pending"&&p.tgOk&&p.emailOk!==false).map(p=>({id:p.id,name:p.name}));setTimeout(ntfRefresh,0);
  const stOf=p=>p.status||"approved";
  const pending=profs.filter(p=>p.role!=="admin"&&stOf(p)==="pending").sort((a,b)=>(a.created_at||"").localeCompare(b.created_at||""));
  const rejected=profs.filter(p=>p.role!=="admin"&&stOf(p)==="rejected");
  const students=profs.filter(p=>p.role!=="admin"&&stOf(p)==="approved");const wk=new Date();wk.setDate(wk.getDate()-7);const wkS=ymd(wk);const nd=nextTradingDay();
  const rows=students.map(s=>{const ts=trades.filter(t=>t.user_id===s.id);const c=calc(ts);const last=ts.map(t=>t.date).sort().pop()||"";
    const pl=plans.filter(p=>p.user_id===s.id);const brk=ts.filter(t=>t.followed==="No").length;
    let mlb=0;pl.forEach(p=>{const dn=ts.filter(t=>t.date===p.date).reduce((a,t)=>a+tradeNet(t),0);if(num(p.maxLoss)>0&&dn<=-num(p.maxLoss))mlb++});
    const em=groupBy(ts,t=>(t.emotions||[]).filter(e=>EMO_BAD.includes(e)));
    const td=todayStr(),pT=pl.find(p=>p.date===td),jT=ts.some(t=>t.date===td)||!!(pT&&((pT.review||"").trim()||pT.followed));
    return {s,c,last,active:last>=wkS,plans:pl.length,hasNext:pl.some(p=>p.date>=todayStr()),jT,pT:!!pT,pN:pl.some(p=>p.date===nd),brk,mlb,worstEmo:em.filter(r=>r.net<0).sort((a,b)=>a.net-b.net)[0]}}).sort((a,b)=>b.c.net-a.c.net);
  const all=calc(trades.filter(t=>students.some(s=>s.id===t.user_id)));
  const emoAll=groupBy(trades,t=>(t.emotions||[]).filter(e=>EMO_BAD.includes(e))).filter(r=>r.net<0).sort((a,b)=>a.net-b.net).slice(0,3);
  /* today's discipline: journaled today? plan for today? plan for tomorrow? */
  const today=todayStr();const d7=new Date();d7.setDate(d7.getDate()-6);const d7s=ymd(d7);
  const disc=students.map(s=>{const ts=trades.filter(t=>t.user_id===s.id),pl=plans.filter(p=>p.user_id===s.id);
    const tToday=ts.filter(t=>t.date===today),pToday=pl.find(p=>p.date===today),pNext=pl.find(p=>p.date===nd);
    const reviewed=!!(pToday&&((pToday.review||"").trim()||pToday.followed));
    const days7=new Set(ts.filter(t=>t.date>=d7s&&t.date<=today).map(t=>t.date)).size;
    const ds=discStreak(ts,pl);
    return {s,tToday,pToday,pNext,reviewed,journaled:tToday.length>0||reviewed,days7,netToday:tToday.reduce((a,t)=>a+tradeNet(t),0),streak:ds.streak,over:tToday.length>DISC.maxPerDay}})
    .sort((a,b)=>(a.journaled+!!a.pNext)-(b.journaled+!!b.pNext)||(a.s.name||"").localeCompare(b.s.name||""));
  const nJ=disc.filter(r=>r.journaled).length,nPT=disc.filter(r=>r.pToday).length,nPN=disc.filter(r=>r.pNext).length;
  /* this week (last 7 days) per student */
  const wkRows=students.map(s=>{const ts=trades.filter(t=>t.user_id===s.id&&t.date>=d7s&&t.date<=today),pl=plans.filter(p=>p.user_id===s.id&&p.date>=d7s&&p.date<=today);
    const days=new Set(ts.map(t=>t.date)).size,net=ts.reduce((a,t)=>a+tradeNet(t),0),rev=pl.filter(p=>p.followed),fol=rev.filter(p=>p.followed==="Yes").length;
    let mlh=0;pl.forEach(p=>{const dn=ts.filter(t=>t.date===p.date).reduce((a,t)=>a+tradeNet(t),0);if(num(p.maxLoss)>0&&dn<=-num(p.maxLoss))mlh++});
    const broke=ts.filter(t=>t.followed==="No").length+rev.filter(p=>p.followed==="No").length;
    const score=days*2+pl.length+fol*2-mlh*3-broke*2;return {s,n:ts.length,days,net,plans:pl.length,rev:rev.length,fol,mlh,broke,score,quiet:!ts.length&&!pl.length}});
  const wkBest=wkRows.filter(r=>!r.quiet&&!r.mlh&&!r.broke).sort((a,b)=>b.score-a.score).slice(0,3);
  const wkAttn=wkRows.filter(r=>r.quiet||r.mlh||r.broke).sort((a,b)=>(b.mlh+b.broke)-(a.mlh+a.broke));
  const nm=r=>`<b data-notr>${esc(r.s.name||"—")}</b>`;
  const nmc=r=>`${nm(r)}${contactLinks(r.s)}`;
  const weekCard=students.length?`<div class="card wk-card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">🗓 <span>This week</span> — <span data-notr>${esc(fmtDate(d7s))} → ${esc(fmtDate(today))}</span></h3>
     <span class="mut" style="font-size:12px"><span data-notr>${wkRows.filter(r=>!r.quiet).length}/${students.length}</span> <span>students active</span></span></div>
    <div class="grid g2" style="margin-bottom:12px">
     <div class="wk-box good"><b>🏆 <span>Most disciplined</span></b>${wkBest.length?wkBest.map(r=>`<div>${nm(r)} <span class="mut"><span data-notr>${r.days}</span> <span>days journaled</span> · <span data-notr>${r.plans}</span> <span>plans</span></span></div>`).join(""):`<div class="mut">No one yet this week.</div>`}</div>
     <div class="wk-box attn"><b>⚠️ <span>Needs a message</span></b>${wkAttn.length?wkAttn.slice(0,6).map(r=>`<div>${nm(r)} <span class="mut">${r.quiet?"<span>No journal and no plan this week</span>":[r.mlh?`<span data-notr>${r.mlh}×</span> <span>max loss hit</span>`:"",r.broke?`<span data-notr>${r.broke}×</span> <span>broke the plan</span>`:""].filter(Boolean).join(" · ")}</span></div>`).join(""):`<div class="mut">Everyone is on track. 👏</div>`}</div></div>
    <div class="tw"><table class="t"><tr><th>Student</th><th>Days journaled</th><th>Trades</th><th>Net P&L</th><th>Plans</th><th>Followed plan</th><th>Max loss hit</th></tr>
     ${wkRows.sort((a,b)=>b.score-a.score).map(r=>`<tr><td>${nmc(r)}</td><td class="mono" data-notr>${r.days}/7</td><td class="mono" data-notr>${r.n}</td><td class="mono ${cls(r.net)}" data-notr>${r.n?smoney(r.net,0):"—"}</td><td class="mono" data-notr>${r.plans}</td>
       <td class="mono" data-notr>${r.rev?`${r.fol}/${r.rev}`:"—"}</td><td>${r.mlh?`<span class="dno" data-notr>✖ ${r.mlh}</span>`:`<span class="mut">—</span>`}</td></tr>`).join("")}</table></div></div>`:"";
  const yes=(t)=>`<span class="dyes">✔ ${t||""}</span>`,no=t=>`<span class="dno">✖ ${t||""}</span>`;
  const tgUser=s=>(s.telegram||"").replace(/^@/,"").replace(/^https?:\/\/t\.me\//,"").trim();
  const discRow=r=>`<tr data-sid="${r.s.id}" data-miss="${r.journaled?"":"j"}${r.pNext?"":"p"}">
     <td><b data-notr>${esc(r.s.name||"—")}</b>${contactLinks(r.s)}</td>
     <td>${r.journaled?yes(r.tToday.length?`<span data-notr>${r.tToday.length}</span> <span>${r.tToday.length===1?"trade":"trades"}</span> <span class="mono ${cls(r.netToday)}" data-notr>${smoney(r.netToday,0)}</span>`:"Review written"):no("Nothing yet")}${r.over?` <span class="tag over">Overtrading</span>`:""}</td>
     <td>${r.pToday?yes(r.pToday.followed?`<span>Followed:</span> <span>${esc(r.pToday.followed)}</span>`:"Planned"):no("No plan")}</td>
     <td>${r.pNext?yes("Planned"):no("Not yet")}</td>
     <td><div class="d7" title="Journaling days in the last 7 days"><div class="bar"><i style="width:${r.days7/7*100}%;background:${r.days7>=4?"var(--green)":r.days7>=2?"var(--gold)":"var(--red)"}"></i></div><span class="mono" data-notr>${r.days7}/7</span></div></td>
     <td><span class="mono ${r.streak>=DISC.goal?"pos":r.streak?"warn":"mut"}" data-notr>${Math.min(r.streak,DISC.goal)}/${DISC.goal}</span>${r.streak>=DISC.goal?" 🏆":""}</td>
     <td><div class="row" style="justify-content:flex-end;flex-wrap:nowrap">
       <button class="btn sm" data-open="journal">📓 Journal</button><button class="btn sm" data-open="plan">🧭 Plan</button><button class="btn sm" data-open="stats">📊 Stats</button>
       ${tgUser(r.s)?`<a class="btn sm" href="https://t.me/${encodeURIComponent(tgUser(r.s))}" target="_blank" rel="noopener" title="Message on Telegram">💬</a>`:""}</div></td></tr>`;
  const reqRow=(p,rej)=>`<tr data-pid="${p.id}"><td><b data-notr>${esc(p.name||"—")}</b>${contactLinks(p)}</td><td data-notr>${p.tgOk?`<span class="dyes">✅ <span>Telegram verified</span></span>`:`<span class="dno">⚠️ <span>Telegram not verified</span></span>`}<br>${p.emailOk===false?`<span class="dno">⚠️ <span>Email not verified</span></span>`:p.emailOk?`<span class="dyes">✅ <span>Email verified</span></span>`:""}</td><td class="mut" data-notr>${p.created_at?esc(fmtDate(p.created_at.slice(0,10))):""}</td>
     <td><div class="row" style="justify-content:flex-end">${rej?`<button class="btn sm danger" data-delu="${p.id}">🗑 <span>Delete</span></button>`:`<button class="btn sm danger" data-act="rejected">✖ Reject</button>`}${(()=>{const ok=p.tgOk&&p.emailOk!==false;
       return `<button class="btn sm pri" data-act="approved" ${ok?"":`disabled title="${esc(I18N.t("Can be approved after the student verifies Telegram and email"))}"`}>${ok?"✔ <span>Approve</span>":"🔒 <span>Waiting for verification</span>"}</button>`})()}</div></td></tr>`;
  el.innerHTML=`<h1>👑 Admin dashboard</h1><p class="sub">All your Tradeversity students in one place. Click a student to open their journal, stats and plans (read-only).</p>
   ${notifyCard(true)}
   ${pending.length?`<div class="card" style="margin-bottom:12px;border-color:var(--gold)"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3 style="margin:0;color:var(--gold)">🔔 Pending requests</h3><span class="tag" style="background:rgba(245,185,66,.15);color:var(--gold)">${pending.length}</span></div>
     <p class="mut" style="margin:0 0 8px;font-size:12px">These people signed up and are waiting for you. They can't use the journal until you approve them.</p>
     ${(()=>{const ready=pending.filter(p=>p.tgOk&&p.emailOk!==false),wait=pending.filter(p=>!(p.tgOk&&p.emailOk!==false));
       const head=`<tr><th>Student</th><th>Verification</th><th>Requested</th><th></th></tr>`;
       return `<div class="rq-grp ready"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;margin:4px 0 6px"><b class="rq-t">✅ <span>Ready to approve</span> <span class="rq-n">${ready.length}</span></b>
         ${ready.length>1?`<button class="btn sm pri" type="button" id="approveAllV">✔ <span>Approve all verified</span> (${ready.length})</button>`:""}</div>
         ${ready.length?`<div class="tw"><table class="t" id="reqT">${head}${ready.map(p=>reqRow(p,false)).join("")}</table></div>`:`<p class="mut" style="font-size:12px;margin:0 0 6px">${esc(I18N.t("Nobody yet. Students appear here as soon as they verify Telegram and email."))}</p>`}</div>
       ${wait.length?`<details class="rq-grp wait" ${S._rqWaitOpen?"open":""} id="rqWait"><summary class="rq-t">⏳ <span>Waiting for verification</span> <span class="rq-n">${wait.length}</span> <span class="mut" style="font-weight:500;font-size:12px">· ${esc(I18N.t("They must verify first. They move up to Ready by themselves."))}</span></summary>
         <div class="tw" style="margin-top:6px"><table class="t">${head}${wait.map(p=>reqRow(p,false)).join("")}</table></div></details>`:""}`})()}</div>`:""}
   ${affCard(clicks)}
   ${pfUpdatesCard()}
   ${weekCard}
   ${students.length?`<div class="card" style="margin-bottom:12px" id="discCard">
     <div class="row" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">📅 Today's discipline — <span data-notr>${esc(fmtDate(today))}</span></h3>
       <div class="seg" id="discF"><button data-f="all" class="on">All</button><button data-f="j">Missing journal</button><button data-f="p">Missing plan</button></div></div>
     <div class="grid g3" style="margin-bottom:12px">
       ${kpi("Journaled today",`<span class="${nJ===disc.length?"pos":nJ?"warn":"neg"}">${nJ} / ${disc.length}</span>`,`${disc.length-nJ} missing`)}
       ${kpi("Plan for today",`<span class="${nPT===disc.length?"pos":nPT?"warn":"neg"}">${nPT} / ${disc.length}</span>`,fmtDate(today))}
       ${kpi("Plan for tomorrow",`<span class="${nPN===disc.length?"pos":nPN?"warn":"neg"}">${nPN} / ${disc.length}</span>`,fmtDate(nd))}
     </div>
     <div class="tw"><table class="t" id="discT"><tr><th>Student</th><th>Journal today</th><th>Plan for today</th><th>Plan for tomorrow</th><th>Last 7 days</th><th>Streak</th><th></th></tr>${disc.map(discRow).join("")}</table></div>
   </div>`:""}
   <div class="grid g4" style="margin-bottom:12px">
    ${kpi("Students",students.length,`${rows.filter(r=>r.active).length} active this week`)}
   </div>
   ${emoAll.length?`<div class="card" style="margin-bottom:12px"><h3>Group weak spots</h3>${emoAll.map(r=>`<div class="insight"><span class="ic">⚠️</span><span><b>${esc(r.k)}</b> trades across students: <b class="neg">${money(r.net,0)}</b> over ${r.n} trades (${pct(r.wr,0)} win). Good topic for the next live.</span></div>`).join("")}</div>`:""}
   <div class="card acc-card"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px"><h3 style="margin:0">✅ <span>Accepted users</span> <span class="adm-n" data-notr>${students.length}</span></h3><input class="i" id="accQ" placeholder="Search name, email, Telegram" style="width:220px"></div>
    <p class="mut" style="font-size:12px;margin:0 0 10px"><span>Remove access: the user can't open the journal and their data stays. They can request access again: they verify their Telegram again, then wait for your approval. Delete: the account and all its data are erased for good.</span></p>
    <div class="acc-list">${students.length?[...students].sort((a,b)=>(a.name||"").localeCompare(b.name||"")).map(s=>`<div class="acc-row" data-accid="${s.id}" data-q="${esc(((s.name||"")+" "+(s.email||"")+" "+(s.telegram||"")+" "+tgUser(s)).toLowerCase().replace(/@/g,""))}"><div class="acc-who"><b data-notr>${s.avatar?`<img class="acc-av" src="${esc(s.avatar)}" alt="">`:""}${esc(s.name||"—")}${isVerified(s)?" "+vCheck():""}${s.username?` <span class="mut">@${esc(s.username)}</span>`:""}</b><small class="mut" data-notr>${esc(s.email||"")}${tgUser(s)?` · @${esc(tgUser(s))}`:""}${s.created_at?` · <span>Joined</span> ${esc(fmtDate(s.created_at.slice(0,10)))}`:""}</small></div><div class="acc-acts"><button type="button" class="btn sm" data-remove="${s.id}">✖ <span>Remove access</span></button><button type="button" class="btn sm danger" data-delu="${s.id}">🗑 <span>Delete</span></button></div></div>`).join(""):`<div class="mut">No accepted users yet.</div>`}</div></div>
   <div class="card acc-card" id="crsAdm"></div>
   <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3 style="margin:0">Students</h3><div class="row"><input class="i" id="aq" placeholder="Search name, email, Telegram" style="width:240px"><button class="btn sm" id="aExp">Export CSV</button></div></div>
   <div class="tw"><table class="t" id="aT"><tr><th>Name (username)</th><th>Email</th><th>Telegram username</th><th>Trades</th><th>Broke plan</th><th>Weak spot</th><th>Journaled today</th><th>Plan today</th><th>Plan tomorrow</th></tr>
   ${rows.map(r=>`<tr class="click" data-id="${r.s.id}" data-q="${esc((r.s.name+" "+r.s.email+" "+r.s.telegram).toLowerCase())}"><td><b data-notr>${esc(r.s.name||"—")}</b> <span class="tag">👤 Open</span></td><td data-notr><a class="lnk" href="mailto:${esc(r.s.email||"")}" onclick="event.stopPropagation()">${esc(r.s.email||"—")}</a></td><td class="mono" data-notr>${tgUser(r.s)?`${r.s.tgOk?"✅":"⚠️"} <a class="lnk" href="https://t.me/${encodeURIComponent(tgUser(r.s))}" target="_blank" rel="noopener" onclick="event.stopPropagation()">@${esc(tgUser(r.s))}</a>`:"—"}</td><td class="mono">${r.c.n}</td>
     <td class="mono ${r.brk?"neg":""}">${r.brk}</td><td>${r.worstEmo?`<span class="tag bad">${esc(r.worstEmo.k)}</span>`:"—"}</td>${[r.jT,r.pT,r.pN].map(v=>`<td>${v?'<span class="dyes">✔ Yes</span>':'<span class="dno">✖ No</span>'}</td>`).join("")}</tr>`).join("")||`<tr><td colspan="9" class="empty">No students yet. Share the website link — they sign up for free.</td></tr>`}</table></div></div>
   ${rejected.length?`<details class="card" style="margin-top:12px"><summary style="cursor:pointer;color:var(--muted);font-weight:600">Rejected requests (${rejected.length})</summary><div class="tw" style="margin-top:8px"><table class="t" id="rejT"><tr><th>Student</th><th>Telegram</th><th>Requested</th><th></th></tr>${rejected.map(p=>reqRow(p,true)).join("")}</table></div></details>`:""}`;
  bindNotify(el);
  const rw=$("#rqWait",el);if(rw)rw.ontoggle=()=>{S._rqWaitOpen=rw.open};
  const aav=$("#approveAllV",el);if(aav)aav.onclick=()=>{const ready=pending.filter(p=>p.tgOk&&p.emailOk!==false);
    confirmBox(`${I18N.t("Approve")} ${ready.length} ${I18N.t("verified students? They will get access to the journal.")}`,async()=>{aav.disabled=true;let ok=0,bad=0;
      for(const p of ready){try{await API.setStatus(p.id,"approved");ok++}catch(e){bad++}}
      toast(`${ok} ${I18N.t("students approved")}${bad?` · ${bad} ${I18N.t("not approved (not verified)")}`:""}`);vAdmin(el)})};
  $$("tr[data-pid] button[data-act]",el).forEach(b=>b.onclick=async ev=>{ev.stopPropagation();const id=b.closest("tr").dataset.pid,act=b.dataset.act;const p=profs.find(x=>x.id===id);
    const go_=async()=>{b.disabled=true;try{await API.setStatus(id,act);toast(act==="approved"?"Student approved":"Request rejected");vAdmin(el)}catch(e){b.disabled=false;const m=String(e.message||e);
      toast(/not_verified_telegram/.test(m)?I18N.t("This student hasn't verified Telegram yet."):/not_verified_email/.test(m)?I18N.t("This student hasn't verified the email yet."):m)}};
    if(act==="rejected")confirmBox(`Reject ${p&&p.name||"this request"}? They won't be able to use the journal.`,go_);else go_()});
  /* today's discipline: filters + open a student's journal / plan / stats */
  $$("#discF button").forEach(b=>b.onclick=()=>{$$("#discF button").forEach(x=>x.classList.toggle("on",x===b));const f=b.dataset.f;
    $$("#discT tr[data-sid]").forEach(tr=>tr.classList.toggle("hidden",f!=="all"&&!tr.dataset.miss.includes(f)))});
  $$("#discT button[data-open]").forEach(b=>b.onclick=async()=>{const s=students.find(x=>x.id===b.closest("tr").dataset.sid);if(!s)return;const v=b.dataset.open;
    const r=disc.find(x=>x.s.id===s.id);await loadSubject(s,true);
    if(v==="plan")S._planDate=r&&r.pNext?nd:today;
    S.view=v;render();window.scrollTo(0,0)});
  /* accepted users: search + remove (status -> rejected: no access, data kept, can be approved again) */
  courseAdmin($("#crsAdm",el),students);
  const accQ=$("#accQ",el);if(accQ)accQ.oninput=e=>{const q=e.target.value.toLowerCase().replace(/@/g,"").trim();$$(".acc-row",el).forEach(r=>r.classList.toggle("hidden",!r.dataset.q.includes(q)))};
  /* delete a user for good: done by the server function (admin only); you must type DELETE to confirm */
  $$("[data-delu]",el).forEach(b=>b.onclick=ev=>{ev.stopPropagation();const s=students.find(x=>x.id===b.dataset.delu)||profs.find(x=>x.id===b.dataset.delu);if(!s)return;deleteUserBox(s,()=>vAdmin(el))});
  $$("[data-remove]",el).forEach(b=>b.onclick=()=>{const s=students.find(x=>x.id===b.dataset.remove);if(!s)return;
    confirmBox(`${I18N.t("Remove")} ${s.name||s.email||""}? ${I18N.t("They lose access to the journal right away. Their data stays saved. To come back, they must verify their Telegram again and wait for your approval.")}`,async()=>{b.disabled=true;
      try{await API.setStatus(s.id,"rejected");toast(I18N.t("User removed"));vAdmin(el)}catch(e){b.disabled=false;toast(I18N.t("Couldn't remove")+": "+(e.message||e))}})});
  if(!el.isConnected||!$("#aq",el))return;  /* the user left the admin page while it was loading */
  $("#aq",el).oninput=e=>{const q=e.target.value.toLowerCase();$$("#aT tr[data-q]").forEach(tr=>tr.classList.toggle("hidden",!tr.dataset.q.includes(q)))};
  $$("#aT tr[data-id]").forEach(tr=>tr.onclick=async()=>{const s=students.find(x=>x.id===tr.dataset.id);await loadSubject(s,true);S.view="student";render();window.scrollTo(0,0)});
  $("#aExp").onclick=()=>{const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;saveFile(`tradeversity-students-${todayStr()}.csv`,["name,email,telegram,joined,trades,broke_plan,journaled_today,plan_today,plan_tomorrow,last_trade",...rows.map(r=>[r.s.name,r.s.email,r.s.telegram,(r.s.created_at||"").slice(0,10),r.c.n,r.brk,r.jT?"yes":"no",r.pT?"yes":"no",r.pN?"yes":"no",r.last].map(q).join(","))].join("\n"),"text/csv")};
  admOrganize(el,{profs,trades,plans,clicks,students,pending,disc,wkRows,rows});
}
function admOrganize(el,D){const {profs,trades,plans,clicks,students,pending,disc,wkRows,rows}=D;
  const today=todayStr(),d7=new Date();d7.setDate(d7.getDate()-6);const d7s=ymd(d7);const sid=new Set(students.map(s=>s.id));
  const ready=pending.filter(p=>p.tgOk&&p.emailOk!==false),waitV=pending.filter(p=>!(p.tgOk&&p.emailOk!==false));
  const tw=trades.filter(t=>sid.has(t.user_id)&&t.date>=d7s&&t.date<=today);
  const breaks=wkRows.reduce((a,r)=>a+r.broke+r.mlh,0);
  const clk30=(clicks||[]).filter(c=>c.kind==="link"&&Date.now()-new Date(c.created_at).getTime()<=30*864e5).length;
  const nJ=disc.filter(r=>r.journaled).length;
  /* max daily loss hit today / overtrading today / inactive 7+ days */
  const lossToday=students.filter(s=>{const p=plans.find(x=>x.user_id===s.id&&x.date===today);if(!p||!(num(p.maxLoss)>0))return false;
    return trades.filter(t=>t.user_id===s.id&&t.date===today).reduce((a,t)=>a+tradeNet(t),0)<=-num(p.maxLoss)});
  const overT=disc.filter(r=>r.over).map(r=>r.s);
  const lastAct=s=>{const a=trades.filter(t=>t.user_id===s.id).map(t=>t.date),b=plans.filter(p=>p.user_id===s.id).map(p=>p.date);return [...a,...b].sort().pop()||""};
  const inactive=students.filter(s=>lastAct(s)<d7s);
  const tg=s=>(s.telegram||"").replace(/^@/,"").replace(/^https?:\/\/t\.me\//,"").trim();
  const ppl=list=>list.slice(0,8).map(s=>`<span class="adm-p"><b data-notr>${esc(s.name||"—")}</b>${tg(s)?`<a href="https://t.me/${encodeURIComponent(tg(s))}" target="_blank" rel="noopener" title="Telegram">💬</a>`:""}</span>`).join("")+(list.length>8?`<span class="mut">+${list.length-8}</span>`:"");
  const inbox=[];
  if(ready.length)inbox.push(["🎉","hot",`<b data-notr>${ready.length}</b> <span>${ready.length===1?"student verified, ready to approve":"students verified, ready to approve"}</span>`,ppl(ready),"requests","Open requests"]);
  if(lossToday.length)inbox.push(["🛑","hot",`<b data-notr>${lossToday.length}</b> <span>hit their max daily loss today</span>`,ppl(lossToday),"discipline","See discipline"]);
  if(overT.length)inbox.push(["⛔","warn",`<b data-notr>${overT.length}</b> <span>overtrading today (more than 2 trades)</span>`,ppl(overT),"discipline","See discipline"]);
  if(waitV.length)inbox.push(["⏳","",`<b data-notr>${waitV.length}</b> <span>waiting for verification (email or Telegram)</span>`,ppl(waitV),"requests","Open requests"]);
  if(inactive.length)inbox.push(["😴","",`<b data-notr>${inactive.length}</b> <span>inactive for 7+ days: send them a message</span>`,ppl(inactive),"students","Open students"]);
  if(students.length&&nJ<students.length&&new Date().getHours()>=17)inbox.push(["📓","",`<b data-notr>${students.length-nJ}</b> <span>haven't journaled today</span>`,"","discipline","See discipline"]);
  /* charts: active students per day (14 days) and sign-ups per week (8 weeks) */
  const days14=[];{const x=new Date();x.setDate(x.getDate()-13);for(let i=0;i<14;i++){days14.push(ymd(x));x.setDate(x.getDate()+1)}}
  const act=days14.map(d=>new Set([...trades.filter(t=>t.date===d&&sid.has(t.user_id)).map(t=>t.user_id),...plans.filter(p=>p.date===d&&sid.has(p.user_id)&&((p.review||"").trim()||p.followed||p.noTrade)).map(p=>p.user_id)]).size);
  const wk8=[];{const x=new Date();x.setDate(x.getDate()-((x.getDay()+6)%7)-7*7);for(let i=0;i<8;i++){const a=ymd(x);x.setDate(x.getDate()+7);wk8.push([a,ymd(x)])}}
  const sign=wk8.map(([a,b])=>profs.filter(p=>p.role!=="admin"&&(p.created_at||"").slice(0,10)>=a&&(p.created_at||"").slice(0,10)<b).length);
  const bars=(vals,labels,cls)=>{const m=Math.max(1,...vals);return `<div class="adm-bars ${cls||""}">${vals.map((v,i)=>`<div class="ab" title="${esc(labels[i])}: ${v}"><i style="height:${Math.max(3,v/m*100)}%"></i><small data-notr>${v||""}</small></div>`).join("")}</div><div class="adm-bl mut"><span data-notr>${esc(labels[0])}</span><span data-notr>${esc(labels[labels.length-1])}</span></div>`};
  const newsN=(S.news||[]).length,pfu=(window.PF_UPDATES||[])[0];
  const hl=(ok,t,s)=>`<div class="adm-h ${ok?"ok":"warn"}"><span>${ok?"🟢":"🟠"}</span><div><b>${t}</b><small class="mut">${s}</small></div></div>`;
  const classAvg=(()=>{const sc=(from)=>{const out=[];students.forEach(s=>{const TR=trades.filter(t=>t.user_id===s.id),PL=plans.filter(p=>p.user_id===s.id),J=judgeTrades(TR).out;
      const ds=[...new Set([...TR.map(t=>t.date),...PL.map(p=>p.date)])].filter(d=>d>=from&&d<=today);if(ds.length)out.push(ds.map(d=>scoreFor(d,TR,PL,J).score).reduce((a,b)=>a+b,0)/ds.length)});return out};
    let a=sc(today),t=true;if(!a.length){a=sc(d7s);t=false}return {v:a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0,n:a.length,today:t}})();
  const tabs=[["overview","📊","Overview"],["requests","🔔","Requests",pending.length],["discipline","📅","Discipline"],["students","👥","Students",students.length],["affiliates","🔗","Affiliates"],["settings","⚙️","Settings & updates"]];
  const cur=S._admTab||"overview";
  const box=document.createElement("div");box.className="adm";
  box.innerHTML=`<div class="adm-tabs seg">${tabs.map(([k,ic,l,n])=>`<button type="button" data-at="${k}" class="${k===cur?"on":""}">${ic} <span>${l}</span>${n?` <span class="adm-n" data-notr>${n}</span>`:""}</button>`).join("")}</div>
   <div class="adm-sec" data-sec="overview">
    <div class="adm-kpis">
     ${kpi("Students",`<span data-notr>${students.length}</span>`,`<span data-notr>${rows.filter(r=>r.active).length}</span> <span>active this week</span>`)}
     ${kpi("Ready to approve",`<span class="${ready.length?"warn":""}" data-notr>${ready.length}</span>`,`<span data-notr>${waitV.length}</span> <span>waiting for verification</span>`)}
     ${kpi("Journaled today",`<span class="${students.length&&nJ===students.length?"pos":nJ?"warn":"neg"}" data-notr>${nJ} / ${students.length}</span>`,esc(fmtDate(today)))}
     ${kpi("Trades this week",`<span data-notr>${tw.length}</span>`,`<span class="${cls(tw.reduce((a,t)=>a+tradeNet(t),0))}" data-notr>${smoney(tw.reduce((a,t)=>a+tradeNet(t),0),0)}</span>`)}
     ${kpi("Rule breaks this week",`<span class="${breaks?"neg":"pos"}" data-notr>${breaks}</span>`,"<span>broke the plan or hit max loss</span>")}
     ${kpi("Link clicks · 30 days",`<span data-notr>${clk30}</span>`,"<span>affiliate & BROWN23</span>")}
    </div>
    <div class="card adm-orb"><div id="a3AdmOrb" class="a3-box"><div class="a3-flat"><b data-notr>${classAvg.v}</b><small>${esc(I18N.t("class score"))}</small></div></div>
     <div><h3 style="margin:0 0 6px">🔮 <span>Class discipline</span></h3><p class="mut" style="margin:0;font-size:13px"><span>${classAvg.today?"Average discipline score of the students active today":"Average discipline score of the last 7 days"}</span> · <b data-notr>${classAvg.n}</b> <span>students</span></p>
     <p class="mut" style="margin:6px 0 0;font-size:12px"><span>Green and calm = the class follows its plans. Red and agitated = rules are being broken.</span></p></div></div>
    <div class="card adm-inbox"><h3>📥 <span>Needs you</span></h3>
     ${inbox.length?inbox.map(([ic,lv,t,p,tab,btn])=>`<div class="adm-it ${lv}"><span class="adm-ic">${ic}</span><div class="adm-tx"><div>${t}</div>${p?`<div class="adm-ppl">${p}</div>`:""}</div><button type="button" class="btn sm" data-at="${tab}">${btn} ›</button></div>`).join(""):`<div class="adm-empty">✅ <span>All clear. Nothing needs you right now.</span></div>`}</div>
    ${admSummary(D).html}
    <div class="card adm-visit"><h3>🔗 <span>Visitor link · 48 hours</span></h3><p class="mut" style="font-size:12px;margin:0 0 8px"><span>Anyone with this link can look around the platform with sample data, no account needed. It stops working after 48 hours.</span></p>
     <div class="row" style="gap:8px;flex-wrap:wrap"><input class="i" id="visLink" readonly placeholder="—" style="flex:1;min-width:220px"><button class="btn sm pri" type="button" id="visNew">🔗 <span>Create a 48-hour link</span></button><button class="btn sm" type="button" id="visCopy">📋 <span>Copy</span></button></div>
     <small class="mut" id="visExp" style="display:block;margin-top:6px"></small></div>
    <div class="card adm-ann"><h3>📣 <span>Announcement to all students</span></h3>
     <p class="mut" style="font-size:12px;margin:0 0 10px"><span>Shown in every student's bell and sent on Telegram to the students connected to the bot.</span></p>
     <input class="i" id="annT" maxlength="120" placeholder="Title (e.g. Live session tonight at 20:00)">
     <textarea class="i" id="annB" maxlength="3000" style="min-height:90px;margin-top:8px" placeholder="Your message"></textarea>
     <div class="row" style="justify-content:space-between;gap:8px;margin-top:8px;flex-wrap:wrap"><label class="row" style="gap:6px;font-size:13px"><input type="checkbox" id="annTg" checked> <span>Also send on Telegram</span></label>
      <button class="btn pri" type="button" id="annSend">📣 <span>Send to all students</span></button></div>
     <div id="annList" class="adm-annl"></div></div>
    <div class="grid g2">
     <div class="card"><h3>📈 <span>Active students per day</span> <small class="mut">· <span>last 14 days</span></small></h3>${bars(act,days14.map(d=>fmtDate(d).split(",")[0]+" "+d.slice(8)))}</div>
     <div class="card"><h3>🆕 <span>New sign-ups per week</span> <small class="mut">· <span>last 8 weeks</span></small></h3>${bars(sign,wk8.map(w=>fmtDate(w[0])),"gold")}</div>
    </div>
    <div class="card"><h3>🩺 <span>Health</span></h3><div class="adm-health">
     ${hl(newsN>0,I18N.t("News feed"),newsN?`<span data-notr>${newsN}</span> <span>events loaded</span>`:"<span>No news loaded. Check the econ-news job.</span>")}
     ${hl(!!S.me.tgOk,I18N.t("Your Telegram"),S.me.tgOk?"<span>Connected: weekly summary every Sunday 20:00</span>":"<span>Not connected: open Settings & updates to connect it</span>")}
     ${hl(!!pfu,I18N.t("Prop firm tracker"),pfu?`<span>Last update</span> <span data-notr>${esc(fmtDate(pfu.date))}</span>`:"<span>No update log yet</span>")}
     ${hl(!ready.length,I18N.t("Approvals"),ready.length?`<span data-notr>${ready.length}</span> <span>waiting for you</span>`:"<span>Nobody waiting</span>")}
    </div></div>
   </div>
   <div class="adm-sec" data-sec="requests"></div><div class="adm-sec" data-sec="discipline"></div><div class="adm-sec" data-sec="students"></div>
   <div class="adm-sec" data-sec="affiliates"></div><div class="adm-sec" data-sec="settings"></div>`;
  const sub=el.querySelector(".sub");(sub||el.firstChild).after(box);
  const put=(node,sec)=>{if(node&&node!==box&&!box.contains(node))box.querySelector(`[data-sec="${sec}"]`).appendChild(node)};
  const cardOf=sel=>{const n=el.querySelector(sel);return n&&(n.closest("details.card,.card")||n)};
  put(el.querySelector("#ntfBox"),"settings");put(el.querySelector(".pfu-card"),"settings");
  put(cardOf("#reqT")||cardOf(".rq-grp"),"requests");put(cardOf("#rejT"),"requests");
  put(el.querySelector(".wk-card"),"discipline");put(el.querySelector("#discCard"),"discipline");
  put(el.querySelector(".aff-card"),"affiliates");
  [...el.querySelectorAll(":scope > .card, :scope > .grid")].forEach(n=>{if(n.querySelector("#aT"))put(n,"students");else if(/Group weak spots/.test(n.textContent))put(n,"overview");else if(n.classList.contains("grid")&&n.querySelector(".kpi"))n.remove()});
  if(!box.querySelector('[data-sec="requests"]').children.length)box.querySelector('[data-sec="requests"]').innerHTML=`<div class="card adm-empty">✅ <span>No pending requests.</span></div>`;
  if(!box.querySelector('[data-sec="affiliates"]').children.length)box.querySelector('[data-sec="affiliates"]').innerHTML=`<div class="card adm-empty"><span>No clicks recorded yet.</span></div>`;
  {const c=document.createElement("div");c.className="card err-card";box.querySelector('[data-sec="settings"]').appendChild(c);admErrors(c)}
  /* 📣 announcements: send (server function: saves it + Telegram to all students), list, delete */
  {const list=box.querySelector("#annList");
   const draw=async()=>{let A=[];try{A=API.announcements?await API.announcements():[]}catch(e){list.innerHTML=`<p class="mut" style="font-size:12px">${esc(I18N.t("Announcements are not set up yet on the server."))}</p>`;return}
     S.ann=A;list.innerHTML=A.length?`<div class="mut" style="font-size:12px;margin:12px 0 6px"><span>Recent announcements</span></div>`+A.slice(0,5).map(a=>`<div class="adm-an"><div><b data-notr>${esc(a.title||"—")}</b> <span class="mut mono" style="font-size:11px" data-notr>${esc(fmtDate(a.created_at.slice(0,10)))}</span><p data-notr>${esc(a.body).slice(0,200)}</p></div><button class="btn sm danger" type="button" data-andel="${a.id}" title="Delete">🗑</button></div>`).join(""):"";
     $$("[data-andel]",list).forEach(b=>b.onclick=()=>confirmBox(I18N.t("Delete this announcement? It disappears from the students' bell (Telegram messages already sent stay)."),async()=>{try{const r=await tgFn("announce=delete&id="+encodeURIComponent(b.dataset.andel));if(!r.ok)throw new Error(r.error||"error");toast(I18N.t("Announcement deleted"));draw()}catch(e){toast(String(e.message||e))}}))};
   draw();
   {const vn=box.querySelector("#visNew"),vl=box.querySelector("#visLink"),vc=box.querySelector("#visCopy"),vx=box.querySelector("#visExp");
    const mk=()=>{const exp=Date.now()+48*3600e3,u=location.origin+"/preview/?e="+Math.floor(exp/1000).toString(36);vl.value=u;vx.textContent=I18N.t("Valid until")+" "+new Date(exp).toLocaleString();return u};
    if(vn)vn.onclick=()=>{const u=mk();(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast(I18N.t("Visitor link copied (48 hours)"))).catch(()=>{})};
    if(vc)vc.onclick=()=>{const u=vl.value||mk();(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast(I18N.t("Visitor link copied (48 hours)"))).catch(()=>copyText(u))}}
   {const sc=box.querySelector("#sumCopy");if(sc)sc.onclick=()=>{const tx=admSummary(D).txt;(navigator.clipboard?navigator.clipboard.writeText(tx):Promise.reject()).then(()=>toast(I18N.t("Summary copied"))).catch(()=>copyText(tx))}}
   box.querySelector("#annSend").onclick=()=>{const title=box.querySelector("#annT").value.trim(),body=box.querySelector("#annB").value.trim(),tg=box.querySelector("#annTg").checked;
     if(!body){toast(I18N.t("Write your message first"));return}
     confirmBox(`${I18N.t("Send this announcement to all students?")}${tg?" "+I18N.t("It will also be sent on Telegram."):""}`,async()=>{const btn=box.querySelector("#annSend");btn.disabled=true;
       try{const {data}=await Cloud.sb.auth.getSession();const tok=data&&data.session&&data.session.access_token;
         const r=await (await fetch(CONFIG.SUPABASE_URL+"/functions/v1/tg-reminders?announce=1",{method:"POST",headers:{Authorization:"Bearer "+tok,apikey:CONFIG.SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({title,body,telegram:tg})})).json();
         if(!r.ok)throw new Error(r.error||"error");toast(`📣 ${I18N.t("Announcement sent")}${tg?` · ${r.sent} ${I18N.t("on Telegram")}${r.failed?` · ${r.failed} ${I18N.t("failed")}`:""}`:""}`);
         box.querySelector("#annT").value="";box.querySelector("#annB").value="";draw()}catch(e){toast(I18N.t("Couldn't send")+": "+(e.message||e))}btn.disabled=false})}}
  /* 🏆 discipline leaderboard of this month: average daily discipline score on active days (not profit) */
  {const m0=today.slice(0,8)+"01",mName=new Date().toLocaleString(I18N.lang==="fr"?"fr-FR":I18N.lang==="ar"?"ar":"en-US",{month:"long"});
   const lb=students.map(s=>{const TR=trades.filter(t=>t.user_id===s.id),PL=plans.filter(p=>p.user_id===s.id),J=judgeTrades(TR).out;
     const days=[...new Set([...TR.map(t=>t.date),...PL.map(p=>p.date)])].filter(d=>d>=m0&&d<=today);
     const sc=days.map(d=>scoreFor(d,TR,PL,J).score);return {s,n:days.length,avg:sc.length?Math.round(sc.reduce((a,b)=>a+b,0)/sc.length):0,streak:discStreak(TR,PL).streak}})
     .filter(r=>r.n>=3).sort((a,b)=>b.avg-a.avg||b.n-a.n);
   const medal=i=>["🥇","🥈","🥉"][i]||`<span class="mono" data-notr>${i+1}</span>`;
   const card=document.createElement("div");card.className="card adm-lb";
   card.innerHTML=`<div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px"><h3 style="margin:0">🏆 <span>Discipline leaderboard</span> · <span data-notr>${esc(mName)}</span></h3>
     ${lb.length?`<button class="btn sm" type="button" id="lbCopy">📋 <span>Copy top 3 for Telegram</span></button>`:""}</div>
     <p class="mut" style="font-size:12px;margin:0 0 10px"><span>Ranked by the average daily discipline score this month (at least 3 active days), not by profit.</span></p>
     ${lb.length?`<div class="tw"><table class="t"><tr><th>#</th><th>Student</th><th>Average score</th><th>Active days</th><th>Streak</th></tr>${lb.slice(0,15).map((r,i)=>`<tr><td>${medal(i)}</td><td><b data-notr>${esc(r.s.name||"—")}</b></td><td><span class="mono ${r.avg>=80?"pos":r.avg>=60?"warn":"neg"}" data-notr>${r.avg}</span></td><td class="mono" data-notr>${r.n}</td><td class="mono" data-notr>🔥 ${r.streak}</td></tr>`).join("")}</table></div>`
       :`<div class="adm-empty"><span>Not enough activity yet this month.</span></div>`}`;
   box.querySelector('[data-sec="discipline"]').prepend(card);
   const cp=card.querySelector("#lbCopy");if(cp)cp.onclick=()=>{const t=`🏆 ${I18N.t("Discipline leaderboard")} · ${mName}\n`+lb.slice(0,3).map((r,i)=>`${["🥇","🥈","🥉"][i]} ${r.s.name} — ${r.avg}/100`).join("\n")+`\n\n${I18N.t("Discipline is the edge nobody can copy.")} — BROWN ALGO`;copyText(t)}}
  mount3d("a3AdmOrb","disciplineOrb",classAvg.v,I18N.t("class score"));
  const show=k=>{S._admTab=k;$$(".adm-tabs [data-at]",box).forEach(b=>b.classList.toggle("on",b.dataset.at===k));$$(".adm-sec",box).forEach(s=>s.classList.toggle("on",s.dataset.sec===k))};
  $$("[data-at]",box).forEach(b=>b.onclick=()=>{show(b.dataset.at);window.scrollTo({top:0,behavior:"smooth"})});show(cur)}
/* 🐞 app errors: screens that broke on members' devices (own error log: client_errors, kept 30 days, no personal data; admin-only read) */
async function admErrors(c){const h=`<h3>🐞 <span>App errors · 7 days</span>`;c.innerHTML=h+`</h3><div class="empty">…</div>`;
  let R=[];try{const{data,error}=await Cloud.sb.from("client_errors").select("at,ver,page,msg,src,line").gte("at",new Date(Date.now()-7*864e5).toISOString()).order("at",{ascending:false}).limit(300);if(error)throw error;R=data||[]}
  catch(e){c.innerHTML=h+`</h3><p class="mut" style="font-size:12px;margin:0"><span>The error log is not set up yet on the server.</span></p>`;return}
  const g={};R.forEach(r=>{const k=r.msg+"|"+r.src+"|"+r.line;const x=g[k]||(g[k]={n:0,r,last:r.at,pages:new Set(),vers:new Set()});x.n++;if(r.page)x.pages.add(r.page);if(r.ver)x.vers.add(r.ver)});
  const L=Object.values(g).sort((a,b)=>b.n-a.n).slice(0,15);
  c.innerHTML=h+` <span class="adm-n" data-notr>${R.length}</span></h3><p class="mut" style="font-size:12px;margin:0 0 8px"><span>Errors that happened on members' screens. Kept 30 days, no personal data. Copy them to Claude to fix them.</span></p>`+
   (L.length?`<div class="tw"><table class="t"><tr><th>Error</th><th>Times</th><th>Where</th><th>Last seen</th></tr>${L.map(x=>`<tr><td data-notr><b>${esc(x.r.msg)}</b><br><small class="mut mono">${esc(String(x.r.src||"").split("/").pop())}${x.r.line?":"+x.r.line:""}${x.vers.size?" · v"+esc([...x.vers].join(", ")):""}</small></td><td data-notr>${x.n}</td><td data-notr>${esc([...x.pages].slice(0,3).join(" "))}</td><td data-notr>${esc(fmtDate(String(x.last).slice(0,10)))}</td></tr>`).join("")}</table></div>`
    :`<div class="adm-empty">✅ <span>No errors in the last 7 days.</span></div>`)}
async function courseAdmin(box,students){if(!box)return;box.innerHTML=`<h3 style="margin:0 0 8px">🎓 <span>Mentorship course</span></h3><div class="empty">…</div>`;
  const r=await CourseAPI.call("adminList");if(!box.isConnected)return;
  if(!r.ok){box.innerHTML=`<h3 style="margin:0 0 8px">🎓 <span>Mentorship course</span></h3><p class="mut" style="font-size:13px">${esc(r.error==="server"||r.error==="network"?I18N.t("The course server isn't set up yet."):cErr(r.error))}</p><button class="btn sm" id="crsLes">🎬 <span>Lessons</span></button>`;$("#crsLes",box).onclick=()=>courseLessonsBox();return}
  const M=(r.members||[]).sort((a,b)=>(b.suspicious?1:0)-(a.suspicious?1:0)||(a.name||"").localeCompare(b.name||""));
  const susp=M.filter(m=>m.suspicious).length,pend=M.filter(m=>m.pend_label).length;
  box.innerHTML=`<div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px"><h3 style="margin:0">🎓 <span>Mentorship course</span> <span class="adm-n" data-notr>${M.length}</span>${susp?` <span class="cv-flag">⚠️ <span data-notr>${susp}</span></span>`:""}${pend?` <span class="cv-flag cv-flag-p">⏳ <span data-notr>${pend}</span></span>`:""}</h3>
     <div class="row" style="gap:6px;flex-wrap:wrap"><input class="i" id="crsQ" placeholder="Search name, email, Telegram" style="width:200px"><button class="btn sm pri" id="crsAdd">＋ <span>Give access</span></button><button class="btn sm" id="crsLes">🎬 <span>Lessons</span></button><button class="btn sm" id="crsAsg">📝 <span>Assignments</span><span class="adm-n hidden" id="crsAsgN" data-notr></span></button></div></div>
    <p class="mut" style="font-size:12px;margin:0 0 10px"><span>Each member opens the course on one device only. Reset device: the next device they open the course on becomes their device. Block: access stops right away on every device.</span></p>
    <div class="acc-list">${M.length?M.map(m=>`<div class="acc-row cv-arow ${m.suspicious?"susp":""}" data-q="${esc(((m.name||"")+" "+(m.email||"")+" "+(m.telegram||"")).toLowerCase().replace(/@/g,""))}">
      <div class="acc-who"><b data-notr>${esc(m.name||"—")}${m.status==="blocked"?` <span class="cv-tag bad">⛔ <span>Blocked</span></span>`:""}${m.suspicious?` <span class="cv-tag warn">⚠️ <span>Check</span></span>`:""}</b>
       <small class="mut" data-notr>${esc(m.email||"")}${m.telegram?" · "+esc(m.telegram):""}</small>
       <small>${m.device_label?`📱 <b data-notr>${esc(m.device_label)}</b> <span class="mut" data-notr>· ${esc(cD(m.device_at))}</span>`:`<span class="mut">⏳ <span>Not activated yet</span></span>`}
        ${m.pend_label?` · <span class="cv-tag pend">⏳ <span>Change to</span> <span data-notr>${esc(m.pend_label)}</span></span>`:""}</small>
       <small class="mut"><span>Device changes:</span> <span data-notr>${(m.resets||[]).length}/2</span>${m.blocked7?` · <span class="neg"><span>Blocked tries (7 days):</span> <span data-notr>${m.blocked7}</span></span>`:""}${m.lastAt?` · <span>Last seen</span> <span data-notr>${esc(cDT(m.lastAt))}${m.lastIp?" · "+esc(m.lastIp):""}${m.lastCountry?" · "+esc(m.lastCountry):""}</span>`:""}</small></div>
      <div class="acc-acts">${m.pend_label?`<button type="button" class="btn sm pri" data-ca="adminApprove" data-u="${m.user_id}">✔ <span>Approve now</span></button>`:""}
       ${m.device_label||m.pend_label?`<button type="button" class="btn sm" data-ca="adminReset" data-u="${m.user_id}">🔁 <span>Reset device</span></button>`:""}
       <button type="button" class="btn sm" data-clog="${m.user_id}">📜 <span>Log</span></button>
       ${m.status==="blocked"?`<button type="button" class="btn sm" data-ca="adminUnblock" data-u="${m.user_id}">✅ <span>Unblock</span></button>`:`<button type="button" class="btn sm" data-ca="adminBlock" data-u="${m.user_id}">⛔ <span>Block</span></button>`}
       <button type="button" class="btn sm danger" data-ca="adminRevoke" data-u="${m.user_id}">✖ <span>Remove access</span></button></div></div>`).join(""):`<div class="empty">No members yet. Use "Give access".</div>`}</div>`;
  const q=$("#crsQ",box);if(q)q.oninput=()=>{const v=q.value.toLowerCase().replace(/@/g,"").trim();$$(".cv-arow",box).forEach(x=>x.classList.toggle("hidden",!x.dataset.q.includes(v)))};
  const ASK={adminReset:"Reset this member's device? The next device they open the course on becomes their device.",adminBlock:"Block this member? The course stops right away on every device.",adminRevoke:"Remove course access for this member?",adminApprove:"Approve the device change now (without the 24-hour wait)?"};
  $$("[data-ca]",box).forEach(b=>b.onclick=()=>{const m=M.find(x=>x.user_id===b.dataset.u),run=async()=>{b.disabled=true;const x=await CourseAPI.call(b.dataset.ca,{userId:b.dataset.u});if(x.ok){toast(I18N.t("Done"));courseAdmin(box,students)}else{b.disabled=false;toast(cErr(x.error))}};
    if(ASK[b.dataset.ca])confirmBox(`${m&&m.name||""} · ${I18N.t(ASK[b.dataset.ca])}`,run);else run()});
  $$("[data-clog]",box).forEach(b=>b.onclick=async()=>{const m=M.find(x=>x.user_id===b.dataset.clog),x=await CourseAPI.call("adminLog",{userId:b.dataset.clog});
    openModal(`<h3 style="margin-top:0">📜 <span>Course log</span> · <span data-notr>${esc(m&&m.name||"")}</span></h3><div class="tw" style="max-height:60vh;overflow:auto"><table class="t"><tr><th>Time</th><th>Action</th><th>Result</th><th>Device</th><th>IP</th></tr>
      ${(x.log||[]).map(l=>`<tr><td class="mono" data-notr>${esc(cDT(l.at))}</td><td data-notr>${esc(l.action)}</td><td>${l.ok?"✅":`❌ <span class="mut" data-notr>${esc(l.reason||"")}</span>`}</td><td data-notr>${esc(l.device||"")}</td><td class="mono" data-notr>${esc(l.ip||"")}${l.country?" · "+esc(l.country):""}</td></tr>`).join("")||`<tr><td colspan="5" class="mut">—</td></tr>`}</table></div>
      <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" id="clX">Close</button></div>`);$("#clX").onclick=closeModal});
  $("#crsLes",box).onclick=()=>courseLessonsBox();
  $("#crsAsg",box).onclick=()=>courseAssignBox(students,M);
  CourseAPI.subs.all().then(a=>{const n=a.filter(s=>s.status==="pending").length,b=$("#crsAsgN",box);if(b&&n){b.textContent=n;b.classList.remove("hidden")}}).catch(()=>{});
  $("#crsAdd",box).onclick=()=>{const have=new Set(M.map(m=>m.user_id)),list=(students||[]).filter(s=>!have.has(s.id));
    openModal(`<h3 style="margin-top:0">🎓 <span>Give course access</span></h3><input class="i" id="gaQ" placeholder="Search name, email, Telegram" style="width:100%;margin-bottom:8px">
      <div class="acc-list" style="max-height:50vh">${list.length?list.map(s=>`<div class="acc-row ga-row" data-q="${esc(((s.name||"")+" "+(s.email||"")+" "+(s.telegram||"")).toLowerCase().replace(/@/g,""))}"><div class="acc-who"><b data-notr>${esc(s.name||"—")}</b><small class="mut" data-notr>${esc(s.email||"")}</small></div><button type="button" class="btn sm pri" data-ga="${s.id}">＋ <span>Give access</span></button></div>`).join(""):`<div class="empty">Every accepted user already has access.</div>`}</div>
      <p class="mut" style="font-size:12px"><span>They get a Telegram message. The first device they open the course on becomes their only course device.</span></p>
      <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" id="gaX">Close</button></div>`);
    $("#gaX").onclick=()=>{closeModal();courseAdmin(box,students)};
    $("#gaQ").oninput=e=>{const v=e.target.value.toLowerCase().replace(/@/g,"").trim();$$(".ga-row").forEach(x=>x.classList.toggle("hidden",!x.dataset.q.includes(v)))};
    $$("[data-ga]").forEach(b=>b.onclick=async()=>{const s=list.find(x=>x.id===b.dataset.ga);b.disabled=true;const x=await CourseAPI.call("adminGrant",{userId:b.dataset.ga,name:s&&s.name,email:s&&s.email});
      if(x.ok){b.outerHTML=`<span class="ind-b">✅ <span>Access given</span></span>`}else{b.disabled=false;toast(cErr(x.error))}})}}
async function courseAssignBox(students,M,filter){filter=filter||"pending";let A=[],L=[];
  try{[A,L]=await Promise.all([CourseAPI.subs.all(),CourseAPI.lessonsAdmin.list()])}catch(e){toast(I18N.t("Couldn't load")+": "+(e.message||e));return}
  const who=id=>(students||[]).find(s=>s.id===id)||(M||[]).map(m=>({id:m.user_id,name:m.name,email:m.email})).find(s=>s.id===id)||{id,name:"—",email:""};
  const les=id=>L.find(l=>l.id===id)||{title:"—"},list=A.filter(s=>filter==="all"||s.status===filter);
  const TAG={pending:`<span class="cv-tag pend">📝 <span>To review</span></span>`,approved:`<span class="cv-tag ok">✅ <span>Approved</span></span>`,redo:`<span class="cv-tag warn">↩ <span>To redo</span></span>`};
  openModal(`<h3 style="margin-top:0">📝 <span>Assignments</span></h3>
    <div class="seg cv-asf">${["pending","redo","approved","all"].map(k=>`<button type="button" data-af="${k}" class="${k===filter?"on":""}">${{pending:"To review",redo:"To redo",approved:"Approved",all:"All"}[k]} <span data-notr>${k==="all"?A.length:A.filter(s=>s.status===k).length}</span></button>`).join("")}</div>
    <div class="acc-list" style="max-height:58vh;margin-top:10px">${list.length?list.map(s=>{const u=who(s.user_id);return `<div class="cv-arv" data-sid="${s.id}">
      <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><div><b data-notr>${esc(u.name||"—")}</b> <small class="mut" data-notr>${esc(u.email||"")}</small><br><small class="mut"><span data-notr>${esc(les(s.lesson_id).title)}</span> · <span data-notr>${esc(cDT(s.created_at))}</span></small></div>${TAG[s.status]||""}</div>
      <p class="cv-ans" data-notr>${esc(s.answer)}</p>${s.feedback?`<div class="cv-fb">💬 <b>Your feedback</b><p data-notr>${esc(s.feedback)}</p></div>`:""}
      ${s.status==="pending"?`<textarea class="i" rows="2" maxlength="2000" placeholder="${esc(I18N.t("Feedback for the student (optional when approving)"))}"></textarea>
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><button type="button" class="btn sm" data-aj="${s.user_id}">📒 <span>Open journal</span></button><button type="button" class="btn sm" data-ar="redo">↩ <span>Ask to redo</span></button><button type="button" class="btn sm pri" data-ar="approved">✅ <span>Approve</span></button></div>`
      :`<div class="row" style="gap:6px;margin-top:6px"><button type="button" class="btn sm" data-aj="${s.user_id}">📒 <span>Open journal</span></button></div>`}</div>`}).join(""):`<div class="empty">Nothing here.</div>`}</div>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" id="asX">Close</button></div>`);
  $("#asX").onclick=closeModal;
  $$("[data-af]").forEach(b=>b.onclick=()=>courseAssignBox(students,M,b.dataset.af));
  $$("[data-aj]").forEach(b=>b.onclick=async()=>{const s=(students||[]).find(x=>x.id===b.dataset.aj);if(!s){toast(I18N.t("This student isn't in your accepted users."));return}closeModal();await loadSubject(s,true);S.view="student";render();window.scrollTo(0,0)});
  $$("[data-ar]").forEach(b=>b.onclick=async()=>{const card=b.closest("[data-sid]"),fb=card.querySelector("textarea").value.trim();
    if(b.dataset.ar==="redo"&&!fb){toast(I18N.t("Write what the student should fix."));card.querySelector("textarea").focus();return}
    b.disabled=true;try{await CourseAPI.subs.review(card.dataset.sid,b.dataset.ar,fb);toast(I18N.t("Saved"));courseAssignBox(students,M,filter)}catch(e){b.disabled=false;toast(I18N.t("Couldn't save")+": "+(e.message||e))}})}
window.__adminLoaded=true;
