/* TRADEVERSITY Mentorship course code (loaded on demand by index.html). Shares index.html's globals (S, API, $, esc, I18N…). Split out on 2026-11-26 to make the app lighter. */
/* ============ Mentorship course (paid content, protected) ============
   ONE DEVICE PER MEMBER. On activation this browser creates an ECDSA P-256 key pair; the private key can't be exported
   (WebCrypto, non-extractable, kept in IndexedDB). The server (Edge Function "course") only stores the public key and
   answers lessons / videos only to requests signed by that key. Same login on another phone, PC or browser = no key = locked.
   Device change: code on Telegram -> the new device waits 24 h (the old one keeps working and can cancel). 1 per 90 days, 2 per year.
   Page protection: no right-click, copy, drag, select, save, print or view-source shortcuts; the page hides when another app
   takes the focus; moving watermark with the member's name and email. Videos: VdoCipher DRM (no download, capture blocked). */
const CDev={_db:null,_mem:null,
  ok(){return !!(window.crypto&&crypto.subtle&&window.indexedDB)},
  other(){return S._demo&&new URLSearchParams(location.search).get("cvother")==="1"},   /* demo only: act as a second device */
  async db(){if(this._db)return this._db;this._db=await new Promise((res,rej)=>{const r=indexedDB.open("tv_course",1);r.onupgradeneeded=()=>r.result.createObjectStore("k");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return this._db},
  async get(){if(this.other())return this._mem;try{const db=await this.db();return await new Promise(res=>{const q=db.transaction("k").objectStore("k").get("dev");q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})}catch(e){return null}},
  async make(){const kp=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},false,["sign","verify"]);const j=await crypto.subtle.exportKey("jwk",kp.publicKey);
    const d={priv:kp.privateKey,pub:{kty:"EC",crv:"P-256",x:j.x,y:j.y},at:Date.now()};
    if(this.other()){this._mem=d;return d}
    const db=await this.db();await new Promise((res,rej)=>{const t=db.transaction("k","readwrite");t.objectStore("k").put(d,"dev");t.oncomplete=res;t.onerror=()=>rej(t.error)});return d},
  async key(){return (await this.get())||await this.make()},
  async sign(d,msg){const s=await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},d.priv,new TextEncoder().encode(msg));return btoa(String.fromCharCode(...new Uint8Array(s)))},
  label(){const u=navigator.userAgent;
    const os=/iPhone/.test(u)?"iPhone":(/iPad/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1))?"iPad":/Android/.test(u)?"Android":/Windows/.test(u)?"Windows PC":/Mac OS X/.test(u)?"Mac":/CrOS/.test(u)?"Chromebook":/Linux/.test(u)?"Linux PC":"Device";
    const br=/Edg\//.test(u)?"Edge":/OPR\/|Opera/.test(u)?"Opera":/SamsungBrowser/.test(u)?"Samsung Internet":/Firefox|FxiOS/.test(u)?"Firefox":/CriOS|Chrome/.test(u)?"Chrome":/Safari/.test(u)?"Safari":"Browser";
    return os+" · "+(/TradeversityApp\//.test(u)?"Cerebra by TDV":br)}};
const CourseAPI={_ts:0,
  async call(action,body={}){if(S._demo)return CourseDemo.call(action,body);
    try{const{data}=await Cloud.sb.auth.getSession();const tok=data&&data.session&&data.session.access_token;
      const r=await fetch(CONFIG.SUPABASE_URL+"/functions/v1/course",{method:"POST",headers:{Authorization:"Bearer "+tok,apikey:CONFIG.SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({action,drm:this._drm||null,...body})});
      let j={};try{j=await r.json()}catch(e){}if(!r.ok&&!j.error)j={ok:false,error:"server"};return j}
    catch(e){return {ok:false,error:"network"}}},
  async signed(action,extra="",body={}){const d=await CDev.key();this._ts=Math.max(Date.now(),this._ts+1);const ts=this._ts;
    const sig=await CDev.sign(d,`${action}|${S.me.id}|${extra}|${ts}`);return this.call(action,{...body,pub:d.pub,ts,sig,label:CDev.label()})},
  async status(){const d=await CDev.get();return this.call("status",{pub:d?d.pub:null})},
  async progress(id,pct,done){if(S._demo)return CourseDemo.progress(id,pct,done);
    const{error}=await Cloud.sb.from("course_progress").upsert({user_id:S.me.id,lesson_id:id,pct,done,updated_at:new Date().toISOString()},{onConflict:"user_id,lesson_id"});if(error)throw error},
  lessonsAdmin:{
    async list(){if(S._demo)return CourseDemo.les;const{data,error}=await Cloud.sb.from("course_lessons").select("*").order("position");if(error)throw error;return data||[]},
    async save(l){if(S._demo){const i=CourseDemo.les.findIndex(x=>x.id===l.id);if(i>=0)CourseDemo.les[i]=l;else CourseDemo.les.push({...l,id:"d"+Date.now()});return}
      const row={position:l.position,module:l.module||null,title:l.title,summary:l.summary||null,minutes:l.minutes||null,video_id:l.video_id||null,published:!!l.published,unlock_days:Math.max(0,parseInt(l.unlock_days)||0),assignment:l.assignment||null};
      const{error}=l.id?await Cloud.sb.from("course_lessons").update(row).eq("id",l.id):await Cloud.sb.from("course_lessons").insert(row);if(error)throw error},
    async del(id){if(S._demo){CourseDemo.les=CourseDemo.les.filter(x=>x.id!==id);return}const{error}=await Cloud.sb.from("course_lessons").delete().eq("id",id);if(error)throw error}},
  /* assignments: the member sends an answer (pending), the mentor approves or asks to redo with feedback */
  subs:{
    async mine(){if(S._demo)return CourseDemo.subs.filter(s=>s.user_id===S.me.id);const{data,error}=await Cloud.sb.from("course_submissions").select("id,lesson_id,answer,status,feedback,created_at,reviewed_at").eq("user_id",S.me.id).order("created_at",{ascending:false});if(error)throw error;return data||[]},
    async send(lessonId,answer){if(S._demo){CourseDemo.subs.unshift({id:"s"+Date.now(),user_id:S.me.id,lesson_id:lessonId,answer,status:"pending",feedback:null,created_at:new Date().toISOString()});return}
      const{error}=await Cloud.sb.from("course_submissions").insert({user_id:S.me.id,lesson_id:lessonId,answer});if(error)throw error},
    async all(){if(S._demo)return CourseDemo.subs;const{data,error}=await Cloud.sb.from("course_submissions").select("id,user_id,lesson_id,answer,status,feedback,created_at,reviewed_at").order("created_at",{ascending:false}).limit(300);if(error)throw error;return data||[]},
    async review(id,status,feedback){if(S._demo){const s=CourseDemo.subs.find(x=>x.id===id);if(s)Object.assign(s,{status,feedback,reviewed_at:new Date().toISOString()});return}
      const{error}=await Cloud.sb.from("course_submissions").update({status,feedback:feedback||null,reviewed_at:new Date().toISOString()}).eq("id",id);if(error)throw error}}};
/* demo mode: the same rules as the server, kept in this browser (real signatures checked with WebCrypto) */
const CourseDemo={les:[],prog:{},subs:[{id:"s0",user_id:"u1",lesson_id:"l2",answer:"I marked the structure on NQ for 5 days, journaled 8 trades, 6 followed the plan. Days: Nov 11 to Nov 15.",status:"pending",feedback:null,created_at:new Date(Date.now()-5*36e5).toISOString()}],
  st(){try{return JSON.parse(localStorage.getItem("tv_cdemo"))}catch(e){return null}},save(m){try{localStorage.setItem("tv_cdemo",JSON.stringify(m))}catch(e){}},
  async ver(pub,msg,sig){try{const k=await crypto.subtle.importKey("jwk",{...pub,ext:true},{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);return await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},k,Uint8Array.from(atob(sig),c=>c.charCodeAt(0)),new TextEncoder().encode(msg))}catch(e){return false}},
  progress(id,pct,done){this.prog[id]={pct,done}},
  async call(a,b){const q=new URLSearchParams(location.search),WAIT=q.get("cvfast")==="1"?20e3:864e5;
    if(q.get("cvlessons")==="1"&&!this.les.length)this.les=[{id:"l1",position:1,module:"Module 1 · Foundations",title:"Welcome and how the course works",summary:"",minutes:6,published:true,video_id:"",unlock_days:0},{id:"l2",position:2,module:"Module 1 · Foundations",title:"Market structure",summary:"",minutes:18,published:true,video_id:"",unlock_days:0,assignment:"Mark the market structure on NQ for 5 days. Journal every trade in Tradeversity and tell me which days you traded and what you saw."},{id:"l3",position:3,module:"Module 2 · Execution",title:"Building your daily plan",summary:"",minutes:14,published:true,video_id:"",unlock_days:7}];
    if(a.startsWith("admin")){const D=this.adm=this.adm||[{user_id:"u1",name:"Yassine B.",email:"yassine@example.com",telegram:"@yassine",status:"active",device_label:"iPhone · Safari",device_at:new Date(Date.now()-9*864e5).toISOString(),resets:[],blocked7:0,lastIp:"105.66.12.4",lastCountry:"DZ",lastAt:new Date().toISOString()},
        {user_id:"u2",name:"Amina K.",email:"amina@example.com",telegram:"@amina_k",status:"active",device_label:"Windows PC · Chrome",device_at:new Date(Date.now()-30*864e5).toISOString(),pend_label:"Android · Chrome",pend_at:new Date(Date.now()-3*36e5).toISOString(),resets:[],blocked7:4,suspicious:true,lastIp:"41.200.3.9",lastCountry:"DZ",lastAt:new Date().toISOString()},
        {user_id:"u3",name:"Karim S.",email:"karim@example.com",telegram:"@karims",status:"active",device_label:null,resets:[],blocked7:0}];
      const m=D.find(x=>x.user_id===b.userId);
      if(a==="adminList")return {ok:true,members:D};if(a==="adminLog")return {ok:true,log:[{at:new Date().toISOString(),action:"play",ok:true,device:"iPhone · Safari",ip:"105.66.12.4",country:"DZ"},{at:new Date(Date.now()-36e5).toISOString(),action:"lessons",ok:false,reason:"other_device",ip:"197.0.4.1",country:"TN"}]};
      if(a==="adminGrant"){if(!m)D.push({user_id:b.userId,name:b.name||"",email:b.email||"",telegram:"",status:"active",device_label:null,resets:[],blocked7:0});return {ok:true}}
      if(!m)return {ok:false,error:"no_user"};
      if(a==="adminRevoke")D.splice(D.indexOf(m),1);if(a==="adminBlock")m.status="blocked";if(a==="adminUnblock")m.status="active";
      if(a==="adminReset")Object.assign(m,{device_label:null,device_at:null,pend_label:null,pend_at:null});
      if(a==="adminApprove")Object.assign(m,{device_label:m.pend_label,device_at:new Date().toISOString(),pend_label:null,pend_at:null});return {ok:true}}
    let m=this.st()||{status:"active",resets:[],last:0};const pub=b.pub,same=(x,y)=>!!x&&!!y&&x.x===y.x&&x.y===y.y,uid=S.me.id;
    if(m.pend&&Date.now()-m.pendAt>=WAIT){m.resets.push(Date.now());Object.assign(m,{dev:m.pend,label:m.pendLabel,at:Date.now(),pend:null,pendLabel:null,pendAt:null,last:0});this.save(m)}
    const lim=()=>{const now=Date.now(),rs=m.resets,yr=rs.filter(t=>now-t<365*864e5),lr=rs.length?Math.max(...rs):0,next=Math.max(lr?lr+90*864e5:0,yr.length>=2?Math.min(...yr)+365*864e5:0);return {left:Math.max(0,2-yr.length),nextAt:next>now?new Date(next).toISOString():null,allowed:next<=now&&yr.length<2}};
    const state=()=>({ok:true,member:true,blocked:m.status==="blocked",device:!m.dev?"none":same(m.dev,pub)?"this":(m.pend&&same(m.pend,pub))?"pending":"other",label:m.label,since:m.at&&new Date(m.at).toISOString(),
      pending:m.pend?{label:m.pendLabel,at:new Date(m.pendAt).toISOString(),readyAt:new Date(m.pendAt+WAIT).toISOString()}:null,resets:lim(),telegram:true});
    const signed=async(extra="")=>{if(!pub||!m.dev||!same(pub,m.dev))return "other_device";if(Math.abs(Date.now()-b.ts)>12e4||b.ts<=m.last)return "bad_time";
      if(!(await this.ver(m.dev,`${a}|${uid}|${extra}|${b.ts}`,b.sig)))return "bad_signature";m.last=b.ts;this.save(m);return ""};
    if(m.status==="blocked")return {ok:true,member:true,blocked:true};
    if(a==="status")return state();
    if(a==="activate"){if(m.dev)return {...state(),ok:false,error:"already_active"};if(b.accept!==true)return {ok:false,error:"must_accept"};
      if(!(await this.ver(pub,`activate|${uid}||${b.ts}`,b.sig)))return {ok:false,error:"bad_signature"};Object.assign(m,{dev:pub,label:b.label,at:Date.now(),last:b.ts});this.save(m);return state()}
    const opens=l=>{const d=l.unlock_days||0;if(!d||!m.at)return null;const t=m.at+d*864e5;return t>Date.now()?new Date(t).toISOString():null};
    if(a==="lessons"){const e=await signed();if(e)return {...state(),ok:false,error:e};return {...state(),lessons:this.les.filter(l=>l.published).map(l=>{const o=opens(l);return {...l,video:!!l.video_id,locked:!!o,opensAt:o,assignment:o?null:(l.assignment||null),pct:(this.prog[l.id]||{}).pct||0,done:!!(this.prog[l.id]||{}).done}})}}
    if(a==="play"){const e=await signed(b.lessonId);if(e)return {ok:false,error:e};const l=this.les.find(x=>x.id===b.lessonId);if(l&&opens(l))return {ok:false,error:"locked",opensAt:opens(l)};return {ok:false,error:!l?"no_lesson":!l.video_id?"video_not_ready":"video_not_configured"}}
    if(a==="cancelPending"){const e=await signed();if(e)return {ok:false,error:e};Object.assign(m,{pend:null,pendLabel:null,pendAt:null});this.save(m);return state()}
    if(a==="resetCode"){if(m.pend)return {ok:false,error:"already_pending"};if(!lim().allowed)return {ok:false,error:"limit",resets:lim()};this.code="123456";
      setTimeout(()=>toast(I18N.t("Demo: your Telegram code is")+" 123456",6000),300);return {ok:true}}
    if(a==="resetConfirm"){if(m.pend)return {ok:false,error:"already_pending"};if(!lim().allowed)return {ok:false,error:"limit"};if(!this.code)return {ok:false,error:"code_expired"};
      if(String(b.code||"").trim()!==this.code)return {ok:false,error:"wrong_code"};if(!(await this.ver(pub,`resetConfirm|${uid}||${b.ts}`,b.sig)))return {ok:false,error:"bad_signature"};
      this.code=null;Object.assign(m,{pend:pub,pendLabel:b.label,pendAt:Date.now()});this.save(m);return state()}
    return {ok:false,error:"unknown_action"}}};
const CERR={other_device:"This course is locked to another device.",bad_time:"Your device's date and time are wrong. Turn on automatic date and time, then try again.",
  bad_signature:"This device couldn't be verified. Reload the page and try again.",limit:"You've used your device changes for now.",
  no_telegram:"Connect your Telegram first, so we can send you the code.",telegram_failed:"We couldn't send the code. Open the Tradeversity bot on Telegram, press Start, then try again.",
  wait_minute:"A code was just sent. Wait a minute before asking for a new one.",code_expired:"The code expired. Ask for a new one.",too_many_tries:"Too many wrong codes. Ask for a new one.",
  wrong_code:"Wrong code. Check the message on Telegram.",already_pending:"A device change is already waiting.",already_active:"The course is already activated on a device.",
  video_not_ready:"This video isn't ready yet.",video_not_configured:"Videos aren't switched on yet.",video_error:"The video couldn't load. Try again in a moment.",
  no_lesson:"This lesson isn't available.",locked:"This lesson isn't open yet.",use_app:"On PC, open the course in Cerebra by TDV.",use_android_app:"On Android, open the course in the Cerebra by TDV app.",ios_blocked:"The course isn't available on iPhone yet. Use an Android phone or a PC.",need_l1:"Your phone is not supported. Please watch the course on a PC with Cerebra by TDV.",not_logged_in:"Please log in again.",must_accept:"Please accept the device rule first.",
  network:"No connection. Check your internet and try again.",server:"The course server isn't reachable. Try again in a moment.",bad_key:"This browser can't hold a secure course key."};
const cErr=e=>I18N.t(CERR[e]||"Something went wrong. Try again.");
const cDT=d=>d?new Date(d).toLocaleString(I18N.locale(),{dateStyle:"medium",timeStyle:"short"}):"";
const cD=d=>d?new Date(d).toLocaleDateString(I18N.locale(),{dateStyle:"medium"}):"";
function courseMark(){const m=S.me||{},who=[m.name,m.email].filter(Boolean).join(" · ")||"Tradeversity member";return esc(who+" · "+new Date().toLocaleDateString(I18N.locale()))}
const C_RULES=`<ul class="cv-rules">
   <li><span class="cv-ri">📱</span><span><b>One device.</b> <span>The course opens only on the device you activate. Another phone, PC or browser can't open it, even with your account and password.</span></span></li>
   <li><span class="cv-ri">🛡</span><span><b>Protected videos.</b> <span>Encrypted videos (DRM): no download, and they play only on this website.</span></span></li>
   <li><span class="cv-ri">💻</span><span><b>On PC and Android.</b> <span>The course plays in the Cerebra by TDV app (Windows and Android), which screen recorders and screenshots can't capture.</span></span></li>
   <li><span class="cv-ri">💧</span><span><b>Your name on every video.</b> <span>Your name and email are shown on every video, so any leak shows who it came from.</span></span></li>
   <li><span class="cv-ri">📜</span><span><b>Course rules.</b> <span>Sharing, recording or downloading the course is forbidden. If a leak shows your name, your access is removed without refund.</span></span></li>
   <li><span class="cv-ri">🗓</span><span><b>Step by step.</b> <span>New lessons open week by week, with assignments your mentor reviews in your journal.</span></span></li>
   <li><span class="cv-ri">🔁</span><span><b>New phone?</b> <span>Move the course yourself with a code sent to your Telegram: once every 90 days, 2 times a year. The new device replaces the old one 24 hours later.</span></span></li>
  </ul>`;
function vCourse(el){el.classList.add("course-v","cv-guard");
  el.innerHTML=`<h1>🎓 <span>Trading mentorship course</span></h1><p class="sub">The Tradeversity mentorship, step by step, by Brown Algo and ZN Trading.</p>
   <div class="cv-intro"><button type="button" class="tour-btn cer-btn" data-cerebra><span class="tour-play">▶</span><span><b>Watch: what is Cerebra by TDV?</b><small>45 seconds · the secure player of the course</small></span></button></div>
   <div id="cvBody"><div class="card cv-soon"><div class="cv-load"></div></div></div>
   <div class="cv-wm" aria-hidden="true" data-notr>${Array.from({length:18},()=>`<span>${courseMark()}</span>`).join("")}</div>
   <div class="cv-shield hidden" id="cvShield"><div>🔒 <span>Content hidden. Click here to continue.</span></div></div>`;
  $("#cvShield").onclick=()=>$("#cvShield").classList.add("hidden");
  courseLoad(el)}
async function courseLoad(el){const B=$("#cvBody",el);if(!B)return;
  if(!CDev.ok()){B.innerHTML=`<div class="card cv-soon"><div class="cv-lock">⚠️</div><h2>This browser can't open the course</h2><p class="mut">Use an up-to-date Chrome, Safari, Edge or Firefox, not a private window.</p></div>`;return}
  const st=await CourseAPI.status();if(!B.isConnected)return;
  if(!st.ok&&st.error){B.innerHTML=`<div class="card cv-soon"><div class="cv-lock">📡</div><h2>${esc(cErr(st.error))}</h2><button class="btn" id="cvRetry">↻ <span>Try again</span></button></div>`;$("#cvRetry",B).onclick=()=>courseLoad(el);return}
  /* iPhone / iPad: the course can't be protected there yet, so it can't be bought or watched on them (members and visitors) */
  if(cvIOS()&&!st.admin)return cvNoIOS(B);
  if(!st.member)return cvSoon(B);
  if(st.blocked){B.innerHTML=`<div class="card cv-soon"><div class="cv-lock">⛔</div><h2>Your course access is suspended</h2><p class="mut">Contact Brown Algo on Telegram.</p></div>`;return}
  if(!st.admin&&cvNeedsApp())return cvGetApp(B);
  /* Android: the course plays only in Cerebra by TDV for Android (secure window: black in screenshots and recordings on every phone).
     Checked before activation, so a browser never takes the member's one course device. */
  if(cvAndroid()&&!cvInApp()&&!st.admin)return cvGetAndroidApp(B);
  if(st.admin||st.device==="this")return cvCourse(el,B,st);
  if(st.device==="none")return cvActivate(el,B,st);
  return cvLocked(el,B,st)}
/* Windows PC: the course plays only in Cerebra by TDV (its window is hidden from every screen recorder and screenshot) */
const CV_APP_URL="https://jointradeversity.com/download/Cerebra-by-TDV-Setup.exe",CV_APK_URL="https://jointradeversity.com/download/Cerebra-by-TDV.apk";
/* iPhone / iPad (also iPadOS asking for the desktop site): the course is not available until the iPhone app + FairPlay exist */
function cvIOS(){const u=navigator.userAgent;return /iPhone|iPad|iPod/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)||(S._demo&&/[?&]cvios=1/.test(location.search))}
function cvNoIOS(B){B.innerHTML=`<div class="card cv-act cv-ios">
    <div class="cv-act-h"><div class="cv-lock">🚫</div><div><h2>The course isn't available on iPhone yet</h2><p class="mut">To protect the sessions from screen recording, the Mentorship course can only be bought and watched on an Android phone or a PC for now.</p></div></div>
    <div class="cv-dev"><span class="cv-dev-ic">📱</span><span><b>Android phone</b><small class="mut">Watch in Cerebra by TDV for Android</small></span></div>
    <div class="cv-dev"><span class="cv-dev-ic">💻</span><span><b>Windows PC</b><small class="mut">Watch in Cerebra by TDV for Windows</small></span></div>
    <p class="mut" style="font-size:13px;margin:12px 0 0"><span>Open jointradeversity.com on your Android phone or your PC to buy and watch the course. An iPhone app is coming.</span></p></div>
   <div class="card cv-how"><h3>How your course access works</h3>${C_RULES}</div>`}
/* Android: guided install, big buttons only. 1 Get the app (download) -> 2 Open it (Downloads) -> 3 Open the app (course page) */
const CV_APK_OPEN="intent://course#Intent;scheme=tradeversity;package=com.tradeversity.player;end";
const CV_DOWNLOADS="intent:#Intent;action=android.intent.action.VIEW_DOWNLOADS;end";
function cvGetAndroidApp(B,step){step=step||1;
  const st=(n,h)=>`<div class="cv-step ${step===n?"on":step>n?"done":""}"><span class="cv-sn">${step>n?"✓":n}</span><div class="cv-sb">${h}</div></div>`;
  B.innerHTML=`<div class="card cv-act cv-app cv-and">
    <div class="cv-act-h"><div class="cv-lock">📱</div><div><h2>Watch the course in the Cerebra by TDV app</h2><p class="mut">On Android the sessions play only in the app: screenshots and screen recordings come out black.</p></div></div>
    <a class="btn cv-open" href="${CV_APK_OPEN}" id="cvOpenApp">▶ <span>I already have the app: open it</span></a>
    ${st(1,`<b>Get the app</b><small class="mut">Free · less than 1 MB · Android 7 or newer</small>
      <a class="btn pri cv-go" href="${CV_APK_URL}" download id="cvGetApk">⬇ <span>Get the app</span></a>
      <small class="mut">If Chrome asks, tap "Download anyway".</small>`)}
    ${st(2,`<b>Install it</b>
      <a class="btn pri cv-go" href="${CV_DOWNLOADS}" id="cvOpenDl">📂 <span>Open the downloaded app</span></a>
      <small class="mut">Tap "Cerebra-by-TDV" → Install. If Android asks, allow Chrome, then go back and tap Install. If Play Protect warns, tap "More details" → "Install anyway".</small>`)}
    ${st(3,`<b>Open it and log in</b>
      <a class="btn pri cv-go" href="${CV_APK_OPEN}">▶ <span>Open the app</span></a>
      <small class="mut">Log in with your account: the Mentorship course opens.</small>`)}
    <p class="mut" style="font-size:12px;margin:12px 0 0"><span>Can't find the downloaded file? Open the Files app → Downloads.</span></p>${cvSafe("android")}</div>
   <div class="card cv-how"><h3>How your course access works</h3>${C_RULES}</div>`;
  const g=$("#cvGetApk",B);if(g)g.addEventListener("click",()=>setTimeout(()=>cvGetAndroidApp(B,2),1200));
  const d=$("#cvOpenDl",B);if(d)d.addEventListener("click",()=>setTimeout(()=>cvGetAndroidApp(B,3),1500))}
const cvInApp=()=>/TradeversityApp\//.test(navigator.userAgent)||(S._demo&&/[?&]cvapp=1/.test(location.search));
const cvNeedsApp=()=>/Windows NT/.test(navigator.userAgent)&&!cvInApp()&&!cvAndroid();
/* Android: the course plays only on phones with hardware video protection (Widevine L1).
   On L2/L3 phones the video can be screen-recorded, so they are refused (the server checks it too). */
function cvAndroid(){return /Android/i.test(navigator.userAgent)||(S._demo&&/[?&]cvandroid=1/.test(location.search))}
let _cvDrm=null;
async function cvDrmLevel(){if(_cvDrm)return _cvDrm;
  if(S._demo){const f=(location.search.match(/[?&]cvdrm=(L1|L2|L3|none)/)||[])[1];if(f)return _cvDrm=f}
  if(!navigator.requestMediaKeySystemAccess)return _cvDrm="none";
  const ok=async r=>{try{await navigator.requestMediaKeySystemAccess("com.widevine.alpha",[{initDataTypes:["cenc"],videoCapabilities:[{contentType:'video/mp4; codecs="avc1.42E01E"',robustness:r}]}]);return true}catch(e){return false}};
  return _cvDrm=await ok("HW_SECURE_ALL")?"L1":await ok("HW_SECURE_CRYPTO")?"L2":await ok("SW_SECURE_CRYPTO")?"L3":"none"}
function cvNoL1(B,lv){B.innerHTML=`<div class="card cv-act cv-nol1">
    <div class="cv-act-h"><div class="cv-lock">📵</div><div><h2>Your phone is not supported</h2><p class="mut">To protect the course from screen recording, the sessions only play on phones with hardware video protection (Widevine L1). This phone doesn't have it.</p></div></div>
    <div class="cv-dev"><span class="cv-dev-ic">🔓</span><span><b data-notr>${lv==="none"?"No DRM":"Widevine "+esc(lv)}</b><small class="mut">This phone's protection level</small></span></div>
    <div class="cv-warn"><b>💻 <span>Watch the course sessions on your PC</span></b>
     <ol class="cv-steps" style="margin:8px 0 0"><li><span>On your PC, open jointradeversity.com and log in.</span></li>
      <li><span>Open the Mentorship course and download Cerebra by TDV.</span></li>
      <li><span>Install it, log in, and watch the sessions there.</span></li></ol></div>
    <p class="mut" style="font-size:12px;margin:12px 0 8px"><span>Opened the site inside Telegram, Instagram or another app? Open it in Google Chrome and check again.</span></p>
    <button class="btn" id="cvL1Retry">↻ <span>Check again</span></button></div>
   <div class="card cv-how"><h3>How your course access works</h3>${C_RULES}</div>`;
  $("#cvL1Retry",B).onclick=()=>{_cvDrm=null;CourseAPI._drm=null;const el=B.closest(".course-v");if(el)courseLoad(el)}}
function cvSafe(kind){const L=["Cerebra by TDV is made by the TRADEVERSITY team, only for this course.","It opens your TRADEVERSITY course and nothing else: it doesn't read your files, photos or other apps.",
  kind==="android"?"It asks for only two permissions: internet, and installing its own updates.":"Windows shows \"Windows protected your PC\" because the app is new and not yet signed with a paid certificate, not because it is harmful.",
  ...(kind==="android"?["Play Protect warns about any app that doesn't come from Google Play. A Google Play version is planned."]:[]),
  "Updates come only from jointradeversity.com and are checked with a digital fingerprint before they install.","Only download it from jointradeversity.com. Nobody from TRADEVERSITY will send you the app in a private message."];
  return `<details class="cv-safe"><summary>🛡️ <span>Is it safe?</span></summary><ul>${L.map(t=>`<li><span>${esc(t)}</span></li>`).join("")}</ul></details>`}
function cvGetApp(B){B.innerHTML=`<div class="card cv-act cv-app">
    <div class="cv-act-h"><div class="cv-lock">💻</div><div><h2>On PC, the course plays in Cerebra by TDV</h2><p class="mut">To protect the lessons, screen recorders and screenshots can't capture the app. On an Android phone, use the Cerebra by TDV app for Android.</p></div></div>
    <a class="btn pri cv-go" href="${CV_APP_URL}" download>⬇ <span>Download Cerebra by TDV for Windows</span></a>
    <ol class="cv-steps"><li><span>Open the downloaded file "Cerebra-by-TDV-Setup.exe".</span></li>
     <li><span>If Windows shows "Windows protected your PC", click "More info", then "Run anyway".</span></li>
     <li><span>Press OK to install. The Cerebra by TDV icon appears on your desktop.</span></li>
     <li><span>Open it, log in with your account, and open the Mentorship course.</span></li></ol>
    <p class="mut" style="font-size:12px;margin:0"><span>Windows 10 or 11 · free · no admin rights needed · about 65 MB</span></p>${cvSafe("windows")}</div>
   <div class="card cv-how"><h3>How your course access works</h3>${C_RULES}</div>`}
function cvSoon(B){B.innerHTML=`<div class="card cv-soon">
    <div class="cv-lock">🔒</div><h2>Content still unavailable</h2>
    <p class="mut">The lessons are being prepared. They will appear here as soon as they are ready.</p>
    <div class="cv-badges"><span class="ind-b">🛡 <span>Protected content</span></span><span class="ind-b">👤 <span>Members only</span></span><span class="ind-b">📱 <span>One device</span></span></div></div>
   <div class="card cv-how"><h3>How your course access works</h3>${C_RULES}</div>`}
function cvDevBox(lbl,sub){return `<div class="cv-dev"><span class="cv-dev-ic">${/iPhone|Android/.test(lbl)?"📱":/iPad/.test(lbl)?"📲":"💻"}</span><span><b data-notr>${esc(lbl||"")}</b>${sub?`<small class="mut">${sub}</small>`:""}</span></div>`}
function cvActivate(el,B,st){
  B.innerHTML=`<div class="card cv-act"><div class="cv-act-h"><div class="cv-lock">📱</div><div><h2>Activate this device</h2><p class="mut">Your course opens on one device only. Activate the device you will study on.</p></div></div>
    ${cvDevBox(CDev.label(),`<span>This device</span>`)}
    <div class="cv-warn"><b>⚠️ <span>Read before you activate</span></b>
     <ul><li><span>This device will be the only device that can open the course.</span></li>
      <li><span>The course will not open on any other phone, PC or browser, even with your account and password.</span></li>
      <li><span>Use your usual browser. A private window, or clearing this browser's data, locks the course on this device.</span></li>
      <li><span>Changed device? Move the course yourself with a code sent to your Telegram: once every 90 days, 2 times a year.</span></li></ul></div>
    <label class="cv-ok"><input type="checkbox" id="cvAcc"><span>I understand and accept that this device is my only course device.</span></label>
    <label class="cv-ok"><input type="checkbox" id="cvRules"><span>I will not share, record or download the course. If a leak shows my name, my access is removed without refund.</span></label>
    <button class="btn pri cv-go" id="cvActBtn" disabled>🔐 <span>Activate this device</span></button></div>
   <div class="card cv-how"><h3>How your course access works</h3>${C_RULES}</div>`;
  const acc=$("#cvAcc",B),rul=$("#cvRules",B),go=$("#cvActBtn",B);acc.onchange=rul.onchange=()=>go.disabled=!(acc.checked&&rul.checked);
  go.onclick=async()=>{go.disabled=true;go.classList.add("busy");
    const r=await CourseAPI.signed("activate","",{accept:true});
    if(r.ok&&r.device==="this"){toast(I18N.t("This device is now your course device"));courseLoad(el)}
    else{go.disabled=false;go.classList.remove("busy");toast(cErr(r.error));if(r.error==="already_active")courseLoad(el)}}}
function cvLocked(el,B,st){
  const p=st.pending,mine=st.device==="pending",R=st.resets||{};
  if(mine){const left=Math.max(0,new Date(p.readyAt)-Date.now()),h=Math.floor(left/36e5),mi=Math.ceil(left%36e5/6e4);
    B.innerHTML=`<div class="card cv-soon"><div class="cv-lock">⏳</div><h2>This device is waiting</h2>
      <p class="mut"><span>Your course moves to this device on</span> <b data-notr>${esc(cDT(p.readyAt))}</b> <span class="mut" data-notr>(${h}h ${mi}m)</span>.</p>
      ${cvDevBox(p.label,`<span>New course device</span>`)}
      <p class="mut" style="font-size:12.5px"><span>Until then your old device keeps working. This waiting time protects your account if someone else asked for the change.</span></p>
      <button class="btn" id="cvRetry">↻ <span>Check again</span></button></div>`;
    $("#cvRetry",B).onclick=()=>courseLoad(el);return}
  B.innerHTML=`<div class="card cv-soon cv-lockd"><div class="cv-lock">🔒</div><h2>This course is locked to another device</h2>
     <p class="mut"><span>Your course is activated on:</span></p>${cvDevBox(st.label,st.since?`<span>Since</span> <span data-notr>${esc(cD(st.since))}</span>`:"")}
     <p class="mut" style="font-size:13px"><span>It can't open on this device, even with your account. For your protection, every try is recorded.</span></p>
     ${p?`<div class="cv-note">⏳ <span>A device change is already waiting:</span> <b data-notr>${esc(p.label||"")}</b> · <span data-notr>${esc(cDT(p.readyAt))}</span></div>`
       :R.allowed?`<button class="btn pri cv-go" id="cvMove">📲 <span>Move my course to this device</span></button><p class="mut" style="font-size:12px;margin-top:8px"><span>Device changes left this year:</span> <b data-notr>${R.left}</b></p>`
       :`<div class="cv-note">🔁 <span>You've used your device changes for now. Next change possible on</span> <b data-notr>${esc(cD(R.nextAt))}</b>. <span>Lost your device? Contact Brown Algo on Telegram.</span></div>`}
   </div>`;
  const mv=$("#cvMove",B);if(mv)mv.onclick=()=>cvMoveFlow(el,st)}
function cvMoveFlow(el,st){
  if(!st.telegram){toast(cErr("no_telegram"));return}
  openModal(`<div class="cv-flow"><h3 style="margin-top:0">📲 <span>Move my course to this device</span></h3>
    ${cvDevBox(CDev.label(),`<span>New course device</span>`)}
    <ol class="cv-steps"><li><span>We send a 6-digit code to your Telegram.</span></li><li><span>You enter the code here.</span></li><li><span>24 hours later, this device replaces your old one. Until then the old device keeps working and can cancel.</span></li></ol>
    <div id="cvStep"><button class="btn pri cv-go" id="cvSend">✈️ <span>Send the code to my Telegram</span></button></div>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" id="cvClose">Cancel</button></div></div>`);
  $("#cvClose").onclick=closeModal;
  const send=$("#cvSend");send.onclick=async()=>{send.disabled=true;send.classList.add("busy");const r=await CourseAPI.call("resetCode");
    if(!r.ok){send.disabled=false;send.classList.remove("busy");toast(cErr(r.error));return}
    $("#cvStep").innerHTML=`<label class="f"><span>Code from Telegram</span><input class="i cv-code" id="cvCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••"></label>
      <label class="cv-ok"><input type="checkbox" id="cvAcc2"><span>I accept that this device becomes my only course device.</span></label>
      <button class="btn pri cv-go" id="cvConf" disabled>✔ <span>Confirm the change</span></button><button type="button" class="btn sm" id="cvResend" style="margin-top:8px">↻ <span>Send a new code</span></button>`;
    const c=$("#cvCode"),a=$("#cvAcc2"),ok=$("#cvConf"),upd=()=>ok.disabled=!(a.checked&&/^\d{6}$/.test(c.value.trim()));c.oninput=()=>{c.value=c.value.replace(/\D/g,"").slice(0,6);upd()};a.onchange=upd;setTimeout(()=>c.focus(),50);
    $("#cvResend").onclick=async()=>{const r2=await CourseAPI.call("resetCode");toast(r2.ok?I18N.t("New code sent"):cErr(r2.error))};
    ok.onclick=async()=>{ok.disabled=true;ok.classList.add("busy");const r2=await CourseAPI.signed("resetConfirm","",{code:c.value.trim()});
      if(r2.ok&&r2.device==="pending"){closeModal();toast(I18N.t("Done. This device becomes your course device in 24 hours."),5000);courseLoad(el)}
      else{ok.classList.remove("busy");upd();toast(cErr(r2.error))}}}}
async function cvCourse(el,B,st){
  B.innerHTML=`<div class="card cv-soon"><div class="cv-load"></div></div>`;
  const r=await CourseAPI.signed("lessons");if(!B.isConnected)return;
  if(!r.ok){if(r.error==="other_device")return courseLoad(el);if(r.error==="use_app")return cvGetApp(B);if(r.error==="need_l1"||r.error==="use_android_app")return cvGetAndroidApp(B);if(r.error==="ios_blocked")return cvNoIOS(B);B.innerHTML=`<div class="card cv-soon"><div class="cv-lock">⚠️</div><h2>${esc(cErr(r.error))}</h2><button class="btn" id="cvRetry">↻ <span>Try again</span></button></div>`;$("#cvRetry",B).onclick=()=>courseLoad(el);return}
  let subs=[];if(!st.admin){try{subs=await CourseAPI.subs.mine()}catch(e){}}if(!B.isConnected)return;
  const subOf=id=>subs.find(s=>s.lesson_id===id);
  const SUBTAG={pending:`<small class="cv-tag pend">📝 <span>Sent to your mentor</span></small>`,approved:`<small class="cv-tag ok">✅ <span>Approved</span></small>`,redo:`<small class="cv-tag warn">↩ <span>To redo</span></small>`};
  const L=(r.lessons||[]).sort((a,b)=>a.position-b.position),done=L.filter(l=>l.done).length,pc=L.length?Math.round(done/L.length*100):0,next=L.find(l=>!l.done&&!l.locked);
  const mods=[];L.forEach(l=>{const k=l.module||"";let g=mods.find(x=>x.k===k);if(!g)mods.push(g={k,ls:[]});g.ls.push(l)});let n=0;
  const p=st.pending;
  B.innerHTML=`${st.admin&&cvIOS()?`<div class="cv-note cv-adm">🚫 <span>iPhone/iPad: members and visitors can't buy or watch the course here.</span> <button type="button" class="btn sm" id="cvSeeMemberIos">👀 <span>See what members see</span></button></div>`:""}${st.admin&&cvNeedsApp()?`<div class="cv-note cv-adm">💻 ⛔ <span>PC browser: members are sent to Cerebra by TDV for Windows.</span> <button type="button" class="btn sm" id="cvSeeMemberPc">👀 <span>See what members see</span></button></div>`:""}${st.admin&&cvAndroid()?`<div class="cv-note cv-adm">📱 ${cvInApp()?`✅ <span>Android app: secure screen on. Members watch the course here.</span>`:`⛔ <span>Android browser: members are sent to the Cerebra by TDV app.</span> <button type="button" class="btn sm" id="cvSeeMember">👀 <span>See what members see</span></button>`}</div>`:""}${st.admin?`<div class="cv-note cv-adm">👑 <span>Admin preview: the device lock doesn't apply to you. Unpublished lessons are shown.</span></div>`:""}
   <div class="cv-lic"><span>🛡 <span>Licensed to</span> <b data-notr>${esc(S.me.name||S.me.email||"")}</b></span>${st.admin?"":`<span>📱 <span>This device:</span> <b data-notr>${esc(st.label||CDev.label())}</b></span>`}</div>
   ${p&&!st.admin?`<div class="cv-note cv-pend"><span>⚠️ <span>A device change was requested for</span> <b data-notr>${esc(p.label||"")}</b> <span>on</span> <span data-notr>${esc(cDT(p.at))}</span>. <span>It replaces this device on</span> <b data-notr>${esc(cDT(p.readyAt))}</b>. <span>Not you? Cancel it now.</span></span><button class="btn sm danger" id="cvCancel">✖ <span>Cancel the change</span></button></div>`:""}
   ${L.length?`<div class="card cv-prog"><div class="row" style="justify-content:space-between;gap:10px;flex-wrap:wrap"><div><b>Your progress</b> <span class="mut" data-notr>${done}/${L.length} · ${pc}%</span></div>${next?`<button class="btn pri sm" data-les="${next.id}">▶ <span>${done?"Continue":"Start the course"}</span></button>`:`<span class="ind-b">🏆 <span>Course completed</span></span>`}</div><div class="cv-bar"><i style="width:${pc}%"></i></div></div>
     ${mods.map(g=>`<div class="card cv-mod">${g.k?`<h3 data-notr>${esc(g.k)}</h3>`:""}${g.ls.map(l=>{++n;if(l.locked)return `<div class="cv-les locked"><span class="cv-n">🔒</span><span class="cv-t"><b data-notr>${esc(l.title)}</b><small class="mut"><span>Opens on</span> <span data-notr>${esc(cD(l.opensAt))}</span></small></span><span class="cv-m mut" data-notr>${l.minutes?l.minutes+" min":""}</span><span class="cv-s"></span></div>`;
       const sb=subOf(l.id);return `<button type="button" class="cv-les ${l.done?"done":""}" data-les="${l.id}"><span class="cv-n" data-notr>${l.done?"✓":n}</span><span class="cv-t"><b data-notr>${esc(l.title)}</b>${l.summary?`<small class="mut" data-notr>${esc(l.summary)}</small>`:""}${st.admin&&!l.published?`<small class="cv-draft">Draft</small>`:""}${st.admin&&l.unlock_days?`<small class="mut">🗓 <span>Opens</span> <span data-notr>+${l.unlock_days}d</span></small>`:""}${l.assignment?(sb?SUBTAG[sb.status]:`<small class="cv-tag">📝 <span>Assignment</span></small>`):""}</span><span class="cv-m mut" data-notr>${l.minutes?l.minutes+" min":""}</span><span class="cv-s">${l.done?"":l.pct?`<span data-notr>${l.pct}%</span>`:"▶"}</span></button>`}).join("")}</div>`).join("")}`
   :`<div class="card cv-soon"><div class="cv-lock">🎬</div><h2>Content still unavailable</h2><p class="mut">The lessons are being prepared. They will appear here as soon as they are ready.</p></div>`}
   ${st.admin?"":`<div class="card cv-devcard"><h3>📱 <span>Your course device</span></h3>${cvDevBox(st.label,st.since?`<span>Activated</span> <span data-notr>${esc(cD(st.since))}</span>`:"")}
     <p class="mut" style="font-size:12.5px;margin:10px 0 0"><span>New phone or PC? Open the course on the new device and press "Move my course to this device". Changes left this year:</span> <b data-notr>${(st.resets||{}).left??2}</b></p></div>`}`;
  const smi=$("#cvSeeMemberIos",B);if(smi)smi.onclick=()=>{cvNoIOS(B);window.scrollTo(0,0)};
  const smp=$("#cvSeeMemberPc",B);if(smp)smp.onclick=()=>{cvGetApp(B);window.scrollTo(0,0)};
  const sm=$("#cvSeeMember",B);if(sm)sm.onclick=()=>{cvGetAndroidApp(B);window.scrollTo(0,0)};
  const cc=$("#cvCancel",B);if(cc)cc.onclick=async()=>{cc.disabled=true;const x=await CourseAPI.signed("cancelPending");if(x.ok){toast(I18N.t("Device change cancelled"));courseLoad(el)}else{cc.disabled=false;toast(cErr(x.error))}};
  $$("[data-les]",B).forEach(b=>b.onclick=()=>cvPlay(el,L.find(l=>l.id===b.dataset.les),st,subOf(b.dataset.les)))}
async function cvPlay(el,l,st,sub){if(!l)return;
  const r=st.admin?await CourseAPI.call("play",{lessonId:l.id}):await CourseAPI.signed("play",l.id,{lessonId:l.id});
  if(r.error==="other_device"){toast(cErr(r.error));courseLoad(el);return}if(r.error==="use_app"||r.error==="need_l1"||r.error==="use_android_app"){courseLoad(el);return}
  if(r.error==="locked"){toast(I18N.t("This lesson opens on")+" "+cD(r.opensAt));return}
  /* a lesson whose video isn't ready can still show its assignment */
  const soon=!r.ok&&["video_not_ready","video_not_configured"].includes(r.error);
  if(!r.ok&&!(soon&&l.assignment)){toast(cErr(r.error));return}
  const pl=document.createElement("div");pl.className="cv-player";
  const ST={pending:"📝 <span>Sent to your mentor. You'll see the feedback here.</span>",approved:"✅ <span>Approved by your mentor</span>",redo:"↩ <span>Your mentor asks you to redo it</span>"};
  pl.innerHTML=`<div class="cv-pbox"><div class="cv-ph"><b data-notr>${esc(l.title)}</b><button class="btn sm" id="cvPx" aria-label="Close">✕</button></div>
    ${r.ok?`<div class="cv-frame"><iframe src="https://player.vdocipher.com/v2/?otp=${encodeURIComponent(r.otp)}&playbackInfo=${encodeURIComponent(r.playbackInfo)}" allow="encrypted-media; fullscreen" allowfullscreen referrerpolicy="origin"></iframe></div>`
      :`<div class="cv-frame cv-nov"><div>🎬 <span>${esc(cErr(r.error))}</span></div></div>`}
    <div class="cv-pf"><span class="mut" style="font-size:12px">🛡 <span>Protected video · licensed to</span> <span data-notr>${esc(S.me.name||S.me.email||"")}</span></span><button class="btn pri sm" id="cvDone">✓ <span>${l.done?"Done":"Mark as done"}</span></button></div>
    ${l.assignment?`<div class="cv-asg"><h4>📝 <span>Assignment</span></h4><p data-notr>${esc(l.assignment)}</p>
      ${sub?`<div class="cv-sub ${sub.status}"><b>${ST[sub.status]||""}</b><p class="mut" data-notr>${esc(sub.answer)}</p>${sub.feedback?`<div class="cv-fb">💬 <b>Mentor feedback</b><p data-notr>${esc(sub.feedback)}</p></div>`:""}</div>`:""}
      ${st.admin?`<p class="mut" style="font-size:12px">👑 <span>Members send their answer here. You review them in Admin → Mentorship course → Assignments.</span></p>`
        :!sub||sub.status==="redo"?`<textarea class="i" id="cvAns" rows="4" maxlength="4000" placeholder="${esc(I18N.t("What did you do? Which days in your journal?"))}"></textarea>
        <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:8px"><button type="button" class="btn sm" id="cvJr">📒 <span>Open my journal</span></button><button type="button" class="btn pri sm" id="cvSend" disabled>✈️ <span>Send to my mentor</span></button></div>`:""}</div>`:""}</div>`;
  el.appendChild(pl);
  const close=()=>{pl.remove();courseLoad(el)};$("#cvPx",pl).onclick=close;
  $("#cvDone",pl).onclick=async()=>{try{await CourseAPI.progress(l.id,100,true);toast(I18N.t("Lesson completed"));close()}catch(e){toast(I18N.t("Couldn't save")+": "+(e.message||e))}};
  const ans=$("#cvAns",pl),snd=$("#cvSend",pl);
  if(ans){ans.oninput=()=>snd.disabled=ans.value.trim().length<10;
    $("#cvJr",pl).onclick=()=>{pl.remove();go("journal")};
    snd.onclick=async()=>{snd.disabled=true;try{await CourseAPI.subs.send(l.id,ans.value.trim().slice(0,4000));toast(I18N.t("Sent to your mentor"));close()}catch(e){snd.disabled=false;toast(I18N.t("Couldn't send")+": "+(e.message||e))}}}}
(function courseGuard(){const on=()=>S.view==="course"&&!!document.querySelector(".cv-guard"),hide=()=>{const s=$("#cvShield");if(s&&on())s.classList.remove("hidden")};
  ["contextmenu","copy","cut","dragstart","selectstart"].forEach(t=>document.addEventListener(t,e=>{if(on()&&e.target.closest&&e.target.closest(".cv-guard")&&!e.target.closest("input,textarea"))e.preventDefault()},true));
  document.addEventListener("keydown",e=>{if(!on())return;const k=(e.key||"").toLowerCase(),c=e.ctrlKey||e.metaKey;
    if(k==="printscreen"||k==="f12"||(c&&["s","p","u"].includes(k))||(c&&k==="c"&&!e.target.closest("input,textarea"))||(c&&e.shiftKey&&["i","j","c","s"].includes(k))){e.preventDefault();e.stopPropagation();hide()}},true);
  document.addEventListener("keyup",e=>{if(on()&&(e.key||"").toLowerCase()==="printscreen"){hide();try{navigator.clipboard.writeText("")}catch(x){}}},true);
  /* clicking into the video player moves the focus into its frame: that is not a screenshot tool */
  addEventListener("blur",()=>setTimeout(()=>{const a=document.activeElement;if(a&&a.tagName==="IFRAME")return;hide()},0));
  document.addEventListener("visibilitychange",()=>{if(document.hidden)hide()});addEventListener("beforeprint",hide)})();
/* admin: course members (device, change waiting, suspicious use) + lessons */

/* admin: review the members' assignments (open their journal, approve, or ask to redo with feedback) */

async function courseLessonsBox(){let L=[];try{L=(await CourseAPI.lessonsAdmin.list()).sort((a,b)=>a.position-b.position)}catch(e){toast(I18N.t("Couldn't load")+": "+(e.message||e));return}
  openModal(`<h3 style="margin-top:0">🎬 <span>Course lessons</span></h3>
    <p class="mut" style="font-size:12px;margin-top:0"><span>Upload each video to VdoCipher, then paste its video ID here. Only published lessons are shown to members.</span></p>
    <div class="acc-list" style="max-height:48vh">${L.length?L.map(l=>`<div class="acc-row"><div class="acc-who"><b data-notr>${l.position}. ${esc(l.title)}</b><small class="mut" data-notr>${esc(l.module||"")}${l.minutes?" · "+l.minutes+" min":""}</small><small>${l.published?`<span class="cv-tag ok">✅ <span>Published</span></span>`:`<span class="cv-tag">📝 <span>Draft</span></span>`} ${l.video_id?`<span class="cv-tag ok">🎬 <span>Video linked</span></span>`:`<span class="cv-tag warn">⚠️ <span>No video yet</span></span>`} <span class="cv-tag">🗓 ${l.unlock_days?`<span>Day</span> <span data-notr>${l.unlock_days}</span>`:`<span>Right away</span>`}</span>${l.assignment?` <span class="cv-tag">📝 <span>Assignment</span></span>`:""}</small></div>
      <div class="acc-acts"><button type="button" class="btn sm" data-le="${l.id}">✏️ <span>Edit</span></button><button type="button" class="btn sm danger" data-ld="${l.id}">🗑</button></div></div>`).join(""):`<div class="empty">No lessons yet.</div>`}</div>
    <div class="row" style="justify-content:space-between;margin-top:12px"><button class="btn pri" id="leAdd">＋ <span>Add a lesson</span></button><button class="btn" id="leX">Close</button></div>`);
  $("#leX").onclick=closeModal;$("#leAdd").onclick=()=>courseLessonEdit({position:(L.length?Math.max(...L.map(x=>x.position)):0)+1,module:L.length?L[L.length-1].module:"",published:false});
  $$("[data-le]").forEach(b=>b.onclick=()=>courseLessonEdit(L.find(x=>x.id===b.dataset.le)));
  $$("[data-ld]").forEach(b=>b.onclick=()=>{const l=L.find(x=>x.id===b.dataset.ld);confirmBox(`${I18N.t("Delete this lesson?")} ${l.title}`,async()=>{try{await CourseAPI.lessonsAdmin.del(l.id);courseLessonsBox()}catch(e){toast(I18N.t("Couldn't delete")+": "+(e.message||e))}})})}
function courseLessonEdit(l){
  openModal(`<h3 style="margin-top:0">${l.id?"✏️ <span>Edit the lesson</span>":"＋ <span>New lesson</span>"}</h3>
    <div class="grid2" style="display:grid;grid-template-columns:90px minmax(0,1fr);gap:8px"><label class="f"><span>Order</span><input class="i" id="leP" type="number" min="0" value="${l.position||0}"></label><label class="f"><span>Module</span><input class="i" id="leM" value="${esc(l.module||"")}" placeholder="Module 1 · Foundations"></label></div>
    <label class="f"><span>Title</span><input class="i" id="leT" value="${esc(l.title||"")}" maxlength="140"></label>
    <label class="f"><span>Short description</span><input class="i" id="leS" value="${esc(l.summary||"")}" maxlength="240"></label>
    <div style="display:grid;grid-template-columns:110px minmax(0,1fr);gap:8px"><label class="f"><span>Minutes</span><input class="i" id="leMin" type="number" min="0" value="${l.minutes||""}"></label><label class="f"><span>VdoCipher video ID</span><input class="i mono" id="leV" value="${esc(l.video_id||"")}" placeholder="e.g. 1234567890abcdef1234567890abcdef"></label></div>
    <div style="display:grid;grid-template-columns:150px minmax(0,1fr);gap:8px;align-items:end"><label class="f"><span>Opens after (days)</span><input class="i" id="leU" type="number" min="0" max="365" value="${l.unlock_days||0}"></label><p class="mut" style="font-size:12px;margin:0 0 10px"><span>Counted from the day the member got access. 0 = right away, 7 = week 2, 14 = week 3.</span></p></div>
    <label class="f"><span>Assignment (optional)</span><textarea class="i" id="leA" rows="3" maxlength="1500" placeholder="e.g. Mark the structure on NQ for 5 days and journal every trade.">${esc(l.assignment||"")}</textarea></label>
    <label class="cv-ok"><input type="checkbox" id="lePub" ${l.published?"checked":""}><span>Published (members can see it)</span></label>
    <div class="row" style="justify-content:flex-end;gap:8px;margin-top:12px"><button class="btn" id="leC">Cancel</button><button class="btn pri" id="leOk">💾 <span>Save</span></button></div>`);
  $("#leC").onclick=courseLessonsBox;
  $("#leOk").onclick=async()=>{const t=$("#leT").value.trim();if(!t){toast(I18N.t("Add a title"));return}
    const v=$("#leV").value.trim();if(v&&!/^[A-Za-z0-9_-]{8,64}$/.test(v)){toast(I18N.t("This VdoCipher video ID doesn't look right"));return}
    try{await CourseAPI.lessonsAdmin.save({...l,position:parseInt($("#leP").value)||0,module:$("#leM").value.trim(),title:t,summary:$("#leS").value.trim(),minutes:parseInt($("#leMin").value)||null,video_id:v,published:$("#lePub").checked,unlock_days:Math.max(0,parseInt($("#leU").value)||0),assignment:$("#leA").value.trim()});toast(I18N.t("Saved"));courseLessonsBox()}
    catch(e){toast(I18N.t("Couldn't save")+": "+(e.message||e))}}}
