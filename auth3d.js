/* 3D trading-chart background for the login / sign-up page (same scenes as welcome.html, from trade3d-shapes.js).
   The chart follows the step: log in = bullish TradingView chart, sign-up = bullish breakout,
   email code = prop firm levels, Telegram = buy/sell trades, waiting for approval = long position tool.
   If WebGL is not available, the night scene stays. */
import * as THREE from "three";
import {buildShapes} from "./trade3d-shapes.js?v=2";
const auth=document.getElementById("auth");
const canvas=document.createElement("canvas");canvas.id="auth3d";canvas.setAttribute("aria-hidden","true");
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:"high-performance"})}catch(e){renderer=null}
if(renderer&&auth){
auth.prepend(canvas);document.documentElement.classList.add("auth3d");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const small=innerWidth<860,N=small?9000:15000;
renderer.setPixelRatio(Math.min(devicePixelRatio,small?1.5:1.75));
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1,.1,100);camera.position.set(0,0,8.5);
const rnd=(a=1)=>(Math.random()*2-1)*a;
const S=buildShapes(THREE,N);
const geo=new THREE.BufferGeometry(),pos=new Float32Array(N*3),col=new Float32Array(N*3),seed=new Float32Array(N);
for(let i=0;i<N;i++)seed[i]=Math.random();
geo.setAttribute("position",new THREE.BufferAttribute(pos,3));geo.setAttribute("color",new THREE.BufferAttribute(col,3));geo.setAttribute("seed",new THREE.BufferAttribute(seed,1));
const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,
  uniforms:{uSize:{value:(small?30:36)*renderer.getPixelRatio()},uTime:{value:0},uAlpha:{value:small?.95:1}},
  vertexShader:`attribute float seed;uniform float uSize;uniform float uTime;varying vec3 vC;varying float vA;
    void main(){vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;vA=.65+.35*sin(uTime*2.+seed*40.);gl_PointSize=uSize*(.35+seed*.65)/-mv.z;}`,
  fragmentShader:`uniform float uAlpha;varying vec3 vC;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=smoothstep(.5,0.,d);gl_FragColor=vec4(vC*(.6+a*.8),a*vA*uAlpha);}`});
const grp=new THREE.Group();grp.add(new THREE.Points(geo,mat));scene.add(grp);
const sg=new THREE.BufferGeometry(),sp=new Float32Array(1200*3);for(let i=0;i<1200;i++){sp[i*3]=rnd(30);sp[i*3+1]=rnd(18);sp[i*3+2]=-8-Math.random()*20}
sg.setAttribute("position",new THREE.BufferAttribute(sp,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0x8090ff,size:.035,transparent:true,opacity:.5})));
function size(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=w<860?11.5:8.5;camera.updateProjectionMatrix()}
/* desktop: a wide chart behind the box; phone: a small chart at the top, behind the logo */
function place(){const ph=innerWidth<860;grp.scale.setScalar(ph?.74:1.45);grp.position.set(0,ph?(camera.position.z*Math.tan(27.5*Math.PI/180))*(1-2*110/innerHeight):0,0)}
addEventListener("resize",()=>{size();place()});size();place();
/* which step is on screen */
const vis=id=>{const e=document.getElementById(id);return e&&!e.classList.contains("hidden")&&e.offsetParent!==null};
function want(){if(vis("waitBox"))return "position";if(vis("tgForm"))return "trades";if(vis("otpForm"))return "levels";if(vis("signupForm"))return "breakout";return "tvchart"}
let from=S.tvchart,to=S.tvchart,toKey="tvchart",t0=0,k=1;
for(let i=0;i<N*3;i++){pos[i]=to.p[i];col[i]=to.c[i]}
geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;
let mx=0,my=0;addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
const clock=new THREE.Clock();
function frame(){requestAnimationFrame(frame);
  if(auth.classList.contains("hidden")||document.hidden)return;
  const t=clock.getElapsedTime(),w=want();
  if(w!==toKey){from={p:pos.slice(),c:col.slice()};to=S[w];toKey=w;t0=t;k=0}
  if(k<1){k=Math.min(1,(t-t0)/1.4);const e=k*k*(3-2*k),burst=Math.sin(e*Math.PI)*1.3;
    for(let i=0;i<N;i++){const j=i*3,sd=seed[i];
      pos[j]=from.p[j]+(to.p[j]-from.p[j])*e+burst*Math.sin(sd*61.3)*(.6+sd);
      pos[j+1]=from.p[j+1]+(to.p[j+1]-from.p[j+1])*e+burst*Math.cos(sd*17.9)*(.6+sd);
      pos[j+2]=from.p[j+2]+(to.p[j+2]-from.p[j+2])*e+burst*Math.sin(sd*93.7);
      col[j]=from.c[j]+(to.c[j]-from.c[j])*e;col[j+1]=from.c[j+1]+(to.c[j+1]-from.c[j+1])*e;col[j+2]=from.c[j+2]+(to.c[j+2]-from.c[j+2])*e}
    geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true}
  /* a 3D trading screen that sways gently and follows the mouse a little */
  grp.rotation.y=(reduce?0:Math.sin(t*.3)*.22)+mx*.35;grp.rotation.x=-.1+(reduce?0:Math.sin(t*.23)*.05)+my*.2;
  mat.uniforms.uTime.value=t;renderer.render(scene,camera)}
frame();
}

