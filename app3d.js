/* In-app 3D designs (Three.js, loaded only on the page that shows them).
   equityMountain · disciplineOrb · streakFlame · calendar3d · trophyRoom · newsClock · firmGalaxy
   Every design: drag to rotate where it makes sense, tap callbacks, stops and frees memory when its element leaves the page. */
import * as THREE from "three";
const small=()=>innerWidth<821;
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
    requestAnimationFrame(loop);if(document.hidden)return;tick(clock.getElapsedTime(),st);r.render(scene,cam)})();
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
  let arc=null;const glow=glowSprite(C.gold,3.2);B.grp.add(glow);const ov=overlay(el,"","clock");let lastP=-1,lastS="";
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





/* 8. GALAXY BACKGROUND (Prop firm tracker): full-page spiral galaxy that turns slowly, nebula clouds,
   twinkling stars, shooting stars, parallax with the mouse and the scroll. Fixed behind the page content. */
export function galaxyBackground(el){
  const r=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:"high-performance"});
  const ph=small(),N=ph?9000:22000,dpr=Math.min(devicePixelRatio,ph?1.3:1.6);r.setPixelRatio(dpr);r.setSize(innerWidth,innerHeight);el.innerHTML="";el.appendChild(r.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,400);cam.position.set(0,6,16);cam.lookAt(0,0,0);
  const rnd=(a=1)=>(Math.random()*2-1)*a;
  /* the spiral galaxy: gold core, indigo / blue / magenta arms */
  const pos=new Float32Array(N*3),col=new Float32Array(N*3),sd=new Float32Array(N),c=new THREE.Color(),core=new THREE.Color("#ffd27a"),mid=new THREE.Color("#ff9e5e"),arm=new THREE.Color("#7c8bff"),edge=new THREE.Color("#2aa8ff"),mag=new THREE.Color("#d16bff");
  for(let i=0;i<N;i++){const arms=4,a0=(i%arms)*Math.PI*2/arms,t=Math.pow(Math.random(),.62),R=t*13,spin=R*.55,scat=(1-t*.35)*1.15;
    const a=a0+spin+rnd(.38*(1-t*.4));pos[i*3]=Math.cos(a)*R+rnd(scat*.5);pos[i*3+1]=rnd(.55*(1-t))*(1+Math.random());pos[i*3+2]=Math.sin(a)*R+rnd(scat*.5);
    c.copy(core).lerp(mid,Math.min(1,t*2.2)).lerp(arm,Math.max(0,t*1.6-.35)).lerp(t>.8?edge:arm,Math.max(0,t-.7)*2);if(Math.random()<.08)c.lerp(mag,.7);if(Math.random()<.03)c.set("#ffffff");
    col.set([c.r,c.g,c.b],i*3);sd[i]=Math.random()}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));g.setAttribute("seed",new THREE.BufferAttribute(sd,1));
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,uniforms:{uT:{value:0},uS:{value:(ph?46:58)*dpr}},
    vertexShader:`attribute float seed;uniform float uT;uniform float uS;varying vec3 vC;varying float vA;void main(){vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
      vA=.55+.45*sin(uT*(1.5+seed*3.)+seed*60.);gl_PointSize=uS*(.25+seed*.75)/-mv.z;}`,
    fragmentShader:`varying vec3 vC;varying float vA;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);if(d>.5)discard;float a=pow(1.-d*2.,1.8);gl_FragColor=vec4(vC*(.7+a*.8),a*vA*.95);}`});
  const gal=new THREE.Points(g,mat),galaxy=new THREE.Group();galaxy.add(gal);galaxy.rotation.x=.95;galaxy.rotation.z=-.22;galaxy.position.y=-1;scene.add(galaxy);
  /* bright core glow + nebula clouds */
  const glow=(color,size,op)=>{const s=document.createElement("canvas");s.width=s.height=128;const x=s.getContext("2d"),gr=x.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.25,"rgba(255,255,255,.45)");gr.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=gr;x.fillRect(0,0,128,128);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(s),color,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(size,size,1);return sp};
  galaxy.add(glow("#ffd27a",9,1));galaxy.add(glow("#ff9e5e",18,.45));galaxy.add(glow("#7c8bff",34,.18));
  const neb=[];[["#3a48e0",30,.3,[-14,2,-18]],["#d16bff",24,.22,[16,-3,-22]],["#2aa8ff",26,.2,[6,8,-26]],["#f5b942",18,.14,[-10,-6,-14]],["#7c8bff",34,.16,[2,-10,-30]]].forEach(([cl,s,o,p])=>{const n=glow(cl,s,o);n.position.set(...p);n.userData={p,o};neb.push(n);scene.add(n)});
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
  const clock=new THREE.Clock();let last=0,cx=0,cy=6;
  (function loop(){if(!el.isConnected){removeEventListener("pointermove",mv);removeEventListener("resize",rs);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});r.dispose();return}
    requestAnimationFrame(loop);if(document.hidden)return;const t=clock.getElapsedTime(),dt=Math.min(.05,t-last);last=t;mat.uniforms.uT.value=t;
    galaxy.rotation.y=t*.035;stars.rotation.y=t*.006;
    const sy=Math.min(1,scrollY/1600);cx+=((mx*3)-cx)*.03;cy+=((6-sy*5+my*-2)-cy)*.03;cam.position.set(cx,cy,16-sy*3);cam.lookAt(0,-sy*1.5,0);
    neb.forEach((n,i)=>{n.position.x=n.userData.p[0]+Math.sin(t*.07+i)*2.5;n.position.y=n.userData.p[1]+Math.cos(t*.05+i)*1.5;n.material.opacity=n.userData.o*(.75+.25*Math.sin(t*.3+i*2))});
    shoot.forEach(s=>{const u=s.userData;u.t+=dt;if(u.t<0)return;if(u.t===dt||!u.on){u.on=true;s.position.set(rnd(25),8+Math.random()*8,-20-Math.random()*10);s.rotation.z=-.35-Math.random()*.3}
      const p=u.t/1.1;s.position.x+=dt*22*Math.cos(s.rotation.z);s.position.y+=dt*22*Math.sin(s.rotation.z);s.material.opacity=p<1?Math.sin(p*Math.PI)*.9:0;if(p>=1){u.t=-3-Math.random()*7;u.on=false}});
    r.render(scene,cam)})();
  return {r}}

