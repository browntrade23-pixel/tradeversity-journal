/* Tradeversity: light 2D section backgrounds that react to the trader's state.
   today = aurora coloured by the discipline score · news = world map with the open sessions + red-news pulse
   plan = night sky turning into dawn before the New York open · risk = calm blue glow, red when risk is too big
   consistency = flowing lines, smooth when consistent · about = slow gold dust.
   State comes from window.__bgState (set by the app). opts.still = draw one frame only (Light mode). */
const C=(h)=>{h=h.replace("#","");return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
const rgba=(c,a)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
const ST=()=>window.__bgState||{};

/* time in a city: hours as a decimal + weekday (0 = Sunday) */
function cityTime(tz){try{const p=new Intl.DateTimeFormat("en-US",{timeZone:tz,hour:"2-digit",minute:"2-digit",weekday:"short",hour12:false}).formatToParts(new Date()),g=k=>(p.find(x=>x.type===k)||{}).value;
  return {h:(Number(g("hour"))%24)+Number(g("minute"))/60,wd:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday"))}}catch(e){const d=new Date();return {h:d.getHours()+d.getMinutes()/60,wd:d.getDay()}}}

/* rough continents (longitude, latitude) for a dim dotted world map */
const LAND=[
 [[-168,66],[-140,70],[-95,72],[-80,63],[-62,58],[-55,50],[-66,44],[-75,35],[-81,25],[-97,26],[-97,19],[-88,15],[-80,8],[-84,10],[-105,20],[-115,30],[-124,40],[-125,49],[-135,58],[-150,60],[-165,60]],
 [[-55,82],[-25,82],[-20,70],[-45,60],[-55,68]],
 [[-80,8],[-60,10],[-50,0],[-35,-6],[-40,-22],[-55,-34],[-65,-42],[-70,-54],[-75,-45],[-72,-30],[-71,-18],[-81,-5]],
 [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[8,54],[10,58],[5,62],[15,69],[30,71],[40,67],[45,55],[40,45],[28,41],[23,36],[15,38],[12,44],[5,43],[-2,37]],
 [[-6,50],[2,51],[-2,56],[-5,58],[-6,55]],
 [[-17,21],[-10,30],[-6,35],[10,37],[32,31],[43,12],[51,12],[40,-2],[40,-15],[35,-25],[20,-35],[15,-28],[12,-12],[8,4],[-8,5],[-17,14]],
 [[40,45],[45,55],[40,67],[70,73],[110,77],[140,72],[170,70],[180,66],[160,60],[140,55],[135,43],[122,40],[122,30],[110,20],[106,10],[100,13],[98,8],[92,22],[80,15],[77,8],[72,20],[62,25],[56,26],[50,30],[48,30],[36,36]],
 [[36,30],[43,12],[52,16],[58,22],[56,26],[48,30]],
 [[130,31],[136,34],[140,36],[142,40],[141,45],[139,38],[132,34]],
 [[95,5],[105,-6],[115,-8],[120,-9],[130,-3],[118,2],[105,2]],
 [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[140,-38],[132,-32],[115,-35]]];
const SESS=[["Tokyo","Asia/Tokyo",139.7,35.7,9,15,"#7c8bff"],["London","Europe/London",-0.1,51.5,8,16.5,"#2ad1c9"],["New York","America/New_York",-74,40.7,9.5,16,"#f5b942"]];

export function sectionBg(el,kind,opts={}){
  const cv=document.createElement("canvas"),x=cv.getContext("2d");el.innerHTML="";el.appendChild(cv);
  const ph=innerWidth<821,SC=ph?.6:.5;let W=0,H=0,map=null;
  const size=()=>{W=cv.width=Math.max(2,Math.round(innerWidth*SC));H=cv.height=Math.max(2,Math.round(innerHeight*SC));cv.style.width="100%";cv.style.height="100%";map=null;if(opts.still)frame(performance.now()/1000)};
  const R=(a=1)=>(Math.random()*2-1)*a;
  /* --- per design state --- */
  const stars=Array.from({length:ph?90:160},()=>({x:Math.random(),y:Math.random()*.75,r:.3+Math.random()*1.1,p:Math.random()*6}));
  const dust=Array.from({length:ph?70:130},()=>({x:Math.random(),y:Math.random(),r:.4+Math.random()*1.8,v:.006+Math.random()*.02,p:Math.random()*6,b:Math.random()<.12}));
  const motes=Array.from({length:ph?40:70},()=>({x:Math.random(),y:Math.random(),r:.5+Math.random()*1.5,v:.004+Math.random()*.01,p:Math.random()*6}));
  let col=null;   /* colour that eases toward the target */
  const ease=(target,k)=>{col=col?mix(col,target,k):target.slice();return col};
  const buildMap=()=>{const off=document.createElement("canvas");off.width=W;off.height=H;const o=off.getContext("2d");o.fillStyle="#fff";
    const P=(lo,la)=>[(lo+180)/360*W,(80-la)/138*H*.8+H*.1];
    LAND.forEach(poly=>{o.beginPath();poly.forEach(([lo,la],i)=>{const [px,py]=P(lo,la);i?o.lineTo(px,py):o.moveTo(px,py)});o.closePath();o.fill()});
    const d=o.getImageData(0,0,W,H).data,step=Math.max(4,Math.round(W/110)),pts=[];
    for(let yy=step/2;yy<H;yy+=step)for(let xx=step/2;xx<W;xx+=step){if(d[((yy|0)*W+(xx|0))*4+3]>0)pts.push([xx,yy,(xx/W)*360-180,80-((yy-H*.1)/(H*.8))*138])}
    map={pts,step,P}};
  function frame(t){const s=ST();x.globalCompositeOperation="source-over";x.clearRect(0,0,W,H);
    if(kind==="aurora"){
      const sc=s.score,tgt=sc==null?C("#5b6cf0"):sc>=80?C("#12e07a"):sc>=60?C("#f5b942"):C("#ff2d55"),c=ease(tgt,.03),c2=mix(c,C("#5b6cf0"),.55);
      x.fillStyle="#04050b";x.fillRect(0,0,W,H);x.globalCompositeOperation="lighter";
      for(let k=0;k<3;k++){const base=H*(.18+k*.11),amp=H*(.05+k*.02),len=H*(.32-k*.05),cc=k===1?c2:c;
        for(let xx=0;xx<=W;xx+=3){const y=base+Math.sin(xx/W*6.3*(1+k*.4)+t*(.25+k*.08)+k)*amp+Math.sin(xx/W*17+t*.6+k*2)*amp*.25;
          const a=(.12+.08*Math.sin(xx/W*9+t*.7+k))*(k===2?.6:1);const g=x.createLinearGradient(0,y,0,y+len);g.addColorStop(0,rgba(cc,0));g.addColorStop(.15,rgba(cc,a));g.addColorStop(1,rgba(cc,0));x.fillStyle=g;x.fillRect(xx,y,3,len)}}
      x.globalCompositeOperation="source-over";for(const p of stars){x.fillStyle=`rgba(255,255,255,${.25+.25*Math.sin(t*1.3+p.p)})`;x.fillRect(p.x*W,p.y*H,p.r*SC*1.4,p.r*SC*1.4)}}
    else if(kind==="map"){if(!map)buildMap();
      x.fillStyle="#03050b";x.fillRect(0,0,W,H);
      /* day / night: dots on the sunny side are a little brighter */
      const now=new Date(),utc=now.getUTCHours()+now.getUTCMinutes()/60,doy=Math.floor((now-new Date(now.getUTCFullYear(),0,0))/864e5),slon=(12-utc)*15,slat=-23.44*Math.cos(2*Math.PI*(doy+10)/365),rad=Math.PI/180;
      const r=Math.max(1,map.step*.22);
      for(const [px,py,lo,la] of map.pts){const cz=Math.sin(la*rad)*Math.sin(slat*rad)+Math.cos(la*rad)*Math.cos(slat*rad)*Math.cos((lo-slon)*rad),a=cz>0?.16+cz*.14:.08;
        x.fillStyle=`rgba(124,139,255,${a})`;x.fillRect(px-r,py-r,r*2,r*2)}
      x.globalCompositeOperation="lighter";
      SESS.forEach(([nm,tz,lo,la,o,cl,hex],i)=>{const ct=cityTime(tz),open=ct.wd>0&&ct.wd<6&&ct.h>=o&&ct.h<cl,[px,py]=map.P(lo,la),cc=C(hex),pul=.5+.5*Math.sin(t*2+i);
        const rr=(open?W*.06:W*.018)*(open?(.85+.15*pul):1),g=x.createRadialGradient(px,py,0,px,py,rr);g.addColorStop(0,rgba(cc,open?.55:.18));g.addColorStop(1,rgba(cc,0));x.fillStyle=g;x.beginPath();x.arc(px,py,rr,0,7);x.fill();
        x.fillStyle=rgba(cc,open?.95:.4);x.beginPath();x.arc(px,py,Math.max(1.5,W*.003),0,7);x.fill();
        x.globalCompositeOperation="source-over";x.font=`600 ${Math.max(8,Math.round(W*.0105))}px Inter,system-ui,sans-serif`;x.fillStyle=rgba(cc,open?.75:.3);x.fillText(nm+(open?" · open":""),px+W*.008,py-W*.008);x.globalCompositeOperation="lighter"});
      x.globalCompositeOperation="source-over";
      if(s.redSoon){const a=.1+.1*Math.sin(t*3.2),g=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,"rgba(255,45,85,0)");g.addColorStop(1,`rgba(255,45,85,${a+.12})`);x.fillStyle=g;x.fillRect(0,0,W,H)}}
    else if(kind==="dawn"){
      const ny=cityTime("America/New_York");let mins;{const h=ny.h,wd=ny.wd;const open=9.5;if(wd>0&&wd<6&&h<open)mins=(open-h)*60;else{let left=(24-h)+open,w=(wd+1)%7;while(w===0||w===6){left+=24;w=(w+1)%7}mins=left*60}}
      const k=Math.max(0,Math.min(1,1-mins/600)),dawn=k*k*(3-2*k);   /* 0 = deep night (10h+ before the open), 1 = the open */
      const top=mix(C("#03040c"),C("#141a44"),dawn),midc=mix(C("#060819"),C("#3a2a5c"),dawn),hor=mix(C("#0a0c1e"),C("#c2603a"),dawn*.75);
      const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,rgba(top,1));g.addColorStop(.62,rgba(midc,1));g.addColorStop(1,rgba(hor,1));x.fillStyle=g;x.fillRect(0,0,W,H);
      for(const p of stars){x.fillStyle=`rgba(255,255,255,${(1-dawn*.85)*(.3+.3*Math.sin(t*1.2+p.p))})`;x.fillRect(p.x*W,p.y*H*.8,p.r*SC*1.5,p.r*SC*1.5)}
      x.globalCompositeOperation="lighter";const sy=H*(1.08-dawn*.16),sr=H*(.35+dawn*.25),sg=x.createRadialGradient(W*.62,sy,0,W*.62,sy,sr);sg.addColorStop(0,`rgba(255,170,90,${.08+dawn*.32})`);sg.addColorStop(1,"rgba(255,140,80,0)");x.fillStyle=sg;x.fillRect(0,0,W,H);
      x.globalCompositeOperation="source-over";
      /* mountain silhouette */
      x.fillStyle="#020309";x.beginPath();x.moveTo(0,H);for(let i=0;i<=60;i++){const xx=i/60*W,y=H*(.86-.05*Math.sin(xx/W*7.3+1)-.035*Math.sin(xx/W*19+2)-.02*Math.sin(xx/W*41));x.lineTo(xx,y)}x.lineTo(W,H);x.closePath();x.fill()}
    else if(kind==="shield"){
      const tgt=s.risk==="bad"?C("#ff2d55"):s.risk==="warn"?C("#f5b942"):C("#2f5bff"),c=ease(tgt,.04);
      x.fillStyle="#03050c";x.fillRect(0,0,W,H);x.globalCompositeOperation="lighter";
      const br=.75+.25*Math.sin(t*.6),g=x.createRadialGradient(W*.5,H*.42,0,W*.5,H*.42,Math.max(W,H)*.6*br);g.addColorStop(0,rgba(c,.22));g.addColorStop(.5,rgba(c,.07));g.addColorStop(1,rgba(c,0));x.fillStyle=g;x.fillRect(0,0,W,H);
      const g2=x.createRadialGradient(W*.15,H*.9,0,W*.15,H*.9,W*.5);g2.addColorStop(0,rgba(mix(c,C("#7a3cff"),.5),.08));g2.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g2;x.fillRect(0,0,W,H);
      for(const m of motes){m.y-=m.v*.016;if(m.y<-.05)m.y=1.05;x.fillStyle=rgba(c,.25+.2*Math.sin(t+m.p));x.beginPath();x.arc((m.x+Math.sin(t*.2+m.p)*.01)*W,m.y*H,m.r*SC*1.6,0,7);x.fill()}}
    else if(kind==="waves"){
      const ok=s.cons,amp=ok===1?.012:ok===-1?.07:.035,chaos=ok===-1?1:ok===1?.15:.45,tgt=ok===-1?C("#ff6a3d"):ok===1?C("#12e07a"):C("#2ad1c9"),c=ease(tgt,.03);
      x.fillStyle="#03050b";x.fillRect(0,0,W,H);x.globalCompositeOperation="lighter";x.lineWidth=Math.max(1,1.4*SC*2);
      for(let k=0;k<7;k++){const yb=H*(.2+k*.1),cc=k%2?mix(c,C("#5b6cf0"),.5):c;x.strokeStyle=rgba(cc,.16+.05*Math.sin(t+k));x.beginPath();
        for(let i=0;i<=120;i++){const xx=i/120*W,y=yb+Math.sin(i/120*6.3*(1+k*.15)+t*(.5+k*.05)+k)*H*amp+Math.sin(i/120*23+t*1.7+k*3)*H*amp*chaos;i?x.lineTo(xx,y):x.moveTo(xx,y)}x.stroke()}}
    else if(kind==="dust"){
      x.fillStyle="#04040a";x.fillRect(0,0,W,H);x.globalCompositeOperation="lighter";
      const g=x.createRadialGradient(W*.5,H*.3,0,W*.5,H*.3,Math.max(W,H)*.55);g.addColorStop(0,"rgba(245,185,66,.08)");g.addColorStop(1,"rgba(245,185,66,0)");x.fillStyle=g;x.fillRect(0,0,W,H);
      for(const d of dust){d.y-=d.v*.016;d.x+=Math.sin(t*.3+d.p)*.0002;if(d.y<-.05){d.y=1.05;d.x=Math.random()}const a=(.25+.35*Math.sin(t*1.4+d.p))*(d.b?.5:1),rr=(d.b?d.r*4:d.r)*SC*1.6;
        if(d.b){const bg=x.createRadialGradient(d.x*W,d.y*H,0,d.x*W,d.y*H,rr);bg.addColorStop(0,`rgba(255,210,122,${a*.35})`);bg.addColorStop(1,"rgba(255,210,122,0)");x.fillStyle=bg}else x.fillStyle=`rgba(255,210,122,${Math.max(0,a)})`;
        x.beginPath();x.arc(d.x*W,d.y*H,rr,0,7);x.fill()}}
    x.globalCompositeOperation="source-over"}
  size();addEventListener("resize",size);
  if(opts.still){frame(performance.now()/1000);
    const iv=setInterval(()=>{if(!el.isConnected){clearInterval(iv);removeEventListener("resize",size);return}frame(performance.now()/1000)},30000);return {}}
  let last=0;(function loop(now){if(!el.isConnected){removeEventListener("resize",size);return}requestAnimationFrame(loop);if(document.hidden||now-last<33)return;last=now;frame(now/1000)})(0);
  return {}}
