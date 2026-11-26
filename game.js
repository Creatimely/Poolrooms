(()=>{'use strict';
const CELL=14,N=10,WT=.4,CH=6,SH=6.5,DW=5,EYE=1.65,M=2.6,WL=-.4,PR=.4,RINGS=8,STEP=.8,CLIMB=1.55;
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const exitLock=()=>{try{if(document.exitPointerLock)document.exitPointerLock()}catch(e){}};
const SEED=((parseInt(new URLSearchParams(location.search).get('seed'))||((Math.random()*1e9)|0))>>>0);
let sd=SEED|0;const R=()=>{sd=sd+0x6D2B79F5|0;let t=Math.imul(sd^sd>>>15,1|sd);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const SET={q:(matchMedia&&matchMedia('(pointer:coarse)').matches)?1:2,mobile:!!(matchMedia&&matchMedia('(pointer:coarse)').matches),sens:1,vol:.8,peace:false,music:.7};
try{Object.assign(SET,JSON.parse(localStorage.getItem('pr_set')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('pr_set',JSON.stringify(SET))}catch(e){}};
const PRS=()=>[.6,.85,Math.min(devicePixelRatio,1.25),Math.min(devicePixelRatio,2)],DIST=[42,52,60,72],CUBE=[128,192,256,384];
const rd=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,powerPreference:'high-performance'});rd.outputEncoding=THREE.sRGBEncoding;
const sc=new THREE.Scene(),FOG=0xa9ad7c,FOGD=.031;sc.background=new THREE.Color(FOG);sc.fog=new THREE.FogExp2(FOG,FOGD);
const baseFov=()=>clamp(2*Math.atan(Math.tan(50*Math.PI/180)/(innerWidth/innerHeight))*180/Math.PI,48,78);
const cam=new THREE.PerspectiveCamera(70,1,.12,100);cam.rotation.order='YXZ';sc.add(cam);
const pl=new THREE.PointLight(0xfff0c0,1.15,24,1.3);cam.add(pl);sc.add(new THREE.AmbientLight(0xb4bc88,1.05));
function resize(){rd.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.fov=baseFov();cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();

/* ---------- textures & matériaux ---------- */
const WU={uTime:{value:0},uEnv:{value:null},uRip:{value:new THREE.Vector4(0,0,0,0)},uBmin:{value:new THREE.Vector3(-1e4,-1e4,-1e4)},uBmax:{value:new THREE.Vector3(1e4,1e4,1e4)},uCpos:{value:new THREE.Vector3()},uRefl:{value:null},uTexMat:{value:new THREE.Matrix4()},uPH:{value:-999},uUsePl:{value:0}};
const cnv=n=>{const c=document.createElement('canvas');c.width=c.height=n;return c};
function pill(col){const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d');x.shadowColor=col;x.shadowBlur=20;x.fillStyle='#fff';
 x.beginPath();x.moveTo(22,64);x.arc(64,64,42,Math.PI,0);x.lineTo(106,192);x.arc(64,192,42,0,Math.PI);x.closePath();x.fill();x.fill();
 const T=new THREE.CanvasTexture(c);T.encoding=THREE.sRGBEncoding;return T}
/* carrelage réaliste : joints, biseaux, variations par carreau, salissures, fissures, flaques de rugosité */
function tileSet(base,n,grout,o={}){const S=512,t=S/n,g=o.gap||2.5,c=cnv(S),b=cnv(S),r=cnv(S),x=c.getContext('2d'),y=b.getContext('2d'),z=r.getContext('2d');
 x.fillStyle=grout;x.fillRect(0,0,S,S);y.fillStyle='#303030';y.fillRect(0,0,S,S);z.fillStyle='#b4b4b4';z.fillRect(0,0,S,S);
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=R()*20-10,w=R()*10-5,X=i*t+g,Y=j*t+g,W=t-2*g;
  x.fillStyle=`rgb(${(base[0]+v+w*.3)|0},${(base[1]+v)|0},${(base[2]+v-w*.4)|0})`;x.fillRect(X,Y,W,W);
  const gr=x.createLinearGradient(X,Y,X+W,Y+W);gr.addColorStop(0,'rgba(255,255,255,.14)');gr.addColorStop(1,'rgba(0,0,0,.10)');x.fillStyle=gr;x.fillRect(X,Y,W,W);
  x.fillStyle='rgba(255,255,255,.22)';x.fillRect(X,Y,W,1.2);x.fillRect(X,Y,1.2,W);x.fillStyle='rgba(0,0,0,.16)';x.fillRect(X,Y+W-1.2,W,1.2);x.fillRect(X+W-1.2,Y,1.2,W);
  const gv=(200+R()*30)|0;y.fillStyle=`rgb(${gv},${gv},${gv})`;y.fillRect(X,Y,W,W);const rv=(150+R()*70)|0;z.fillStyle=`rgb(${rv},${rv},${rv})`;z.fillRect(X,Y,W,W)}
 const ns=o.stains===undefined?26:o.stains;
 for(let k=0;k<ns;k++){const px=R()*S,py=R()*S,rad=20+R()*70,gg=x.createRadialGradient(px,py,0,px,py,rad);gg.addColorStop(0,`rgba(${o.stain||'60,70,40'},${.05+R()*.08})`);gg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gg;x.fillRect(px-rad,py-rad,rad*2,rad*2)}
 for(let k=0;k<18;k++){const px=R()*S,py=R()*S,rad=25+R()*70,gg=z.createRadialGradient(px,py,0,px,py,rad);gg.addColorStop(0,'rgba(20,20,20,.5)');gg.addColorStop(1,'rgba(20,20,20,0)');z.fillStyle=gg;z.fillRect(px-rad,py-rad,rad*2,rad*2)}
 x.strokeStyle='rgba(30,35,25,.35)';x.lineWidth=.8;const nc=o.cracks===undefined?3:o.cracks;for(let k=0;k<nc;k++){let px=R()*S,py=R()*S;x.beginPath();x.moveTo(px,py);for(let q=0;q<6;q++){px+=(R()-.5)*26;py+=(R()-.5)*26;x.lineTo(px,py)}x.stroke()}
 const mk=(cv,enc)=>{const T=new THREE.CanvasTexture(cv);T.wrapS=T.wrapT=THREE.RepeatWrapping;T.anisotropy=Math.min(8,rd.capabilities.getMaxAnisotropy());T.repeat.set(.5,.5);if(enc)T.encoding=THREE.sRGBEncoding;return T};
 return{map:mk(c,1),bump:mk(b),rough:mk(r)}}
const stdm=(s,rough,bs,extra)=>new THREE.MeshStandardMaterial(Object.assign({map:s.map,bumpMap:s.bump,bumpScale:bs,roughnessMap:s.rough,roughness:rough},extra||{}));
const mWs=[stdm(tileSet([236,238,220],10,'#9fa38c'),.55,.6),stdm(tileSet([220,238,216],10,'#98a08c'),.55,.6),stdm(tileSet([240,232,210],10,'#a39f88'),.55,.6)],mW=mWs[0],
sT=tileSet([20,112,106],40,'#0a403c',{gap:.8,stain:'10,50,50',cracks:0}),mT=stdm(sT,.45,.4),
sF=tileSet([232,234,216],8,'#8f9380',{stain:'40,60,50'}),
mDeckDry=stdm(sF,.8,.7),mDeckWet=stdm(sF,.3,.7,{color:0xd8e2d0,envMapIntensity:.9}),
mDeckW=[mT,mT,mDeckWet,mT,mT,mT],mDeckD=[mT,mT,mDeckDry,mT,mT,mT],
mFloor=mT.clone(),
mLight=new THREE.MeshBasicMaterial({color:0xfffbe0,toneMapped:false}),
mWin=new THREE.MeshBasicMaterial({map:pill('#ffffe0'),transparent:true,toneMapped:false,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),
mMetal=new THREE.MeshStandardMaterial({color:0xcfd3d0,metalness:.9,roughness:.25}),
mChair=new THREE.MeshStandardMaterial({color:0xf4f4ee,roughness:.5}),mDark=new THREE.MeshStandardMaterial({color:0x14302e,roughness:.3,side:THREE.DoubleSide}),
mHole=new THREE.MeshBasicMaterial({color:0x0b0e08,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),
mPhong=new THREE.MeshPhongMaterial({color:0x0e302e,specular:0xfff6c0,shininess:90,transparent:true,opacity:.86});
/* caustiques animées sur le fond des bassins */
mFloor.onBeforeCompile=sh=>{sh.uniforms.uTime=WU.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <project_vertex>','#include <project_vertex>\nvWp=(modelMatrix*vec4(transformed,1.)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform float uTime;\nfloat cau(vec2 p){float a=sin(p.x*1.7+uTime*.9)*sin(p.y*1.3-uTime*.7);float b=sin((p.x+p.y)*2.1+uTime*1.3)*sin((p.x-p.y)*1.9-uTime*1.1);return pow(abs(a*b),.4);}').replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb+=vec3(.55,1.,.9)*pow(cau(vWp.xz*1.4),3.)*.35;')};
mFloor.customProgramCacheKey=()=>'floorcau';
const uvs=(g,a,b)=>{const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*a,u.getY(i)*b);return g};

/* ---------- eau : reflets planaires dynamiques + cubemap, vaguelettes multi-échelles, profondeur, ondes du joueur ---------- */
const WV='varying vec3 vW;\n#include <fog_pars_vertex>\nvoid main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}';
const WF=`uniform float uTime;uniform float uDepth;uniform samplerCube uEnv;uniform sampler2D uRefl;uniform mat4 uTexMat;uniform float uPH;uniform float uUsePl;uniform vec4 uRip;uniform vec3 uBmin;uniform vec3 uBmax;uniform vec3 uCpos;varying vec3 vW;
#include <fog_pars_fragment>
vec3 bp(vec3 p,vec3 r){if(any(lessThan(p,uBmin))||any(greaterThan(p,uBmax)))return r;vec3 t1=(uBmax-p)/r;vec3 t2=(uBmin-p)/r;vec3 tf=max(t1,t2);float t=min(min(tf.x,tf.y),tf.z);return p+r*t-uCpos;}
void main(){
 vec2 p=vW.xz;p+=.35*sin(p.yx*.8+uTime*.3);vec2 g=vec2(0.);
 for(int i=0;i<10;i++){float fi=float(i);float a=fi*2.399+.5;float f=.9*pow(1.5,fi);float am=.045*pow(f,-.85);vec2 d=vec2(cos(a),sin(a));
  g+=d*cos(dot(p,d)*f+uTime*sqrt(f)*1.1+fi*1.7)*f*am;}
 g*=1.35;
 vec2 q=vW.xz-uRip.xy;float r=length(q)+.001;float e=uRip.z*exp(-r*.3)*smoothstep(0.,.5,r);g+=q/r*cos(r*8.-uTime*6.)*.12*e;
 vec3 N=normalize(vec3(-g.x,1.,-g.y));vec3 V=normalize(cameraPosition-vW);
 if(cameraPosition.y<vW.y){gl_FragColor=vec4(.04,.3,.3,.5);}
 else{float nv=clamp(dot(N,V),0.,1.);float fr=.04+.96*pow(1.-nv,3.6);vec3 R2=reflect(-V,N);R2.y=abs(R2.y);
  vec3 env=textureCube(uEnv,bp(vW,R2),.6).rgb;
  if(uUsePl>.5&&abs(vW.y-uPH)<.08){vec4 pc=uTexMat*vec4(vW,1.);vec2 ruv=pc.xy/pc.w+N.xz*.04;if(pc.w>0.&&ruv.x>0.&&ruv.x<1.&&ruv.y>0.&&ruv.y<1.){env=mix(env,texture2D(uRefl,ruv).rgb,.88);}}
  float lum=dot(env,vec3(.3,.6,.1));env*=1.+pow(lum,5.)*7.;
  vec3 dc=mix(vec3(.02,.09,.09),vec3(.004,.02,.02),smoothstep(.3,2.2,uDepth));
  vec3 col=dc*(1.-fr)+env*fr*1.25+vec3(1.,.96,.85)*pow(nv,380.)*.35;
  gl_FragColor=vec4(col,clamp(.72+.2*smoothstep(.2,1.5,uDepth)+.28*fr,0.,.98));}
 gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(.4545));
#include <fog_fragment>
}`;
let waterBroken=false;
const mkWater=d=>waterBroken?mPhong:new THREE.ShaderMaterial({uniforms:{...THREE.UniformsLib.fog,uTime:WU.uTime,uEnv:WU.uEnv,uRip:WU.uRip,uBmin:WU.uBmin,uBmax:WU.uBmax,uCpos:WU.uCpos,uRefl:WU.uRefl,uTexMat:WU.uTexMat,uPH:WU.uPH,uUsePl:WU.uUsePl,uDepth:{value:d}},vertexShader:WV,fragmentShader:WF,transparent:true,depthWrite:false,fog:true,side:THREE.DoubleSide});
rd.debug.onShaderError=()=>{waterBroken=true;for(const w of waters)w.material=mPhong;mFloor.onBeforeCompile=()=>{};mFloor.customProgramCacheKey=()=>'plain';mFloor.needsUpdate=true};
/* réflexion planaire (caméra miroir + clipping oblique), comme la démo Three.js Water, adaptée à nos plans d'eau */
let reflRT=null;const vcam=new THREE.PerspectiveCamera(),clipP=new THREE.Plane(),clipV=new THREE.Vector4(),qv=new THREE.Vector4();
function mkRefl(){if(reflRT)reflRT.dispose();const f=[0,.35,.5,.6][SET.q];reflRT=SET.q?new THREE.WebGLRenderTarget(Math.max(64,(innerWidth*f)|0),Math.max(64,(innerHeight*f)|0)):null;WU.uRefl.value=reflRT?reflRT.texture:null;WU.uUsePl.value=0}
function renderRefl(pY){const cw=new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld);if(cw.y<=pY+.05){WU.uUsePl.value=0;return}
 const rot=new THREE.Matrix4().extractRotation(cam.matrixWorld),fw=new THREE.Vector3(0,0,-1).applyMatrix4(rot).add(cw),up=new THREE.Vector3(0,1,0).applyMatrix4(rot);
 vcam.position.set(cw.x,2*pY-cw.y,cw.z);vcam.up.set(up.x,-up.y,up.z);vcam.lookAt(fw.x,2*pY-fw.y,fw.z);vcam.updateMatrixWorld();vcam.projectionMatrix.copy(cam.projectionMatrix);vcam.far=cam.far;
 const tm=WU.uTexMat.value;tm.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);tm.multiply(vcam.projectionMatrix);tm.multiply(vcam.matrixWorldInverse);
 clipP.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0),new THREE.Vector3(0,pY,0));clipP.applyMatrix4(vcam.matrixWorldInverse);clipV.set(clipP.normal.x,clipP.normal.y,clipP.normal.z,clipP.constant);
 const pm=vcam.projectionMatrix;qv.x=(Math.sign(clipV.x)+pm.elements[8])/pm.elements[0];qv.y=(Math.sign(clipV.y)+pm.elements[9])/pm.elements[5];qv.z=-1;qv.w=(1+pm.elements[10])/pm.elements[14];
 clipV.multiplyScalar(2/clipV.dot(qv));pm.elements[2]=clipV.x;pm.elements[6]=clipV.y;pm.elements[10]=clipV.z+1-.003;pm.elements[14]=clipV.w;
 const prev=rd.getRenderTarget();for(const w of waters)w.visible=false;rd.setRenderTarget(reflRT);rd.render(sc,vcam);rd.setRenderTarget(prev);for(const w of waters)w.visible=true;
 WU.uPH.value=pY;WU.uUsePl.value=1}
function updateRefl(){if(!reflRT){WU.uUsePl.value=0;return}const ci=clamp((P.x/CELL)|0,0,N-1),cj=clamp((P.z/CELL)|0,0,N-1);let best=null,bd=1e9;
 for(let i=Math.max(0,ci-1);i<=Math.min(N-1,ci+1);i++)for(let j=Math.max(0,cj-1);j<=Math.min(N-1,cj+1);j++)for(const r of cells[i][j].rects){
  if(r[4]>=P.fy+EYE-.1)continue;const dx=Math.max(r[0]-P.x,0,P.x-r[1]),dz=Math.max(r[2]-P.z,0,P.z-r[3]),d=Math.hypot(dx,dz)+Math.abs(r[4]-P.fy)*.5;if(d<bd){bd=d;best=r}}
 if(!best||bd>24){WU.uUsePl.value=0;return}renderRefl(best[4])}
mkRefl();

/* ---------- monde ---------- */
const cells=[],walls=[],cyl=[],waters=[],rings=[];let cur,cm=mW;
const add=(o,st=1)=>{if(st){o.matrixAutoUpdate=false;o.updateMatrix()}cur.add(o);return o};
function box(w,h,d,m,x,y,z){const g=new THREE.BoxGeometry(w,h,d),u=g.attributes.uv,D=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
 for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;u.setXY(i,u.getX(i)*D[f][0],u.getY(i)*D[f][1])}
 const o=new THREE.Mesh(g,m);o.position.set(x,y,z);return add(o)}
const V3=THREE.Vector3;
for(let i=0;i<N;i++){cells[i]=[];for(let j=0;j<N;j++)cells[i][j]={i,j,e:0,s:0,e1:0,s1:0,e2:0,s2:0,v:0,rects:[],surf:[],blk:{},type:'',sw:0,fl:0,lv:0,depth:1,jN:0,jS:0,jE:0,jW:0,isl:0,vc:[],park:0,tall:0,sub:null,lk:{},secretRoom:0,mz:0,mat:mWs[R()<.6?0:R()<.5?1:2]}}
const all=cells.flat(),startC=cells[N>>1][N>>1],corners=[[0,0],[N-1,0],[0,N-1],[N-1,N-1]],PC=corners[(R()*4)|0],pcell=cells[PC[0]][PC[1]];
const mapSide=(c,s)=>{if(c.sw)s={W:'N',N:'W',E:'S',S:'E'}[s];if(c.fl)s={W:'E',E:'W'}[s]||s;return s};
for(const c of all){const r=R();c.type=(c===startC||c===pcell)?'dry':r<.06?'atrium':r<.16?'stair':r<.22?'cellar':r<.28?'dry':r<.35?'lap':r<.42?'rotunda':r<.49?'serp':r<.56?'forest':r<.62?'nave':r<.69?'grand':'pool';if(c.type==='nave'||c.type==='grand')c.tall=1;
 if(c.type==='pool'){c.depth=R()<.3?2.4:1;c.isl=(c.depth<1.5&&R()<.2)?1:0}
 if(c.type==='cellar')c.depth=SH;
 if(c.type==='atrium'){c.lv=1;c.park=R()<.4?1:0}if(c.type==='stair')c.lv=R()<.4?2:1;
 if(c.lv||c.type==='cellar'){c.sw=R()<.5?1:0;c.fl=R()<.5?1:0;c.blk[mapSide(c,c.type==='atrium'?'S':'W')]=1;if(c.type==='stair'&&c.lv===2)c.blk[mapSide(c,'E')]=1}}
{let nc=all.filter(c=>c.type==='cellar').length;for(let t=0;t<300&&nc<5;t++){const c=all[(R()*all.length)|0];if(c===startC||c===pcell||!(c.type==='dry'||c.type==='lap'||c.type==='rotunda'||c.type==='forest'||c.type==='serp'))continue;c.type='cellar';c.depth=SH;c.sw=R()<.5?1:0;c.fl=R()<.5?1:0;c.blk[mapSide(c,'W')]=1;nc++}}
const D=[[1,0,'E','W'],[-1,0,'W','E'],[0,1,'S','N'],[0,-1,'N','S']],bk=(c,n,d)=>c.blk[d[2]]||n.blk[d[3]];
const nbr=(c,d)=>cells[c.i+d[0]]&&cells[c.i+d[0]][c.j+d[1]];
for(const c of all)if((c.type==='dry'||c.type==='forest'||c.type==='serp')&&c!==startC&&c!==pcell&&D.some(d=>{const n=nbr(c,d);return n&&n.lv>0&&n.type!=='mezz'})&&R()<.55){c.type='mezz';c.lv=1}
const link=(c,n,d)=>{if(d[0]===1)c.e=1;else if(d[0]===-1)n.e=1;else if(d[1]===1)c.s=1;else n.s=1};
const st=[startC];startC.v=1;
while(st.length){const c=st[st.length-1],nb=D.map(d=>[nbr(c,d),d]).filter(([n,d])=>n&&!n.v&&!bk(c,n,d));
 if(!nb.length){st.pop();continue}const[n,d]=nb[(R()*nb.length)|0];n.v=1;link(c,n,d);st.push(n)}
for(let again=1;again;){again=0;for(const c of all)if(!c.v)for(const d of D){const n=nbr(c,d);if(n&&n.v&&!n.blk[d[3]]){c.v=1;c.type='dry';c.blk={};c.lv=0;c.depth=1;c.isl=0;link(c,n,d);again=1;break}}}
const okT=t=>t==='pool'||t==='lap'||t==='dry';
for(const c of all)for(const[n,d,k]of[[nbr(c,D[0]),D[0],'e'],[nbr(c,D[2]),D[2],'s']]){if(!n)continue;
 if(!c[k]&&!bk(c,n,d)&&R()<.2)c[k]=1;
 const pp=c.type==='pool'&&n.type==='pool'&&c.depth===n.depth&&!c.isl&&!n.isl;
 if(c[k]===1&&((pp&&R()<.55)||(okT(c.type)&&okT(n.type)&&R()<.3)))c[k]=2;
 if(c[k]===2&&pp){if(k==='e'){c.jE=1;n.jW=1}else{c.jS=1;n.jN=1}}
 if(c.lv>0&&n.lv>0&&!bk(c,n,d)){if(R()<(c.type==='mezz'||n.type==='mezz'?.92:.7))c[k+'1']=1;if(c.lv>1&&n.lv>1&&R()<.7)c[k+'2']=1}}

/* mezzanines orphelines : démolies si inaccessibles */
{const reach=new Set(all.filter(c=>c.type==='stair'||c.type==='atrium')),q=[...reach];for(let h=0;h<q.length;h++){const c=q[h];for(const d of D){const n=nbr(c,d);if(!n||reach.has(n)||n.lv<1)continue;const f=d[0]===1?c.e1:d[0]===-1?n.e1:d[1]===1?c.s1:n.s1;if(f){reach.add(n);q.push(n)}}}
 for(const c of all)if(c.type==='mezz'&&!reach.has(c)){c.type='dry';c.lv=0;for(const d of D){const n=nbr(c,d);if(!n)continue;if(d[0]===1)c.e1=0;else if(d[0]===-1)n.e1=0;else if(d[1]===1)c.s1=0;else n.s1=0}}}
/* porte de sortie : un mur fermé de la salle de départ (connexité préservée) */
const DOOR={},COL={},noDeco=new Set();
{const conn=()=>{const seen=new Set([startC]),q=[startC];for(let h=0;h<q.length;h++){const c=q[h];for(const d of D){const n=nbr(c,d);if(!n||seen.has(n))continue;const open=d[0]===1?c.e:d[0]===-1?n.e:d[1]===1?c.s:n.s;if(open){seen.add(n);q.push(n)}}}return seen.size===all.length};
 const ox=startC.i*CELL,oz=startC.j*CELL,cx=ox+CELL/2,cz=oz+CELL/2,Wc=cells[startC.i-1]&&cells[startC.i-1][startC.j],Nc=cells[startC.i][startC.j-1];
 const cand=[{k:'E',ok:startC.i<N-1,g:()=>startC.e,s:v=>{startC.e=v},x:ox+CELL,z:cz,nx:-1,nz:0,nd:startC.i+','+startC.j+',E'},{k:'S',ok:startC.j<N-1,g:()=>startC.s,s:v=>{startC.s=v},x:cx,z:oz+CELL,nx:0,nz:-1,nd:startC.i+','+startC.j+',S'},
  {k:'W',ok:!!Wc,g:()=>Wc.e,s:v=>{Wc.e=v},x:ox,z:cz,nx:1,nz:0,nd:(startC.i-1)+','+startC.j+',E'},{k:'N',ok:!!Nc,g:()=>Nc.s,s:v=>{Nc.s=v},x:cx,z:oz,nx:0,nz:1,nd:startC.i+','+(startC.j-1)+',S'}].filter(o=>o.ok).sort(()=>R()-.5);
 for(const o of cand){const old=o.g();if(!old){Object.assign(DOOR,o);break}o.s(0);if(conn()){Object.assign(DOOR,o);break}o.s(old)}
 if(!DOOR.k){Object.assign(DOOR,cand[0]);cand[0].s(0)}noDeco.add(DOOR.nd)}
/* ---------- sous-sol : réseau de tunnels, branches, impasses, labyrinthe, salles secrètes ---------- */
const subOK=c=>c!==startC&&!(c.type==='pool'&&c.depth>1.5),subs=new Set(all.filter(c=>c.type==='cellar')),LK=[],hasL=new Set();
const ek=(a,b)=>(a.i<b.i||(a.i===b.i&&a.j<b.j))?a.i+','+a.j+'-'+b.i+','+b.j:b.i+','+b.j+'-'+a.i+','+a.j,addLink=(a,b,secret)=>{const k=ek(a,b);if(hasL.has(k))return false;hasL.add(k);LK.push({a,b,secret:!!secret});return true};
const nbs=c=>D.map(d=>({n:nbr(c,d),d})).filter(o=>o.n&&!bk(c,o.n,o.d)),shuf=a=>a.sort(()=>R()-.5);
function bfsTo(from,isGoal,allowed){const prev=new Map([[from,null]]),q=[from];for(let h=0;h<q.length;h++){const c=q[h];if(h&&isGoal(c)){const p=[];for(let x=c;x;x=prev.get(x))p.unshift(x);return p}for(const o of shuf(nbs(c)))if(!prev.has(o.n)&&allowed(o.n)){prev.set(o.n,c);q.push(o.n)}}return null}
{const cel0=[...subs];if(cel0.length){const done=new Set([cel0[0]]);while(done.size<cel0.length){let best=null;for(const c of done){const p=bfsTo(c,t=>subs.has(t)&&!done.has(t),subOK);if(p&&(!best||p.length<best.length))best=p}if(!best)break;for(let i=0;i<best.length;i++){subs.add(best[i]);if(i)addLink(best[i-1],best[i])}done.add(best[best.length-1])}}}
for(let k=0;k<8;k++){const base=[...subs],s0=base[(R()*base.length)|0];if(!s0)break;let c2=s0;const len=1+((R()*4)|0);for(let t=0;t<len;t++){const o=shuf(nbs(c2)).find(o=>!subs.has(o.n)&&subOK(o.n));if(!o)break;subs.add(o.n);addLink(c2,o.n);c2=o.n}}
for(const c of [...subs])for(const o of nbs(c))if(subs.has(o.n)&&R()<.15)addLink(c,o.n);
{const bi=(R()*(N-2))|0,bj=(R()*(N-2))|0,blk=[];for(let i=bi;i<bi+3;i++)for(let j=bj;j<bj+3;j++)if(subOK(cells[i][j])&&cells[i][j].type!=='cellar')blk.push(cells[i][j]);
 if(blk.length>=6){const Bs=new Set(blk);for(const c of blk){subs.add(c);c.mz=1}const st2=[blk[0]],vs=new Set([blk[0]]);while(st2.length){const c=st2[st2.length-1],o=shuf(nbs(c).filter(o=>Bs.has(o.n)&&!vs.has(o.n)));if(!o.length){st2.pop();continue}vs.add(o[0].n);addLink(c,o[0].n);st2.push(o[0].n)}
  for(const c of blk)for(const o of nbs(c))if(Bs.has(o.n)&&R()<.28)addLink(c,o.n);
  const p=bfsTo(blk[0],t=>!Bs.has(t)&&subs.has(t),subOK);if(p)for(let i=0;i<p.length;i++){subs.add(p[i]);if(i)addLink(p[i-1],p[i])}}}
for(let k=0;k<4;k++){const base=[...subs].filter(c=>!c.secretRoom),s0=base[(R()*base.length)|0];if(!s0)break;const o=shuf(nbs(s0)).find(o=>!subs.has(o.n)&&subOK(o.n));if(!o)continue;o.n.secretRoom=1;subs.add(o.n);addLink(s0,o.n,true)}
for(let k=0;k<2;k++){const base=[...subs],s0=base[(R()*base.length)|0],o=shuf(nbs(s0)).find(o=>subs.has(o.n)&&!o.n.secretRoom&&!s0.secretRoom&&!hasL.has(ek(s0,o.n)));if(o)addLink(s0,o.n,true)}
for(const c of subs){if(c.type==='cellar')c.sub={A:1,x0:c.i*CELL+.2,x1:(c.i+1)*CELL-.2,z0:c.j*CELL+.2,z1:(c.j+1)*CELL-.2,h:5.5};
 else{const mz=c.mz,sr=c.secretRoom,rw=mz?5+R()*1.5:sr?7+R()*3:5+R()*6.5,rd=mz?5+R()*1.5:sr?7+R()*3:5+R()*6.5,h=mz?2.8+R()*.8:sr?3.6+R()*1.6:3+R()*2.4,
  jx=(R()-.5)*(13.4-rw)*.4,jz=(R()-.5)*(13.4-rd)*.4,cx=c.i*CELL+CELL/2+jx,cz=c.j*CELL+CELL/2+jz;c.sub={A:0,x0:cx-rw/2,x1:cx+rw/2,z0:cz-rd/2,z1:cz+rd/2,h,flood:!mz&&R()<.35,mat:R()<.5?mT:mWs[1]}}}
for(const L of LK){const a=L.a,b=L.b,hor=a.j===b.j,A=a.sub,B2=b.sub,lo=hor?Math.max(A.z0,B2.z0):Math.max(A.x0,B2.x0),hi=hor?Math.min(A.z1,B2.z1):Math.min(A.x1,B2.x1);
 let w=L.secret?2.4:(a.mz||b.mz)?2:1.8+R()*2.2;w=Math.min(w,Math.max(1.4,hi-lo-.4));const m=w/2+.35;let a0=lo+m,a1=hi-m;if(a1<a0){a0=a1=(lo+hi)/2}
 const lat=a0+(a1-a0)*R(),h=Math.min(A.h,B2.h,Math.max(2.6,2.6+R()*2.8)),rec={a,b,lat,w,h,secret:L.secret,hor};L.rec=rec;
 a.lk[hor?(b.i>a.i?'E':'W'):(b.j>a.j?'S':'N')]=rec;b.lk[hor?(b.i>a.i?'W':'E'):(b.j>a.j?'N':'S')]=rec}

/* escaliers : marches pleines + surface praticable */
const sh=(s,x,z)=>{if(!s.ax)return s.y;const co=s.ax==='x'?x:z,t=clamp((s.dir>0?co-s.a0:s.a0+s.len-co)/s.len,0,.9999);return s.y0+(((t*s.n)|0)+1)*s.rise};
const inS=(s,x,z)=>x>=s.x0&&x<=s.x1&&z>=s.z0&&z<=s.z1;
const cellAt=(x,z)=>cells[clamp((x/CELL)|0,0,N-1)][clamp((z/CELL)|0,0,N-1)];
function groundAt(x,z,f,st=STEP){let b=-1e9;for(const s of cellAt(x,z).surf)if(inS(s,x,z)){const h=sh(s,x,z);if(h<=f+st&&h>b)b=h}return b}
function blockedAt(x,z,f,st=STEP){for(const s of cellAt(x,z).surf)if(s.solid&&inS(s,x,z)&&sh(s,x,z)>f+st)return true;return false}
function waterAt(x,z,f){for(const r of cellAt(x,z).rects)if(x>r[0]&&x<r[1]&&z>r[2]&&z<r[3]&&f<r[4]-.05)return r;return null}
const slides=[],ladders=[];
const bar=(A,B,r=.03)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,A.distanceTo(B),6),mMetal);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new V3(0,1,0),B.clone().sub(A).normalize());add(o)};
/* garde-corps : lisse haute + intermédiaire + poteaux, avec collision fine */
function guard(x0,z0,x1,z1,y){const L=Math.hypot(x1-x0,z1-z0);if(L<.15)return;const n=Math.max(1,Math.round(L/1.6));
 bar(new V3(x0,y+1,z0),new V3(x1,y+1,z1),.035);bar(new V3(x0,y+.5,z0),new V3(x1,y+.5,z1),.02);
 for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;bar(new V3(x,y,z),new V3(x,y+1,z),.025)}
 walls.push([Math.min(x0,x1)-.05,Math.max(x0,x1)+.05,Math.min(z0,z1)-.05,Math.max(z0,z1)+.05,y,y+1.05])}
/* échelle inox fixée à la paroi (wx,wz = point sur la paroi ; nx,nz = normale vers l'eau) */
function ladder(wx,wz,nx,nz,d){const bx=wx+nx*.13,bz=wz+nz*.13,tx=-nz,tz=nx;
 for(const s of[-.23,.23]){const X=bx+tx*s,Z=bz+tz*s;bar(new V3(X,-d+.1,Z),new V3(X,1.05,Z),.03);bar(new V3(X,1.05,Z),new V3(X-nx*.45,1.05,Z-nz*.45),.03);bar(new V3(X-nx*.45,1.05,Z-nz*.45),new V3(X-nx*.45,.78,Z-nz*.45),.03)}
 for(let y=-d+.4;y<.95;y+=.3)bar(new V3(bx-tx*.23,y,bz-tz*.23),new V3(bx+tx*.23,y,bz+tz*.23),.022)}
function stairs(c,r,ax,dir,y0,n,rise,m){const a0=ax==='x'?r[0]:r[2],len=ax==='x'?r[1]-r[0]:r[3]-r[2],sl=len/n,e=.03;
 c.surf.push({x0:r[0],x1:r[1],z0:r[2],z1:r[3],ax,dir,y0,n,rise,len,a0,solid:1});
 for(let k=0;k<n;k++){const h=(k+1)*rise,p=dir>0?a0+k*sl:a0+len-(k+1)*sl;
  if(ax==='x')box(sl,h,r[3]-r[2]-2*e,m,p+sl/2,y0+h/2,(r[2]+r[3])/2);else box(r[1]-r[0]-2*e,h,sl,m,(r[0]+r[1])/2,y0+h/2,p+sl/2)}
 if(n>=3)for(const side of[0,1]){const cr=ax==='x'?(side?r[3]-.08:r[2]+.08):(side?r[1]-.08:r[0]+.08),lo=dir>0?a0:a0+len,hi=dir>0?a0+len:a0,
   pos=(co,y)=>ax==='x'?new V3(co,y,cr):new V3(cr,y,co),yA=y0+rise+1,yB=y0+n*rise+1;
  bar(pos(lo,yA),pos(hi,yB),.03);
  const ks=new Set([0,n-1]);for(let k=Math.round(n/5);k<n-1;k+=Math.max(2,Math.round(n/5)))ks.add(k);
  for(const k of ks){const co=dir>0?a0+(k+.5)*sl:a0+len-(k+.5)*sl,yt=yA+(yB-yA)*((k+.5)/n),yb=y0+(k+1)*rise;bar(pos(co,yb),pos(co,yt),.022)}
  const seg=Math.max(2,Math.round(n/6));for(let k0=0;k0<n;k0+=seg){const k1=Math.min(n,k0+seg),c0=dir>0?a0+k0*sl:a0+len-k1*sl,c1=c0+(k1-k0)*sl,ybs=y0+k0*rise,yts=yA+(yB-yA)*(k1/n)+.05;
   walls.push(ax==='x'?[c0,c1,cr-.05,cr+.05,ybs,yts]:[cr-.05,cr+.05,c0,c1,ybs,yts])}}}
/* toboggans : tubes opaques / transparents / demi-tubes ouverts, balayés le long d'une courbe */
const mTube=new THREE.MeshStandardMaterial({color:0x1d6a64,roughness:.3,side:THREE.DoubleSide}),mGlass=new THREE.MeshStandardMaterial({color:0xb4ece4,transparent:true,opacity:.28,roughness:.08,side:THREE.DoubleSide,depthWrite:false}),
 mHalf=new THREE.MeshStandardMaterial({color:0x2c948c,roughness:.22,side:THREE.DoubleSide}),mDarkT=new THREE.MeshStandardMaterial({color:0x172b2a,roughness:.35,side:THREE.DoubleSide});
function sweep(curve,L,u0,u1,r,kind){const segs=Math.max(4,Math.ceil((u1-u0)*L/.5)),half=kind==='open',m=half?9:16,pos=[],uv=[],idx=[];
 for(let i=0;i<=segs;i++){const u=u0+(u1-u0)*i/segs,P=curve.getPointAt(u),T=curve.getTangentAt(u),S=new V3().crossVectors(T,new V3(0,1,0));if(S.lengthSq()<1e-5)S.set(1,0,0);S.normalize();const U=new V3().crossVectors(S,T).normalize();
  for(let j=0;j<m;j++){const a=half?Math.PI+Math.PI*j/(m-1):2*Math.PI*j/m,cs=Math.cos(a)*r,sn=Math.sin(a)*r;pos.push(P.x+S.x*cs+U.x*sn,P.y+S.y*cs+U.y*sn,P.z+S.z*cs+U.z*sn);uv.push(j/(m-1)*3,i/segs*(u1-u0)*L*.4)}}
 const rows=half?m-1:m;for(let i=0;i<segs;i++)for(let j=0;j<rows;j++){const a=i*m+j,b=i*m+(j+1)%m,c2=(i+1)*m+j,d2=(i+1)*m+(j+1)%m;idx.push(a,b,c2,b,d2,c2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 add(new THREE.Mesh(g,kind==='glass'?mGlass:kind==='open'?mHalf:kind==='dark'?mDarkT:mTube))}
const SV=[{kind:'tube',turns:1.3,vmax:15,vmin:5,r:.85},{kind:'glass',turns:1.9,vmax:10,vmin:4,r:.85},{kind:'open',turns:1.1,vmax:17,vmin:6,r:1},{kind:'dark',turns:2.4,vmax:7,vmin:3.5,r:.9}];
function buildSlide(c,pt,park){const dir=R()<.5?1:-1,Rh=2.9,ys=SH+1.2,P3=(x,z,y)=>{const q=pt(x,z);return new V3(q[0],y,q[1])},pts=[],mk=[];
 const v=park?{kind:'mix',vmax:13,vmin:5,r:.9}:SV[(R()*4)|0],as=dir>0?0:Math.PI;let ang=as;const yE=WL+.1;
 pts.push(P3(7,2.6,ys),P3(7,3.9,ys-.1),P3(7+dir*Rh*.45,5.4,ys-.35),P3(7+dir*Rh*.9,6.6,ys-.55),P3(7+Rh*Math.cos(as),7+Rh*Math.sin(as),ys-.7));
 const hx=(turns,r0,r1,y0,y1,kind)=>{mk.push({i:pts.length-1,kind});const n=Math.max(8,Math.round(turns*26));for(let q=1;q<=n;q++){const t=q/n,a=ang+dir*Math.PI*2*turns*t,r=r0+(r1-r0)*t;pts.push(P3(7+r*Math.cos(a),7+r*Math.sin(a),y0+(y1-y0)*t))}ang+=dir*Math.PI*2*turns};
 if(park){hx(1,3,3,ys-.7,3.6,'tube');hx(1,3,2.3,3.6,1.5,'open');hx(.9,2.3,1.7,1.5,yE,'glass')}else hx(v.turns,Rh,Rh,ys-.7,yE,v.kind);
 const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+pts[i].distanceTo(pts[i-1]));const tot=cum[cum.length-1];
 const curve=new THREE.CatmullRomCurve3(pts,false,'centripetal');curve.arcLengthDivisions=500;const L=curve.getLength();
 for(let q=0;q<mk.length;q++)sweep(curve,L,q?cum[mk[q].i]/tot:0,q<mk.length-1?cum[mk[q+1].i]/tot:1,v.r,mk[q].kind);
 for(let s=3,k=0;s<L-1;s+=3.6,k++){const u=s/L,p=curve.getPointAt(u),T=curve.getTangentAt(u),t=new THREE.Mesh(new THREE.TorusGeometry(v.r+.06,.04,6,18),mMetal);t.position.copy(p);t.quaternion.setFromUnitVectors(new V3(0,0,1),T);add(t);
  if(k%3===1&&p.y>1.8)bar(new V3(p.x,p.y-v.r,p.z),new V3(p.x,-1,p.z),.07)}
 for(let s=2.6;s<L-1.4;s+=.9){const p=curve.getPointAt(s/L);cyl.push([p.x,p.z,v.r+.12,p.y-v.r,p.y+v.r])}
 const e=pt(7,1.7),a=pt(7,2),b=pt(7,3),tl=Math.hypot(b[0]-a[0],b[1]-a[1]);
 slides.push({curve,L,r:v.r,kind:v.kind,vmax:v.vmax,vmin:v.vmin,ex:e[0],ez:e[1],ey:SH,tx:(b[0]-a[0])/tl,tz:(b[1]-a[1])/tl,cell:c})}
function column(x,z,r,y0,y1,cage){const h=y1-y0,o=new THREE.Mesh(uvs(new THREE.CylinderGeometry(r,r,h,28,1,true),2*Math.PI*r,h),cm);o.position.set(x,(y0+y1)/2,z);add(o);cyl.push([x,z,r,y0,y1]);
 if(cage){const R2=r+.5;for(const yy of[WL+.9,WL+.45]){const t=new THREE.Mesh(new THREE.TorusGeometry(R2,.025,8,40).rotateX(Math.PI/2),mMetal);t.position.set(x,yy,z);add(t)}
  for(let i=0;i<8;i++){const a=i*Math.PI/4,q=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,WL+.9-y0,6),mMetal);q.position.set(x+Math.cos(a)*R2,(y0+WL+.9)/2,z+Math.sin(a)*R2);add(q)}
  cyl.push([x,z,R2,y0,WL+.95])}}
function chair(x,z,ry){const g=new THREE.Group(),b=(w,h,d,px,py,pz)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mChair);o.position.set(px,py,pz);g.add(o)};
 b(.5,.05,.5,0,.45,0);b(.5,.55,.05,0,.75,-.22);[[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]].forEach(([a,c])=>b(.04,.45,.04,a,.22,c));
 g.position.set(x,0,z);g.rotation.y=ry;add(g);cyl.push([x,z,.32,0,1])}

function buildCell(c){
 cur=new THREE.Group();sc.add(cur);c.g=cur;cm=c.mat;const ox=c.i*CELL,oz=c.j*CELL,T=c.type,C=CELL,lv=c.lv;c.cx=ox+C/2;c.cz=oz+C/2;
 const tf=(...r)=>{if(c.sw)r=[r[2],r[3],r[0],r[1]];if(c.fl)r=[C-r[1],C-r[0],r[2],r[3]];return r};
 const pt=(x,z)=>{const r=tf(x,x,z,z);return[ox+r[0],oz+r[2]]};
 const flat=(r,y)=>c.surf.push({x0:ox+r[0],x1:ox+r[1],z0:oz+r[2],z1:oz+r[3],y});
 const piece=(l,y0,y1,m,y)=>{const r=tf(...l);if(r[1]-r[0]<.05||r[3]-r[2]<.05)return;box(r[1]-r[0],y1-y0,r[3]-r[2],m,ox+(r[0]+r[1])/2,(y0+y1)/2,oz+(r[2]+r[3])/2);flat(r,y)};
 const wet=T==='pool'||T==='lap'||T==='atrium'||T==='cellar'||T==='rotunda'||T==='grand',mDk=wet?mDeckW:mDeckD,dd=T==='cellar'?1:c.depth,deck=l=>piece(l,-dd,0,mDk,0),slab=(l,n)=>piece(l,(n-1)*SH+CH,n*SH,cm,n*SH);
 const stair=(l,ax,dir,y0,n,rise,m)=>{const r=tf(...l);if(c.sw)ax=ax==='x'?'z':'x';if(c.fl&&ax==='x')dir=-dir;stairs(c,[ox+r[0],ox+r[1],oz+r[2],oz+r[3]],ax,dir,y0,n,rise,m)};
 const water=(l,wl,fy)=>{const r=tf(...l),w=r[1]-r[0],d=r[3]-r[2],x=ox+(r[0]+r[1])/2,z=oz+(r[2]+r[3])/2;flat(r,fy);
  const fl=new THREE.Mesh(uvs(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),w,d),mFloor);fl.position.set(x,fy,z);add(fl);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),mkWater(wl-fy));m.position.set(x,wl,z);m.userData.keep=1;add(m);waters.push(m);
  c.rects.push([ox+r[0],ox+r[1],oz+r[2],oz+r[3],wl,fy])};
 const grd=(x0,z0,x1,z1,y)=>{const a=pt(x0,z0),b=pt(x1,z1);guard(a[0],a[1],b[0],b[1],y)};
 const top=lv?lv*SH+CH:(c.tall?SH+CH:CH);c.pt=pt;
 const pb=(x0,z0,x1,z1,h)=>{const a=pt(x0,z0),b=pt(x1,z1),X0=Math.min(a[0],b[0]),X1=Math.max(a[0],b[0]),Z0=Math.min(a[1],b[1]),Z1=Math.max(a[1],b[1]);box(X1-X0,h,Z1-Z0,cm,(X0+X1)/2,h/2,(Z0+Z1)/2);walls.push([X0,X1,Z0,Z1,0,h])};
 if(T==='pool'){const d=c.depth,deep=d>1.5,ml=c.jW?0:M,mr=c.jE?0:M,mt=c.jN?0:M,mb=c.jS?0:M,x0=ml,x1=C-mr,z0=mt,z1=C-mb;
  if(ml)deck([0,ml,0,C]);if(mr)deck([C-mr,C,0,C]);if(mt)deck([x0,x1,0,mt]);if(mb)deck([x0,x1,z1,C]);
  let steps=0;
  if(c.isl){const a=5.4,b=8.6;piece([a,b,a,b],-d,0,mDk,0);[[x0,a,z0,z1],[b,x1,z0,z1],[a,b,z0,a],[a,b,b,z1]].forEach(l=>water(l,WL,-d));chair(c.cx,c.cz,R()*6);
   for(const[x,z]of[[4,4],[C-4,4],[4,C-4],[C-4,C-4]])if(R()<.5)column(ox+x,oz+z,.7,-d,SH,1)}
  else{water([x0,x1,z0,z1],WL,-d);
   if(deep){const Ls=[];if(mt)Ls.push([x0+(x1-x0)*.3,z0,0,1]);if(mb)Ls.push([x0+(x1-x0)*.7,z1,0,-1]);if(!Ls.length&&ml)Ls.push([x0,z0+(z1-z0)*.5,1,0]);if(!Ls.length&&mr)Ls.push([x1,z0+(z1-z0)*.5,-1,0]);
    for(const[lx,lz,nx,nz]of Ls){ladder(ox+lx,oz+lz,nx,nz,d);ladders.push({x:ox+lx,z:oz+lz,nx,nz,d,wl:WL,cell:c})}
    if(mt)walls.push([ox+x0,ox+x1,oz+z0-.06,oz+z0+.06,-d,-.1]);if(mb)walls.push([ox+x0,ox+x1,oz+z1-.06,oz+z1+.06,-d,-.1]);if(ml)walls.push([ox+x0-.06,ox+x0+.06,oz+z0,oz+z1,-d,-.1]);if(mr)walls.push([ox+x1-.06,ox+x1+.06,oz+z0,oz+z1,-d,-.1])}
   else if(mt>0&&R()<.65){steps=1;stairs(c,[ox+C/2-1.5,ox+C/2+1.5,oz+z0,oz+z0+1.8],'z',-1,-d,4,d/4,mT)}
   for(let k=0,n=1+((R()*(c.jE||c.jW||c.jN||c.jS?4:2))|0);k<n;k++){let x,z,t=0;do{x=ox+x0+1.4+R()*(x1-x0-2.8);z=oz+z0+3.8+R()*Math.max(.1,z1-z0-5)}while(t++<10&&ladders.some(l=>l.cell===c&&Math.hypot(l.x-x,l.z-z)<2.6));column(x,z,.7+R()*.2,-d,SH,1)}}
  if(!steps&&!deep&&!c.isl&&mt>0&&R()<.6){const y=oz+M-.25;for(let x=M;x<=C-M+.01;x+=2.2)bar(new V3(ox+x,0,y),new V3(ox+x,1,y),.025);bar(new V3(ox+M,1,y),new V3(ox+C-M,1,y),.03);bar(new V3(ox+M,.5,y),new V3(ox+C-M,.5,y),.02);walls.push([ox+M,ox+C-M,y-.04,y+.04,0,1.05])}}
 else if(T==='lap'){const B=[0,1,2].map(k=>[M+k*3.4,M+k*3.4+2]);deck([0,C,0,M]);deck([0,C,C-M,C]);let p=0;for(const[a,b]of B){if(a>p)deck([p,a,M,C-M]);p=b;water([a,b,M,C-M],WL,-1)}deck([p,C,M,C-M])}
 else if(T==='dry'&&c===startC){const r0=DOOR.k==='E'?[C-7.5,C-2,3,11]:DOOR.k==='W'?[2,7.5,3,11]:DOOR.k==='S'?[3,11,C-7.5,C-2]:[3,11,2,7.5];
  [[0,r0[0],0,C],[r0[1],C,0,C],[r0[0],r0[1],0,r0[2]],[r0[0],r0[1],r0[3],C]].forEach(deck);
  const nx=4,nz=4,cw=(r0[1]-r0[0])/nx,cd=(r0[3]-r0[2])/nz;COL.chunks=[];
  for(let a=0;a<nx;a++)for(let b=0;b<nz;b++){const x0=r0[0]+a*cw,z0=r0[2]+b*cd,m=box(cw-.01,1,cd-.01,mDeckD,ox+x0+cw/2,-.5,oz+z0+cd/2);m.userData.keep=1;m.matrixAutoUpdate=true;COL.chunks.push({m,x:ox+x0+cw/2,z:oz+z0+cd/2,vy:0,rx:(R()-.5)*3,rz:(R()-.5)*3,dl:0})}
  flat(r0,0);COL.surf=c.surf[c.surf.length-1];COL.rect=[ox+r0[0],ox+r0[1],oz+r0[2],oz+r0[3]];
  const s=new THREE.Mesh(new THREE.CircleGeometry(2.4,32).rotateX(Math.PI/2),mLight);s.position.set(c.cx,CH-.08,c.cz);add(s)}
 else if(T==='rotunda'){[[0,C,0,5],[0,C,9,C],[0,5,5,9],[9,C,5,9]].forEach(deck);water([5,9,5,9],WL,-1);
  for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4,q=pt(7+Math.cos(a)*4.9,7+Math.sin(a)*4.9);column(q[0],q[1],.6,-1,top)}
  const s=new THREE.Mesh(new THREE.CircleGeometry(3.2,40).rotateX(Math.PI/2),mLight);s.position.set(c.cx,top-.08,c.cz);add(s)}
 else if(T==='serp'){deck([0,C,0,C]);pb(0,3.0,10.5,3.4,CH);pb(3.5,10.6,C,11,CH);for(let k=0,n=(R()*2)|0;k<n;k++)chair(ox+2+R()*(C-4),oz+5.4+R()*3,R()*6.28)}
 else if(T==='forest'){deck([0,C,0,C]);for(const[x,z]of[[3,3],[3,11],[11,3],[11,11],[5.2,5.2],[8.8,5.2],[5.2,8.8],[8.8,8.8],[7,1.8],[7,12.2]]){const q=pt(x,z);column(q[0],q[1],.5,-1,top)}}
 else if(T==='nave'){deck([0,C,0,C]);for(const x of[3.6,10.4])for(let z=1.5;z<13;z+=2.2){const q=pt(x,z);column(q[0],q[1],.45,-1,top)}
  const s=new THREE.Mesh(new THREE.PlaneGeometry(2.4,9).rotateX(Math.PI/2),mLight);s.position.set(c.cx,top-.08,c.cz);add(s)}
 else if(T==='grand'){deck([0,C,0,M]);deck([0,C,C-M,C]);deck([0,M,M,C-M]);deck([C-M,C,M,C-M]);water([M,C-M,M,C-M],WL,-1);
  for(const[x,z]of[[4.6,4.6],[9.4,4.6],[4.6,9.4],[9.4,9.4]])column(ox+x,oz+z,.7,-1,top,1);
  const s=new THREE.Mesh(new THREE.CircleGeometry(3.4,40).rotateX(Math.PI/2),mLight);s.position.set(c.cx,top-.08,c.cz);add(s)}
 else if(T==='dry'){deck([0,C,0,C]);for(const[x,z]of[[4,4],[C-4,4],[4,C-4],[C-4,C-4]])if(R()<.6)column(ox+x,oz+z,.75,-1,SH);
  for(let k=0,n=(R()*3)|0;k<n;k++)chair(ox+3+R()*(C-6),oz+3+R()*(C-6),R()*6.28);
  if(R()<.35){const s=new THREE.Mesh(new THREE.CircleGeometry(2.4,32).rotateX(Math.PI/2),mLight);s.position.set(c.cx,CH-.08,c.cz);add(s)}}
 else if(T==='mezz'){deck([0,C,0,C]);[[0,C,0,2.6],[0,C,C-2.6,C],[0,2.6,2.6,C-2.6],[C-2.6,C,2.6,C-2.6],[2.6,C-2.6,5.8,8.2],[5.8,8.2,2.6,5.8],[5.8,8.2,8.2,C-2.6]].forEach(l=>slab(l,1));
  for(const[a,b,d,e]of[[2.6,2.6,5.8,5.8],[8.2,2.6,C-2.6,5.8],[2.6,8.2,5.8,C-2.6],[8.2,8.2,C-2.6,C-2.6]]){grd(a,b,d,b,SH);grd(a,e,d,e,SH);grd(a,b,a,e,SH);grd(d,b,d,e,SH)}
  for(const[x,z]of[[4.2,4.2],[9.8,4.2],[4.2,9.8],[9.8,9.8]])if(R()<.6){const q=pt(x,z);column(q[0],q[1],.7,-1,top)}
  for(let k=0,n=(R()*3)|0;k<n;k++)chair(ox+3+R()*(C-6),oz+3+R()*(C-6),R()*6.28);
  if(R()<.4){const s=new THREE.Mesh(new THREE.CircleGeometry(2.4,32).rotateX(Math.PI/2),mLight);s.position.set(c.cx,top-.08,c.cz);add(s)}}
 else if(T==='stair'){deck([0,C,0,C]);const t2=lv===2;slab([0,3.2,0,3.68],1);slab([0,3.2,12,C],1);
  if(t2){slab([3.2,10.8,0,C],1);slab([10.8,C,0,3.68],1);slab([10.8,C,12,C],1);slab([0,10.8,0,C],2);slab([10.8,C,0,3.68],2);slab([10.8,C,12,C],2);stair([10.8,C-.2,3.68,12],'z',1,SH,26,.25,cm);
   c.vc.push({a:pt(12.3,2.6),la:1,b:pt(12.3,13),lb:2});grd(10.8,3.68,10.8,12,SH);grd(10.8,12,C-.2,12,SH);grd(10.8,3.68,10.8,12,2*SH);grd(10.8,3.68,C-.2,3.68,2*SH)}
  else slab([3.2,C,0,C],1);
  stair([.2,3.2,3.68,12],'z',-1,0,26,.25,cm);c.vc.push({a:pt(1.7,12.7),la:0,b:pt(1.7,2.4),lb:1});grd(3.2,3.68,3.2,12,SH);grd(.2,12,3.2,12,SH);
  for(const z of[3.5,10.5]){const q=pt(9,z);column(q[0],q[1],.7,-1,top)}}
 else if(T==='cellar'){const a=3.2;[[0,.18,0,C],[a,C,0,C],[.2,a,0,2],[.2,a,10.32,C]].forEach(deck);
  stair([.2,a,2,10.32],'z',-1,-SH,26,.25,cm);water([0,C,0,C],-SH+.7,-SH);c.vc.push({a:pt(1.7,1),la:0,b:pt(1.7,11.2),lb:-1});grd(a,2,a,10.32,0);grd(.2,10.32,a,10.32,0);
  for(const sx of[-3.2,3.2])box(.9,.12,4.6,mLight,c.cx+sx,-1.06,c.cz)}
 else if(T==='atrium'){const a=3.2;[[0,C,0,a],[0,C,C-a,C],[0,a,a,C-a],[C-a,C,a,C-a]].forEach(deck);water([a,C-a,a,C-a],WL,-1);
  [[0,C,0,2.6],[0,2.6,2.6,C-2.6],[C-2.6,C,2.6,C-2.6],[0,3,C-2.6,C],[11.32,C,C-2.6,C]].forEach(l=>slab(l,1));stair([3,11.32,C-2.6,C],'x',1,0,26,.25,cm);c.vc.push({a:pt(2.2,12.7),la:0,b:pt(12.5,12.7),lb:1});
  for(const[x,z]of[[1.6,1.6],[C-1.6,1.6],[1.6,C-1.6],[C-1.6,C-1.6]]){const q=pt(x,z);column(q[0],q[1],.8,-1,top)}
  grd(2.6,2.6,5.8,2.6,SH);grd(8.2,2.6,11.4,2.6,SH);grd(2.6,2.6,2.6,11.4,SH);grd(11.4,2.6,11.4,11.4,SH);grd(3,11.4,3,14,SH);grd(2.6,11.4,3,11.4,SH);
  buildSlide(c,pt,c.park);
  const s=new THREE.Mesh(new THREE.CircleGeometry(3,40).rotateX(Math.PI/2),mLight);s.position.set(c.cx,top-.08,c.cz);add(s)}
 const cp=new THREE.Mesh(uvs(new THREE.PlaneGeometry(C,C).rotateX(Math.PI/2),C,C),cm);cp.position.set(c.cx,top,c.cz);add(cp);
 for(const sx of[-3.2,3.2]){box(.9,.12,4.6,mLight,c.cx+sx,top-.06,c.cz);if(T==='stair')for(let l=0;l<lv;l++)box(.9,.12,4.6,mLight,c.cx+sx,l*SH+CH-.06,c.cz)}
 /* ----- tunnels : salle, couloirs, éclairage ----- */
 if(c.sub&&!c.sub.A){const S=c.sub,h=S.h,fy=-SH,T2=.2,fW=(x0,x1,z0,z1,y)=>c.surf.push({x0,x1,z0,z1,y});
  const pl=(x0,x1,z0,z1,y,up,m)=>{const w=x1-x0,d=z1-z0,o=new THREE.Mesh(uvs(new THREE.PlaneGeometry(w,d).rotateX(up?-Math.PI/2:Math.PI/2),w,d),m);o.position.set((x0+x1)/2,y,(z0+z1)/2);add(o)};
  const wb=(x0,x1,z0,z1,y0,y1,m)=>{if(x1-x0<.02||z1-z0<.02||y1-y0<.02)return;box(x1-x0,y1-y0,z1-z0,m,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);walls.push([x0,x1,z0,z1,y0,y1])};
  pl(S.x0,S.x1,S.z0,S.z1,fy,1,S.flood?mFloor:mDeckDry);pl(S.x0,S.x1,S.z0,S.z1,fy+h,0,S.mat);fW(S.x0,S.x1,S.z0,S.z1,fy);
  if(S.flood){const m=new THREE.Mesh(new THREE.PlaneGeometry(S.x1-S.x0,S.z1-S.z0).rotateX(-Math.PI/2),mkWater(.7));m.position.set((S.x0+S.x1)/2,fy+.7,(S.z0+S.z1)/2);m.userData.keep=1;add(m);waters.push(m);c.rects.push([S.x0,S.x1,S.z0,S.z1,fy+.7,fy])}
  for(const dir of['N','S','W','E']){const r=c.lk[dir],hor=dir==='N'||dir==='S',a0=hor?S.x0:S.z0,a1=hor?S.x1:S.z1,fx=dir==='N'?S.z0:dir==='S'?S.z1:dir==='W'?S.x0:S.x1,o0=(dir==='N'||dir==='W')?fx-T2:fx,o1=o0+T2;
   const put=(p,q,y0,y1)=>hor?wb(p,q,o0,o1,y0,y1,S.mat):wb(o0,o1,p,q,y0,y1,S.mat);
   if(!r)put(a0,a1,fy,fy+h);else{put(a0,r.lat-r.w/2,fy,fy+h);put(r.lat+r.w/2,a1,fy,fy+h);if(r.h<h-.05)put(r.lat-r.w/2,r.lat+r.w/2,fy+r.h,fy+h)}}
  for(const dir in c.lk){const r=c.lk[dir],hor=dir==='E'||dir==='W',lo=r.lat-r.w/2,hi=r.lat+r.w/2,from=dir==='E'?S.x1:dir==='W'?ox:dir==='S'?S.z1:oz,to=dir==='E'?ox+C:dir==='W'?S.x0:dir==='S'?oz+C:S.z0;
   const x0=hor?from:lo,x1=hor?to:hi,z0=hor?lo:from,z1=hor?hi:to;pl(x0,x1,z0,z1,fy,1,mDeckDry);pl(x0,x1,z0,z1,fy+r.h,0,S.mat);fW(x0,x1,z0,z1,fy);
   const w0=dir==='E'||dir==='S'?from+T2:from,w1=dir==='W'||dir==='N'?to-T2:to,y1=fy+r.h;
   if(hor){wb(w0,w1,lo-T2,lo,fy,y1,S.mat);wb(w0,w1,hi,hi+T2,fy,y1,S.mat)}else{wb(lo-T2,lo,w0,w1,fy,y1,S.mat);wb(hi,hi+T2,w0,w1,fy,y1,S.mat)}}
  if(S.flood)for(const dir in c.lk){const r=c.lk[dir],hor=dir==='E'||dir==='W',ed=dir==='E'?S.x1:dir==='W'?S.x0:dir==='S'?S.z1:S.z0,sg=(dir==='E'||dir==='S')?-1:1,a0=Math.min(ed,ed+sg*.55),a1=Math.max(ed,ed+sg*.55),lo=r.lat-r.w/2,hi=r.lat+r.w/2,x0=hor?a0:lo,x1=hor?a1:hi,z0=hor?lo:a0,z1=hor?hi:a1;
   box(x1-x0,.75,z1-z0,mDeckDry,(x0+x1)/2,fy+.375,(z0+z1)/2);fW(x0,x1,z0,z1,fy+.75)}
  if(R()<.6)box(.9,.12,2.4,mLight,(S.x0+S.x1)/2,fy+h-.06,(S.z0+S.z1)/2);
  if(!c.mz&&!c.secretRoom&&R()<.45){column(S.x0+1.3,S.z0+1.3,.5,fy,fy+h);column(S.x1-1.3,S.z1-1.3,.5,fy,fy+h)}}
}
function archWall(px,pz,az,y0,h,open){const L=CELL,s=new THREE.Shape();s.moveTo(0,0);
 if(open){const a=(L-DW)/2;s.lineTo(a,0);s.lineTo(a,3);s.absarc(L/2,3,DW/2,Math.PI,0,true);s.lineTo(L-a,0)}
 s.lineTo(L,0);s.lineTo(L,h);s.lineTo(0,h);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:WT,bevelEnabled:false,curveSegments:10});
 if(az){g.rotateY(-Math.PI/2);g.translate(px+WT/2,y0,pz)}else g.translate(px,y0,pz-WT/2);add(new THREE.Mesh(g,cm))}
function wall(px,pz,az,ca,cb,o,nd,er){
 const tall=(ca&&ca.tall)||(cb&&cb.tall),cel=(ca&&ca.type==='cellar')||(cb&&cb.type==='cellar'),lv=Math.max(ca?ca.lv:0,cb?cb.lv:0,tall?1:0),yb=-Math.max(ca?ca.depth:1,cb?cb.depth:1);cm=(ca||cb).mat;
 const seg=(a,b,y0,y1)=>{const L=b-a,m=a+L/2,x=az?px:px+m,z=az?pz+m:pz;walls.push(az?[x-WT/2,x+WT/2,z-L/2,z+L/2,y0,y1]:[x-L/2,x+L/2,z-WT/2,z+WT/2,y0,y1])};
 if(o[0]!==2){const lw=cel?mT:cm,lb=(a,b,y0,y1)=>{const L=b-a;if(L<.02)return;box(az?WT:L,y1-y0,az?L:WT,lw,az?px:px+a+L/2,(y0+y1)/2,az?pz+a+L/2:pz)};
  if(cel&&er){const o0=(er.hor?er.lat-pz:er.lat-px)-er.w/2,o1=o0+er.w;lb(0,o0,yb,-.03);lb(o1,CELL,yb,-.03);seg(0,o0,yb,0);seg(o1,CELL,yb,0);if(er.h<SH-.03){lb(o0,o1,-SH+er.h,-.03);seg(o0,o1,-SH+er.h,0)}
   for(const[cc,sgn]of[[ca,-1],[cb,1]]){if(!cc||cc.type!=='cellar')continue;const bd=az?px:pz,s0=sgn<0?bd-.2-.55:bd+.2,s1=s0+.55,lo2=er.lat-er.w/2,hi2=er.lat+er.w/2,x0=az?s0:lo2,x1=az?s1:hi2,z0=az?lo2:s0,z1=az?hi2:s1;
    box(x1-x0,.75,z1-z0,mDeckDry,(x0+x1)/2,-SH+.375,(z0+z1)/2);cc.surf.push({x0,x1,z0,z1,y:-SH+.75})}}
  else{lb(0,CELL,yb,-.03);seg(0,CELL,yb,0)}}
 const door=(y0,h,oo)=>{archWall(px,pz,az,y0,h,oo===1);if(oo===1){const a=(CELL-DW)/2;seg(0,a,y0,y0+h);seg(CELL-a,CELL,y0,y0+h)}else seg(0,CELL,y0,y0+h)};
 if(o[0]===2){for(let k=0;k<4;k++){const p=1.75+3.5*k;column(az?px:px+p,az?pz+p:pz,.45,-2.5,SH)}}else door(0,SH,o[0]);
 for(let l=1;l<=lv;l++)door(l*SH,CH,o[l]||0);
 const mx=az?px:px+CELL/2,mz=az?pz+CELL/2:pz;
 const deco=(y,geo,mat)=>{for(const g of[1,-1]){const m=new THREE.Mesh(geo,mat);m.position.set(mx+(az?g*(WT/2+.03):0),y,mz+(az?0:g*(WT/2+.03)));m.rotation.y=az?g*Math.PI/2:(g>0?0:Math.PI);add(m)}};
 if(o[0]===0&&!nd){if(R()<.65)deco(2.8,new THREE.PlaneGeometry(1.5,3),mWin);else if(R()<.3)deco(3.6,new THREE.CircleGeometry(1.1,28),mHole);if(tall&&R()<.85)deco(8.7,new THREE.PlaneGeometry(1.5,3),mWin)}
 for(let l=1;l<=lv;l++)if(!o[l]&&R()<.65)deco(l*SH+2.8,new THREE.PlaneGeometry(1.5,3),mWin)}
function buildWalls(c){cur=c.g;const ox=c.i*CELL,oz=c.j*CELL,E=c.i<N-1?cells[c.i+1][c.j]:null,S=c.j<N-1?cells[c.i][c.j+1]:null;
 wall(ox+CELL,oz,true,c,E,E?[c.e,c.e1,c.e2]:[0,0,0],noDeco.has(c.i+','+c.j+',E'),E?c.lk.E:null);wall(ox,oz+CELL,false,c,S,S?[c.s,c.s1,c.s2]:[0,0,0],noDeco.has(c.i+','+c.j+',S'),S?c.lk.S:null);
 if(c.i===0)wall(ox,oz,true,null,c,[0,0,0],false,null);if(c.j===0)wall(ox,oz,false,null,c,[0,0,0],false,null)}
function merge(c){const g=c.g;g.updateMatrixWorld(true);const B=new Map(),old=[],v=new THREE.Vector3();
 g.children.slice().forEach(o=>{if(o.userData.keep)return;old.push(o);o.traverse(m=>{if(!m.isMesh)return;const ge=m.geometry,P=ge.attributes.position,Nn=ge.attributes.normal,U=ge.attributes.uv,ix=ge.index,ms=Array.isArray(m.material)?m.material:[m.material],
  grp=ge.groups.length?ge.groups:[{start:0,count:ix?ix.count:P.count,materialIndex:0}];
  for(const gr of grp){const mat=ms.length===1?ms[0]:ms[gr.materialIndex];let b=B.get(mat);if(!b){b={p:[],n:[],u:[],i:[]};B.set(mat,b)}const off=b.p.length/3;
   for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);b.p.push(v.x,v.y,v.z);v.fromBufferAttribute(Nn,i).transformDirection(m.matrixWorld);b.n.push(v.x,v.y,v.z);b.u.push(U.getX(i),U.getY(i))}
   for(let i=gr.start;i<gr.start+gr.count;i++)b.i.push((ix?ix.getX(i):i)+off)}})});
 old.forEach(o=>{g.remove(o);o.traverse(m=>m.geometry&&m.geometry.dispose())});
 for(const[mat,b]of B){const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));ge.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));ge.setIndex(b.i);
  const m=new THREE.Mesh(ge,mat);m.matrixAutoUpdate=false;g.add(m)}}
all.forEach(buildCell);all.forEach(buildWalls);all.forEach(merge);

/* ---------- clés, porte à 10 serrures, panneaux secrets ---------- */
const KEYS=10,RT=KEYS;let got=0,ins=0,actReq=false,insAnim=null;const keys=[],secrets=[],flyers=[];
const mGold=new THREE.MeshStandardMaterial({color:0xffc84a,metalness:.9,roughness:.25,emissive:0x6a4200,emissiveIntensity:.9}),mFrame=new THREE.MeshStandardMaterial({color:0x2a3a38,metalness:.55,roughness:.45}),mBrass=new THREE.MeshStandardMaterial({color:0xc9a24a,metalness:.9,roughness:.3}),mPanel=mT.clone();mPanel.color.setScalar(.86);
const glowTex=(()=>{const c=cnv(64),x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,220,120,.9)');g.addColorStop(1,'rgba(255,180,60,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
function keyModel(){const g=new THREE.Group(),bow=new THREE.Mesh(new THREE.TorusGeometry(.11,.032,8,18),mGold);bow.position.y=.2;g.add(bow);const sh=new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,.46,8),mGold);sh.position.y=-.1;g.add(sh);
 for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(.1,.04,.03),mGold);t.position.set(.05,-.22+i*.07,0);g.add(t)}return g}
function addKey(x,y,z,cell,l){const g=new THREE.Group();g.position.set(x,y,z);const pil=new THREE.Mesh(uvs(new THREE.CylinderGeometry(.27,.32,1,16),1.9,1),mWs[0]);pil.position.y=.5;g.add(pil);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.07,16),mMetal);cap.position.y=1.03;g.add(cap);
 const k=keyModel();k.position.y=1.55;g.add(k);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:.7}));sp.scale.set(1.6,1.6,1.6);sp.position.y=1.55;g.add(sp);sc.add(g);keys.push({g,k,sp,x,y,z,cell,l,taken:0,ph:R()*6})}
function validSpot(x,z,y,wok){const g=groundAt(x,z,y+.3,.5);if(g<-1e8||Math.abs(g-y)>.05||(!wok&&waterAt(x,z,y)))return false;
 for(const q of cyl)if(y+1.5>q[3]&&y<q[4]&&Math.hypot(x-q[0],z-q[1])<q[2]+1)return false;for(const w of walls){if(y+1.5<=w[4]||y>=w[5])continue;if(x>w[0]-.9&&x<w[1]+.9&&z>w[2]-.9&&z<w[3]+.9)return false}
 return Math.hypot(x-DOOR.x,z-DOOR.z)>4}
function placeKeys(){const cand={sec:[],tun:[],cel:[],up:[],gnd:[]};
 for(const c of all){const ox=c.i*CELL,oz=c.j*CELL,pts=[[1.4,1.4],[CELL-1.4,1.4],[1.4,CELL-1.4],[CELL-1.4,CELL-1.4],[7,2.2],[7,CELL-2.2],[2.2,7],[CELL-2.2,7],[7,7],[4,10],[10,4]],lv=[0];if(c.lv>=1)lv.push(1);if(c.lv>=2)lv.push(2);
  for(const l of lv){if(l===0&&Math.max(Math.abs(c.i-startC.i),Math.abs(c.j-startC.j))<2)continue;for(const[lx,lz]of pts){const q=c.pt?c.pt(lx,lz):[ox+lx,oz+lz];if(validSpot(q[0],q[1],l*SH)){(l?cand.up:cand.gnd).push({c,l,x:q[0],z:q[1],y:l*SH});break}}}
  if(c.sub){const S=c.sub,x=S.A?ox+CELL*.7:(S.x0+S.x1)/2,z=S.A?oz+CELL*.7:(S.z0+S.z1)/2;if(validSpot(x,z,-SH,true))(c.secretRoom?cand.sec:S.A?cand.cel:cand.tun).push({c,l:-1,x,z,y:-SH})}}
 const out=[],used=new Set(),shuf2=a=>a.slice().sort(()=>R()-.5),r0=rk(startC.i,startC.j,0);
 const take=(arr,n)=>{let k2=0;for(const sp of shuf2(arr)){if(k2>=n||out.length>=KEYS)break;const id=sp.c.i+','+sp.c.j+','+sp.l;if(used.has(id))continue;if(!route(r0,rk(sp.c.i,sp.c.j,sp.l),true))continue;out.push(sp);used.add(id);k2++}};
 take(cand.sec,2);take(cand.tun,2);take(cand.cel,1);take(cand.up,3);take(cand.gnd,KEYS);take(cand.tun,KEYS);take(cand.cel,KEYS);take(cand.up,KEYS);take(cand.sec,KEYS);
 for(const sp of out)addKey(sp.x,sp.y,sp.z,sp.c,sp.l)}
/* panneaux secrets : un pan de mur légèrement différent, qui coulisse quand on l'examine */
function mkBoxMesh(w,h,d,m){const g=new THREE.BoxGeometry(w,h,d),u=g.attributes.uv,Dm=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;u.setXY(i,u.getX(i)*Dm[f][0],u.getY(i)*Dm[f][1])}return new THREE.Mesh(g,m)}
function buildSecrets(){for(const L of LK){const r=L.rec;if(!r.secret)continue;const a=L.a,b=L.b,hor=r.hor,bx=hor?Math.max(a.i,b.i)*CELL:r.lat,bz=hor?r.lat:Math.max(a.j,b.j)*CELL,th=.3,m=mkBoxMesh(hor?th:r.w,r.h,hor?r.w:th,mPanel);
  m.position.set(bx,-SH+r.h/2,bz);sc.add(m);const w=[hor?bx-th/2:bx-r.w/2,hor?bx+th/2:bx+r.w/2,hor?bz-r.w/2:bz-th/2,hor?bz+r.w/2:bz+th/2,-SH,-SH+r.h];walls.push(w);secrets.push({m,w,x:bx,z:bz,y:-SH+1,open:0,t:0,rec:r})}}
function doorTex(){const c=cnv(256),x=c.getContext('2d');x.fillStyle='#232f2e';x.fillRect(0,0,256,256);x.strokeStyle='#3d504d';x.lineWidth=4;for(let i=0;i<4;i++)x.strokeRect(14+i*2,14+i*2,228-i*4,228-i*4);x.fillStyle='#4e6663';for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.beginPath();x.arc(24+i*29,24+j*29,2.4,0,7);x.fill()}
 const T=new THREE.CanvasTexture(c);T.wrapS=T.wrapT=THREE.RepeatWrapping;T.repeat.set(.4,.4);T.encoding=THREE.sRGBEncoding;return T}
function buildDoor(){const g=new THREE.Group();g.position.set(DOOR.x,0,DOOR.z);g.rotation.y=Math.atan2(DOOR.nx,DOOR.nz);sc.add(g);DOOR.g=g;
 const mDoor=new THREE.MeshStandardMaterial({map:doorTex(),metalness:.6,roughness:.5,side:THREE.DoubleSide}),ps=new THREE.Shape();ps.moveTo(-2.2,0);ps.lineTo(-2.2,3.6);ps.absarc(0,3.6,2.2,Math.PI,0,true);ps.lineTo(2.2,0);ps.closePath();
 const lg0=new THREE.Mesh(new THREE.ShapeGeometry(ps,16),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false,side:THREE.DoubleSide,transparent:true,opacity:0}));lg0.position.z=.215;g.add(lg0);DOOR.light=lg0;
 const fs=new THREE.Shape();fs.moveTo(-2.5,0);fs.lineTo(-2.5,3.6);fs.absarc(0,3.6,2.5,Math.PI,0,true);fs.lineTo(2.5,0);fs.lineTo(2.2,0);fs.lineTo(2.2,3.6);fs.absarc(0,3.6,2.2,0,Math.PI,false);fs.lineTo(-2.2,0);fs.closePath();
 const fm=new THREE.Mesh(new THREE.ExtrudeGeometry(fs,{depth:.3,bevelEnabled:false,curveSegments:20}),mFrame);fm.position.z=.22;g.add(fm);
 const leaf=left=>{const sh=new THREE.Shape();if(left){sh.moveTo(-2.2,0);sh.lineTo(0,0);sh.lineTo(0,5.8);sh.absarc(0,3.6,2.2,Math.PI/2,Math.PI,false);sh.lineTo(-2.2,0)}else{sh.moveTo(0,0);sh.lineTo(2.2,0);sh.lineTo(2.2,3.6);sh.absarc(0,3.6,2.2,0,Math.PI/2,false);sh.lineTo(0,0)}
  return new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:false,curveSegments:16}),mDoor)};
 const pl=new THREE.Group();pl.position.set(-2.2,0,.3);const lf=leaf(true);lf.position.x=2.2;pl.add(lf);g.add(pl);
 const pr=new THREE.Group();pr.position.set(2.2,0,.3);const rf=leaf(false);rf.position.x=-2.2;pr.add(rf);g.add(pr);DOOR.pl_=pl;DOOR.pr_=pr;DOOR.locks=[];
 for(let side=0;side<2;side++){const piv=side?pr:pl;for(let r=0;r<5;r++){const lg=new THREE.Group();lg.position.set(side?-1.1:1.1,.95+r*.62,.13);
  lg.add(new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.05,24).rotateX(Math.PI/2),mBrass));lg.add(new THREE.Mesh(new THREE.TorusGeometry(.15,.018,8,24),mBrass));
  const hole=new THREE.Mesh(new THREE.BoxGeometry(.03,.09,.06),mHole);hole.position.z=.02;lg.add(hole);const dot=new THREE.Mesh(new THREE.CircleGeometry(.025,12),mHole);dot.position.set(0,.045,.03);lg.add(dot);
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:0xd02a2a,toneMapped:false}));lamp.position.set(0,.22,.03);lg.add(lamp);piv.add(lg);DOOR.locks.push({lg,lamp,done:0,open:0,t0:0})}}
 DOOR.pl=new THREE.PointLight(0xe8fff0,0,32,1.4);DOOR.pl.position.set(0,2.6,1.8);g.add(DOOR.pl);
 DOOR.flare=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:0,color:0xeaffff}));DOOR.flare.position.set(0,2.8,.6);DOOR.flare.scale.set(4,4,4);g.add(DOOR.flare)}

/* ---------- monstre : modèle articulé (original) ---------- */
const mMon=new THREE.MeshStandardMaterial({color:0x0b0f0d,roughness:.42,metalness:.15,transparent:true,emissive:0x03080a}),mBone=new THREE.MeshStandardMaterial({color:0xc9cdb9,roughness:.55,transparent:true}),
 mEye=new THREE.MeshBasicMaterial({color:0xe2ffb4,fog:false,transparent:true});
const MON=new THREE.Group(),B={};
const gp=(p,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g};
const pm=(p,geo,mat,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);p.add(m);return m};
const limb=(len,r0,r1)=>new THREE.CylinderGeometry(r1,r0,len,8).translate(0,-len/2,0);
B.root=gp(MON);B.hips=gp(B.root,0,1.27,0);pm(B.hips,new THREE.SphereGeometry(.22,10,8),mMon,0,0,0,1.1,.8,.9);
B.spine=gp(B.hips,0,.08,0);pm(B.spine,new THREE.CylinderGeometry(.17,.26,.95,10).translate(0,.47,0),mMon);
for(let i=0;i<7;i++)pm(B.spine,new THREE.SphereGeometry(.04,6,5),mBone,0,.1+i*.13,-.2);
B.neck=gp(B.spine,0,.95,.02);pm(B.neck,new THREE.CylinderGeometry(.055,.085,.42,8).translate(0,.21,0),mMon);
B.head=gp(B.neck,0,.44,.03);pm(B.head,new THREE.SphereGeometry(.2,12,10),mMon,0,.2,0,.85,1.5,1);pm(B.head,new THREE.SphereGeometry(.15,10,8),mBone,0,.2,.13,.9,1.45,.45);
for(const e of[-1,1])pm(B.head,new THREE.SphereGeometry(.028,8,6),mEye,e*.065,.3,.19);
B.jaw=gp(B.head,0,.06,.07);pm(B.jaw,new THREE.BoxGeometry(.1,.045,.2),mMon,0,-.02,.09);
for(let i=0;i<6;i++){pm(B.jaw,new THREE.ConeGeometry(.011,.07,4),mBone,-.04+i*.016,.03,.17);pm(B.head,new THREE.ConeGeometry(.011,.07,4).rotateX(Math.PI),mBone,-.04+i*.016,.04,.2)}
B.arm=[];B.leg=[];
for(const e of[-1,1]){const sh=gp(B.spine,e*.28,.88,0);pm(sh,limb(.85,.055,.04),mMon);const el=gp(sh,0,-.85,0);pm(el,limb(.95,.04,.03),mMon);const wr=gp(el,0,-.95,0);pm(wr,new THREE.BoxGeometry(.08,.1,.03),mMon,0,-.05,0);const fg=[];
 for(let i=0;i<4;i++){const f=gp(wr,(i-1.5)*.024,-.1,0);pm(f,limb(.38,.012,.003),mBone);fg.push(f)}B.arm.push({sh,el,wr,fg,s:e});
 const hp=gp(B.hips,e*.13,-.05,0);pm(hp,limb(.6,.1,.07),mMon);const kn=gp(hp,0,-.6,0);pm(kn,limb(.62,.07,.04),mMon);const an=gp(kn,0,-.62,0);pm(an,new THREE.BoxGeometry(.1,.05,.26),mMon,0,-.02,.09);B.leg.push({hp,kn,an,s:e})}
let mph=0;
function monAnim(dt,mode,spd,t){t=t===undefined?T:t;mph+=dt*(1.5+spd*1.1);const sw=Math.sin(mph),k=Math.min(1,spd/2.5),a=Math.min(1,dt*7);
 const lean={idle:.05,patrol:.12,investigate:.18,search:.08,chase:.5,stun:-.12,attack:.75,die:0}[mode]||.1;B.spine.rotation.x+=(lean-B.spine.rotation.x)*Math.min(1,dt*6);
 B.leg.forEach((l,i)=>{const ph=i?-sw:sw;l.hp.rotation.x=ph*.75*k;l.kn.rotation.x=Math.max(0,-ph)*1.1*k+.05;l.an.rotation.x=-ph*.2*k});
 B.arm.forEach((r,i)=>{const ph=i?sw:-sw;let tx=ph*.5*k+.1,te=-(.2+Math.max(0,ph)*.4*k);if(mode==='attack'){tx=-2.3;te=-.3}else if(mode==='stun'){tx=-1.9;te=-1.7}else if(mode==='search'){tx=-.2;te=-.9}
  r.sh.rotation.x+=(tx-r.sh.rotation.x)*a;r.el.rotation.x+=(te-r.el.rotation.x)*a;r.sh.rotation.z=r.s*(.08+(mode==='attack'?.5:0));r.fg.forEach((f,j)=>f.rotation.x=.3+Math.sin(t*6+j*.7+i*2)*.28*(mode==='chase'||mode==='attack'?1.6:1))});
 let hy=0,hp=0,jw=.08+Math.abs(Math.sin(t*3))*.04;
 if(mode==='patrol'||mode==='investigate')hy=Math.sin(t*.7)*.45;else if(mode==='search'){hy=Math.sin(t*1.3)*1.15;hp=Math.sin(t*.8)*.25;jw=.2}else if(mode==='chase'){hp=.12;jw=.25+Math.abs(Math.sin(t*25))*.12}
 else if(mode==='stun'){hy=(Math.random()-.5)*.3;hp=(Math.random()-.5)*.3;jw=.5}else if(mode==='attack'){hp=-.4;jw=.95}else if(Math.sin(t*13)>.97)hy=.3;
 B.head.rotation.y=hy;B.head.rotation.x=hp;B.jaw.rotation.x=jw;B.hips.position.y=1.27+Math.abs(sw)*.05*k;B.root.rotation.z=sw*.04*k}
MON.visible=false;sc.add(MON);

/* ---------- audio ---------- */
let AC,noiseB,rev,thr,mg,mf;
function initAudio(){try{AC=new(window.AudioContext||window.webkitAudioContext)();const len=AC.sampleRate*3;noiseB=AC.createBuffer(1,len,AC.sampleRate);const d=noiseB.getChannelData(0);let l=0;
 for(let i=0;i<len;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}
 mg=AC.createGain();mg.gain.value=SET.vol;mf=AC.createBiquadFilter();mf.type='lowpass';mf.frequency.value=20000;mg.connect(mf);mf.connect(AC.destination);
 const s=AC.createBufferSource();s.buffer=noiseB;s.loop=true;const lp=AC.createBiquadFilter();lp.frequency.value=500;const g=AC.createGain();g.gain.value=.14;s.connect(lp);lp.connect(g);g.connect(mg);s.start();
 for(const[f,v]of[[58,.05],[117,.02]]){const o=AC.createOscillator(),q=AC.createGain();o.frequency.value=f;q.gain.value=v;o.connect(q);q.connect(mg);o.start()}
 const o=AC.createOscillator(),f2=AC.createBiquadFilter();thr=AC.createGain();thr.gain.value=0;o.type='sawtooth';o.frequency.value=38;f2.frequency.value=120;o.connect(f2);f2.connect(thr);thr.connect(mg);o.start();
 rev=AC.createDelay();rev.delayTime.value=.28;const fb=AC.createGain();fb.gain.value=.45;rev.connect(fb);fb.connect(rev);rev.connect(mg)}catch(e){AC=null}}
function blip(f0=1400,f1=700,v=.06,dur=.12){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur+.1);o.connect(g);g.connect(mg);g.connect(rev);o.start(t);o.stop(t+dur+.15)}
function burst(f,v,dur){if(!AC)return;const s=AC.createBufferSource();s.buffer=noiseB;const b=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime;b.type='bandpass';b.frequency.value=f;
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(b);b.connect(g);g.connect(mg);s.start(t,R()*2);s.stop(t+dur)}

function sfxChime(){if(!AC)return;blip(880,1760,.12,.3);setTimeout(()=>blip(1320,2640,.08,.3),90)}
function sfxClack(){burst(2400,.22,.09);blip(420,180,.18,.12)}
function sfxInsert(){burst(900,.2,.25);blip(160,90,.2,.3);setTimeout(()=>blip(1500,900,.1,.2),120)}
function sfxRumble(d){if(!AC)return;const s=AC.createBufferSource();s.buffer=noiseB;const lp=AC.createBiquadFilter();lp.frequency.value=140;const g=AC.createGain(),t=AC.currentTime;g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.9,t+d*.3);g.gain.linearRampToValueAtTime(.001,t+d);s.connect(lp);lp.connect(g);g.connect(mg);s.start(t,R()*2);s.stop(t+d+.1)}
function sfxCreak(){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type='sawtooth';o.frequency.setValueAtTime(70,t);o.frequency.linearRampToValueAtTime(110,t+3.5);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.12,t+1);g.gain.linearRampToValueAtTime(.001,t+4);const f=AC.createBiquadFilter();f.frequency.value=380;o.connect(f);f.connect(g);g.connect(mg);o.start(t);o.stop(t+4.1)}
function sfxFall(){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),sh=AC.createWaveShaper(),cv=new Float32Array(256);for(let i=0;i<256;i++)cv[i]=Math.tanh((i/128-1)*4);sh.curve=cv;const g=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(900,t);o.frequency.exponentialRampToValueAtTime(45,t+2.6);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+2.8);o.connect(sh);sh.connect(g);g.connect(mg);g.connect(rev);o.start(t);o.stop(t+2.9);burst(300,.4,1.2)}
function sfxRoar(){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),o2=AC.createOscillator(),sh=AC.createWaveShaper(),cv=new Float32Array(256);for(let i=0;i<256;i++)cv[i]=Math.tanh((i/128-1)*5);sh.curve=cv;const g=AC.createGain();o.type='sawtooth';o2.type='square';
 o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(520,t+.5);o.frequency.exponentialRampToValueAtTime(200,t+1.4);o2.frequency.setValueAtTime(70,t);o2.frequency.exponentialRampToValueAtTime(300,t+.5);o2.frequency.exponentialRampToValueAtTime(120,t+1.4);
 g.gain.setValueAtTime(.7,t);g.gain.exponentialRampToValueAtTime(.001,t+1.6);o.connect(sh);o2.connect(sh);sh.connect(g);g.connect(mg);g.connect(rev);o.start(t);o2.start(t);o.stop(t+1.7);o2.stop(t+1.7);burst(1200,.3,.8)}
function overSound(kind){if(!AC)return;const t=AC.currentTime,mk=(f,v,d,typ)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=typ||'sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+d*.4);g.gain.linearRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(mg);g.connect(rev);o.start(t);o.stop(t+d+.1)};
 if(kind==='win'){[261.6,329.6,392,523.3,659.3].forEach((f,i)=>mk(f,.07,7+i*.4))}else{mk(55,.25,6,'sawtooth');mk(82.4,.12,6);for(let i=0;i<4;i++)setTimeout(()=>{blip(52,32,.22,.14);setTimeout(()=>blip(48,30,.16,.12),170)},600+i*1500)}}
function scream(){if(!AC)return;const t=AC.currentTime,sh=AC.createWaveShaper(),cv=new Float32Array(256);for(let i=0;i<256;i++)cv[i]=Math.tanh((i/128-1)*5);sh.curve=cv;
 const out=AC.createGain();out.gain.setValueAtTime(.9,t);out.gain.exponentialRampToValueAtTime(.001,t+1.8);sh.connect(out);out.connect(mg);
 const o1=AC.createOscillator(),o2=AC.createOscillator(),lf=AC.createOscillator(),lg=AC.createGain();o1.type='sawtooth';o2.type='square';
 o1.frequency.setValueAtTime(180,t);o1.frequency.exponentialRampToValueAtTime(1250,t+.35);o1.frequency.exponentialRampToValueAtTime(420,t+1.7);
 o2.frequency.setValueAtTime(95,t);o2.frequency.exponentialRampToValueAtTime(610,t+.4);o2.frequency.exponentialRampToValueAtTime(210,t+1.7);lf.frequency.value=38;lg.gain.value=90;lf.connect(lg);lg.connect(o1.frequency);
 o1.connect(sh);o2.connect(sh);lf.start(t);o1.start(t);o2.start(t);o1.stop(t+1.9);o2.stop(t+1.9);lf.stop(t+1.9);
 const n=AC.createBufferSource();n.buffer=noiseB;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=900;const ng=AC.createGain();ng.gain.setValueAtTime(.7,t);ng.gain.exponentialRampToValueAtTime(.001,t+1.2);n.connect(hp);hp.connect(ng);ng.connect(mg);n.start(t,R()*2);n.stop(t+1.3);
 const b=AC.createOscillator(),bg=AC.createGain();b.frequency.setValueAtTime(70,t);b.frequency.exponentialRampToValueAtTime(28,t+.5);bg.gain.setValueAtTime(1,t);bg.gain.exponentialRampToValueAtTime(.001,t+.8);b.connect(bg);bg.connect(mg);b.start(t);b.stop(t+.9)}

/* ---------- joueur ---------- */
const P={x:startC.cx,z:startC.cz,fy:0,vy:0,yaw:R()*6.28,pitch:0,lad:null,sl:null,cd:0,noise:0},k={},joy={x:0,y:0};
let phase='play',jumpPrev=false,fc=0,promptT='',jt=0,jfx=[0,0],glt=null,sprintBtn=false,diveBtn=false,locked=false,started=false,won=false,stepD=0,dripT=3,T=0,flick=0,mapT=0,mapOn=true,bob=0,rip=0,uw=false,lastC=null,envOnce=false;
const seen=new Set(),vib=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
const pips=$('rings');for(let i=0;i<RT;i++)pips.appendChild(document.createElement('i'));
function say(t,ms=3500){const m=$('msg');m.textContent=t;m.style.opacity=1;clearTimeout(say.h);say.h=setTimeout(()=>m.style.opacity=0,ms)}
const upd=()=>{[...pips.children].forEach((s,i)=>s.className=i<ins?'ins':i<got?'on':'');$('cnt').textContent=got+'/'+RT};upd();
function resolve(){const f=P.fy,t=f+1.7;
 for(const b of walls){if(P.x<b[0]-PR||P.x>b[1]+PR||P.z<b[2]-PR||P.z>b[3]+PR||f+.05>=b[5]||t<=b[4])continue;const cx=clamp(P.x,b[0],b[1]),cz=clamp(P.z,b[2],b[3]),dx=P.x-cx,dz=P.z-cz,d=Math.hypot(dx,dz);
  if(d<PR){if(d>1e-4){P.x+=dx/d*(PR-d);P.z+=dz/d*(PR-d)}else P.x+=PR}}
 for(const c of cyl){if(Math.abs(P.x-c[0])>c[2]+PR||Math.abs(P.z-c[1])>c[2]+PR||f+.05>=c[4]||t<=c[3])continue;const dx=P.x-c[0],dz=P.z-c[1],d=Math.hypot(dx,dz),r=c[2]+PR;if(d<r&&d>1e-4){P.x+=dx/d*(r-d);P.z+=dz/d*(r-d)}}}

/* reflets : cubemap de la salle, recapturée quand on change de salle */
let cubeRT,cubeCam;
function mkCube(){if(cubeRT)cubeRT.dispose();cubeRT=new THREE.WebGLCubeRenderTarget(CUBE[SET.q],{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});cubeCam=new THREE.CubeCamera(.12,100,cubeRT);WU.uEnv.value=cubeRT.texture;mDeckWet.envMap=cubeRT.texture;mDeckWet.needsUpdate=true}
function updateEnv(){if(!cubeCam)return;const c=cellAt(P.x,P.z),y=P.fy+EYE;let cx=c.cx,cz=c.cz;
 for(const[ox,oz]of[[0,0],[2.2,0],[-2.2,0],[0,2.2],[0,-2.2],[3.5,3.5]]){if(!cyl.some(q=>Math.hypot(q[0]-(c.cx+ox),q[1]-(c.cz+oz))<q[2]+.5&&q[3]<y&&q[4]>y)){cx=c.cx+ox;cz=c.cz+oz;break}}
 let bmn=[c.i*CELL,-SH,c.j*CELL],bmx=[(c.i+1)*CELL,c.lv?c.lv*SH+CH:CH,(c.j+1)*CELL];if(P.fy<-3&&c.sub){const S=c.sub;cx=(S.x0+S.x1)/2;cz=(S.z0+S.z1)/2;bmn=[S.x0,-SH,S.z0];bmx=[S.x1,-SH+S.h,S.z1]}
 cubeCam.position.set(cx,y,cz);WU.uCpos.value.set(cx,y,cz);WU.uBmin.value.set(bmn[0],bmn[1],bmn[2]);WU.uBmax.value.set(bmx[0],bmx[1],bmx[2]);
 for(const w of waters)w.visible=false;cubeCam.update(rd,sc);for(const w of waters)w.visible=true}
mkCube();

/* ---------- monstre : navigation (graphe salles/étages), IA, jumpscare ---------- */
const lvOf=y=>y>9.5?2:y>3?1:y<-3?-1:0,angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d},rk=(i,j,l)=>i+','+j+','+l;
function adj(i,j,l,sec){const c=cells[i][j],out=[],C2=CELL/2,key=l===0?['e','s']:l===1?['e1','s1']:['e2','s2'];
 if(l>=0){if(i<N-1&&c[key[0]])out.push({k:rk(i+1,j,l),w:[{x:(i+1)*CELL,z:j*CELL+C2}]});if(i>0&&cells[i-1][j][key[0]])out.push({k:rk(i-1,j,l),w:[{x:i*CELL,z:j*CELL+C2}]});
  if(j<N-1&&c[key[1]])out.push({k:rk(i,j+1,l),w:[{x:i*CELL+C2,z:(j+1)*CELL}]});if(j>0&&cells[i][j-1][key[1]])out.push({k:rk(i,j-1,l),w:[{x:i*CELL+C2,z:j*CELL}]})}
 for(const v of c.vc){if(v.la===l)out.push({k:rk(i,j,v.lb),w:[{x:v.a[0],z:v.a[1]},{x:v.b[0],z:v.b[1]}]});if(v.lb===l)out.push({k:rk(i,j,v.la),w:[{x:v.b[0],z:v.b[1]},{x:v.a[0],z:v.a[1]}]})}
 if(l===-1&&c.sub)for(const dir in c.lk){const r=c.lk[dir];if(r.secret&&!sec)continue;const n=r.a===c?r.b:r.a,Pp=r.hor?{x:Math.max(c.i,n.i)*CELL,z:r.lat}:{x:r.lat,z:Math.max(c.j,n.j)*CELL};out.push({k:rk(n.i,n.j,-1),w:[Pp]})}
 return out}
function route(from,to,sec){const prev=new Map([[from,null]]),q=[from];for(let h=0;h<q.length;h++){const k0=q[h];if(k0===to)break;const[i,j,l]=k0.split(',').map(Number);for(const e of adj(i,j,l,sec))if(!prev.has(e.k)){prev.set(e.k,{p:k0,w:e.w});q.push(e.k)}}
 if(!prev.has(to))return null;const wp=[];let k0=to;while(prev.get(k0)){const e=prev.get(k0);wp.unshift(...e.w);k0=e.p}return wp}
function los(ax,ay,az,bx,by,bz){const d=Math.hypot(bx-ax,by-ay,bz-az),n=Math.ceil(d/.7);for(let i=1;i<n;i++){const t=i/n,x=ax+(bx-ax)*t,y=ay+(by-ay)*t,z=az+(bz-az)*t;
 for(const w of walls)if(x>w[0]&&x<w[1]&&z>w[2]&&z<w[3]&&y>w[4]&&y<w[5])return false;for(const q of cyl)if(y>q[3]&&y<q[4]&&(x-q[0])*(x-q[0])+(z-q[1])*(z-q[1])<q[2]*q[2])return false}return true}
const mon={st:'dead',alive:false,x:0,z:0,y:0,yaw:0,spd:0,path:[],pi:0,last:null,lostT:0,stare:0,stunT:0,stunCool:0,stunStare:0,idleT:0,spawnT:22,replanT:0,visT:0,sees:false,side:1,die:0,burstT:5,mvd:0,stkT:0,stk:0,beat:0,step:0,t:0,pspd:1.6,arrive:0};
function planTo(x,z,l){const ci=clamp((mon.x/CELL)|0,0,N-1),cj=clamp((mon.z/CELL)|0,0,N-1),ti=clamp((x/CELL)|0,0,N-1),tj=clamp((z/CELL)|0,0,N-1),wp=route(rk(ci,cj,lvOf(mon.y)),rk(ti,tj,l));if(!wp)return false;mon.path=[...wp,{x,z}];mon.pi=0;return true}
function patrolTarget(){const near=R()<.4;for(let t=0;t<30;t++){const c=near?cells[clamp(((P.x/CELL)|0)+((R()*7)|0)-3,0,N-1)][clamp(((P.z/CELL)|0)+((R()*7)|0)-3,0,N-1)]:cells[(R()*N)|0][(R()*N)|0];
 const l=c.lv&&R()<.4?(c.lv>1&&R()<.4?2:1):(c.type==='cellar'&&R()<.3?-1:0),e=adj(c.i,c.j,l);if(e.length){const q=e[(R()*e.length)|0].w[0];return{x:q.x,z:q.z,l}}}return{x:startC.cx,z:startC.cz,l:0}}
function monHit(x,z,y){for(const w of walls){if(y+2.4<=w[4]||y+.3>=w[5])continue;if(x>w[0]-.45&&x<w[1]+.45&&z>w[2]-.45&&z<w[3]+.45)return true}
 for(const q of cyl){if(y+2.4<=q[3]||y+.3>=q[4])continue;const r=q[2]+.45;if((x-q[0])*(x-q[0])+(z-q[1])*(z-q[1])<r*r)return true}return false}
function monMove(dt,spd){if(mon.pi>=mon.path.length)return true;const wp=mon.path[mon.pi],dx=wp.x-mon.x,dz=wp.z-mon.z,d=Math.hypot(dx,dz);if(d<.7){mon.pi++;return mon.pi>=mon.path.length}
 const h=Math.atan2(dx,dz),sd=mon.side,off=[0,.45*sd,-.45*sd,.9*sd,-.9*sd,1.5*sd,-1.5*sd];let hh=null;
 for(const o of off){const a=h+o,px=mon.x+Math.sin(a)*.9,pz=mon.z+Math.cos(a)*.9,g=groundAt(px,pz,mon.y,1);if(g>-1e8&&Math.abs(g-mon.y)<.95&&!monHit(px,pz,mon.y)){hh=a;break}}
 if(hh===null){mon.stk+=dt*3;return false}
 mon.yaw+=angDiff(hh,mon.yaw)*Math.min(1,dt*(5+spd));const mx=Math.sin(mon.yaw)*spd*dt,mz=Math.cos(mon.yaw)*spd*dt;mon.x+=mx;mon.z+=mz;mon.mvd+=Math.hypot(mx,mz);
 const g=groundAt(mon.x,mon.z,mon.y,1);if(g>-1e8)mon.y+=(g-mon.y)*Math.min(1,dt*10);return false}
function spawnMon(){for(let t=0;t<40;t++){const c=cells[(R()*N)|0][(R()*N)|0];if(!(c.type==='pool'||c.type==='lap'||c.type==='dry'||c.type==='mezz'))continue;const x=c.i*CELL+1.4,z=c.cz;
  if(Math.hypot(x-P.x,z-P.z)<30)continue;mon.x=x;mon.z=z;mon.y=0;mon.alive=true;mon.st='search';mon.idleT=1.5;mon.die=0;mon.path=[];mon.stare=0;mon.stunCool=0;mMon.opacity=1;mBone.opacity=1;mEye.opacity=1;B.root.rotation.x=0;MON.visible=true;return}
 mon.spawnT=6}
function roar(){burst(260,.3,.9);blip(160,60,.2,.8);vib(80)}
function monUpdate(dt){
 if(SET.peace||phase!=='play'){if(mon.alive&&SET.peace){mon.alive=false;MON.visible=false}$('danger').style.opacity=0;if(thr)thr.gain.value=0;return}
 mon.t+=dt;if(!mon.alive){mon.spawnT-=dt;if(mon.spawnT<=0)spawnMon();return}
 mon.stunCool=Math.max(0,mon.stunCool-dt);const dx=P.x-mon.x,dz=P.z-mon.z,d=Math.hypot(dx,dz),dy=P.fy-mon.y;
 mon.visT-=dt;if(mon.visT<=0){mon.visT=.22;let sv=false;if(d<30&&Math.abs(dy)<4.2){const dot=(dx*Math.sin(mon.yaw)+dz*Math.cos(mon.yaw))/(d||1);if((d<9||dot>.1)&&los(mon.x,mon.y+2.6,mon.z,P.x,P.fy+1.4,P.z))sv=true}mon.sees=sv;
  if(!sv&&d<P.noise&&mon.st!=='chase'&&mon.st!=='stun'&&mon.st!=='die'){mon.last={x:P.x,z:P.z,l:lvOf(P.fy)};if(mon.st!=='investigate'){mon.st='investigate';mon.replanT=0}}}
 const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),dm=Math.hypot(mon.x-P.x,mon.z-P.z)||1,watched=mon.sees&&dm<22&&((mon.x-P.x)*fx+(mon.z-P.z)*fz)/dm>.93&&Math.abs(mon.y-P.fy)<4;
 let spd=0,mode=mon.st;
 if(mon.st==='die'){mon.die+=dt*.55;mode='die';if(mon.die>=1){mon.alive=false;MON.visible=false;mon.spawnT=45+R()*40}}
 else if(mon.st==='stun'){mode='stun';mon.stunT-=dt;if(watched)mon.stunStare+=dt;if(mon.stunStare>1.6){mon.st='die';mon.die=0;burst(120,.3,1.2)}else if(mon.stunT<=0){mon.st='investigate';mon.last={x:mon.x+(R()-.5)*30,z:mon.z+(R()-.5)*30,l:0};mon.last.x=clamp(mon.last.x,3,N*CELL-3);mon.last.z=clamp(mon.last.z,3,N*CELL-3);mon.replanT=0;mon.stunCool=12}}
 else{
  if(mon.sees){mon.last={x:P.x,z:P.z,l:lvOf(P.fy)};mon.lostT=0;if(mon.st!=='chase'){mon.st='chase';mon.replanT=0;roar()}}else if(mon.st==='chase'){mon.lostT+=dt;if(mon.lostT>2.2){mon.st='investigate';mon.replanT=0}}
  if(watched)mon.stare+=dt;else mon.stare=Math.max(0,mon.stare-dt*.7);
  if(mon.stare>1.2&&mon.stunCool<=0){mon.st='stun';mon.stunT=2.6;mon.stunStare=0;mon.stare=0;mon.path=[];burst(200,.25,.7);blip(300,90,.2,.5)}
  mode=mon.st;
  if(mon.st==='chase'){mon.burstT-=dt;if(mon.burstT<-1)mon.burstT=4+R()*5;spd=4.1*(mon.burstT<0?1.35:1);mon.replanT-=dt;if(mon.replanT<=0){mon.replanT=.6;if(mon.last)planTo(mon.last.x,mon.last.z,mon.last.l)}monMove(dt,spd);
   if(d<1.5&&Math.abs(dy)<2.4&&(mon.sees||d<1.1)){startJumpscare();return}}
  else if(mon.st==='investigate'){spd=2.4;if(mon.replanT<=0&&mon.last){mon.replanT=99;planTo(mon.last.x,mon.last.z,mon.last.l)}if(monMove(dt,spd)){mon.st='search';mon.idleT=6+R()*4;mon.path=[]}}
  else if(mon.st==='patrol'){spd=mon.pspd;if(!mon.path.length||monMove(dt,spd)){mon.st='search';mon.idleT=2+R()*3;mon.path=[]}}
  else{mon.idleT-=dt;mode='search';if(mon.idleT<=0){const t=patrolTarget();if(planTo(t.x,t.z,t.l)){mon.st='patrol';mon.pspd=1.2+R()*1.1}else mon.idleT=1}}
  if(d<1.1&&Math.abs(dy)<2){startJumpscare();return}
  if(mon.st==='chase'||mon.st==='investigate'||mon.st==='patrol'){mon.stkT+=dt;if(mon.stkT>1.4){if(mon.mvd<.3||mon.stk>1.2){mon.side*=-1;mon.pi=Math.min(mon.path.length,mon.pi+1);mon.stk=0;if(++mon.arrive>=3){mon.arrive=0;const wp=mon.path[mon.pi];if(wp){const g=groundAt(wp.x,wp.z,mon.y,2.5);if(g>-1e8){mon.x=wp.x;mon.z=wp.z;mon.y=g}}}}else mon.arrive=0;mon.stkT=0;mon.mvd=0}}
 }
 mon.spd=spd;monAnim(dt,mode,spd);MON.position.set(mon.x,mon.y,mon.z);MON.rotation.y=mon.yaw;
 if(mon.st==='die'||mon.die>0){const o=Math.max(0,1-mon.die);mMon.opacity=o;mBone.opacity=o;mEye.opacity=o;B.root.rotation.x=-Math.min(1,mon.die*2.2)*1.5}
 mon.step+=dt*spd*.5;if(mon.step>1){mon.step=0;if(d<28)blip(75+R()*20,38,.16*(1-d/28),.13)}
 if(d<16&&R()<dt*.6)burst(320,.05*(1-d/16),.7);
 if(mon.st==='chase'||d<14){mon.beat-=dt;if(mon.beat<=0){mon.beat=.45+Math.min(1,d/30)*.65;blip(55,34,.22,.12);setTimeout(()=>blip(50,30,.16,.1),150)}}
 if(thr)thr.gain.value=mon.st==='chase'?.13*Math.max(0,1-d/30):Math.max(0,1-d/22)*.06;
 $('danger').style.opacity=mon.st==='chase'?Math.min(.85,Math.max(0,1-d/24)):0}
function startGlitch(){const gb=$('gb');if(!gb.children.length)for(let i=0;i<5;i++){const e=document.createElement('i');gb.appendChild(e)}
 glt=setInterval(()=>{const c=$('c').style;c.transform=`translate(${(Math.random()-.5)*26|0}px,${(Math.random()-.5)*14|0}px) scale(${1+Math.random()*.05})`;c.filter=`hue-rotate(${(Math.random()*160-80)|0}deg) saturate(${1+Math.random()*3}) contrast(${1+Math.random()*1.2})`;
  for(const e of gb.children){e.style.top=(Math.random()*100)+'%';e.style.height=(2+Math.random()*9)+'%';e.style.opacity=Math.random()<.6?.85:0;e.style.background=['#ff2b3a','#2bffe6','#fff','#7a00ff'][(Math.random()*4)|0]}},55)}
function stopGlitch(){clearInterval(glt);glt=null;$('c').style.transform='';$('c').style.filter='';for(const e of $('gb').children)e.style.opacity=0}
function startJumpscare(){if(phase!=='play')return;phase='jump';jt=0;P.sl=null;P.lad=null;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);jfx=[fx,fz];mon.x=P.x+fx*1.2;mon.z=P.z+fz*1.2;mon.y=P.fy;mon.yaw=Math.atan2(-fx,-fz);mon.st='attack';
 MON.visible=true;MON.scale.set(1,1,1);MON.position.set(mon.x,mon.y,mon.z);MON.rotation.y=mon.yaw;mMon.opacity=1;mBone.opacity=1;mEye.opacity=1;B.root.rotation.x=0;
 scream();document.body.classList.add('jump');startGlitch();vib([200,60,300]);$('danger').style.opacity=0;$('prompt').style.opacity=0;setUW(false);if(thr)thr.gain.value=0}
function jumpTick(dt){jt+=dt;const a=Math.min(1,jt/.28),shk=(1-Math.min(1,jt/1.7))*.06,d=1.2-.65*a;mon.x=P.x+jfx[0]*d;mon.z=P.z+jfx[1]*d;MON.position.set(mon.x,mon.y,mon.z);MON.scale.setScalar(1+.3*a);monAnim(dt,'attack',0,jt);
 cam.position.set(P.x+(R()-.5)*shk,P.fy+EYE+(R()-.5)*shk,P.z+(R()-.5)*shk);cam.lookAt(mon.x,mon.y+2.55,mon.z);cam.rotation.z+=Math.sin(jt*40)*.04*(1-a*.5);cam.fov=70+36*a+Math.sin(jt*30)*2;cam.updateProjectionMatrix();
 if(jt>1.5&&jt<1.58){$('fade').style.transition='none';$('fade').style.opacity=1}
 if(jt>2.0){phase='dead';stopGlitch();document.body.classList.remove('jump');MON.visible=false;MON.scale.set(1,1,1);exitLock();showOver('lose')}}

const TC={atrium:'rgba(150,110,210,.75)',stair:'rgba(215,175,70,.75)',cellar:'rgba(60,110,200,.75)',pool:'rgba(40,150,140,.65)',lap:'rgba(40,150,140,.65)',grand:'rgba(40,150,140,.65)',rotunda:'rgba(60,170,160,.6)',dry:'rgba(200,210,160,.32)',mezz:'rgba(214,176,96,.55)',serp:'rgba(200,170,150,.4)',forest:'rgba(150,190,140,.4)',nave:'rgba(220,200,150,.45)'};
let mapOpen=false,mapLvl=null;
function drawMap(cv,lvO,big){const x=cv.getContext('2d'),W=cv.width,O=big?34:14,S=(W-2*O)/N,lvl=lvO===null||lvO===undefined?lvOf(P.fy):lvO,u=(wx)=>O+wx/CELL*S;x.clearRect(0,0,W,W);
 const has=(c,l)=>l===-1?!!c.sub:l===0?true:c.lv>=l;
 for(const c of all){if(!seen.has(c)||!has(c,lvl))continue;const X=O+c.i*S,Y=O+c.j*S;
  if(lvl===-1){const S2=c.sub;x.fillStyle=S2.A?'rgba(60,110,200,.7)':c.secretRoom?'rgba(190,80,200,.65)':'rgba(70,150,190,.6)';x.fillRect(u(S2.x0),u(S2.z0),(S2.x1-S2.x0)/CELL*S,(S2.z1-S2.z0)/CELL*S);continue}
  x.fillStyle=lvl===0?TC[c.type]:(c.lv>1&&lvl===1?'rgba(235,120,60,.7)':'rgba(214,176,96,.6)');x.fillRect(X,Y,S,S);
  if(lvl>0&&(c.type==='atrium'||c.type==='mezz')){x.fillStyle='rgba(8,26,26,.85)';if(c.type==='atrium')x.fillRect(X+S*.2,Y+S*.2,S*.6,S*.6);else for(const[a,b]of[[.2,.2],[.58,.2],[.2,.58],[.58,.58]])x.fillRect(X+S*a,Y+S*b,S*.22,S*.22)}
  const key=lvl>=1?['e'+lvl,'s'+lvl]:['e','s'];x.strokeStyle='rgba(241,240,212,.92)';x.lineWidth=big?2.4:1.6;x.beginPath();
  const edge=(x1,y1,x2,y2,o)=>{if(!o){x.moveTo(x1,y1);x.lineTo(x2,y2)}else if(o===1){const dx=(x2-x1)*.32,dy=(y2-y1)*.32;x.moveTo(x1,y1);x.lineTo(x1+dx,y1+dy);x.moveTo(x2-dx,y2-dy);x.lineTo(x2,y2)}};
  const E=c.i<N-1?c[key[0]]:0,Sd=c.j<N-1?c[key[1]]:0,Wd=c.i>0?cells[c.i-1][c.j][key[0]]:0,Nd=c.j>0?cells[c.i][c.j-1][key[1]]:0;
  edge(X+S,Y,X+S,Y+S,E);edge(X,Y+S,X+S,Y+S,Sd);edge(X,Y,X,Y+S,Wd);edge(X,Y,X+S,Y,Nd);x.stroke()}
 if(lvl===-1)for(const L of LK){const r=L.rec;if(!seen.has(L.a)&&!seen.has(L.b))continue;if(r.secret&&!r.opened)continue;const A=L.a.sub,B2=L.b.sub,cw=Math.max(2,r.w/CELL*S);x.fillStyle=r.secret?'rgba(190,80,200,.8)':'rgba(120,190,230,.75)';
  if(r.hor){const lft=L.a.i<L.b.i?A:B2,rgt=L.a.i<L.b.i?B2:A;x.fillRect(u(lft.x1),u(r.lat)-cw/2,u(rgt.x0)-u(lft.x1),cw)}else{const tp=L.a.j<L.b.j?A:B2,bt=L.a.j<L.b.j?B2:A;x.fillRect(u(r.lat)-cw/2,u(tp.z1),cw,u(bt.z0)-u(tp.z1))}}
 x.fillStyle='rgba(255,255,255,.92)';for(const c of all)for(const v of c.vc){if(!seen.has(c))continue;for(const[pp,l,up]of[[v.a,v.la,v.lb>v.la],[v.b,v.lb,v.la>v.lb]]){if(l!==lvl)continue;const px=u(pp[0]),pz=u(pp[1]),r2=big?6:3.5;x.beginPath();if(up){x.moveTo(px,pz-r2);x.lineTo(px-r2*.85,pz+r2*.75);x.lineTo(px+r2*.85,pz+r2*.75)}else{x.moveTo(px,pz+r2);x.lineTo(px-r2*.85,pz-r2*.75);x.lineTo(px+r2*.85,pz-r2*.75)}x.fill()}}
 for(const sd of slides)if(lvl===1&&seen.has(sd.cell)){x.fillStyle='#5ff2e0';x.beginPath();x.arc(u(sd.ex),u(sd.ez),big?5:3.2,0,7);x.fill()}
 if(lvl===0){x.fillStyle=ins>=KEYS?'#7dffb0':'#ffd24a';const dx=u(DOOR.x),dz=u(DOOR.z);x.fillRect(dx-(big?7:4),dz-(big?7:4),big?14:8,big?14:8);x.strokeStyle='#08201f';x.lineWidth=1;x.strokeRect(dx-(big?7:4),dz-(big?7:4),big?14:8,big?14:8)}
 if(cheat){x.lineWidth=big?2.5:1.6;for(const kk of keys){if(kk.taken||kk.l!==lvl)continue;x.strokeStyle='#ffd24a';x.beginPath();x.arc(u(kk.x),u(kk.z),big?7:4,0,7);x.stroke();x.fillStyle='#ffd24a';x.beginPath();x.arc(u(kk.x),u(kk.z),big?2.6:1.6,0,7);x.fill()}
  if(mon.alive&&lvOf(mon.y)===lvl){x.fillStyle='#ff3b4a';x.beginPath();x.arc(u(mon.x),u(mon.z),big?7:4,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=1.2;x.stroke()}}
 const px=u(P.x),pz=u(P.z),sc2=big?1.8:1;x.save();x.translate(px,pz);x.rotate(-P.yaw);x.scale(sc2,sc2);x.fillStyle='rgba(255,210,74,.25)';x.beginPath();x.moveTo(0,0);x.arc(0,0,26,-Math.PI/2-.6,-Math.PI/2+.6);x.closePath();x.fill();
 x.fillStyle='#ffd24a';x.strokeStyle='#08201f';x.lineWidth=1.5;x.beginPath();x.moveTo(0,-7);x.lineTo(-5,6);x.lineTo(0,3);x.lineTo(5,6);x.closePath();x.fill();x.stroke();x.restore();
 x.fillStyle='rgba(241,240,212,.85)';x.font=(big?'600 15px':'600 11px')+' system-ui,sans-serif';x.fillText(lvl===2?'ÉTAGE 2':lvl===1?'ÉTAGE 1':lvl===-1?'SOUS-SOL':'REZ-DE-CHAUSSÉE',big?16:O,big?22:11)}
function minimap(){const mm=$('mm');mm.style.display=started&&phase==='play'?'block':'none';if(started&&phase==='play')drawMap(mm,null,false)}
function openMap(){if(mapOpen||phase!=='play'||!started)return;mapOpen=true;mapLvl=null;for(const x in k)k[x]=0;joy.x=joy.y=0;if(!SET.mobile)exitLock();$('mapfs').classList.add('on');document.body.classList.add('mapopen');drawMap($('mmf'),mapLvl,true)}
function closeMap(){if(!mapOpen)return;mapOpen=false;$('mapfs').classList.remove('on');document.body.classList.remove('mapopen');
 if(!SET.mobile&&phase==='play'){try{$('c').requestPointerLock()}catch(e){}setTimeout(()=>{if(!document.pointerLockElement&&phase==='play'&&!mapOpen)setLocked(false)},500)}}
function setUW(on){if(on===uw)return;uw=on;sc.fog.color.setHex(on?0x0a3d3b:FOG);sc.background.setHex(on?0x0a3d3b:FOG);sc.fog.density=on?.14:FOGD;$('uw').style.opacity=on?1:0;if(mf)mf.frequency.value=on?450:20000}

let cheat=false;const chEls=[];
function cheatTick(){const L=$('chl');if(!cheat){if(L.style.display!=='none')L.style.display='none';return}L.style.display='block';const items=[];
 for(const kk of keys)if(!kk.taken)items.push({x:kk.x,y:kk.y+1.5,z:kk.z,t:'Clé',c:'chk'});if(mon.alive&&MON.visible)items.push({x:mon.x,y:mon.y+1.8,z:mon.z,t:'Monstre',c:'chm'});
 while(chEls.length<items.length){const e=document.createElement('div');L.appendChild(e);chEls.push(e)}
 cam.updateMatrixWorld();cam.matrixWorldInverse.copy(cam.matrixWorld).invert();const v=new V3();
 chEls.forEach((e,i)=>{const it=items[i];if(!it){e.style.display='none';return}e.style.display='block';e.className='chmk '+it.c;v.set(it.x,it.y,it.z);const d=Math.hypot(it.x-P.x,it.y-(P.fy+1),it.z-P.z);v.project(cam);let sx=v.x,sy=v.y;const behind=v.z>1;if(behind){sx=-sx;sy=-sy}
  const m=Math.max(Math.abs(sx),Math.abs(sy));let off=false;if(behind||m>.9){const f=.9/Math.max(m,1e-6);sx*=f;sy*=f;off=true}const dy=it.y-(P.fy+EYE);
  e.textContent=`${it.t} · ${d|0} m${dy>3?' ▲':dy<-3?' ▼':''}`;e.style.opacity=off?.65:1;e.style.transform=`translate(${(sx*.5+.5)*innerWidth}px,${(-sy*.5+.5)*innerHeight}px) translate(-50%,-50%)`})}
let CINE=null;const fmtT=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function showOver(kind){themeTo(kind==='win'?1:0,kind==='win'?2500:500);document.body.classList.remove('cine');setLocked(false);$('touch').style.display='none';$('fade').style.transition='opacity 1.4s';$('fade').style.opacity=0;
 if(kind==='win')$('wtime').textContent=fmtT(T);else{$('dtime').textContent=fmtT(T);$('dsub').textContent=`Clés ${got}/${KEYS} · Monde n° ${SEED}`}
 $(kind==='win'?'end':'dead').classList.add('on');overSound(kind)}
function startCine(){if(phase!=='play')return;phase='cine';P.sl=null;P.lad=null;document.body.classList.add('cine');$('prompt').style.opacity=0;setUW(false);$('danger').style.opacity=0;if(thr)thr.gain.value=0;mon.alive=false;MON.visible=false;
 CINE={t:0,a:0,b:0,rm:0,cs:-1,tb:0,ma:12.9,my:0,mvy:0,yaw:0,roar:0,fo:0,dust:null,look:null};$('fade').style.transition='opacity .7s';$('fade').style.opacity=1}
function finishCine(){phase='win';won=true;try{exitLock()}catch(e){}MON.visible=false;if(CINE.dust){sc.remove(CINE.dust.pts);CINE.dust=null}showOver('win')}
function cineTick(dt){const c=CINE;c.t+=dt;const t=c.t,F=(a,b,y)=>new V3(DOOR.x+DOOR.nx*a-DOOR.nz*b,y,DOOR.z+DOOR.nz*a+DOOR.nx*b),look=(p,q)=>{cam.position.copy(p);cam.lookAt(q)},shake=a=>{cam.position.x+=(R()-.5)*a;cam.position.y+=(R()-.5)*a;cam.position.z+=(R()-.5)*a};
 WU.uTime.value=T+t;if(t<.7)return;
 if(t<7.4){if(!c.a){c.a=1;$('fade').style.transition='opacity 1s';$('fade').style.opacity=0;cam.fov=60;cam.updateProjectionMatrix();sfxRumble(2.5)}
  const u=(t-.7)/6.7;look(F(6.4-1.8*u,.5*Math.sin(u*2.4),1.6+.2*u),F(0,0,2.6+.2*u));
  for(let i=0;i<10;i++){const L=DOOR.locks[i],ts=1.1+i*.17;if(!L.open&&t>ts){L.open=1;L.t0=t;L.lamp.material.color.setHex(0xb6ffd0);sfxClack()}if(L.open){const k=Math.min(1,(t-L.t0)/.4);L.lg.rotation.z=k*1.57;L.lg.position.z=.13+Math.sin(k*3.14)*.05}}
  if(t>3.4){const o=Math.min(1,(t-3.4)/3.8),e=o*o*(3-2*o);DOOR.pl_.rotation.y=-e*1.6;DOOR.pr_.rotation.y=e*1.6;DOOR.light.material.opacity=Math.min(1,o*1.8);DOOR.pl.intensity=e*3.2;DOOR.flare.material.opacity=e*.9;DOOR.flare.scale.setScalar(4+e*9);
   if(!c.rm){c.rm=1;sfxRumble(4.5);sfxCreak()}shake(.01*e)}
  return}
 if(!c.b){c.b=1;c.tb=t;cam.fov=72;cam.updateProjectionMatrix();MON.visible=true;MON.scale.set(1,1,1);mMon.opacity=1;mBone.opacity=1;mEye.opacity=1;B.root.rotation.x=0;c.yaw=Math.atan2(-DOOR.nz,DOOR.nx)}
 const tb=t-c.tb,fyaw=Math.atan2(-DOOR.nx,-DOOR.nz);let mode='search',spd=0;
 if(tb>.8)c.yaw+=angDiff(fyaw,c.yaw)*Math.min(1,dt*4);
 if(c.cs<0){if(tb>=1.3&&tb<2.9){mode='attack';if(!c.roar){c.roar=1;sfxRoar()}}
  else if(tb>=2.9){mode='chase';spd=10.5;c.ma-=spd*dt;if(c.ma<=5.4){c.cs=0;sfxFall();sfxRumble(3.5);COL.surf.x0=COL.surf.x1=-1e9;
    const n=260,pos=new Float32Array(n*3),vel=[],a=COL.rect;for(let i=0;i<n;i++){pos[i*3]=a[0]+R()*(a[1]-a[0]);pos[i*3+1]=0;pos[i*3+2]=a[2]+R()*(a[3]-a[2]);vel.push([(R()-.5)*3,1+R()*3,(R()-.5)*3])}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xcfd5c4,size:.2,transparent:true,opacity:.8,depthWrite:false}));sc.add(pts);c.dust={pts,pos,vel,age:0}}}
  if(tb<2.9){cam.fov=72-14*Math.min(1,Math.max(0,(tb-1.4)/1.4));cam.updateProjectionMatrix();look(F(6.3+.4*Math.min(tb,4),7.4,2.0),F(6.3+.4*Math.min(tb,4),0,1.9));if(tb>1.4)shake(.012)}
  else{cam.fov=72;cam.updateProjectionMatrix();look(F(c.ma+1.6,6.0,1.7),F(c.ma-1.5,0,1.4))}}
 else{const cs=c.cs+=dt;mode='attack';c.mvy-=24*dt;c.my+=c.mvy*dt;c.ma-=Math.max(0,10.5-cs*6)*dt;B.root.rotation.x=-cs*1.2;
  for(const ch of COL.chunks){const a=(ch.x-DOOR.x)*DOOR.nx+(ch.z-DOOR.z)*DOOR.nz;if(cs>Math.abs(a-5.4)*.14){ch.vy-=20*dt;ch.m.position.y+=ch.vy*dt;ch.m.rotation.x+=ch.rx*dt;ch.m.rotation.z+=ch.rz*dt}}
  if(c.dust){const d=c.dust;d.age+=dt;for(let i=0;i<d.vel.length;i++){d.pos[i*3]+=d.vel[i][0]*dt;d.pos[i*3+1]+=d.vel[i][1]*dt;d.pos[i*3+2]+=d.vel[i][2]*dt;d.vel[i][1]-=2*dt}d.pts.geometry.attributes.position.needsUpdate=true;d.pts.material.opacity=Math.max(0,.8-d.age*.25)}
  if(!c.look)c.look=F(c.ma,0,1.5);c.look.lerp(F(c.ma,0,c.my+1.4),.15);const q=Math.max(0,cs-1.2);look(F(9.6-q*1.1,4.6-q*.7,2.0-q*.9),c.look);shake(.05*Math.max(0,1-cs/1.6));
  if(c.my<-45)MON.visible=false;if(cs>2.3&&!c.fo){c.fo=1;$('fade').style.transition='opacity 2.2s';$('fade').style.opacity=1}if(cs>5){finishCine();return}}
 MON.position.copy(F(c.ma,0,c.my));MON.rotation.y=c.yaw;monAnim(dt,mode,spd,t)}
const angTo=(a,b,k)=>a+angDiff(b,a)*k;
function endSlide(p,Tg){P.sl=null;P.x=p.x+Tg.x*.3;P.z=p.z+Tg.z*.3;P.fy=-.9;P.vy=0;P.cd=2;burst(700,.3,.6);rip=1;say("Splash !",1200);vib(60);P.noise=16}
function slideTick(dt){const S=P.sl,sd=S.sd;S.t+=dt;const T0=sd.curve.getTangentAt(Math.min(1,S.s/sd.L)),slope=-T0.y,vt=sd.vmin+(sd.vmax-sd.vmin)*clamp(slope*2.4+.1,0,1);S.v+=(vt-S.v)*Math.min(1,dt*1.8);S.s+=S.v*dt;
 const u=Math.min(1,S.s/sd.L),p=sd.curve.getPointAt(u),Tg=sd.curve.getTangentAt(u).normalize(),Sd=new V3().crossVectors(Tg,new V3(0,1,0)).normalize(),U=new V3().crossVectors(Sd,Tg).normalize(),eo=sd.kind==='open'?-.2:-.28;
 cam.position.set(p.x+U.x*eo,p.y+U.y*eo,p.z+U.z*eo);P.yaw=angTo(P.yaw,Math.atan2(-Tg.x,-Tg.z),Math.min(1,dt*7));P.pitch+=(Math.asin(clamp(Tg.y,-1,1))*.8-P.pitch)*Math.min(1,dt*6);
 cam.rotation.set(P.pitch,P.yaw,Math.sin(S.t*9)*.012*S.v/10);P.x=p.x;P.z=p.z;P.fy=p.y-EYE+.2;P.noise=25;S.snd-=dt;if(S.snd<=0){S.snd=.18;burst(500+S.v*70,.05+S.v*.004,.3)}
 setUW(false);if(u>=1)endSlide(p,Tg)}
function ladderTick(dt,f){const l=P.lad,cl=f>.1?1:f<-.1?-1:0,mantle=P.fy>-.35;P.fy+=(mantle?1.2:cl*1.6)*dt;
 const tx=l.x-l.nx*.85,tz=l.z-l.nz*.85,gx=mantle?tx:l.x+l.nx*.42,gz=mantle?tz:l.z+l.nz*.42;P.x+=(gx-P.x)*Math.min(1,dt*(mantle?4:10));P.z+=(gz-P.z)*Math.min(1,dt*(mantle?4:10));
 if(cl&&!mantle){P.ct=(P.ct||0)+dt*1.6;if(P.ct>.28){P.ct=0;burst(1800,.07,.08)}}
 if(P.fy>=-.01&&Math.hypot(tx-P.x,tz-P.z)<.3){P.fy=0;P.vy=0;P.lad=null;P.cd=.6}else if(P.fy<=l.wl-1.15&&cl<0){P.lad=null;P.fy=l.wl-1.15}
 cam.position.set(P.x,P.fy+EYE,P.z);cam.rotation.set(P.pitch,P.yaw,0);setUW(false)}
function setPlay(){document.body.classList.remove('cine')}
function compassTick(){const show=got>0&&ins<KEYS;$('exit').style.display=show?'flex':'none';if(!show)return;const dx=DOOR.x-P.x,dz=DOOR.z-P.z,d=Math.hypot(dx,dz),sy2=Math.sin(P.yaw),cy2=Math.cos(P.yaw);
 $('arr').style.transform=`rotate(${Math.atan2(dx*cy2-dz*sy2,-dx*sy2-dz*cy2)}rad)`;$('dist').textContent=(d|0)+' m'}
function takeKey(k){if(k.taken)return;k.taken=1;sc.attach(k.k);k.sp.visible=false;flyers.push({o:k.k,t:0,from:k.k.position.clone()});sfxChime()}
function openSecret(sx){if(sx.open)return;sx.open=1;sx.t=.001;sx.rec.opened=true;sx.w[0]=sx.w[1]=sx.w[2]=sx.w[3]=-1e9;sfxRumble(1.6);sfxClack();say('Un passage secret s\'ouvre…',2500)}
function doorAct(){if(insAnim||got<=ins||ins>=KEYS)return;const lk=DOOR.locks[ins],m=keyModel();m.scale.setScalar(1.2);cam.updateMatrixWorld();const fw=new V3(0,0,-1).applyQuaternion(cam.quaternion);m.position.copy(cam.position).addScaledVector(fw,.5);sc.add(m);insAnim={o:m,t:0,i:ins,from:m.position.clone()};sfxClack()}
function keysTick(dt){const tt=T;for(const k of keys){if(k.taken)continue;k.k.rotation.y+=dt*1.4;k.k.position.y=1.55+Math.sin(tt*2+k.ph)*.06;k.sp.material.opacity=.55+Math.sin(tt*3+k.ph)*.2}
 const fw0=-Math.sin(P.yaw),fw1=-Math.cos(P.yaw),tgt=new V3(),cp=cam.position;
 for(let i=flyers.length-1;i>=0;i--){const f=flyers[i];f.t+=dt/.45;const e=Math.min(1,f.t),q=e*e*(3-2*e);tgt.set(cp.x+fw0*.4,cp.y-.15,cp.z+fw1*.4);f.o.position.lerpVectors(f.from,tgt,q);f.o.scale.setScalar(1-.85*q);f.o.rotation.y+=dt*10;
  if(f.t>=1){sc.remove(f.o);flyers.splice(i,1);got++;upd();vib(40);say(`Clé ${got}/${KEYS}`,2200)}}
 if(insAnim){const a=insAnim;a.t+=dt/.6;const e=Math.min(1,a.t),q=e*e*(3-2*e),lk=DOOR.locks[a.i];lk.lg.getWorldPosition(tgt);a.o.position.lerpVectors(a.from,tgt,q);a.o.scale.setScalar(1.2-.8*q);a.o.rotation.set(0,DOOR.g.rotation.y,q>.8?(q-.8)*7.8:0);
  if(a.t>=1){sc.remove(a.o);lk.lamp.material.color.setHex(0x78ffb0);lk.done=1;ins++;upd();insAnim=null;sfxClack();sfxInsert();vib(60);if(ins>=KEYS)setTimeout(startCine,900)}}
 for(const s of secrets)if(s.t>0&&s.t<1){s.t=Math.min(1,s.t+dt/.9);s.m.position.y=-SH+s.rec.h/2-s.t*(s.rec.h+.1);if(s.t>=1)sc.remove(s.m)}
 let best=null,bd=9;const test=(x,z,y,r,dm,fn,txt)=>{const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);if(d>r||Math.abs(y-(P.fy+1.2))>2.6)return;if(d>.8&&(dx*fw0+dz*fw1)/(d||1)<dm)return;if(d<bd){bd=d;best={fn,txt}}};
 for(const k of keys)if(!k.taken)test(k.x,k.z,k.y+1.2,2.2,.5,()=>takeKey(k),'E — Prendre la clé');
 for(const sx of secrets)if(!sx.open)test(sx.x,sx.z,sx.y,1.8,.85,()=>openSecret(sx),'E — Examiner le mur');
 if(ins<KEYS){const held=got-ins;test(DOOR.x+DOOR.nx,DOOR.z+DOOR.nz,1.5,3.6,.35,held>0?doorAct:null,held>0?`E — Insérer une clé (${ins}/${KEYS})`:`Porte verrouillée · ${ins}/${KEYS} serrures`)}
 const fn=best&&best.fn;if(fn&&actReq&&!P.sl&&!P.lad)fn();actReq=false;return best?best.txt:''}
function tick(dt){
 T+=dt;WU.uTime.value=T;P.cd=Math.max(0,P.cd-dt);P.noise=Math.max(0,P.noise-dt*9);
 const kf=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0),ks=(k.KeyD||k.ArrowRight?1:0)-(k.KeyA||k.ArrowLeft?1:0);
 const f=clamp(kf-joy.y,-1,1),s=clamp(ks+joy.x,-1,1),mv=Math.abs(f)>.05||Math.abs(s)>.05,jumpEdge=!!k.Space&&!jumpPrev;jumpPrev=!!k.Space;
 const wr=waterAt(P.x,P.z,P.fy),deep=!!wr&&wr[4]-wr[5]>1.3,st=wr?(deep?STEP:CLIMB):STEP,dv=deep&&(k.KeyC||k.ControlLeft||diveBtn),spr=k.ShiftLeft||k.ShiftRight||sprintBtn;let pr='';
 if(P.sl)slideTick(dt);
 else if(P.lad)ladderTick(dt,f);
 else{
  const sp=(spr?5.2:3.3)*(deep?(dv?.4:.55):wr?.62:1),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);
  if(mv){const vx=-sy*f+cy*s,vz=-cy*f-sy*s,l=Math.hypot(vx,vz),dx=vx/Math.max(l,1)*sp*dt,dz=vz/Math.max(l,1)*sp*dt,go=(a,b)=>{if(blockedAt(P.x+a,P.z+b,P.fy,st))return 0;P.x+=a;P.z+=b;return 1};
   if(!go(dx,dz)&&!go(dx,0))go(0,dz);resolve();stepD+=sp*dt;bob+=sp*dt*2.4;if(stepD>2.1){stepD=0;wr?burst(900,.16,.3):burst(2200,.05,.06)}
   if(spr&&!wr)P.noise=Math.max(P.noise,14);if(wr)P.noise=Math.max(P.noise,9)}
  rip=wr?(mv?Math.min(1,rip+dt*3):Math.max(0,rip-dt)):Math.max(0,rip-dt*2);WU.uRip.value.set(P.x,P.z,rip,0);
  {let g=groundAt(P.x,P.z,P.fy,st);if(deep&&!dv&&g>-1e8)g=Math.max(g,wr[4]-1.15);const df=g-P.fy;
   if(g>-1e8){if(P.vy>0){P.fy+=P.vy*dt;P.vy-=22*dt}else if(df>-.6){P.fy+=df*Math.min(1,dt*(deep?5:14));P.vy=0;if(k.Space&&!wr&&df<.15&&df>-.15){P.vy=5.2;P.noise=Math.max(P.noise,10)}}
    else{P.vy-=22*dt;P.fy+=P.vy*dt;if(P.fy<=g){P.fy=g;P.vy=0;if(df<-1.2){burst(wr?700:1500,.18,.4);P.noise=Math.max(P.noise,12)}}}}}
  const eye=P.fy+EYE;setUW(!!wr&&eye<wr[4]);
  cam.position.set(P.x,eye+(mv?Math.sin(bob)*(wr?.045:.03):0)+(deep?Math.sin(T*1.7)*.04:0),P.z);cam.rotation.set(P.pitch,P.yaw,0);
  cam.fov+=((baseFov()+(spr&&mv?6:0))-cam.fov)*Math.min(1,dt*6);cam.updateProjectionMatrix();
  if(deep&&!dv)for(const l of ladders){if(Math.hypot(P.x-(l.x+l.nx*.7),P.z-(l.z+l.nz*.7))<1.2&&sy*l.nx+cy*l.nz>.2){pr="Avance pour grimper à l'échelle";if(f>.3){P.lad=l;P.fy=Math.max(P.fy,l.wl-1.2);P.vy=0}break}}
  if(!P.lad)for(const sd of slides){if(Math.abs(sd.ey-P.fy)<.8&&Math.hypot(P.x-sd.ex,P.z-sd.ez)<1.5){pr=SET.mobile?"Appuie sur Saut pour glisser":"Espace pour glisser";if(jumpEdge&&P.cd<=0){P.sl={sd,s:0,v:3,t:0,snd:0};P.vy=0;P.noise=25;vib(30)}break}}
 }
 if(!pr)pr=keysTick(dt);
 if(pr!==promptT){promptT=pr;const e=$('prompt');e.textContent=SET.mobile?pr.replace('E — ','Agir — '):pr;e.style.opacity=pr?1:0}
 const dm=DIST[SET.q];for(const c of all){const d=Math.hypot(c.cx-P.x,c.cz-P.z);c.g.visible=d<dm;if(d<CELL*.9)seen.add(c)}
 const cc=cellAt(P.x,P.z);if(cc!==lastC){lastC=cc;if(SET.q>0||!envOnce){envOnce=true;updateEnv()}}
 compassTick();
 $('lvl').textContent=P.sl?'En glissade':P.lad?'À l\u2019échelle':P.fy>9?'Tour — étage 2':P.fy>3?'Étage':P.fy<-3?'Sous-sol':wr?(deep?'À la nage':"Dans l'eau"):'Rez-de-chaussée';
 monUpdate(dt);cheatTick();
 flick-=dt;if(flick<=0&&R()<.004)flick=.12+R()*.2;const fm=flick>0?.25+R()*.75:1;mLight.color.setRGB(1,.98,.88).multiplyScalar(fm);pl.intensity=1.15*(flick>0?.5+fm*.5:1);
 dripT-=dt;if(dripT<=0){dripT=2+R()*5;blip(1300+R()*500,600,.05,.1)}
 mapT-=dt;if(mapT<=0){mapT=.2;minimap()}}

let last=performance.now();
(function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1e3);last=now;fc++;
 if(phase==='jump')jumpTick(dt);else if(phase==='cine')cineTick(dt);else if(phase==='play'&&locked&&!won&&!mapOpen)tick(dt);else if(!started){cam.position.set(P.x,EYE,P.z);cam.rotation.set(0,now/6e3,0);WU.uTime.value=now/1e3}
 if(mapOpen&&fc%8===0)drawMap($('mmf'),mapLvl,true);
 if(SET.q>0&&started&&(phase==='play'||phase==='cine')&&!mapOpen&&(SET.q>1||fc%2===0)){try{updateRefl()}catch(e){WU.uUsePl.value=0}}
 rd.render(sc,cam)})(last);

/* ---------- interface ---------- */
buildDoor();buildSecrets();placeKeys();upd();
addEventListener('error',e=>{try{say('⚠ '+String(e.message||'erreur').slice(0,90),7000)}catch(x){}});
const theme=$('theme');let thTimer=null,thWant=0,thIOS=null;
function themeTo(v,ms){if(!theme||!theme.play)return;thWant=v;clearInterval(thTimer);const tgt=clamp(v*SET.music,0,1);
 if(thIOS===null){try{theme.volume=.5;thIOS=Math.abs(theme.volume-.5)>.01}catch(e){thIOS=true}}
 if(tgt>.001&&theme.paused){try{const pr=theme.play();if(pr&&pr.catch)pr.catch(()=>{})}catch(e){}}
 if(thIOS||!ms){if(!thIOS)theme.volume=tgt;if(tgt<=.001)theme.pause();return}
 const v0=theme.volume,t0=performance.now();thTimer=setInterval(()=>{const q=Math.min(1,(performance.now()-t0)/ms);theme.volume=clamp(v0+(tgt-v0)*q,0,1);if(q>=1){clearInterval(thTimer);if(tgt<=.001)theme.pause()}},40)}
function themeVol(){if(theme&&!thIOS&&!theme.paused)theme.volume=clamp(thWant*SET.music,0,1);if(thIOS&&SET.music<=.001)theme.pause()}
function setLocked(v){locked=v;if(phase==='play'&&!won&&started)themeTo(v?0:.7,v?1500:1200);$('menu').classList.toggle('on',!(v||won||phase!=='play'));$('touch').style.display=v&&SET.mobile&&!won&&phase==='play'?'block':'none';document.body.classList.toggle('playing',v)}
const go=id=>{for(const v of document.querySelectorAll('.view'))v.classList.remove('on');$(id).classList.add('on')};
for(const b of document.querySelectorAll('[data-go]'))b.addEventListener('click',()=>go(b.dataset.go));
function ui(){document.body.classList.toggle('mob',SET.mobile);
 for(const b of document.querySelectorAll('#sq button'))b.classList.toggle('on',+b.dataset.v===SET.q);
 for(const b of document.querySelectorAll('#sm button'))b.classList.toggle('on',(b.dataset.v==='1')===SET.mobile);
 rd.setPixelRatio(PRS()[SET.q]);resize();$('sens').value=SET.sens;$('vol').value=SET.vol;$('mus').value=SET.music;$('peace').checked=SET.peace;$('seedv').value=SEED;$('seedn').textContent=SEED}
$('sq').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;SET.q=+b.dataset.v;save();ui();mkCube();mkRefl();lastC=null});
$('sm').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;SET.mobile=b.dataset.v==='1';if(SET.mobile&&SET.q>1)SET.q=1;save();ui();mkRefl()});
$('sens').oninput=e=>{SET.sens=+e.target.value;save()};$('vol').oninput=e=>{SET.vol=+e.target.value;if(mg)mg.gain.value=SET.vol;save()};
$('peace').onchange=e=>{SET.peace=e.target.checked;save()};$('mus').oninput=e=>{SET.music=+e.target.value;save();themeVol();if(SET.music>.001&&phase==='play'&&!locked&&!won&&theme&&theme.paused)themeTo(started?.7:1,400)};
$('cheat').onchange=e=>{cheat=e.target.checked;if(!cheat)$('chl').style.display='none'};
{const first=()=>{if(phase==='play'&&!locked&&!won)themeTo(started?.7:1,1500)};addEventListener('pointerdown',first,{once:true});addEventListener('keydown',first,{once:true})}
$('seedgo').onclick=()=>{location.search='?seed='+(parseInt($('seedv').value)||1)};$('seedrnd').onclick=()=>{location.search='?seed='+((Math.random()*1e9)|0)};
const goAuto=sd=>{try{sessionStorage.setItem('pr_auto','1')}catch(e){}location.search='?seed='+sd},toMenu=()=>{try{sessionStorage.removeItem('pr_auto')}catch(e){}location.search=''};
const tapB=(el,fn)=>{let last=0;const h=e=>{const n=performance.now();if(n-last<500)return;last=n;if(e&&e.cancelable)e.preventDefault();fn()};el.addEventListener('click',h);el.addEventListener('touchend',h,{passive:false})};
tapB($('again'),()=>goAuto(SEED));tapB($('wagain'),()=>goAuto((Math.random()*1e9)|0));tapB($('dmenu'),toMenu);tapB($('wmenu'),toMenu);
$('fs').onclick=()=>{try{const e=document.documentElement,r=(e.requestFullscreen||e.webkitRequestFullscreen).call(e);r&&r.catch&&r.catch(()=>{})}catch(x){}};
addEventListener('resize',()=>mkRefl());
ui();
addEventListener('keydown',e=>{k[e.code]=1;if(e.code==='KeyM'){mapOpen?closeMap():openMap()}if(e.code==='Escape'&&mapOpen){closeMap();e.preventDefault()}if(e.code==='KeyE'&&!e.repeat)actReq=true;if(e.code==='KeyP'){SET.peace=!SET.peace;$('peace').checked=SET.peace;save();say(SET.peace?'Mode paisible : activé':'Mode paisible : désactivé',2000)}if(e.code.startsWith('Arrow')||e.code==='Space')e.preventDefault()});
addEventListener('keyup',e=>k[e.code]=0);addEventListener('blur',()=>{for(const x in k)k[x]=0});
addEventListener('mousemove',e=>{if(!locked||SET.mobile||phase!=='play')return;P.yaw-=e.movementX*.0022*SET.sens;P.pitch=clamp(P.pitch-e.movementY*.0022*SET.sens,-1.5,1.5)});
$('play').onclick=()=>{if(!AC)initAudio();if(AC&&AC.state==='suspended')AC.resume();started=true;$('playt').textContent='Reprendre';go('v-main');
 if(SET.mobile){setLocked(true);try{const r=document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();r&&r.catch&&r.catch(()=>{})}catch(e){}}else $('c').requestPointerLock()};
$('c').addEventListener('click',()=>{if(started&&!locked&&!won&&!SET.mobile&&phase==='play')$('c').requestPointerLock()});
document.addEventListener('pointerlockchange',()=>{if(!SET.mobile&&phase==='play'&&!mapOpen)setLocked(document.pointerLockElement===$('c'))});
document.addEventListener('pointerlockerror',()=>{setLocked(true);say('Capture de souris indisponible : lance un mini-serveur (voir README)',6000)});
/* tactile : joystick flottant à gauche, regard à droite, boutons */
let jId=null,lId=null,jx0=0,jy0=0,lx=0,ly=0;const jb=$('jb'),jk=$('jk');
document.addEventListener('touchstart',e=>{if(!SET.mobile||!locked||(e.target.closest&&e.target.closest('.tb')))return;e.preventDefault();
 for(const t of e.changedTouches){if(t.clientX<innerWidth*.45&&jId===null){jId=t.identifier;jx0=t.clientX;jy0=t.clientY;jb.style.display='block';jb.style.left=(jx0-60)+'px';jb.style.top=(jy0-60)+'px';jk.style.transform='none'}
  else if(t.clientX>=innerWidth*.45&&lId===null){lId=t.identifier;lx=t.clientX;ly=t.clientY}}},{passive:false});
document.addEventListener('touchmove',e=>{if(!SET.mobile||!locked)return;e.preventDefault();for(const t of e.changedTouches){
 if(t.identifier===jId){const dx=(t.clientX-jx0)/55,dy=(t.clientY-jy0)/55,l=Math.hypot(dx,dy),m=l>1?1/l:1;joy.x=dx*m;joy.y=dy*m;jk.style.transform=`translate(${joy.x*42}px,${joy.y*42}px)`}
 else if(t.identifier===lId&&P.sl===null){P.yaw-=(t.clientX-lx)*.005*SET.sens;P.pitch=clamp(P.pitch-(t.clientY-ly)*.005*SET.sens,-1.5,1.5);lx=t.clientX;ly=t.clientY}}},{passive:false});
const tend=e=>{for(const t of e.changedTouches){if(t.identifier===jId){jId=null;joy.x=joy.y=0;jb.style.display='none'}if(t.identifier===lId)lId=null}};
document.addEventListener('touchend',tend);document.addEventListener('touchcancel',tend);
const bind=(id,dn,up)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();dn(b);vib(12)});if(up){b.addEventListener('pointerup',()=>up(b));b.addEventListener('pointercancel',()=>up(b))}};
bind('tsp',b=>{sprintBtn=!sprintBtn;b.classList.toggle('on',sprintBtn)});bind('tdv',b=>{diveBtn=!diveBtn;b.classList.toggle('on',diveBtn)});
bind('tjmp',()=>{k.Space=1},()=>{k.Space=0});bind('tact',()=>{actReq=true});const tapOn=(el,fn)=>{let last=0;const h=e=>{const n=performance.now();if(n-last<400)return;last=n;if(e&&e.cancelable)e.preventDefault();fn(e)};el.addEventListener('pointerdown',h);el.addEventListener('touchstart',h,{passive:false});el.addEventListener('click',h)};
function pauseGame(){if(phase!=='play'||mapOpen)return;setLocked(false);joy.x=joy.y=0;for(const x in k)k[x]=0;sprintBtn=false;diveBtn=false;$('tsp').classList.remove('on');$('tdv').classList.remove('on')}
tapOn($('tpause'),pauseGame);
$('mm').addEventListener('click',()=>{mapOpen?closeMap():openMap()});
$('mapfs').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-l]');if(b){mapLvl=+b.dataset.l;for(const q of document.querySelectorAll('#maptabs button'))q.classList.toggle('on',q===b);drawMap($('mmf'),mapLvl,true);return}closeMap()});
const AUTO=(()=>{try{const v=sessionStorage.getItem('pr_auto')==='1';sessionStorage.removeItem('pr_auto');return v}catch(e){return false}})();
if(AUTO){const rs=$('resume');if(SET.mobile)$('play').onclick();else{$('menu').classList.remove('on');rs.classList.add('on');rs.onclick=()=>{rs.classList.remove('on');$('play').onclick()}}}
})();
