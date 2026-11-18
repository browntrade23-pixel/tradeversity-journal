/* Trading-chart particle scenes (TradingView style) shared by welcome.html and auth3d.js.
   Every scene is a list of primitives (candle bodies, wicks, grid, lines, zones, arrows); N particles are
   spread over them by weight. Same random seed every time, so the charts look the same on each visit. */
export function buildShapes(THREE,N){
const UP=new THREE.Color("#26a69a"),DN=new THREE.Color("#ef5350"),GRID=new THREE.Color("#3a4a7a"),MA=new THREE.Color("#2962ff"),MA2=new THREE.Color("#ff9800"),
  GOLD=new THREE.Color("#f5b942"),WHITE=new THREE.Color("#ffffff"),ORANGE=new THREE.Color("#ff9800"),BLUE=new THREE.Color("#7c8bff");
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=rng(1);const r=(a=1)=>(R()*2-1)*a;
/* primitives: {w, f(col)->[x,y,z]} */
const box=(x,y,w,h,d,c,k=1)=>({w:Math.max(.0001,w*h)*1700*k,f:o=>{o.copy(c);return [x+r(w/2),y+R()*h,r(d)]}});
const line=(x0,y0,x1,y1,c,th=.025,k=1,dash=0)=>({w:Math.hypot(x1-x0,y1-y0)*60*k,f:o=>{o.copy(c);let t=R();if(dash&&Math.floor(t*dash)%2)t=Math.floor(t*dash)/dash;return [x0+(x1-x0)*t+r(th),y0+(y1-y0)*t+r(th),r(th)]}});
const poly=(pts,c,th=.03,k=1)=>pts.slice(1).map((p,i)=>line(pts[i][0],pts[i][1],p[0],p[1],c,th,k));
const grid=(x0,x1,y0,y1,nx,ny,k=1)=>{const g=[];for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx;g.push(line(x,y0,x,y1,GRID,.008,.5*k))}for(let j=0;j<=ny;j++){const y=y0+(y1-y0)*j/ny;g.push(line(x0,y,x1,y,GRID,.008,.5*k))}return g};
const zone=(x0,y0,x1,y1,c,k=1)=>({w:(x1-x0)*(y1-y0)*120*k,f:o=>{o.copy(c).multiplyScalar(.55);return [x0+R()*(x1-x0),y0+R()*(y1-y0),r(.05)]}});
const tri=(x,y,s,c,upw)=>({w:s*s*1400,f:o=>{o.copy(c);const v=R(),u=r(1)*(1-v);return [x+u*s*.6,upw?y+v*s:y-v*s,r(.03)]}});
/* OHLC random walk -> candles placed in [x0,x1] x [y0,y1] */
function ohlc(n,drift,vol,seed,path){R=rng(seed);let p=0;const out=[];for(let i=0;i<n;i++){const d=path?path(i/(n-1),i):drift;const o=p,c=p+d+r(vol);const h=Math.max(o,c)+R()*vol*.8,l=Math.min(o,c)-R()*vol*.8;out.push({o,c,h,l});p=c}return out}
function chart(cs,x0,x1,y0,y1,opt={}){R=rng(opt.seed||7);let lo=Infinity,hi=-Infinity;cs.forEach(k=>{lo=Math.min(lo,k.l);hi=Math.max(hi,k.h)});
  const n=cs.length,step=(x1-x0)/n,bw=step*.62,Y=v=>y0+(v-lo)/(hi-lo||1)*(y1-y0),X=i=>x0+step*(i+.5),P=[];
  cs.forEach((k,i)=>{const up=k.c>=k.o,c=up?UP:DN,b0=Y(Math.min(k.o,k.c)),b1=Math.max(Y(Math.max(k.o,k.c)),b0+.03);
    P.push(box(X(i),b0,bw,b1-b0,opt.depth||.12,c,opt.bodyK||1));P.push(line(X(i),Y(k.l),X(i),Y(k.h),c,.012,.9))});
  if(opt.grid!==false)P.push(...grid(x0-.2,x1+.2,y0-.2,y1+.2,opt.gx||10,opt.gy||6,opt.gridK||1));
  if(opt.ma){const m=[];let s=0;cs.forEach((k,i)=>{s+=k.c;if(i>=opt.ma)s-=cs[i-opt.ma].c;if(i>=opt.ma-1)m.push([X(i),Y(s/Math.min(i+1,opt.ma))])});P.push(...poly(m,MA,.02,1.4))}
  if(opt.price){const last=cs[n-1],c=last.c>=last.o?UP:DN;P.push(line(x0-.2,Y(last.c),x1+.35,Y(last.c),c,.01,1.2,40));P.push(box(x1+.5,Y(last.c)-.09,.42,.18,.02,c,2.5))}
  return {P,X,Y,step}}
const S={};
function make(prims){const tot=prims.reduce((s,p)=>s+p.w,0),cum=[];let a=0;prims.forEach(p=>{a+=p.w/tot;cum.push(a)});
  const pos=new Float32Array(N*3),col=new Float32Array(N*3),c=new THREE.Color();R=rng(99);
  for(let i=0;i<N;i++){const u=(i+.5)/N;let j=0;while(j<cum.length-1&&cum[j]<u)j++;const v=prims[j].f(c);
    pos[i*3]=v[0];pos[i*3+1]=v[1];pos[i*3+2]=v[2];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  /* shuffle so morphs between scenes mix nicely */
  R=rng(5);for(let i=N-1;i>0;i--){const j=Math.floor(R()*(i+1));for(let q=0;q<3;q++){let t=pos[i*3+q];pos[i*3+q]=pos[j*3+q];pos[j*3+q]=t;t=col[i*3+q];col[i*3+q]=col[j*3+q];col[j*3+q]=t}}
  return {p:pos,c:col}}

/* hero: a full TradingView chart, bullish trend, moving average, live price line */
S.tvchart=make(chart(ohlc(34,.18,.55,11),-3.6,3.2,-2,2,{ma:8,price:true,seed:3,gx:12,gy:7}).P);
/* journal: candles with buy / sell arrows on the trades */
{const cs=ohlc(26,0,.6,21,(t)=>Math.sin(t*Math.PI*2.2)*.45+.05),ch=chart(cs,-3.4,3.4,-1.8,1.8,{seed:4,gx:10,gy:6});
  const P=[...ch.P];[[3,1],[9,0],[14,1],[20,0]].forEach(([i,buy])=>{const k=cs[i];P.push(buy?tri(ch.X(i),ch.Y(k.l)-.42,.28,UP,true):tri(ch.X(i),ch.Y(k.h)+.42,.28,DN,false))});
  S.trades=make(P)}
/* statistics: daily P&L bars (green / red) + equity curve */
{R=rng(31);const P=[...grid(-3.6,3.6,-2,2,10,6)],n=20,days=[];let eq=0;for(let i=0;i<n;i++){const v=(R()<.62?1:-1)*(.3+R()*1.1);days.push(v)}
  const eqp=[];days.forEach((v,i)=>{const x=-3.4+i*(6.8/(n-1));P.push(box(x,v>0?-1:-1+v,.22,Math.abs(v),.1,v>0?UP:DN,1.3));eq+=v;eqp.push([x,-1+eq*.32])});
  P.push(line(-3.6,-1,3.6,-1,GRID,.01,1.2));P.push(...poly(eqp,GOLD,.035,2.4));S.pnl=make(P)}
/* prop firm rules: price between profit target, daily loss and max drawdown */
{const ch=chart(ohlc(28,.05,.5,41),-3.4,2.6,-1.2,1.3,{seed:6,gx:10,gy:6});const P=[...ch.P];
  P.push(line(-3.6,2.0,3.3,2.0,UP,.02,2.2,30),box(3.0,1.92,.9,.16,.02,UP,2));
  P.push(line(-3.6,-1.65,3.3,-1.65,ORANGE,.02,2,30),box(3.0,-1.73,.9,.16,.02,ORANGE,2));
  P.push(line(-3.6,-2.2,3.3,-2.2,DN,.02,2.2,30),box(3.0,-2.28,.9,.16,.02,DN,2));S.levels=make(P)}
/* prop firm tracker: a wall of mini charts */
{const P=[];let s=50;for(let a=0;a<3;a++)for(let b=0;b<3;b++){const x0=-3.6+a*2.5,y0=1.0-b*1.5,bull=(a+b)%3!==1;
   P.push(...chart(ohlc(12,bull?.25:-.25,.5,s++),x0,x0+2.0,y0-.5,y0+.55,{seed:s,grid:false,depth:.06,bodyK:1.2}).P);
   P.push(...poly([[x0-.1,y0-.7],[x0+2.1,y0-.7],[x0+2.1,y0+.75],[x0-.1,y0+.75],[x0-.1,y0-.7]],GRID,.01,.6))}
  S.wall=make(P)}
/* news: calm candles, then the red news spike */
{const cs=ohlc(24,.02,.25,61);const last=cs[cs.length-1];cs.push({o:last.c,c:last.c-4.2,h:last.c+.4,l:last.c-4.8});cs.push({o:last.c-4.2,c:last.c-2.6,h:last.c-2.3,l:last.c-4.5});
  const ch=chart(cs,-3.6,3.0,-2,2,{seed:8,gx:11,gy:6});const P=[...ch.P];const xn=ch.X(24)-ch.step*.5;P.push(line(xn,-2.2,xn,2.3,DN,.02,2.6,26),box(xn,2.25,.9,.2,.02,DN,3));S.spike=make(P)}
/* tools: TradingView long position: entry, target zone, stop zone */
{const cs=ohlc(20,.04,.35,71);const ch=chart(cs,-3.6,.6,-1.2,.6,{seed:9,gx:10,gy:6});const P=[...ch.P];
  P.push(zone(.4,-.1,3.4,1.9,UP,1.3),zone(.4,-1.1,3.4,-.1,DN,1.3),line(.4,-.1,3.4,-.1,WHITE,.015,2),line(.4,1.9,3.4,1.9,UP,.015,1.5),line(.4,-1.1,3.4,-1.1,DN,.015,1.5));
  P.push(...poly([[.6,-.1],[1.2,.35],[1.7,.1],[2.3,.9],[2.8,.7],[3.3,1.85]],GOLD,.03,2));S.position=make(P)}
/* results: range, then a strong bullish breakout */
S.breakout=make(chart(ohlc(30,0,.45,81,(t)=>t<.55?(Math.sin(t*30)*.12):.62),-3.6,3.4,-2,2,{ma:6,price:true,seed:10,gx:12,gy:7}).P);
/* join: bearish to bullish V reversal */
S.reversal=make(chart(ohlc(30,0,.4,91,(t)=>t<.5?-.42:.5),-3.6,3.4,-2,2,{ma:7,seed:12,gx:12,gy:7}).P);
return S}


