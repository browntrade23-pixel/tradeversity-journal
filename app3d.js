/* In-app 3D designs (Three.js, loaded only on the page that shows them).
   equityMountain · disciplineOrb · streakFlame · calendar3d · trophyRoom · newsClock · firmGalaxy
   Every design: drag to rotate where it makes sense, tap callbacks, stops and frees memory when its element leaves the page. */
import * as THREE from "three";
const small=()=>innerWidth<821;
/* phones: pause 3D while the page is being scrolled (smooth scrolling) and draw every other frame */
/* each animation keeps its own frame counter, so two 3D designs on one page both get drawn */
const busy=f=>small()&&(performance.now()-(window.__scrollT||0)<160||((f._n=(f._n||0)+1)%2===1));
const C={up:new THREE.Color("#26a69a"),dn:new THREE.Color("#ef5350"),gold:new THREE.Color("#f5b942"),gold2:new THREE.Color("#ffd27a"),ind:new THREE.Color("#3a48e0"),ind2:new THREE.Color("#7c8bff"),grey:new THREE.Color("#3a4152"),white:new THREE.Color("#ffffff"),teal:new THREE.Color("#2ec5c9")};

function base(el,{h=260,fov=45,pos=[0,0,10],look=[0,0,0],drag=true}={}){
  const r=new THREE.WebGLRenderer({antialias:!small(),alpha:true});   /* throws on devices without WebGL: the flat version stays */
  const w=el.clientWidth||320;el.style.height=h+"px";el.style.position="relative";el.innerHTML="";r.setPixelRatio(Math.min(devicePixelRatio,small()?1.5:2));r.setSize(w,h);el.appendChild(r.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(fov,w/h,.1,300);cam.position.set(...pos);cam.lookAt(...look);
  scene.add(new THREE.AmbientLight(0xffffff,.6));const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(4,9,7);scene.add(dl);
  const grp=new THREE.Group();scene.add(grp);
  const st={ry:0,rx:0,touched:false};let down=false,px=0,py=0,moved=0;const cv=r.domElement;cv.style.touchAction=drag?"pan-y":"auto";cv.style.cursor=drag?"grab":"pointer";
  if(drag){cv.addEventListener("pointerdown",e=>{down=true;moved=0;px=e.clientX;py=e.clientY});
    addEventListener("pointerup",()=>{down=false});
    cv.addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-px,dy=e.clientY-py;moved+=Math.abs(dx)+Math.abs(dy);st.ry+=dx*.01;st.rx=Math.max(-.5,Math.min(.5,st.rx+dy*.005));px=e.clientX;py=e.clientY;st.touched=true})}
  const ray=new THREE.Raycaster(),m=new THREE.Vector2();
  const pick=(e,objs)=>{const b=cv.getBoundingClientRect();m.x=((e.clientX-b.left)/b.width)*2-1;m.y=-((e.clientY-b.top)/b.height)*2+1;ray.setFromCamera(m,cam);return ray.intersectObjects(objs,true)[0]};
  const onTap=(objs,cb)=>cv.addEventListener("click",e=>{if(moved>8)return;const hit=pick(e,objs);if(hit)cb(hit,e)});
  const ro=new ResizeObserver(()=>{const w2=el.clientWidth;if(!w2)return;r.setSize(w2,h);cam.aspect=w2/h;cam.updateProjectionMatrix()});ro.observe(el);
  const clock=new THREE.Clock();let tick=()=>{};
  (function loop(){if(!el.isConnected){ro.disconnect();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(mt=>{if(mt.map)mt.map.dispose();mt.dispose()})});r.dispose();return}
    requestAnimationFrame(loop);if(document.hidden||busy(loop))return;tick(clock.getElapsedTime(),st);r.render(scene,cam)})();
  return {r,scene,cam,grp,st,cv,pick,onTap,setTick:f=>tick=f}}
const overlay=(el,html,cls)=>{const d=document.createElement("div");d.className="a3-ov "+(cls||"");d.innerHTML=html;el.appendChild(d);return d};
function glowSprite(color,size){const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.3,"rgba(255,255,255,.5)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,64,64);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),color,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.set(size,size,1);return s}
function emojiTex(ch,bg){const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");
  const g=x.createRadialGradient(64,50,10,64,64,64);g.addColorStop(0,bg[0]);g.addColorStop(1,bg[1]);x.fillStyle=g;x.beginPath();x.arc(64,64,62,0,7);x.fill();
  x.font="64px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(ch,64,70);return new THREE.CanvasTexture(c)}
function pointsMat(size){return new THREE.PointsMaterial({size,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,map:glowSprite(0xffffff,1).material.map})}

/* 1. EQUITY MOUNTAIN: cumulative P&L as a landscape. Ridge height = equity, green/red by the day's result, gold ridge line. Tap a peak → that day. */
export function equityMountain(el,days,onDay){const keys=Object.keys(days).sort().slice(-120);if(keys.length<2)return null;
  const B=base(el,{h:small()?240:300,pos:[0,4.2,9.5],look:[0,1,0]});let eq=0;const E=keys.map(k=>eq+=days[k]),mn=Math.min(0,...E),mx=Math.max(0,...E),Y=v=>(v-mn)/((mx-mn)||1)*3.2;
  const n=keys.length,W=10,segZ=small()?10:16,geo=new THREE.PlaneGeometry(W,3.4,n-1,segZ);geo.rotateX(-Math.PI/2);
  const p=geo.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const ix=Math.round((p.getX(i)+W/2)/W*(n-1)),z=p.getZ(i),f=Math.exp(-(z*z)/.8),y=Y(E[ix])*f;p.setY(i,y);
    c.copy(days[keys[ix]]>=0?C.up:C.dn).lerp(C.ind,1-f*.9).multiplyScalar(.45+.55*f);col.set([c.r,c.g,c.b],i*3)}
  geo.setAttribute("color",new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.55,metalness:.15,side:THREE.DoubleSide}));B.grp.add(mesh);
  B.grp.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x7c8bff,wireframe:true,transparent:true,opacity:.12})));
  const ridge=new THREE.CatmullRomCurve3(E.map((v,i)=>new THREE.Vector3(-W/2+i/(n-1)*W,Y(v)+.04,0)));B.grp.add(new THREE.Mesh(new THREE.TubeGeometry(ridge,n*3,.045,6),new THREE.MeshBasicMaterial({color:C.gold})));
  const peak=E.indexOf(Math.max(...E)),dot=glowSprite(C.gold2,.9);dot.position.set(-W/2+peak/(n-1)*W,Y(E[peak])+.25,0);B.grp.add(dot);
  const zero=Y(0),gz=new THREE.GridHelper(11,22,0x3a4a7a,0x232b45);gz.position.y=Math.min(zero,0)-.01;B.grp.add(gz);
  B.onTap([mesh],hit=>{const ix=Math.round((hit.point.x-B.grp.position.x+W/2)/W*(n-1));const k=keys[Math.max(0,Math.min(n-1,ix))];if(k&&onDay)onDay(k)});
  B.setTick((t,st)=>{B.grp.rotation.y=st.ry+(st.touched?0:Math.sin(t*.25)*.35);B.grp.rotation.x=st.rx;dot.material.opacity=.6+.4*Math.sin(t*3)});return B}

/* 2. DISCIPLINE ORB: calm and bright when the score is high, red and agitated when rules are broken */
export function disciplineOrb(el,score,label){const B=base(el,{h:small()?150:170,pos:[0,0,5.2],drag:false});const N=small()?900:1600,pos=new Float32Array(N*3),col=new Float32Array(N*3),seed=new Float32Array(N);
  const s=Math.max(0,Math.min(100,score))/100,c=s>=.8?C.up.clone().lerp(C.gold2,.25):s>=.6?C.gold.clone():C.dn.clone(),agit=(1-s)*.55+.04,speed=.4+(1-s)*2.2;
  for(let i=0;i<N;i++){seed[i]=Math.random();const cc=c.clone().lerp(C.white,Math.random()*.35);col.set([cc.r,cc.g,cc.b],i*3)}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));
  const pts=new THREE.Points(g,pointsMat(.09));B.grp.add(pts);const core=glowSprite(c,2.4+s*1.2);B.grp.add(core);
  overlay(el,`<b>${score}</b><small>${label||""}</small>`,"orb");
  B.setTick(t=>{for(let i=0;i<N;i++){const k=i/N,phi=Math.acos(1-2*k),th=Math.PI*(1+Math.sqrt(5))*i,sd=seed[i];
      const r=1.25+agit*Math.sin(t*speed*2+sd*20)*(.5+sd)+.05*Math.sin(t*1.3+i);pos[i*3]=r*Math.sin(phi)*Math.cos(th+t*.15);pos[i*3+1]=r*Math.cos(phi);pos[i*3+2]=r*Math.sin(phi)*Math.sin(th+t*.15)}
    g.attributes.position.needsUpdate=true;pts.rotation.y=t*.2;core.material.opacity=.35+.25*Math.sin(t*(1+speed))});return B}

/* 3. STREAK FLAME: grows with each disciplined day in a row */
export function streakFlame(el,streak){const B=base(el,{h:small()?120:130,pos:[0,1.1,4.2],look:[0,1.1,0],drag:false});const k=Math.min(1,.25+streak/12),N=small()?500:900;
  const pos=new Float32Array(N*3),col=new Float32Array(N*3),life=new Float32Array(N),sp=new Float32Array(N);for(let i=0;i<N;i++){life[i]=Math.random();sp[i]=.4+Math.random()*.6}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));
  B.grp.add(new THREE.Points(g,pointsMat(.16)));const glow=glowSprite(C.gold,1.6*k+.6);glow.position.y=.4;B.grp.add(glow);const c=new THREE.Color();
  let last=0;B.setTick(t=>{const dt=Math.min(.05,t-last);last=t;for(let i=0;i<N;i++){life[i]+=dt*sp[i]*.9;if(life[i]>1)life[i]=0;const L=life[i],H=2.4*k;
      const w=(1-L)*(.55*k+.1)*(1+.3*Math.sin(t*6+i));pos[i*3]=Math.sin(i*12.9+t*2)*w;pos[i*3+1]=L*H;pos[i*3+2]=Math.cos(i*7.3+t*2)*w*.6;
      c.copy(C.gold2).lerp(C.gold,L*1.2).lerp(C.dn,Math.max(0,L-.45));c.multiplyScalar(1-L*.6);col.set([c.r,c.g,c.b],i*3)}
    g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;glow.material.opacity=.45+.15*Math.sin(t*8)});return B}

/* 4. 3D P&L CALENDAR: each day of the month a column, height = P&L, green / red. Tap → that day. */
export function calendar3d(el,days,month,onDay){const [y,m]=month.split("-").map(Number),first=new Date(y,m-1,1),nd=new Date(y,m,0).getDate(),off=(first.getDay()+6)%7;
  const vals=[];for(let d=1;d<=nd;d++){const k=`${month}-${String(d).padStart(2,"0")}`;vals.push([k,days[k]])}const mx=Math.max(1,...vals.map(v=>Math.abs(v[1]||0)));
  const B=base(el,{h:small()?260:320,pos:[0,small()?7:5.6,small()?8.2:6.6],look:[0,0,.3]});const boxes=[],rows=Math.ceil((nd+off)/7);
  vals.forEach(([k,v],i)=>{const idx=i+off,cx=(idx%7-3)*1.1,cz=(Math.floor(idx/7)-(rows-1)/2)*1.1,hasV=v!=null,h=hasV?.12+Math.abs(v)/mx*2.6:.06;
    const mat=new THREE.MeshStandardMaterial({color:hasV?(v>=0?C.up:C.dn):C.grey,roughness:.4,metalness:.2,emissive:hasV?(v>=0?C.up:C.dn):C.grey,emissiveIntensity:hasV?.25:.05});
    const b=new THREE.Mesh(new THREE.BoxGeometry(.9,h,.9),mat);b.position.set(cx,h/2,cz);b.userData.k=k;b.userData.h=h;b.scale.y=.001;boxes.push(b);B.grp.add(b)});
  const plate=new THREE.Mesh(new THREE.BoxGeometry(8,.06,rows*1.1+.3),new THREE.MeshStandardMaterial({color:0x10131c,roughness:.9}));plate.position.y=-.03;B.grp.add(plate);
  B.onTap(boxes,hit=>{if(onDay)onDay(hit.object.userData.k)});
  B.setTick((t,st)=>{boxes.forEach((b,i)=>{const g=Math.min(1,Math.max(.001,(t*1.6-i*.04)));b.scale.y=g;b.position.y=b.userData.h*g/2});B.grp.rotation.y=st.ry+(st.touched?0:Math.sin(t*.3)*.25);B.grp.rotation.x=st.rx});return B}

/* 5. TROPHY ROOM: earned badges as gold medals on a shelf, locked ones grey. Tap a medal → it spins + callback. */
export function trophyRoom(el,badges,onBadge){const per=small()?4:7,rws=Math.ceil(badges.length/per);const B=base(el,{h:small()?120+rws*95:70+rws*95,pos:[0,.2,small()?5.6+rws*.4:3.6+rws*.55],look:[0,.1,0]}),rows=Math.ceil(badges.length/per),med=[];
  badges.forEach((b,i)=>{const r=Math.floor(i/per),c=i%per,x=(c-(per-1)/2)*1.25,y=(rows-1)/2*1.55-r*1.55+.2;
    const tex=emojiTex(b.ok?b.ic:"🔒",b.ok?["#ffe39a","#c98a1c"]:["#4a5163","#232838"]);
    const face=new THREE.MeshStandardMaterial({map:tex,metalness:b.ok?.6:.2,roughness:.35}),edge=new THREE.MeshStandardMaterial({color:b.ok?C.gold:C.grey,metalness:.8,roughness:.3});
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.1,40),[edge,face,face]);disc.rotation.x=Math.PI/2;
    const holder=new THREE.Group();holder.add(disc);holder.position.set(x,y,0);holder.userData={b,spin:0,base:Math.random()*6};disc.userData.holder=holder;med.push(disc);B.grp.add(holder);
    const shelf=new THREE.Mesh(new THREE.BoxGeometry(1.1,.08,.6),new THREE.MeshStandardMaterial({color:0x2a2f3d,roughness:.8}));shelf.position.set(x,y-.62,0);B.grp.add(shelf);
    if(b.ok){const gl=glowSprite(C.gold,1.6);gl.position.set(x,y,-.3);B.grp.add(gl)}});
  /* fit the whole shelf in view whatever the screen width */
  const fit=()=>{const w=el.clientWidth||320,hh=parseFloat(el.style.height)||200,asp=w/hh,tn=Math.tan(22.5*Math.PI/180),needW=Math.min(per,badges.length)*1.25+.4,needH=rows*1.55+.3;
    B.cam.position.set(0,.1,Math.max(needH/(2*tn),needW/(2*tn*asp))+.6);B.cam.lookAt(0,.1,0)};fit();new ResizeObserver(fit).observe(el);
  B.onTap(med,hit=>{const h=hit.object.userData.holder;h.userData.spin=1;if(onBadge)onBadge(h.userData.b)});
  B.setTick((t,st)=>{B.grp.children.forEach(o=>{if(o.userData&&o.userData.b){const u=o.userData;u.spin=Math.max(0,u.spin-.01);o.rotation.y=Math.sin(t*.6+u.base)*.35+u.spin*Math.PI*4*(1-u.spin)+(u.b.ok?0:0)}});
    B.grp.rotation.y=st.ry*.5;B.grp.rotation.x=st.rx*.5});return B}

/* 6. NEWS CLOCK: ring that fills toward the next red news (last 60 min), pulses red inside the no-trade window */
export function newsClock(el,getState){const B=base(el,{h:small()?170:180,pos:[0,0,5],drag:false});
  B.grp.add(new THREE.Mesh(new THREE.TorusGeometry(1.5,.07,12,120),new THREE.MeshBasicMaterial({color:0x232b45})));
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,tk=new THREE.Mesh(new THREE.BoxGeometry(.04,.22,.04),new THREE.MeshBasicMaterial({color:0x3a4a7a}));tk.position.set(Math.sin(a)*1.85,Math.cos(a)*1.85,0);tk.rotation.z=-a;B.grp.add(tk)}
  let arc=null;const glow=glowSprite(C.gold,3.2);B.grp.add(glow);const ov=overlay(el,"","clock");try{ov.innerHTML=getState().label}catch(e){}   /* the countdown shows at once, before the first 3D frame */let lastP=-1,lastS="";
  B.setTick(t=>{const s=getState(),p=s.inWindow?1:Math.max(0,Math.min(1,1-s.mins/60)),col=s.inWindow?C.dn:p>.9?C.dn.clone().lerp(C.gold,.4):C.gold;
    if(Math.abs(p-lastP)>.004||s.label!==lastS){if(arc){B.grp.remove(arc);arc.geometry.dispose()}arc=new THREE.Mesh(new THREE.TorusGeometry(1.5,.12,14,140,Math.max(.001,p*Math.PI*2)),new THREE.MeshBasicMaterial({color:col}));
      arc.rotation.z=Math.PI/2;arc.scale.x=-1;B.grp.add(arc);lastP=p;lastS=s.label;ov.innerHTML=s.label}
    const pulse=s.inWindow?.5+.5*Math.sin(t*6):.3;glow.material.color.copy(col);glow.material.opacity=pulse;arc&&(arc.material.color=col)});return B}

/* 7. PROP FIRM GALAXY: firms as planets around a gold core. Colour = Algeria (green yes, teal likely, grey ask, red no), gold ring = discount. Tap → firm. */
export function firmGalaxy(el,firms,onFirm){const B=base(el,{h:small()?300:360,pos:[0,4.5,10],look:[0,0,0]});const core=new THREE.Mesh(new THREE.SphereGeometry(.7,32,32),new THREE.MeshStandardMaterial({color:C.gold,emissive:C.gold,emissiveIntensity:.6,metalness:.4,roughness:.3}));
  B.grp.add(core);B.grp.add(glowSprite(C.gold,4));const planets=[],dzC={yes:C.up,likely:C.teal,check:C.grey,no:C.dn},tip=overlay(el,"","tip");tip.style.display="none";
  firms.forEach((f,i)=>{const ring=i%3,R=2.2+ring*1.25+(i%5)*.12,a=i/firms.length*Math.PI*2*3+ring,sz=.16+((f.score||0)%4)*.03;
    const pl=new THREE.Mesh(new THREE.SphereGeometry(sz,20,20),new THREE.MeshStandardMaterial({color:dzC[f.dz]||C.grey,emissive:dzC[f.dz]||C.grey,emissiveIntensity:.35,roughness:.4}));
    pl.userData={f,R,a,sp:.12/(1+ring*.6),y:(Math.sin(i*3.1)*.35)};if(f.deal){const rg=new THREE.Mesh(new THREE.TorusGeometry(sz*1.8,.025,8,40),new THREE.MeshBasicMaterial({color:C.gold2}));rg.rotation.x=Math.PI/2.3;pl.add(rg)}
    planets.push(pl);B.grp.add(pl)});
  [2.2,3.45,4.7].forEach(R=>{const o=new THREE.Mesh(new THREE.TorusGeometry(R+.2,.008,6,160),new THREE.MeshBasicMaterial({color:0x3a4a7a,transparent:true,opacity:.6}));o.rotation.x=Math.PI/2;B.grp.add(o)});
  const sg=new THREE.BufferGeometry(),sp=new Float32Array(600*3);for(let i=0;i<600;i++){sp[i*3]=(Math.random()-.5)*40;sp[i*3+1]=(Math.random()-.5)*20;sp[i*3+2]=-6-Math.random()*14}
  sg.setAttribute("position",new THREE.BufferAttribute(sp,3));B.scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0x8090ff,size:.04,transparent:true,opacity:.6})));
  B.onTap(planets,hit=>{if(onFirm)onFirm(hit.object.userData.f.id)});
  B.cv.addEventListener("pointermove",e=>{const h=B.pick(e,planets);if(h){const f=h.object.userData.f,b=B.cv.getBoundingClientRect();tip.style.display="block";tip.style.left=(e.clientX-b.left+12)+"px";tip.style.top=(e.clientY-b.top-10)+"px";tip.innerHTML=`<b>${f.name}</b>${f.deal?`<small>🏷️ ${f.deal}</small>`:""}`;B.cv.style.cursor="pointer"}else{tip.style.display="none";B.cv.style.cursor="grab"}});
  B.setTick((t,st)=>{planets.forEach(p=>{const u=p.userData,a=u.a+t*u.sp;p.position.set(Math.cos(a)*u.R,u.y,Math.sin(a)*u.R);p.rotation.y=t});core.rotation.y=t*.3;B.grp.rotation.y=st.ry;B.grp.rotation.x=.15+st.rx});return B}





/* 8. SECTION 3D BACKGROUNDS (one design per section):
   galaxy = Prop firm tracker, bull = Journal, fibc = Statistics, bear = Risk calculator, fibr = Tomorrow's plan.
   The particles fly in and assemble the design, then it turns / zooms smoothly with the page scroll;
   a fast scroll shakes the particles loose and they settle back. */
export function galaxyBackground(el,kind="galaxy",opts={}){
  const r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  const ph=small(),isChart=kind==="bull"||kind==="bear"||kind==="fibr",N=kind==="galaxy"?(ph?9000:22000):(ph?7000:15000),dpr=Math.min(devicePixelRatio,ph?1.3:1.6);
  r.setPixelRatio(dpr);r.setSize(innerWidth,innerHeight);el.innerHTML="";el.appendChild(r.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,400);cam.position.set(0,6,16);cam.lookAt(0,0,0);
  const rnd=(a=1)=>(Math.random()*2-1)*a,c=new THREE.Color(),W=new THREE.Color("#ffffff");
  const mk=fn=>{const P=new Float32Array(N*3),Q=new Float32Array(N*3);for(let i=0;i<N;i++){const v=fn(i);P.set(v,i*3);Q.set([c.r,c.g,c.b],i*3)}return {p:P,c:Q}};
  const UPC=new THREE.Color("#12e07a"),DNC=new THREE.Color("#ff2d55"),GRIDC=new THREE.Color("#3a4a7a"),GOLD=new THREE.Color("#f5b942");
  /* --- the designs --- */
  const galaxyShape=()=>{const core=new THREE.Color("#ffd27a"),mid=new THREE.Color("#ff9e5e"),arm=new THREE.Color("#7c8bff"),edge=new THREE.Color("#2aa8ff"),mag=new THREE.Color("#d16bff");
    return mk(i=>{const arms=4,a0=(i%arms)*Math.PI*2/arms,t=Math.pow(Math.random(),.62),R=t*13,scat=(1-t*.35)*1.15,a=a0+R*.55+rnd(.38*(1-t*.4));
      c.copy(core).lerp(mid,Math.min(1,t*2.2)).lerp(arm,Math.max(0,t*1.6-.35)).lerp(t>.8?edge:arm,Math.max(0,t-.7)*2);if(Math.random()<.08)c.lerp(mag,.7);if(Math.random()<.03)c.set("#ffffff");
      return [Math.cos(a)*R+rnd(scat*.5),rnd(.55*(1-t))*(1+Math.random()),Math.sin(a)*R+rnd(scat*.5)]})};
  /* real-looking price action (like a TradingView chart): impulse legs and pullbacks, volatility that comes in waves,
     each candle opens at the previous close, wicks from rejections */
  const market=(n,trend,seed)=>{let s=seed>>>0;const R=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296},G=()=>(R()+R()+R()-1.5)*1.15;
    let p=0,vol=1,leg=0,dir=-1;return Array.from({length:n},()=>{if(--leg<=0){dir=-dir;leg=dir>0?4+Math.floor(R()*5):2+Math.floor(R()*3)}
      vol=Math.max(.45,Math.min(1.9,vol*.8+(.5+R()*1.1)*.2+(R()<.08?.7:0)));const o=p,cl=o+(dir>0?trend:-trend*.6)*vol+G()*vol*.7;p=cl;
      return {o,c:cl,h:Math.max(o,cl)+Math.abs(G())*vol*.45,l:Math.min(o,cl)-Math.abs(G())*vol*.45}})};
  const chart=(cs,withFib)=>{let lo=Infinity,hi=-Infinity;cs.forEach(k=>{lo=Math.min(lo,k.l);hi=Math.max(hi,k.h)});const n=cs.length,X=i=>-10.5+i*(21/(n-1)),Y=v=>-4.6+(v-lo)/((hi-lo)||1)*9.2,bw=Math.min(.3,21/(n-1)*.36);
    const lv=[0,.236,.382,.5,.618,.786,1];
    const out=mk(i=>{const rr=Math.random();
      if(rr<.1){c.copy(GRIDC).multiplyScalar(.7);return Math.random()<.5?[-10+Math.round(Math.random()*20),-5+Math.random()*10,-1.2]:[-10+Math.random()*20,-5+Math.round(Math.random()*5)*2,-1.2]}
      if(withFib&&rr<.24){const L=lv[Math.floor(Math.random()*lv.length)];c.copy(L===.618||L===.5?GOLD:L===0||L===1?W:new THREE.Color("#7c8bff"));return [-10+Math.random()*20,-4.6+L*9.2+rnd(.02),-.6]}
      const k=cs[i%n],x=X(i%n);c.copy(k.c>=k.o?UPC:DNC);if(Math.random()<.15)c.lerp(W,.4);
      if(Math.random()<.2)return [x+rnd(.025),Y(k.l)+Math.random()*(Y(k.h)-Y(k.l)),rnd(.025)];
      /* particles sit on the faces of the candle body so it reads as a solid 3D block */
      const b0=Y(Math.min(k.o,k.c)),b1=Math.max(Y(Math.max(k.o,k.c)),b0+.06),f=Math.floor(Math.random()*3),u=rnd(bw),w=rnd(bw),yy=b0+Math.random()*(b1-b0),sg=Math.random()<.5?-1:1;
      return f===0?[x+sg*bw,yy,w]:f===1?[x+u,yy,sg*bw]:[x+u,sg>0?b1:b0,w]});
    out.k=cs.map((k,i)=>({x:X(i),o:Y(k.o),c:Y(k.c),h:Y(k.h),l:Y(k.l)}));out.bw=bw;out.Y=Y;return out};
  const fibCircles=()=>{const FIB=[.236,.382,.5,.618,.786,1,1.272,1.618],FC=["#7c8bff","#2aa8ff","#ffffff","#f5b942","#2aa8ff","#ffffff","#d16bff","#f5b942"];
    return mk(i=>{if(i%5===0){const th=Math.random()*Math.PI*4.2,rr=.35*Math.exp(.306*th);c.copy(GOLD).lerp(new THREE.Color("#ffd27a"),Math.random());return [rr*Math.cos(th)+rnd(.04),rr*Math.sin(th)+rnd(.04),rnd(.06)]}
      const j=i%FIB.length,R=FIB[j]*5.9,a=Math.random()*Math.PI*2;c.set(FC[j]);if(Math.random()<.1)c.lerp(W,.4);return [Math.cos(a)*R+rnd(.035),Math.sin(a)*R+rnd(.035),rnd(.06)]})};
  const CN=ph?30:40;
  const T=kind==="bull"?chart(market(CN,.55,7),false):kind==="bear"?chart(market(CN,-.55,11),false):kind==="fibr"?chart(market(CN,.5,23),true):kind==="fibc"?fibCircles():galaxyShape();
  if(kind==="galaxy")for(let i=0;i<N;i++){const j=i*3,R=Math.hypot(T.p[j],T.p[j+2]),f=R<3?.24+R*.09:.5;T.c[j]*=f;T.c[j+1]*=f;T.c[j+2]*=f}   /* softer galaxy: dim the bright core most */
  if(kind==="fibc")for(let i=0;i<N*3;i++)T.c[i]*=.55;   /* Statistics: low light */
  /* particles start scattered far away and fly in */
  const start=new Float32Array(N*3),cur=new Float32Array(N*3),sd=new Float32Array(N);
  for(let i=0;i<N;i++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,R=18+Math.random()*22,q=Math.sqrt(1-u*u);start.set([R*q*Math.cos(a),R*u,R*q*Math.sin(a)],i*3);sd[i]=Math.random()}
  cur.set(start);
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(cur,3));g.setAttribute("color",new THREE.BufferAttribute(T.c,3));g.setAttribute("seed",new THREE.BufferAttribute(sd,1));
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,uniforms:{uT:{value:0},uS:{value:(ph?46:58)*dpr*(isChart?.85:1)}},
    vertexShader:`attribute float seed;uniform float uT;uniform float uS;varying vec3 vC;varying float vA;void main(){vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
      vA=.55+.45*sin(uT*(1.5+seed*3.)+seed*60.);gl_PointSize=uS*(.25+seed*.75)/-mv.z;}`,
    fragmentShader:`varying vec3 vC;varying float vA;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);if(d>.5)discard;float a=pow(1.-d*2.,1.8);gl_FragColor=vec4(vC*(.7+a*.8),a*vA*.95);}`});
  const pts=new THREE.Points(g,mat),grp=new THREE.Group();grp.add(pts);scene.add(grp);
  if(kind==="galaxy"){grp.rotation.x=-.13;grp.rotation.z=-.14;grp.position.y=.2;grp.scale.setScalar(.82)}else if(kind==="fibc"){grp.rotation.x=.08}else{grp.rotation.x=.06}
  /* glows + nebula clouds */
  const glow=(color,size,op)=>{const s=document.createElement("canvas");s.width=s.height=128;const x=s.getContext("2d"),gr=x.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.25,"rgba(255,255,255,.45)");gr.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=gr;x.fillRect(0,0,128,128);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(s),color,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(size,size,1);return sp};
  const cg=kind==="galaxy"?[glow("#ffd27a",5,.24),glow("#ff9e5e",11,.1),glow("#7c8bff",26,.05)]:kind==="fibc"?[glow("#f5b942",5,.2),glow("#7c8bff",18,.06)]:[];cg.forEach(x=>{x.userData.o=x.material.opacity;grp.add(x)});
  const NEB={galaxy:[["#3a48e0",30,.3,[-14,2,-18]],["#d16bff",24,.22,[16,-3,-22]],["#2aa8ff",26,.2,[6,8,-26]],["#f5b942",18,.14,[-10,-6,-14]],["#7c8bff",34,.16,[2,-10,-30]]],
    bull:[["#12e07a",30,.16,[-12,-4,-22]],["#2aa8ff",28,.16,[14,6,-26]],["#3a48e0",34,.2,[0,10,-30]]],
    bear:[["#ff2d55",30,.15,[12,4,-22]],["#7a3cff",28,.16,[-14,-5,-26]],["#3a48e0",34,.2,[0,10,-30]]],
    fibc:[["#f5b942",26,.14,[-12,4,-20]],["#d16bff",28,.18,[14,-4,-24]],["#2aa8ff",30,.16,[0,-10,-28]]],
    fibr:[["#f5b942",28,.14,[-13,5,-22]],["#12e07a",26,.12,[13,-5,-24]],["#7c8bff",34,.18,[0,-10,-30]]]}[kind]||[];
  const neb=NEB.map(([cl,s,o,p])=>{const n=glow(cl,s,o);n.position.set(...p);n.userData={p,o};scene.add(n);return n});
  /* solid 3D candles (TradingView colours, lit so the sides look 3D) + a live last candle with its price line */
  let cm=null;
  if(isChart){scene.add(new THREE.AmbientLight(0xffffff,1.1));const dl=new THREE.DirectionalLight(0xffffff,2.6);dl.position.set(6,9,12);scene.add(dl);const dl2=new THREE.DirectionalLight(0x8fa0ff,1.1);dl2.position.set(-8,-3,6);scene.add(dl2);
    const n=T.k.length,BOX=new THREE.BoxGeometry(1,1,1),mb=new THREE.MeshStandardMaterial({roughness:.28,metalness:.25,transparent:true,opacity:0}),mw=mb.clone();
    const body=new THREE.InstancedMesh(BOX,mb,n),wick=new THREE.InstancedMesh(BOX,mw,n),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3();
    const set=(i,k)=>{const b0=Math.min(k.o,k.c),b1=Math.max(Math.max(k.o,k.c),b0+.06);v.set(k.x,(b0+b1)/2,0);s.set(T.bw*2,b1-b0,T.bw*2);m4.compose(v,q,s);body.setMatrixAt(i,m4);
      v.set(k.x,(k.l+k.h)/2,0);s.set(.06,Math.max(.01,k.h-k.l),.06);m4.compose(v,q,s);wick.setMatrixAt(i,m4);const cl=k.c>=k.o?UPC:DNC;body.setColorAt(i,cl);wick.setColorAt(i,cl)};
    T.k.forEach((k,i)=>set(i,k));const cGrp=new THREE.Group();cGrp.add(body,wick);
    const pl=new THREE.Mesh(new THREE.BoxGeometry(22,.025,.025),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}));cGrp.add(pl);
    const lk=T.k[n-1];cm={cGrp,body,wick,set,pl,mats:[mb,mw],lk,base:{...lk},n};grp.add(cGrp)}
  /* deep starfield (parallax) */
  const SN=ph?1500:3500,sp=new Float32Array(SN*3),ss=new Float32Array(SN),sc=new Float32Array(SN*3);for(let i=0;i<SN;i++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,R=60+Math.random()*90,q=Math.sqrt(1-u*u);
    sp.set([R*q*Math.cos(a),R*u,R*q*Math.sin(a)],i*3);ss[i]=Math.random();const k=Math.random();c.set(k<.15?"#ffd9a0":k<.4?"#a9b8ff":"#ffffff");sc.set([c.r,c.g,c.b],i*3)}
  const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.BufferAttribute(sp,3));sg.setAttribute("color",new THREE.BufferAttribute(sc,3));sg.setAttribute("seed",new THREE.BufferAttribute(ss,1));
  const stars=new THREE.Points(sg,mat.clone());stars.material.uniforms={uT:mat.uniforms.uT,uS:{value:(ph?90:120)*dpr}};scene.add(stars);
  /* shooting stars */
  const shoot=[];for(let i=0;i<3;i++){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(-2.4,0,0)]);
    const ln=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending}));ln.userData={t:-Math.random()*6};shoot.push(ln);scene.add(ln)}
  let mx=0,my=0;const mv=e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5};addEventListener("pointermove",mv,{passive:true});
  const rs=()=>{r.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};addEventListener("resize",rs);
  const clock=new THREE.Clock(),T0=performance.now()-(opts.still?9999:0);let stillN=0;let last=0,cx=0,cy=6,sfs=0,vel=0,lastY=scrollY,spin=0,settled=false;
  let stopped=false;(function loop(){if(stopped)return;if(!el.isConnected){removeEventListener("pointermove",mv);removeEventListener("resize",rs);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});r.dispose();return}
    requestAnimationFrame(loop);if(document.hidden||busy(loop))return;const t=clock.getElapsedTime(),dt=Math.min(.05,t-last);last=t;mat.uniforms.uT.value=t;
    /* scroll position (smoothed) drives the camera / rotation; scroll speed shakes the particles loose */
    const mxS=Math.max(1,document.documentElement.scrollHeight-innerHeight),sf=Math.min(1,Math.max(0,scrollY/mxS));sfs+=(sf-sfs)*Math.min(1,dt*3);
    const dy=scrollY-lastY;lastY=scrollY;const inst=dt>0?Math.min(1.4,Math.abs(dy)/innerHeight/dt*.35):0;vel+=(inst-vel)*Math.min(1,dt*(inst>vel?6:2.2));
    const asm=Math.min(1,(performance.now()-T0)/2400),e=1-Math.pow(1-asm,3),sh=vel*(ph?1.5:2.1);
    if(asm<1||sh>.004||!settled){settled=asm>=1&&sh<=.004;const P=T.p;
      for(let i=0;i<N;i++){const j=i*3,s=sd[i],ox=sh*Math.sin(s*61.3)*(.6+s),oy=sh*Math.cos(s*17.9)*(.6+s),oz=sh*Math.sin(s*93.7);
        cur[j]=start[j]+(P[j]-start[j])*e+ox;cur[j+1]=start[j+1]+(P[j+1]-start[j+1])*e+oy;cur[j+2]=start[j+2]+(P[j+2]-start[j+2])*e+oz}
      g.attributes.position.needsUpdate=true}
    cg.forEach(x=>x.material.opacity=x.userData.o*e);
    if(kind==="galaxy"){spin+=dt*.06+Math.abs(dy)*.0009;grp.rotation.y=spin;grp.rotation.x=-.13+sfs*.14}   /* seen from the side: a thin tilted disc */
    else if(kind==="fibc"){grp.rotation.z=t*.1+sfs*2.6;grp.rotation.x=.08+sfs*.55;grp.rotation.y=Math.sin(t*.2)*.12}
    else{grp.rotation.y=-.42+sfs*.84+Math.sin(t*.22)*.07;grp.rotation.x=.06+sfs*.12}
    /* candles: grow up from the bottom as the particles land, dissolve a little while scrolling fast */
    if(cm){const op=Math.max(0,Math.min(1,(asm-.45)/.4))*(1-Math.min(.75,vel*1.1));cm.mats.forEach(m=>m.opacity=op*.92);
      const gs=.15+.85*(1-Math.pow(1-Math.min(1,asm/.85),3));cm.cGrp.scale.y=gs;cm.cGrp.position.y=-4.6*(1-gs);
      /* the last candle is live: price ticks up and down, wick grows, colour flips when it crosses the open */
      const b=cm.base,pr=b.c+Math.sin(t*1.15)*.24+Math.sin(t*2.7+1.3)*.1+Math.sin(t*6.1)*.03;cm.lk.c=pr;cm.lk.h=Math.max(b.h,pr+.02);cm.lk.l=Math.min(b.l,pr-.02);
      cm.set(cm.n-1,cm.lk);cm.body.instanceMatrix.needsUpdate=true;cm.wick.instanceMatrix.needsUpdate=true;cm.body.instanceColor.needsUpdate=true;cm.wick.instanceColor.needsUpdate=true;
      cm.pl.position.set(0,pr,0);cm.pl.material.color.copy(pr>=cm.lk.o?UPC:DNC);cm.pl.material.opacity=op*(.4+.2*Math.sin(t*3))}
    stars.rotation.y=t*.006+sfs*.4;
    cx+=((mx*3)-cx)*Math.min(1,dt*1.8);cy+=((5.5+my*-2-sfs*1.5)-cy)*Math.min(1,dt*1.8);cam.position.set(cx,cy,16-sfs*(isChart?3:2.5));cam.lookAt(0,-.5,0);
    neb.forEach((n,i)=>{n.position.x=n.userData.p[0]+Math.sin(t*.07+i)*2.5;n.position.y=n.userData.p[1]+Math.cos(t*.05+i)*1.5;n.material.opacity=n.userData.o*(.75+.25*Math.sin(t*.3+i*2))});
    shoot.forEach(s=>{const u=s.userData;u.t+=dt;if(u.t<0)return;if(!u.on){u.on=true;s.position.set(rnd(25),8+Math.random()*8,-20-Math.random()*10);s.rotation.z=-.35-Math.random()*.3}
      const p=u.t/1.1;s.position.x+=dt*22*Math.cos(s.rotation.z);s.position.y+=dt*22*Math.sin(s.rotation.z);s.material.opacity=p<1?Math.sin(p*Math.PI)*.9:0;if(p>=1){u.t=-3-Math.random()*7;u.on=false}});
    r.render(scene,cam);
    /* Light mode: draw the finished design a few times, then stop (no animation, saves battery) */
    if(opts.still&&++stillN>4){stopped=true;const iv=setInterval(()=>{if(!el.isConnected){clearInterval(iv);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});r.dispose()}},3000)}})();
  return {r}}

/* 9. CONSISTENCY RULE BACKGROUND (3D): glass light pillars like daily profits on a dark reflective floor.
   Consistent = even teal pillars under the rule line. Not consistent = one pillar rises in amber above the line.
   Soft on purpose: low light, slow camera drift. opts.still = draw once (Light mode). */
export function pillarsBackground(el,opts={}){
  const ph=small(),r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"}),dpr=Math.min(devicePixelRatio,ph?1.4:1.75);
  r.setPixelRatio(dpr);r.setSize(innerWidth,innerHeight);r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.9;el.innerHTML="";el.appendChild(r.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x03050b,12,30);
  const cam=new THREE.PerspectiveCamera(ph?52:42,innerWidth/innerHeight,.1,100);
  const TEAL=new THREE.Color("#2ad1c9"),IND=new THREE.Color("#5b6cf0"),AMB=new THREE.Color("#ff9a3d");
  scene.add(new THREE.AmbientLight(0x8090c0,.35));
  const key=new THREE.DirectionalLight(0xbfd4ff,.9);key.position.set(-6,10,8);scene.add(key);
  const rim=new THREE.PointLight(0x2ad1c9,2.2,26,1.4);rim.position.set(0,7,-7);scene.add(rim);
  const warm=new THREE.PointLight(0xff9a3d,0,14,1.6);warm.position.set(2.2,6,2);scene.add(warm);
  /* reflective dark floor + faint grid */
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x05070f,metalness:.85,roughness:.32}));floor.rotation.x=-Math.PI/2;scene.add(floor);
  const grid=new THREE.GridHelper(40,40,0x2b3566,0x161c38);grid.material.transparent=true;grid.material.opacity=.22;grid.position.y=.002;scene.add(grid);
  /* the pillars */
  const n=ph?9:13,gap=ph?1.25:1.3,w=ph?.68:.7,big=Math.floor(n*.62),P=[];
  const hs=i=>{const x=Math.sin(i*12.9898)*43758.5453;return x-Math.floor(x)};
  for(let i=0;i<n;i++){const x=(i-(n-1)/2)*gap,z=-Math.pow((i-(n-1)/2)/(n/2),2)*1.6,base=1.5+hs(i)*.9;
    const mat=new THREE.MeshStandardMaterial({color:i%2?IND:TEAL,emissive:i%2?IND:TEAL,emissiveIntensity:.22,metalness:.15,roughness:.18,transparent:true,opacity:.42,depthWrite:false});
    const geo=new THREE.BoxGeometry(w,1,w);geo.translate(0,.5,0);const m=new THREE.Mesh(geo,mat);m.position.set(x,0,z);scene.add(m);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:i%2?IND:TEAL,transparent:true,opacity:.45}));m.add(edges);
    const cap=new THREE.Mesh(new THREE.PlaneGeometry(w,w),new THREE.MeshBasicMaterial({color:TEAL,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));cap.rotation.x=-Math.PI/2;cap.position.set(x,base,z);scene.add(cap);
    /* soft reflection-like glow on the floor under each pillar */
    const pool=new THREE.Mesh(new THREE.CircleGeometry(w*1.3,24),new THREE.MeshBasicMaterial({color:i%2?IND:TEAL,transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false}));pool.rotation.x=-Math.PI/2;pool.position.set(x,.01,z);scene.add(pool);
    P.push({m,mat,edges,cap,pool,base,h:base,i})}
  /* the rule line: no pillar should cross it */
  const RL=3.05,lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-(n/2)*gap,0,0),new THREE.Vector3((n/2)*gap,0,0)]);
  const rule=new THREE.Line(lineGeo,new THREE.LineDashedMaterial({color:TEAL,dashSize:.28,gapSize:.2,transparent:true,opacity:.45}));rule.computeLineDistances();rule.position.set(0,RL,0);scene.add(rule);
  const sheet=new THREE.Mesh(new THREE.PlaneGeometry(n*gap,3.6),new THREE.MeshBasicMaterial({color:TEAL,transparent:true,opacity:.025,side:THREE.DoubleSide,depthWrite:false}));sheet.rotation.x=-Math.PI/2;sheet.position.set(0,RL,-.6);scene.add(sheet);
  /* floating motes */
  const MN=ph?60:120,mp=new Float32Array(MN*3);for(let i=0;i<MN;i++){mp.set([(Math.random()-.5)*18,Math.random()*7,(Math.random()-.5)*8-1],i*3)}
  const mg=new THREE.BufferGeometry();mg.setAttribute("position",new THREE.BufferAttribute(mp,3));
  const motes=new THREE.Points(mg,new THREE.PointsMaterial({color:0x9fe8e4,size:ph?.05:.045,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(motes);
  const rs=()=>{r.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};addEventListener("resize",rs);
  let mx=0;const mv=e=>{mx=e.clientX/innerWidth-.5};addEventListener("pointermove",mv,{passive:true});
  const clock=new THREE.Clock();let last=0,cx=0,stopped=false,stillN=0,amberK=(window.__bgState||{}).cons===-1?1:0;
  const ST=()=>window.__bgState||{};
  (function loop(){if(stopped)return;if(!el.isConnected){removeEventListener("resize",rs);removeEventListener("pointermove",mv);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});r.dispose();return}
    requestAnimationFrame(loop);if(document.hidden||busy(loop))return;const t=opts.still?6:clock.getElapsedTime(),dt=opts.still?1:Math.min(.05,t-last);last=t;
    const bad=ST().cons===-1;amberK+=((bad?1:0)-amberK)*Math.min(1,dt*1.5);
    P.forEach(p=>{const target=(p.i===big?p.base+(4.9-p.base)*amberK:p.base)*(1+.03*Math.sin(t*.6+p.i*1.7));p.h+=(target-p.h)*Math.min(1,dt*4);
      p.m.scale.y=p.h;p.cap.position.y=p.h;
      const amberThis=p.i===big?amberK:0,c=(p.i%2?IND:TEAL).clone().lerp(AMB,amberThis);
      p.mat.color.copy(c);p.mat.emissive.copy(c);p.mat.emissiveIntensity=.2+.15*amberThis;p.edges.material.color.copy(c);p.cap.material.color.copy(c);p.pool.material.color.copy(c);p.pool.material.opacity=.08+.06*amberThis});
    const rc=TEAL.clone().lerp(AMB,amberK*.8);rule.material.color.copy(rc);sheet.material.color.copy(rc);warm.intensity=4*amberK;
    const pos=mg.attributes.position.array;for(let i=0;i<MN;i++){pos[i*3+1]+=dt*.12;if(pos[i*3+1]>7)pos[i*3+1]=0}mg.attributes.position.needsUpdate=true;
    /* slow camera drift + a little scroll and mouse parallax */
    const mxS=Math.max(1,document.documentElement.scrollHeight-innerHeight),sf=Math.min(1,Math.max(0,scrollY/mxS));cx+=(mx*1.2-cx)*Math.min(1,dt*1.5);
    const a=Math.sin(t*.07)*.3+cx*.25+sf*.25,R=ph?14.5:12;cam.position.set(Math.sin(a)*R,(ph?4.8:3.9)+sf*1.0,Math.cos(a)*R);cam.lookAt(0,ph?2.8:2.5,-.4);
    r.render(scene,cam);
    if(opts.still&&++stillN>3){stopped=true;const iv=setInterval(()=>{if(!el.isConnected){clearInterval(iv);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});r.dispose()}},3000)}})();
  return {r}}

/* 10. NEWS BACKGROUND (3D): the Earth from orbit, NASA Blue Marble (day) + Black Marble (city lights) textures
   (public domain, served with three.js). Real day/night line from the current sun position, drifting clouds,
   thin atmosphere. Tokyo / London / New York glow while their session is open; the atmosphere turns softly red
   before red news. Soft on purpose. opts.still = draw once (Light mode). */
export function earthBackground(el,opts={}){
  const ph=small(),r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"}),dpr=Math.min(devicePixelRatio,ph?1.4:1.75);
  r.setPixelRatio(dpr);r.setSize(innerWidth,innerHeight);el.innerHTML="";el.appendChild(r.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(ph?44:34,innerWidth/innerHeight,.1,500);cam.position.set(0,0,22);
  const TX="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r164/examples/textures/planets/",L=new THREE.TextureLoader();L.setCrossOrigin("anonymous");
  const tex=n=>{const t=L.load(TX+n);t.colorSpace=n.includes("normal")||n.includes("specular")?THREE.NoColorSpace:THREE.SRGBColorSpace;t.anisotropy=4;return t};
  const day=tex("earth_atmos_2048.jpg"),night=tex("earth_lights_2048.png"),clouds=tex("earth_clouds_1024.png"),spec=tex("earth_specular_2048.jpg");
  /* sun direction from the real date and time (subsolar point) */
  const sunDir=()=>{const d=new Date(),utc=d.getUTCHours()+d.getUTCMinutes()/60,doy=Math.floor((d-new Date(Date.UTC(d.getUTCFullYear(),0,0)))/864e5),lon=(12-utc)*15*Math.PI/180,lat=-23.44*Math.cos(2*Math.PI*(doy+10)/365)*Math.PI/180;
    return new THREE.Vector3(Math.cos(lat)*Math.sin(lon+Math.PI/2),Math.sin(lat),Math.cos(lat)*Math.cos(lon+Math.PI/2))};
  const R=6,earth=new THREE.Group();scene.add(earth);
  const U={dayMap:{value:day},nightMap:{value:night},specMap:{value:spec},sun:{value:sunDir()},soft:{value:.5}};
  const mat=new THREE.ShaderMaterial({uniforms:U,
    vertexShader:`varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform sampler2D dayMap;uniform sampler2D nightMap;uniform sampler2D specMap;uniform vec3 sun;uniform float soft;varying vec2 vUv;varying vec3 vN;varying vec3 vV;
      void main(){float d=dot(normalize(vN),normalize(sun));float k=smoothstep(-.12,.28,d);
        vec3 dayC=texture2D(dayMap,vUv).rgb*(.18+.95*max(d,0.));float sp=texture2D(specMap,vUv).r;vec3 h=normalize(normalize(sun)+vV);dayC+=vec3(1.)*pow(max(dot(normalize(vN),h),0.),60.)*sp*.18*k;
        vec3 nightC=texture2D(nightMap,vUv).rgb*vec3(1.,.88,.7)*.75;
        vec3 c=mix(nightC,dayC,k);float fr=pow(1.-max(dot(normalize(vN),vV),0.),3.);c+=vec3(.55,.7,1.)*fr*(.08+.16*k);
        gl_FragColor=vec4(c*soft,1.);}`});
  const globe=new THREE.Mesh(new THREE.SphereGeometry(R,ph?64:96,ph?48:72),mat);earth.add(globe);
  const cl=new THREE.Mesh(new THREE.SphereGeometry(R*1.012,ph?64:96,ph?48:72),new THREE.MeshLambertMaterial({map:clouds,transparent:true,opacity:.28,depthWrite:false}));earth.add(cl);
  const sunL=new THREE.DirectionalLight(0xffffff,1.6);scene.add(sunL);scene.add(new THREE.AmbientLight(0x223355,.25));
  /* atmosphere halo */
  const AU={c:{value:new THREE.Color("#8fb4ff")},s:{value:.2}};
  const atm=new THREE.Mesh(new THREE.SphereGeometry(R*1.12,64,48),new THREE.ShaderMaterial({uniforms:AU,side:THREE.BackSide,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,
    vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform vec3 c;uniform float s;varying vec3 vN;varying vec3 vV;void main(){float i=pow(max(.72-dot(vN,vV),0.),2.6);gl_FragColor=vec4(c,1.)*i*s;}`}));earth.add(atm);
  /* session cities: glow when the session is open */
  const glowTex=(()=>{const s=document.createElement("canvas");s.width=s.height=64;const x=s.getContext("2d"),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.3,"rgba(255,255,255,.5)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(s)})();
  const ll=(lat,lon,rad)=>{const p=(90-lat)*Math.PI/180,t=(lon+180)*Math.PI/180;return new THREE.Vector3(-rad*Math.sin(p)*Math.cos(t),rad*Math.cos(p),rad*Math.sin(p)*Math.sin(t))};
  const SES=[["Asia/Tokyo",35.7,139.7,9,15,"#7c8bff"],["Europe/London",51.5,-.1,8,16.5,"#2ad1c9"],["America/New_York",40.7,-74,9.5,16,"#f5b942"]].map(([tz,la,lo,o,c,col])=>{
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));sp.position.copy(ll(la,lo,R*1.01));sp.scale.set(.9,.9,1);globe.add(sp);return {tz,o,c,sp}});
  const openNow=s=>{try{const p=new Intl.DateTimeFormat("en-US",{timeZone:s.tz,hour:"2-digit",minute:"2-digit",weekday:"short",hour12:false}).formatToParts(new Date()),g=k=>(p.find(x=>x.type===k)||{}).value,h=(Number(g("hour"))%24)+Number(g("minute"))/60,wd=g("weekday");return wd!=="Sat"&&wd!=="Sun"&&h>=s.o&&h<s.c}catch(e){return false}};
  /* stars */
  const SN=ph?900:1800,sp=new Float32Array(SN*3);for(let i=0;i<SN;i++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,rr=120+Math.random()*120,q=Math.sqrt(1-u*u);sp.set([rr*q*Math.cos(a),rr*u,rr*q*Math.sin(a)-60],i*3)}
  const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.BufferAttribute(sp,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xaab8ff,size:ph?.55:.45,transparent:true,opacity:.45,depthWrite:false})));
  /* framing: a big Earth low on the right, like a satellite view */
  const place=()=>{if(ph){earth.position.set(1.2,-6.2,0)}else{earth.position.set(5.2,-3.6,0)}};place();earth.rotation.z=.41;
  const rs=()=>{r.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};addEventListener("resize",rs);
  let mx=0,my=0;const mv=e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5};addEventListener("pointermove",mv,{passive:true});
  const clock=new THREE.Clock();let last=0,cx=0,cy=0,stopped=false,stillN=0,red=0,openT=0;
  /* the globe is turned so the sun-lit side faces the viewer a little; it then turns slowly */
  globe.rotation.y=-1.2;
  (function loop(){if(stopped)return;if(!el.isConnected){removeEventListener("resize",rs);removeEventListener("pointermove",mv);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){["map","dayMap"].forEach(k=>{});o.material.dispose()}});[day,night,clouds,spec,glowTex].forEach(t=>t.dispose());r.dispose();return}
    requestAnimationFrame(loop);if(document.hidden||busy(loop))return;const t=opts.still?3:clock.getElapsedTime(),dt=opts.still?1:Math.min(.05,t-last);last=t;
    globe.rotation.y+=dt*.012;cl.rotation.y=globe.rotation.y+t*.004;
    /* sun follows the globe's turn so the real day/night line stays true on the map */
    const s=sunDir().applyAxisAngle(new THREE.Vector3(0,1,0),globe.rotation.y).applyAxisAngle(new THREE.Vector3(0,0,1),earth.rotation.z);U.sun.value.copy(s);sunL.position.copy(s).multiplyScalar(50);
    openT-=dt;if(openT<=0){openT=20;SES.forEach(x=>x.on=openNow(x))}
    SES.forEach(x=>{x.sp.visible=false});
    /* natural colours only: no colour changes */
    const mxS=Math.max(1,document.documentElement.scrollHeight-innerHeight),sf=Math.min(1,Math.max(0,scrollY/mxS));
    cx+=(mx*.8-cx)*Math.min(1,dt*1.5);cy+=(-my*.5-cy)*Math.min(1,dt*1.5);cam.position.set(cx,cy+sf*1.5,22-sf*2);cam.lookAt(cx*.3,sf*.6,0);
    r.render(scene,cam);
    if(opts.still&&++stillN>8){stopped=true;const iv=setInterval(()=>{if(!el.isConnected){clearInterval(iv);r.dispose()}},3000)}})();
  return {r}}

/* shared helpers for the soft 3D section backgrounds */
function softGlowTex(){const s=document.createElement("canvas");s.width=s.height=64;const x=s.getContext("2d"),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.35,"rgba(255,255,255,.4)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(s)}
function softLoop(el,r,scene,cam,opts,frame,cleanup){const clock=new THREE.Clock();let last=0,stopped=false,n=0;
  const rs=()=>{r.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};addEventListener("resize",rs);
  const free=()=>{removeEventListener("resize",rs);cleanup&&cleanup();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});r.dispose()};
  (function loop(){if(stopped)return;if(!el.isConnected){free();return}requestAnimationFrame(loop);if(document.hidden||busy(loop))return;
    const t=opts.still?4:clock.getElapsedTime(),dt=opts.still?1:Math.min(.05,t-last);last=t;frame(t,dt);r.render(scene,cam);
    if(opts.still&&++n>4){stopped=true;const iv=setInterval(()=>{if(!el.isConnected){clearInterval(iv);free()}},3000)}})()}
function softRenderer(el){const ph=small(),r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});r.setPixelRatio(Math.min(devicePixelRatio,ph?1.4:1.75));r.setSize(innerWidth,innerHeight);
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.85;el.innerHTML="";el.appendChild(r.domElement);return r}

/* 11. CONSISTENCY RULE BACKGROUND (3D): balance stones stacked over calm dark water.
   Consistent = the stack is balanced and still. One day too big = the top stone slides off-balance, soft amber glow under it. */
export function stonesBackground(el,opts={}){
  const ph=small(),r=softRenderer(el),scene=new THREE.Scene();scene.fog=new THREE.Fog(0x03050b,10,26);
  const cam=new THREE.PerspectiveCamera(ph?50:38,innerWidth/innerHeight,.1,100);
  scene.add(new THREE.HemisphereLight(0x9fb4ff,0x05070c,.55));
  const key=new THREE.DirectionalLight(0xfff1dc,1.4);key.position.set(-5,8,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0x2ad1c9,.9);rim.position.set(4,3,-6);scene.add(rim);
  const amber=new THREE.PointLight(0xff9a3d,0,6,1.8);scene.add(amber);
  /* calm water */
  const water=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x04070d,metalness:.9,roughness:.18}));water.rotation.x=-Math.PI/2;scene.add(water);
  const G=new THREE.Group();scene.add(G);G.position.set(ph?0:3.4,0,0);
  /* natural stones: squashed spheres with small random bumps */
  const stone=(rx,ry,rz,seed,col)=>{const g=new THREE.SphereGeometry(1,48,32),p=g.attributes.position,v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=Math.sin(v.x*3.1+seed)*Math.cos(v.y*2.7+seed*1.3)*Math.sin(v.z*3.3+seed*.7);v.multiplyScalar(1+n*.045);p.setXYZ(i,v.x*rx,v.y*ry,v.z*rz)}
    g.computeVertexNormals();return new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:col,roughness:.62,metalness:.04,emissive:0xff9a3d,emissiveIntensity:0}))};
  const SP=[[1.25,.42,1.05,"#2b303b"],[1.0,.38,.86,"#353a46"],[.82,.33,.72,"#2e3340"],[.64,.29,.56,"#3a404c"],[.48,.24,.42,"#323744"]];
  let y=.25;const S=SP.map(([rx,ry,rz,c],i)=>{const m=stone(rx,ry,rz,i*2.3+1,c);y+=ry*.92;m.position.set((i%2?.05:-.04),y,(i%2?-.03:.04));m.rotation.y=i*.9;y+=ry*.92;G.add(m);return {m,base:m.position.clone(),rot:m.rotation.clone()}});
  const top=S[S.length-1];amber.position.set(G.position.x,top.base.y-.2,0);
  /* soft ripples around the base */
  const rings=[0,1,2].map(i=>{const m=new THREE.Mesh(new THREE.RingGeometry(1,1.03,96),new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:0,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(G.position.x,.01,0);scene.add(m);return {m,ph:i/3}});
  /* mist */
  const gt=softGlowTex(),mist=[0,1,2,3].map(i=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0x8fa8ff,transparent:true,opacity:.03,depthWrite:false}));s.scale.set(10,2.6,1);s.position.set(G.position.x-4+i*2.6,.7,-5-i*.4);scene.add(s);return s});
  let bad=(window.__bgState||{}).cons===-1?1:0;
  softLoop(el,r,scene,cam,opts,(t,dt)=>{
    const isBad=(window.__bgState||{}).cons===-1;bad+=((isBad?1:0)-bad)*Math.min(1,dt*1.2);
    G.position.y=Math.sin(t*.5)*.04;G.rotation.y=Math.sin(t*.12)*.25;
    top.m.position.set(top.base.x+.48*bad,top.base.y-.06*bad+Math.sin(t*1.1)*.02*bad,top.base.z);top.m.rotation.z=top.rot.z-.38*bad;top.m.material.emissiveIntensity=.12*bad;
    S[S.length-2].m.rotation.z=S[S.length-2].rot.z-.06*bad;amber.intensity=3*bad;
    rings.forEach(o=>{const k=((t*.18+o.ph)%1),s=1.6+k*5;o.m.scale.set(s,s,1);o.m.material.opacity=.07*(1-k)*(1-.5*bad)});
    mist.forEach((s,i)=>{s.position.x=G.position.x-4+i*2.6+Math.sin(t*.07+i)*1.2});
    cam.position.set(ph?0:.6,(ph?3.6:2.9),ph?11.5:10.5);cam.lookAt(ph?0:1.6,ph?1.9:1.6,0)},()=>gt.dispose());
  return {r}}

/* 12. JOURNAL BACKGROUND (3D): a softly lit open notebook. A page turns by itself every few seconds;
   gold dust in the air; the warm light grows with the journaling streak (days in a row). */
export function bookBackground(el,opts={}){
  const ph=small(),r=softRenderer(el),scene=new THREE.Scene();scene.fog=new THREE.Fog(0x04050a,9,24);
  const cam=new THREE.PerspectiveCamera(ph?48:36,innerWidth/innerHeight,.1,100);
  scene.add(new THREE.HemisphereLight(0x9fb0ff,0x07080d,.45));
  const key=new THREE.DirectionalLight(0xfff0d8,1.1);key.position.set(-3,9,5);scene.add(key);
  const warm=new THREE.PointLight(0xffc56b,2,9,1.6);scene.add(warm);
  /* the page: faint ruled lines, red margin, handwriting-like strokes and a small chart sketch */
  const pageTex=(seed)=>{const c=document.createElement("canvas");c.width=512;c.height=700;const x=c.getContext("2d");x.fillStyle="#d8d0bd";x.fillRect(0,0,512,700);
    x.strokeStyle="rgba(70,110,200,.28)";x.lineWidth=2;for(let yy=90;yy<680;yy+=30){x.beginPath();x.moveTo(20,yy);x.lineTo(500,yy);x.stroke()}
    x.strokeStyle="rgba(200,60,70,.35)";x.beginPath();x.moveTo(70,0);x.lineTo(70,700);x.stroke();
    let s=seed;const R=()=>{s=(s*9301+49297)%233280;return s/233280};x.strokeStyle="rgba(40,40,60,.55)";x.lineWidth=2.4;x.lineCap="round";
    for(let yy=84;yy<640;yy+=30){if(R()<.18)continue;let xx=84;const end=200+R()*290;x.beginPath();x.moveTo(xx,yy);while(xx<end){const w=8+R()*16;x.quadraticCurveTo(xx+w/2,yy-6-R()*8,xx+w,yy-R()*3);xx+=w+(R()<.18?14:2)}x.stroke()}
    if(seed%2){x.strokeStyle="rgba(30,140,110,.6)";x.lineWidth=3;x.beginPath();let px=300,py=560;x.moveTo(px,py);for(let i=0;i<9;i++){px+=20;py-=6+R()*14-(i%3===2?14:0);x.lineTo(px,py)}x.stroke()}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t};
  const W=2.4,H=3.2,B=new THREE.Group();scene.add(B);B.position.set(ph?0:2.9,0,0);B.rotation.x=-.05;
  const tx=[pageTex(3),pageTex(8),pageTex(13)];
  const pageMat=t=>new THREE.MeshStandardMaterial({map:t,color:0x77716a,roughness:.92,metalness:0,side:THREE.DoubleSide});
  /* two page blocks, slightly tilted towards the spine */
  const block=(side)=>{const g=new THREE.BoxGeometry(W,.14,H);const m=new THREE.Mesh(g,[new THREE.MeshStandardMaterial({color:0x5c574e}),new THREE.MeshStandardMaterial({color:0x5c574e}),pageMat(side>0?tx[0]:tx[1]),new THREE.MeshStandardMaterial({color:0x3a3530}),new THREE.MeshStandardMaterial({color:0x5c574e}),new THREE.MeshStandardMaterial({color:0x5c574e})]);
    m.position.set(side*W/2,.07,0);m.rotation.z=-side*.05;B.add(m);return m};
  const L=block(-1),Rb=block(1);
  const cover=new THREE.Mesh(new THREE.BoxGeometry(W*2+.24,.06,H+.2),new THREE.MeshStandardMaterial({color:0x1d2338,roughness:.6,metalness:.2}));cover.position.y=-.02;B.add(cover);
  const ribbon=new THREE.Mesh(new THREE.PlaneGeometry(.1,1.0),new THREE.MeshStandardMaterial({color:0x8a6a2a,emissive:0x3a2808,emissiveIntensity:.2,side:THREE.DoubleSide}));ribbon.rotation.x=-Math.PI/2;ribbon.position.set(.05,.15,H/2+.3);B.add(ribbon);
  /* the turning page: a strip that bends as it turns around the spine */
  const SEG=28,pg=new THREE.PlaneGeometry(W,H,SEG,1);const page=new THREE.Mesh(pg,pageMat(tx[2]));page.position.y=.16;B.add(page);
  const pos=pg.attributes.position,setPage=(p)=>{const th=p*Math.PI,k=Math.sin(p*Math.PI)*1.1,ds=W/SEG;let px=0,py=0;const X=[0],Y=[0];
    for(let i=1;i<=SEG;i++){const a=th-k*(i/SEG)*(p<.5?1:-1)*.6;px+=Math.cos(a)*ds;py+=Math.sin(a)*ds;X.push(px);Y.push(py)}
    for(let i=0;i<pos.count;i++){const col=i%(SEG+1),row=Math.floor(i/(SEG+1));pos.setXYZ(i,X[col],Y[col]*.9+.002,row===0?-H/2:H/2)}pos.needsUpdate=true;pg.computeVertexNormals()};
  setPage(0);
  /* gold dust */
  const DN=ph?50:90,dp=new Float32Array(DN*3);for(let i=0;i<DN;i++)dp.set([B.position.x+(Math.random()-.5)*8,Math.random()*5,(Math.random()-.5)*5],i*3);
  const dg=new THREE.BufferGeometry();dg.setAttribute("position",new THREE.BufferAttribute(dp,3));scene.add(new THREE.Points(dg,new THREE.PointsMaterial({color:0xffd27a,size:ph?.05:.04,transparent:true,opacity:.45,depthWrite:false,blending:THREE.AdditiveBlending})));
  let texI=0;
  softLoop(el,r,scene,cam,opts,(t,dt)=>{
    const st=Math.max(0,Math.min(12,(window.__bgState||{}).jstreak||0))/12;warm.intensity=1.2+3*st;warm.position.set(B.position.x+.3,2.4+Math.sin(t*.6)*.1,1.2);
    /* one page turn every 7 s (2.4 s to turn), right to left */
    const cyc=t%7,p=opts.still?.35:Math.max(0,Math.min(1,(cyc-4.6)/2.4)),e=p*p*(3-2*p);setPage(e);
    if(cyc<dt*1.5&&!opts.still){texI=(texI+1)%3;page.material.map=tx[texI];page.material.needsUpdate=true}
    B.rotation.y=Math.sin(t*.1)*.12;B.position.y=Math.sin(t*.45)*.03;
    const a=dg.attributes.position.array;for(let i=0;i<DN;i++){a[i*3+1]+=dt*.08;if(a[i*3+1]>5)a[i*3+1]=0}dg.attributes.position.needsUpdate=true;
    cam.position.set(ph?0:.8,ph?6.6:5.4,ph?9.5:8.2);cam.lookAt(ph?0:1.7,0,.2)},()=>tx.forEach(x=>x.dispose()));
  return {r}}

/* 13. ICT INDICATOR BACKGROUND (3D): the killzones ring. A 24-hour ring tilted in space (New York time),
   the 4 ICT killzones as soft arcs (Asia 20-24, London 2-5, NY AM 7-10, NY PM 13:30-16), a hand at the time now;
   the killzone you are in glows (weekdays). Soft on purpose. */
export function killzonesBackground(el,opts={}){
  const ph=small(),r=softRenderer(el),scene=new THREE.Scene();scene.fog=new THREE.Fog(0x03040a,14,40);
  const cam=new THREE.PerspectiveCamera(ph?50:40,innerWidth/innerHeight,.1,200);
  const gt=softGlowTex();
  const SN=ph?500:900,sp=new Float32Array(SN*3);for(let i=0;i<SN;i++)sp.set([(Math.random()-.5)*90,(Math.random()-.2)*45,-20-Math.random()*40],i*3);
  const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.BufferAttribute(sp,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xaab8ff,size:.11,transparent:true,opacity:.35,depthWrite:false})));
  const G=new THREE.Group();scene.add(G);G.rotation.x=-1.05;G.rotation.z=.15;
  if(ph){G.position.set(0,-2.2,0);G.scale.setScalar(.72)}else{G.position.set(3.6,-.3,0);G.scale.setScalar(.78)}
  G.add(new THREE.Mesh(new THREE.TorusGeometry(5,.025,8,180),new THREE.MeshBasicMaterial({color:0x2b3566,transparent:true,opacity:.6})));
  for(let h=0;h<24;h++){const a=h/24*Math.PI*2,m=new THREE.Mesh(new THREE.BoxGeometry(h%6?.035:.06,h%6?.22:.45,.02),new THREE.MeshBasicMaterial({color:h%6?0x2e3866:0x5b6cf0,transparent:true,opacity:.7}));m.position.set(Math.sin(a)*5.45,Math.cos(a)*5.45,0);m.rotation.z=-a;G.add(m)}
  const label=(txt,col)=>{const c=document.createElement("canvas");c.width=256;c.height=64;const x=c.getContext("2d");x.font="800 30px Inter, system-ui, sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillStyle=col;x.fillText(txt,128,34);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:.3,depthWrite:false}));s.scale.set(2.2,.55,1);return s};
  const KZ=[[20,24,"#7c8bff","ASIA"],[2,5,"#2ad1c9","LONDON"],[7,10,"#f5b942","NY AM"],[13.5,16,"#ff8a3d","NY PM"]];
  const arcs=KZ.map(([s,e,c,n])=>{const a0=s/24*Math.PI*2,a1=e/24*Math.PI*2,m=new THREE.Mesh(new THREE.TorusGeometry(5,.13,16,90,a1-a0),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.rotation.z=Math.PI/2-a1;G.add(m);const gl=new THREE.Mesh(new THREE.TorusGeometry(5,.5,16,90,a1-a0),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.03,blending:THREE.AdditiveBlending,depthWrite:false}));gl.rotation.z=m.rotation.z;G.add(gl);
    const am=(a0+a1)/2,lb=label(n,c);lb.position.set(Math.sin(am)*6.7,Math.cos(am)*6.7,.1);G.add(lb);return {m,gl,lb,s,e}});
  const hand=new THREE.Mesh(new THREE.BoxGeometry(.04,4.6,.04),new THREE.MeshBasicMaterial({color:0xdfe6ff,transparent:true,opacity:.55}));hand.geometry.translate(0,2.3,0);G.add(hand);
  const tip=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0xffffff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));tip.scale.set(.9,.9,1);G.add(tip);
  const core=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0x3a48e0,transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false}));core.scale.set(6,6,1);G.add(core);
  const nyNow=()=>{try{const p=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",second:"2-digit",weekday:"short",hour12:false}).formatToParts(new Date()),g=k=>(p.find(x=>x.type===k)||{}).value;
    return {h:(Number(g("hour"))%24)+Number(g("minute"))/60+Number(g("second"))/3600,wd:g("weekday")}}catch(e){const d=new Date();return {h:d.getHours()+d.getMinutes()/60,wd:"Mon"}}};
  let mx=0;const mv=e=>{mx=e.clientX/innerWidth-.5};addEventListener("pointermove",mv,{passive:true});let cx=0,nt=0,now=nyNow();
  softLoop(el,r,scene,cam,opts,(t,dt)=>{nt-=dt;if(nt<=0){nt=5;now=nyNow()}
    const h=now.h,wk=now.wd!=="Sat"&&now.wd!=="Sun"&&!(now.wd==="Fri"&&h>=17),a=(h%24)/24*Math.PI*2;
    hand.rotation.z=-a;tip.position.set(Math.sin(a)*4.6,Math.cos(a)*4.6,.05);
    arcs.forEach(o=>{const on=wk&&h>=o.s&&h<o.e,tg=on?.6:.28;o.m.material.opacity+=(tg-o.m.material.opacity)*Math.min(1,dt*2);o.gl.material.opacity=on?.08+.03*Math.sin(t*2):.025;o.lb.material.opacity=on?.6:.25});
    G.rotation.z=.15+Math.sin(t*.08)*.05;
    const mxS=Math.max(1,document.documentElement.scrollHeight-innerHeight),sf=Math.min(1,Math.max(0,scrollY/mxS));cx+=(mx*.8-cx)*Math.min(1,dt*1.5);
    cam.position.set(cx,3.5+sf*1.2,16);cam.lookAt(ph?0:2.2,ph?-1:0,0)},()=>{removeEventListener("pointermove",mv);gt.dispose()});
  return {r}}

/* 14. ICT INDICATOR BACKGROUND (3D): liquidity sweep. Buy-side liquidity (teal) above, sell-side (rose) below,
   resting orders as particles; a gold price path runs; a soft light wave sweeps the buy-side and scatters the orders. Soft. */
export function liquidityBackground(el,opts={}){
  const ph=small(),r=softRenderer(el),scene=new THREE.Scene();scene.fog=new THREE.Fog(0x03040a,12,36);
  const cam=new THREE.PerspectiveCamera(ph?52:40,innerWidth/innerHeight,.1,200);const gt=softGlowTex();
  const SN=ph?400:800,spp=new Float32Array(SN*3);for(let i=0;i<SN;i++)spp.set([(Math.random()-.5)*90,(Math.random()-.2)*45,-24-Math.random()*40],i*3);
  const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.BufferAttribute(spp,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xaab8ff,size:.1,transparent:true,opacity:.3,depthWrite:false})));
  const grid=new THREE.GridHelper(80,80,0x1a2148,0x0f1430);grid.position.y=-4;grid.material.transparent=true;grid.material.opacity=.35;scene.add(grid);
  const ROT=-.35,CX=ph?0:4,CZ=-6,BY=2.6,SY=-2.6;
  const mkLine=(y,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(40,.03,.03),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.55}));m.position.set(CX,y,CZ);m.rotation.y=ROT;scene.add(m);
    const g=new THREE.Mesh(new THREE.PlaneGeometry(40,.8),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.04,blending:THREE.AdditiveBlending,depthWrite:false}));g.position.copy(m.position);g.rotation.y=ROT;scene.add(g)};
  mkLine(BY,0x2ad1c9);mkLine(SY,0xff5a74);
  const N=ph?500:900,P=new Float32Array(N*3),B=[],cosR=Math.cos(ROT),sinR=Math.sin(ROT);
  for(let i=0;i<N;i++){const top=i%2===0,u=(Math.random()-.5)*36,x=CX+u*cosR,z=CZ-u*sinR,y=(top?BY:SY)+(top?1:-1)*Math.random()*Math.random()*.6;B.push([x,y,z,top]);P.set([x,y,z],i*3)}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(P,3));const Cc=new Float32Array(N*3);for(let i=0;i<N;i++){const c=new THREE.Color(B[i][3]?"#7ff3ea":"#ff8aa0");Cc.set([c.r,c.g,c.b],i*3)}
  g.setAttribute("color",new THREE.BufferAttribute(Cc,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({size:ph?.1:.08,vertexColors:true,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false})));
  /* the price path: ranges, takes the buy-side liquidity, then drops */
  const pts=[];for(let i=0;i<=60;i++){const x=-14+i*.6,y=Math.sin(i*.25)*1.2+Math.sin(i*.9)*.3+(i>40?(i-40)*.18:0)-(i>50?(i-50)*.5:0);pts.push(new THREE.Vector3(x+(ph?-4:0),y,-1-i*.05))}
  const curve=new THREE.CatmullRomCurve3(pts);scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,200,.028,8),new THREE.MeshBasicMaterial({color:0xf5b942,transparent:true,opacity:.55})));
  const head=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0xffd27a,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));head.scale.set(1.1,1.1,1);scene.add(head);
  const wave=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0x9ffff7,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));wave.scale.set(4.5,1.8,1);scene.add(wave);
  let mx=0;const mv=e=>{mx=e.clientX/innerWidth-.5};addEventListener("pointermove",mv,{passive:true});let cx=0;
  softLoop(el,r,scene,cam,opts,(t,dt)=>{
    head.position.copy(curve.getPoint((t*.07)%1));
    const sw=(t*.16)%1,wx=-10+sw*28;wave.position.set(CX+(wx-CX)*cosR,BY,CZ-(wx-CX)*sinR);wave.material.opacity=.32*Math.sin(sw*Math.PI);
    const a=g.attributes.position.array;for(let i=0;i<N;i++){const [x,y,z,top]=B[i],d=Math.abs(x-wave.position.x),kick=top&&d<1.6?(1-d/1.6)*1.2*Math.sin(sw*Math.PI):0;a[i*3+1]=y+kick+Math.sin(t*1.5+i)*.02}g.attributes.position.needsUpdate=true;
    const mxS=Math.max(1,document.documentElement.scrollHeight-innerHeight),sf=Math.min(1,Math.max(0,scrollY/mxS));cx+=(mx*.8-cx)*Math.min(1,dt*1.5);
    cam.position.set(-2+cx,2.2+sf*1.2,ph?17:14);cam.lookAt(ph?0:2,0,-3)},()=>{removeEventListener("pointermove",mv);gt.dispose()});
  return {r}}