/* 3D trading scenes for welcome.html and auth3d.js. Each scene is a different object:
   city (candle towers), book (trading journal), heatmap (3D P&L calendar), shield (prop firm rules),
   orbit (45 prop firms around BROWN23), wave (news shock), balance (risk / reward), trophy (results), helix (growth).
   Particles are spread over primitives by weight; same seed every visit. */
export function buildShapes(THREE,N){
const UP=new THREE.Color("#26a69a"),DN=new THREE.Color("#ef5350"),GRID=new THREE.Color("#3a4a7a"),
  GOLD=new THREE.Color("#f5b942"),GOLD2=new THREE.Color("#ffd27a"),WHITE=new THREE.Color("#ffffff"),ORANGE=new THREE.Color("#ff9800"),
  IND=new THREE.Color("#3a48e0"),IND2=new THREE.Color("#7c8bff"),PAPER=new THREE.Color("#c9d3f0");
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=rng(1);const r=(a=1)=>(R()*2-1)*a;
/* primitives: {w: weight, f(color)->[x,y,z]} */
const P=(w,f)=>({w,f});
const box3=(x,y,z,w,h,d,c,k=1)=>P(Math.max(.002,(w*h+w*d+h*d))*500*k,o=>{o.copy(c);return [x+r(w/2),y+R()*h,z+r(d/2)]});
const seg=(a,b,c,th=.02,k=1)=>P(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])*60*k,o=>{o.copy(c);const t=R();return [a[0]+(b[0]-a[0])*t+r(th),a[1]+(b[1]-a[1])*t+r(th),a[2]+(b[2]-a[2])*t+r(th)]});
const poly=(pts,c,th=.025,k=1)=>pts.slice(1).map((p,i)=>seg(pts[i],p,c,th,k));
const ring=(cx,cy,cz,rad,c,th=.03,k=1,tiltX=0,tiltZ=0)=>P(rad*2*Math.PI*60*k,o=>{o.copy(c);const a=R()*Math.PI*2;let x=rad*Math.cos(a),y=0,z=rad*Math.sin(a);
  const ca=Math.cos(tiltX),sa=Math.sin(tiltX);[y,z]=[y*ca-z*sa,y*sa+z*ca];const cb=Math.cos(tiltZ),sb=Math.sin(tiltZ);[x,y]=[x*cb-y*sb,x*sb+y*cb];return [cx+x+r(th),cy+y+r(th),cz+z+r(th)]});
const ball=(cx,cy,cz,rad,c,k=1,glow)=>P(rad*rad*900*k,o=>{o.copy(c);if(glow)o.lerp(WHITE,R()*glow);const u=R()*2-1,a=R()*Math.PI*2,s=Math.sqrt(1-u*u),q=Math.cbrt(R());return [cx+rad*q*s*Math.cos(a),cy+rad*q*u,cz+rad*q*s*Math.sin(a)]});
const rotX=(v,a)=>[v[0],v[1]*Math.cos(a)-v[2]*Math.sin(a),v[1]*Math.sin(a)+v[2]*Math.cos(a)];
const tilt=(prims,a)=>prims.map(p=>P(p.w,o=>rotX(p.f(o),a)));
function walk(n,drift,vol,seed){R=rng(seed);let p=0;return Array.from({length:n},()=>{const o=p,c=p+drift+r(vol);p=c;return {o,c,h:Math.max(o,c)+R()*vol*.7,l:Math.min(o,c)-R()*vol*.7}})}
function make(prims){const tot=prims.reduce((s,p)=>s+p.w,0),cum=[];let a=0;prims.forEach(p=>{a+=p.w/tot;cum.push(a)});
  const pos=new Float32Array(N*3),col=new Float32Array(N*3),c=new THREE.Color();R=rng(99);
  for(let i=0;i<N;i++){const u=(i+.5)/N;let lo=0,hi=cum.length-1;while(lo<hi){const m=(lo+hi)>>1;if(cum[m]<u)lo=m+1;else hi=m}const v=prims[lo].f(c);
    pos[i*3]=v[0];pos[i*3+1]=v[1];pos[i*3+2]=v[2];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  R=rng(5);for(let i=N-1;i>0;i--){const j=Math.floor(R()*(i+1));for(let q=0;q<3;q++){let t=pos[i*3+q];pos[i*3+q]=pos[j*3+q];pos[j*3+q]=t;t=col[i*3+q];col[i*3+q]=col[j*3+q];col[j*3+q]=t}}
  return {p:pos,c:col}}
const S={};

/* 1. city: rows of candle towers going back in depth, on a glowing grid floor (seen from above) */
{const L=[];for(let row=0;row<6;row++){const cs=walk(16,row%3===1?-.06:.12,.42,10+row),z=1.6-row*.9;let lo=Infinity;cs.forEach(k=>lo=Math.min(lo,k.l));
   cs.forEach((k,i)=>{const x=-3.8+i*.5,c=k.c>=k.o?UP:DN,b0=-1.8+(Math.min(k.o,k.c)-lo)*.55,b1=-1.8+(Math.max(k.o,k.c)-lo)*.55+.06;
     L.push(box3(x,b0,z,.26,b1-b0,.26,c,1.1),seg([x,-1.8+(k.l-lo)*.55,z],[x,-1.8+(k.h-lo)*.55,z],c,.01,.6))})}
 for(let i=0;i<=16;i++)L.push(seg([-4.1+i*.5,-1.85,2.1],[-4.1+i*.5,-1.85,-3.3],GRID,.006,.45));for(let j=0;j<=6;j++)L.push(seg([-4.1,-1.85,2.1-j*.9],[4.1,-1.85,2.1-j*.9],GRID,.006,.45));
 S.city=make(tilt(L,.38))}

/* 2. book: an open trading journal, notes on the left page, a chart on the right page, gold bookmark */
{const L=[],pageZ=(x)=>.35*Math.pow(Math.abs(x)/3,1.6)-.05*Math.cos(x*1.2);
 L.push(P(900,o=>{o.copy(PAPER).multiplyScalar(.28);const x=-3+R()*6,y=-2+R()*4;return [x,y,pageZ(x)]}));
 for(let i=0;i<8;i++){const y=1.5-i*.42,len=1.6+((i*7)%5)*.18;L.push(P(len*70,o=>{o.copy(PAPER).multiplyScalar(.7);const x=-2.7+R()*len;return [x,y+r(.012),pageZ(x)+.01]}))}
 const cs=walk(12,.12,.32,33);let lo=Infinity,hi=-Infinity;cs.forEach(k=>{lo=Math.min(lo,k.l);hi=Math.max(hi,k.h)});const Y=v=>-1.4+(v-lo)/(hi-lo)*2.9;
 cs.forEach((k,i)=>{const x=.45+i*.21,c=k.c>=k.o?UP:DN,b0=Y(Math.min(k.o,k.c)),b1=Y(Math.max(k.o,k.c))+.04;
   L.push(P((b1-b0)*260,o=>{o.copy(c);const xx=x+r(.06);return [xx,b0+R()*(b1-b0),pageZ(xx)+.02]}),P((Y(k.h)-Y(k.l))*40,o=>{o.copy(c);return [x,Y(k.l)+R()*(Y(k.h)-Y(k.l)),pageZ(x)+.02]}))});
 L.push(P(220,o=>{o.copy(GOLD);return [.05+r(.12),2-R()*2.9,pageZ(0)+.05]}),P(120,o=>{o.copy(GOLD2);return [r(.03),-2+R()*4,pageZ(0)+.03]}));
 L.push(P(160,o=>{o.copy(IND2).multiplyScalar(.7);const t=R(),side=R()<.5?-1:1;return [side*3*t+r(.01),(R()<.5?-2:2)+r(.01),pageZ(side*3*t)]}));
 S.book=make(tilt(L,-.25))}

/* 3. heatmap: a 3D P&L calendar, green / red columns by daily result, equity curve floating above */
{const L=[];R=rng(44);let eq=0;const ep=[];const days=[];for(let i=0;i<35;i++)days.push((R()<.63?1:-1)*(.25+R()*1.3));
 for(let w=0;w<5;w++)for(let d=0;d<7;d++){const x=-2.7+d*.9,z=1.6-w*.9,v=days[w*7+d],idx=w*7+d;
   if(d>4){L.push(box3(x,-1.6,z,.62,.04,.62,GRID,1));continue}
   L.push(box3(x,-1.6,z,.62,Math.abs(v),.62,v>0?UP:DN,.9));eq+=v;ep.push([-3+idx/34*6,.9+eq*.13,-2.2])}
 L.push(...poly(ep,GOLD,.03,2.2));S.heatmap=make(tilt(L,.42))}

/* 4. shield: protection of the account, green check, target / daily loss / drawdown lines */
{const L=[],pts=[[-1.6,1.8],[1.6,1.8],[1.6,.4],[1.1,-.9],[0,-2.1],[-1.1,-.9],[-1.6,.4],[-1.6,1.8]],
   sh=t=>{const n=pts.length-1,i=Math.min(n-1,Math.floor(t*n)),f=t*n-i;return [pts[i][0]+(pts[i+1][0]-pts[i][0])*f,pts[i][1]+(pts[i+1][1]-pts[i][1])*f]},
   half=y=>y>.4?1.6:y>-.9?1.1+(y+.9)/1.3*.5:1.1*(y+2.1)/1.2;
 L.push(P(700,o=>{o.copy(GOLD).lerp(GOLD2,R());const p=sh(R());return [p[0]+r(.03),p[1]+r(.03),r(.06)]}));
 L.push(P(1200,o=>{o.copy(IND).lerp(IND2,R()*.5).multiplyScalar(.55);const y=-2.1+R()*3.9,x=r(half(y));return [x,y,r(.05)-.05]}));
 L.push(...poly([[-.75,-.1,.1],[-.15,-.75,.1],[.95,.85,.1]],UP,.06,5));
 L.push(seg([-3.6,2.3,-.3],[3.6,2.3,-.3],UP,.02,1.5),seg([-3.6,-2.35,-.3],[3.6,-2.35,-.3],ORANGE,.02,1.2),seg([-3.6,-2.7,-.3],[3.6,-2.7,-.3],DN,.02,1.5));
 S.shield=make(L)}

/* 5. orbit: 45 prop firms circling a gold BROWN23 core */
{const L=[ball(0,0,0,.75,GOLD,2.2,.5),ball(0,0,0,1.05,GOLD2,.25)];const tilts=[[.35,.15],[-.25,-.4],[1.25,.3]],rads=[1.7,2.45,3.2];
 tilts.forEach(([tx,tz],ri)=>{L.push(ring(0,0,0,rads[ri],IND2,.02,.5,tx,tz));for(let j=0;j<15;j++){const a=j/15*Math.PI*2+ri,c=[UP,IND2,GOLD2,DN,WHITE][(j+ri)%5];
   let x=rads[ri]*Math.cos(a),y=0,z=rads[ri]*Math.sin(a);[y,z]=[y*Math.cos(tx)-z*Math.sin(tx),y*Math.sin(tx)+z*Math.cos(tx)];[x,y]=[x*Math.cos(tz)-y*Math.sin(tz),x*Math.sin(tz)+y*Math.cos(tz)];L.push(ball(x,y,z,.11,c,4))}});
 S.orbit=make(L)}

/* 6. wave: calm price ribbon, then the red news shock with shockwave rings and a clock behind */
{const L=[],f=x=>.12*Math.sin(x*4)+.05*Math.sin(x*11)+(Math.abs(x-.8)<.18?-2.2*Math.cos((x-.8)/.18*Math.PI/2):0)+(x>.98?.6*(1-Math.exp(-(x-.98)*3)):0);
 L.push(P(1400,o=>{const x=-3.8+R()*7.6,y=f(x),z=r(.35);o.copy(Math.abs(x-.8)<.25?DN:IND2).lerp(WHITE,R()*.15);return [x,y+.6,z]}));
 [.6,1.1,1.6,2.1].forEach((rad,i)=>L.push(ring(.8,-1.4,0,rad,DN,.02,.7-i*.12,Math.PI/2*.92,0)));
 L.push(ring(0,.4,-1.8,2.6,GOLD,.025,.7,Math.PI/2,0));for(let h=0;h<12;h++){const a=h/12*Math.PI*2;L.push(seg([2.35*Math.sin(a),.4+2.35*Math.cos(a),-1.8],[2.6*Math.sin(a),.4+2.6*Math.cos(a),-1.8],GOLD2,.02,1.5))}
 L.push(seg([0,.4,-1.75],[0,2.2,-1.75],GOLD2,.03,1.4),seg([0,.4,-1.75],[1.2,.4,-1.75],GOLD2,.03,1.4));
 S.wave=make(L)}

/* 7. balance: risk / reward scale, the green reward pan outweighs the red risk pan */
{const L=[],a=-.22,bx=Math.cos(a)*2.4,by=Math.sin(a)*2.4,top=1.4;
 L.push(box3(0,-2.3,0,1.6,.12,1.0,GRID,3),seg([0,-2.2,0],[0,top,0],GOLD,.05,3),ball(0,top+.05,0,.16,GOLD2,3));
 L.push(seg([-bx,top-by,0],[bx,top+by,0],GOLD,.04,3));
 const pan=(cx,cy,c,big)=>{L.push(seg([cx,cy,0],[cx-.7,cy-1.2,0],GRID,.01,1),seg([cx,cy,0],[cx+.7,cy-1.2,0],GRID,.01,1));
   L.push(P(600,o=>{o.copy(c);const ang=R()*Math.PI*2,rr=Math.sqrt(R())*.9;return [cx+rr*Math.cos(ang),cy-1.25-.25*(1-rr*rr/.81),rr*Math.sin(ang)*.5]}));
   for(let i=0;i<(big?7:3);i++)L.push(box3(cx-.5+(i%4)*.3,cy-1.25,(i>3?.15:-.1),.18,.18+(big?i*.04:0),.18,c,2.5))};
 pan(-bx,top-by,DN,false);pan(bx,top+by,UP,true);
 S.balance=make(L)}

/* 8. trophy: gold cup with handles and sparkles */
{const L=[],prof=y=>y<-1.75?1.15:y<-1.55?.75:y<-.5?.22:y<1.6?.32+1.0*Math.sqrt((y+.5)/2.1):1.32;
 L.push(P(3000,o=>{const y=-2.1+R()*3.75,a=R()*Math.PI*2,rr=prof(y);o.copy(GOLD).lerp(GOLD2,.5+.5*Math.cos(a));return [rr*Math.cos(a),y,rr*Math.sin(a)]}));
 [-1,1].forEach(s=>L.push(P(300,o=>{o.copy(GOLD2);const t=R()*Math.PI,rr=.55;return [s*(1.15+rr*Math.sin(t)),.75+rr*Math.cos(t),r(.04)]})));
 L.push(P(240,o=>{o.copy(WHITE).lerp(GOLD2,R());const a=R()*Math.PI*2,rr=2+R()*1.4;return [rr*Math.cos(a),r(2.4),rr*Math.sin(a)]}));
 S.trophy=make(L)}

/* 9. helix: two strands of candles spiralling up into a gold arrow */
{const L=[];for(let s=0;s<2;s++)for(let i=0;i<26;i++){const t=i/25,a=t*Math.PI*4+s*Math.PI,y=-2.3+t*4.1,x=1.1*Math.cos(a),z=1.1*Math.sin(a),up=(i+s)%5!==2;
   L.push(box3(x,y,z,.17,.22+(up?.08:0),.17,up?UP:DN,2.2))}
 L.push(P(500,o=>{o.copy(IND2).multiplyScalar(.6);const t=R(),a=t*Math.PI*4,s=R()<.5?1:-1;return [.55*Math.cos(a)*s,-2.3+t*4.1,.55*Math.sin(a)*s]}));
 L.push(P(900,o=>{o.copy(GOLD).lerp(GOLD2,R());const v=R(),u=r(1)*(1-v);return [u*.95,2.0+v*1.0,r(.12)*(1-v)]}),seg([0,-2.4,0],[0,2.0,0],GOLD,.03,2));
 S.helix=make(L)}
return S}
