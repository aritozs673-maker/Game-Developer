const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
let W=innerWidth,H=innerHeight,dpr=1;
const $=id=>document.getElementById(id);

function resize(){
dpr=Math.min(devicePixelRatio||1,2);
W=innerWidth;H=innerHeight;
canvas.width=W*dpr;
canvas.height=H*dpr;
canvas.style.width=W+"px";
canvas.style.height=H+"px";
ctx.setTransform(dpr,0,0,dpr,0,0)
}
resize();
addEventListener("resize",resize);

const levels=[
{name:"CIUDAD",w:2600,h:1800,time:80,target:6,type:"tap",tip:"Cada gota cuenta. Cierra los grifos cuando no los estés usando."},
{name:"BOSQUE",w:3500,h:2400,time:90,target:9,type:"trash",tip:"Cuida los ríos y evita tirar basura. El agua limpia es responsabilidad de todos."},
{name:"RÍO",w:4500,h:3000,time:100,target:12,type:"trash",tip:"Recoger residuos ayuda a mantener nuestras fuentes de agua limpias."},
{name:"OCÉANO",w:5600,h:3700,time:110,target:16,type:"plastic",tip:"Evita los plásticos. Menos contaminación significa océanos más saludables."},
{name:"PLANETA",w:7000,h:4600,time:125,target:22,type:"water",tip:"¡El planeta depende de nosotros! Usa el agua de forma responsable todos los días."}
];

let level=1;
let world=levels[0];
let running=false;
let paused=false;
let score=0;
let water=0;
let lives=3;
let timer=0;
let combo=0;
let maxCombo=0;
let collected=0;
let objects=[];
let particles=[];
let spawnTimer=0;
let camX=0;
let camY=0;
let last=performance.now();

const keys={};

const player={
x:0,
y:0,
r:24,
speed:245,
inv:0,
shield:0,
magnet:0,
boost:0,
dir:"down",
moving:false,
walk:0
};

let bestScore=Number(localStorage.getItem("heroWaterScore"))||0;
let bestCombo=Number(localStorage.getItem("heroWaterCombo"))||0;
let bestLevel=Number(localStorage.getItem("heroWaterLevel"))||0;

$("play").onclick=()=>startGame(1);
$("levels").onclick=showLevels;
$("instructions").onclick=()=>show("instructionsScreen");
$("records").onclick=showRecords;
$("pause").onclick=togglePause;
$("resume").onclick=()=>{
paused=false;
hide("pauseScreen");
last=performance.now()
};
$("pauseMenu").onclick=menu;
$("resultAction").onclick=()=>hide("resultScreen");
$("continueShop").onclick=()=>{
hide("shopScreen");
loadLevel(level)
};
$("clearRecord").onclick=()=>{
localStorage.removeItem("heroWaterScore");
localStorage.removeItem("heroWaterCombo");
localStorage.removeItem("heroWaterLevel");
bestScore=0;
bestCombo=0;
bestLevel=0;
showRecords()
};

document.querySelectorAll(".back").forEach(b=>b.onclick=menu);

document.querySelectorAll("[data-buy]").forEach(b=>{
b.onclick=()=>buyPower(b.dataset.buy)
});

addEventListener("keydown",e=>{
let k=e.key.toLowerCase();
keys[k]=true;
if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
if(k==="escape"&&running)togglePause()
});

addEventListener("keyup",e=>{
keys[e.key.toLowerCase()]=false
});

function show(id){
document.querySelectorAll(".screen").forEach(e=>e.classList.add("hidden"));
$(id).classList.remove("hidden")
}

function hide(id){
$(id).classList.add("hidden")
}

function menu(){
running=false;
paused=false;
$("hud").classList.add("hidden");
$("mission").classList.add("hidden");
show("menu")
}

function showLevels(){
let box=$("levelList");
box.innerHTML="";

for(let i=1;i<=5;i++){
let l=levels[i-1];
let b=document.createElement("button");
b.className="levelCard";

let unlocked=i<=bestLevel+1;

if(!unlocked)b.classList.add("locked");

let icon=["🏙️","🌲","🌊","🐠","🌎"][i-1];

b.innerHTML="<strong>"+icon+" NIVEL "+i+" · "+l.name+"</strong><small>"+(unlocked?l.tip:"🔒 BLOQUEADO")+"</small>";

if(unlocked)b.onclick=()=>startGame(i);

box.appendChild(b)
}

show("levelsScreen")
}

function showRecords(){
$("bestScore").textContent=bestScore;
$("bestCombo").textContent=bestCombo;
$("bestLevel").textContent=bestLevel;
show("recordsScreen")
}

function startGame(n){
level=n;
score=0;
water=0;
lives=3;
combo=0;
maxCombo=0;
running=true;
paused=false;
$("hud").classList.remove("hidden");
$("mission").classList.remove("hidden");
loadLevel(n)
}

function loadLevel(n){
level=n;
world=levels[n-1];
timer=world.time;
collected=0;
objects=[];
particles=[];
spawnTimer=.2;

player.x=world.w/2;
player.y=world.h/2;
player.inv=0;
player.shield=0;
player.magnet=0;
player.boost=0;
player.dir="down";
player.moving=false;
player.walk=0;

camX=Math.max(0,Math.min(world.w-W,player.x-W/2));
camY=Math.max(0,Math.min(world.h-H,player.y-H/2));

updateUI();
showStartLevel()
}

function showStartLevel(){
$("resultStars").textContent="💧";
$("resultTitle").textContent="NIVEL "+level+" · "+world.name;
$("resultMessage").textContent=world.tip;

$("resultStats").innerHTML=
"<div>💧 AGUA<br><b>"+water+"</b></div>"+
"<div>⭐ PUNTOS<br><b>"+score+"</b></div>"+
"<div>❤️ VIDAS<br><b>"+lives+"</b></div>";

$("resultAction").textContent="COMENZAR NIVEL";

$("resultAction").onclick=()=>{
hide("resultScreen");

setTimeout(()=>{
gameMessage(
"💧 NIVEL "+level+
"<br><span style='font-size:17px'>"+world.tip+"</span>",
"#54dfff"
)
},150)
};

show("resultScreen")
}

function togglePause(){
if(!running)return;

paused=!paused;

if(paused){
show("pauseScreen")
}else{
hide("pauseScreen");
last=performance.now()
}
}

function buyPower(type){
let cost={shield:100,magnet:120,speed:100,time:80}[type];

if(water<cost){
gameMessage("💧 No tienes suficiente agua","#ff5555");
return
}

water-=cost;

if(type==="shield")player.shield=15;
if(type==="magnet")player.magnet=15;
if(type==="speed")player.boost=15;
if(type==="time")timer+=30;

$("shopWater").textContent=water;
updateUI()
}

function update(dt){
if(!running||paused)return;

if(!$("resultScreen").classList.contains("hidden"))return;
if(!$("shopScreen").classList.contains("hidden"))return;

timer-=dt;

if(timer<=0){
gameOver();
return
}

let dx=0;
let dy=0;

if(keys.d||keys.arrowright)dx++;
if(keys.a||keys.arrowleft)dx--;
if(keys.s||keys.arrowdown)dy++;
if(keys.w||keys.arrowup)dy--;

player.moving=dx!==0||dy!==0;

if(player.moving){
if(Math.abs(dx)>Math.abs(dy)){
player.dir=dx>0?"right":"left"
}else{
player.dir=dy>0?"down":"up"
}

let n=Math.hypot(dx,dy);
dx/=n;
dy/=n;

let speed=player.speed*(player.boost>0?1.65:1);

player.x+=dx*speed*dt;
player.y+=dy*speed*dt;

player.walk+=dt*10
}else{
player.walk=0
}

player.x=Math.max(45,Math.min(world.w-45,player.x));
player.y=Math.max(120,Math.min(world.h-45,player.y));

player.inv=Math.max(0,player.inv-dt);
player.shield=Math.max(0,player.shield-dt);
player.magnet=Math.max(0,player.magnet-dt);
player.boost=Math.max(0,player.boost-dt);

let targetX=Math.max(0,Math.min(world.w-W,player.x-W/2));
let targetY=Math.max(0,Math.min(world.h-H,player.y-H/2));

camX+=(targetX-camX)*Math.min(1,dt*7);
camY+=(targetY-camY)*Math.min(1,dt*7);

spawnTimer-=dt;

if(spawnTimer<=0){
spawnObject();
spawnTimer=Math.max(.3,1-level*.1)
}

for(let o of objects){

o.x+=o.vx*dt;
o.y+=o.vy*dt;
o.rot+=dt;

if(player.magnet>0){
let ax=player.x-o.x;
let ay=player.y-o.y;
let d=Math.hypot(ax,ay);

if(d<500&&d>1){
o.x+=ax/d*300*dt;
o.y+=ay/d*300*dt
}
}

if(o.x<40||o.x>world.w-40)o.vx*=-1;
if(o.y<100||o.y>world.h-40)o.vy*=-1
}

for(let i=objects.length-1;i>=0;i--){

let o=objects[i];

if(Math.hypot(player.x-o.x,player.y-o.y)<player.r+o.r){

collect(o);

objects.splice(i,1)
}
}

for(let i=particles.length-1;i>=0;i--){

let p=particles[i];

p.x+=p.vx*dt;
p.y+=p.vy*dt;
p.life-=dt;

if(p.life<=0)particles.splice(i,1)
}

if(collected>=world.target){
completeLevel();
return
}

updateUI()
}

function spawnObject(){

let types;

if(level===1){
types=["tap","tap","tap","water","trash","danger","power"]
}else if(level===2){
types=["trash","trash","water","danger","power"]
}else if(level===3){
types=["trash","trash","plastic","water","danger","power"]
}else if(level===4){
types=["plastic","plastic","trash","water","danger","power"]
}else{
types=["water","water","trash","plastic","tap","danger","power"]
}

let type=types[Math.floor(Math.random()*types.length)];

let o={
type:type,
x:70+Math.random()*(world.w-140),
y:120+Math.random()*(world.h-170),
r:type==="power"?27:23,
vx:(Math.random()-.5)*65,
vy:(Math.random()-.5)*65,
rot:0
};

if(Math.hypot(o.x-player.x,o.y-player.y)<300)return;

objects.push(o)
}

function collect(o){

let points=0;

if(o.type==="danger"){

if(player.shield>0){

player.shield=0;
points=60;

gameMessage(
"🛡️ ¡El escudo te protegió!",
"#54dfff"
)

}else{

hit();
return
}

}else if(o.type==="power"){

player.shield=8;
player.magnet=8;
player.boost=8;
points=120;

gameMessage(
"⭐ ¡POWER-UP CONSEGUIDO!",
"#ffd83c"
)

}else{

if(o.type===world.type)collected++;

if(o.type==="water"){
water+=10;
points=20;

gameMessage(
"💦 ¡ACUMULASTE AGUA!",
"#35c8f1"
)
}

if(o.type==="tap"){
water+=15;
points=45;

gameMessage(
"💧 ¡AHORRASTE AGUA!",
"#4dff9a"
)
}

if(o.type==="trash"){
points=30;

gameMessage(
"♻️ ¡LIMPIASTE EL AMBIENTE!",
"#65df72"
)
}

if(o.type==="plastic"){
points=40;

gameMessage(
"🌊 ¡REDUJISTE LA CONTAMINACIÓN!",
"#54dfff"
)
}
}

combo++;
maxCombo=Math.max(maxCombo,combo);

let multiplier=1+Math.floor(combo/5)*.5;

score+=Math.round(points*multiplier);

explode(
o.x,
o.y,
o.type==="danger"?"#ff4b4b":"#55ddff",
14
);

sound(350+combo*15,.06)
}

function hit(){

if(player.inv>0)return;

if(player.shield>0){

player.shield=0;
player.inv=1;

gameMessage(
"🛡️ ¡EL ESCUDO PROTEGIÓ TU AGUA!",
"#54dfff"
);

return
}

lives--;
combo=0;
player.inv=2;

gameMessage(
"💔 ¡REDUJISTE TU NIVEL DE AGUA Y PERDISTE UNA VIDA!",
"#ff4545"
);

explode(
player.x,
player.y,
"#ff4747",
25
);

sound(90,.2);

if(lives<=0){
gameOver()
}
}

function completeLevel(){

running=false;

if(level>bestLevel){
bestLevel=level;
localStorage.setItem("heroWaterLevel",bestLevel)
}

save();

if(level===5){
victory();
return
}

$("shopWater").textContent=water;
show("shopScreen")
}

function gameOver(){

running=false;

save();

$("resultStars").textContent="💔";
$("resultTitle").textContent="GAME OVER";

$("resultMessage").textContent=
"El agua necesita que lo intentes otra vez.";

$("resultStats").innerHTML=
"<div>⭐ PUNTOS<br><b>"+score+"</b></div>"+
"<div>🔥 COMBO<br><b>"+maxCombo+"</b></div>"+
"<div>💧 AGUA<br><b>"+water+"</b></div>";

$("resultAction").textContent="REINTENTAR";

$("resultAction").onclick=()=>{
startGame(level)
};

show("resultScreen")
}

function victory(){

$("resultStars").textContent="★★★";
$("resultTitle").textContent="¡PLANETA SALVADO!";

$("resultMessage").textContent=
"¡Completaste los 5 niveles! Gracias por cuidar el agua.";

$("resultStats").innerHTML=
"<div>⭐ PUNTOS<br><b>"+score+"</b></div>"+
"<div>🔥 COMBO<br><b>"+maxCombo+"</b></div>"+
"<div>💧 AGUA<br><b>"+water+"</b></div>";

$("resultAction").textContent="JUGAR DE NUEVO";

$("resultAction").onclick=()=>{
startGame(1)
};

show("resultScreen")
}

function save(){

if(score>bestScore){
bestScore=score;
localStorage.setItem("heroWaterScore",bestScore)
}

if(maxCombo>bestCombo){
bestCombo=maxCombo;
localStorage.setItem("heroWaterCombo",bestCombo)
}

if(level>bestLevel){
bestLevel=level;
localStorage.setItem("heroWaterLevel",bestLevel)
}
}

function updateUI(){

$("water").textContent=water;
$("score").textContent=score;
$("timer").textContent=formatTime(timer);

$("lives").textContent=
"♥".repeat(Math.max(0,lives))+
"♡".repeat(Math.max(0,3-lives));

$("combo").textContent="x"+combo;

$("levelName").textContent=
"NIVEL "+level+" · "+world.name;

$("missionText").textContent=
world.tip+" · "+collected+"/"+world.target;

$("missionProgress").style.width=
Math.min(100,collected/world.target*100)+"%"
}

function formatTime(t){

let m=Math.floor(Math.max(0,t)/60);
let s=Math.floor(Math.max(0,t)%60);

return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")
}

function gameMessage(text,color="#35c8f1"){

let old=document.getElementById("gameMessage");

if(old)old.remove();

let box=document.createElement("div");

box.id="gameMessage";
box.innerHTML=text;

box.style.position="fixed";
box.style.left="50%";
box.style.top="18%";
box.style.transform="translateX(-50%) scale(.8)";
box.style.zIndex="99999";
box.style.padding="16px 28px";
box.style.borderRadius="16px";
box.style.background="rgba(5,25,40,.97)";
box.style.border="3px solid "+color;
box.style.color="#fff";
box.style.fontFamily="Arial,sans-serif";
box.style.fontSize="22px";
box.style.fontWeight="bold";
box.style.textAlign="center";
box.style.boxShadow="0 0 25px "+color;
box.style.opacity="0";
box.style.transition="all .25s ease";
box.style.pointerEvents="none";
box.style.maxWidth="85%";

document.body.appendChild(box);

requestAnimationFrame(()=>{
box.style.opacity="1";
box.style.transform="translateX(-50%) scale(1)"
});

setTimeout(()=>{

box.style.opacity="0";
box.style.transform="translateX(-50%) scale(.8)";

setTimeout(()=>{
box.remove()
},300)

},2400)
}

function explode(x,y,color,n){

for(let i=0;i<n;i++){

particles.push({
x:x,
y:y,
vx:(Math.random()-.5)*190,
vy:(Math.random()-.5)*190,
life:.5+Math.random()*.5,
color:color
})
}
}

function sound(freq,duration){

try{

let audio=new AudioContext();
let o=audio.createOscillator();
let g=audio.createGain();

o.frequency.value=freq;
g.gain.value=.025;

o.connect(g);
g.connect(audio.destination);

o.start();

g.gain.exponentialRampToValueAtTime(
.001,
audio.currentTime+duration
);

o.stop(audio.currentTime+duration)

}catch(e){}
}

function draw(){

ctx.clearRect(0,0,W,H);

ctx.save();

ctx.translate(-camX,-camY);

drawWorld();
drawObjects();
drawHero();
drawParticles();

ctx.restore()
}

function drawWorld(){

if(level===1){
ctx.fillStyle="#8bcfe1"
}else if(level===2){
ctx.fillStyle="#4b9d64"
}else if(level===3){
ctx.fillStyle="#2992ad"
}else if(level===4){
ctx.fillStyle="#147ca4"
}else{
ctx.fillStyle="#65a968"
}

ctx.fillRect(0,0,world.w,world.h);

if(level===1)drawCity();
if(level===2)drawForest();
if(level===3)drawRiver();
if(level===4)drawOcean();
if(level===5)drawPlanet()
}

function drawCity(){

ctx.fillStyle="#69757a";
ctx.fillRect(0,650,world.w,470);

ctx.fillStyle="#3f484c";
ctx.fillRect(0,730,world.w,350);

for(let i=0;i<world.w;i+=150){

ctx.fillStyle="#e0cf62";
ctx.fillRect(i,895,80,10)
}

for(let i=0;i<world.w;i+=330){

drawBuilding(i,650);
drawTree(i+270,640)
}

for(let i=0;i<18;i++){
drawManhole(150+i*145,820+(i%3)*110)
}

drawPipe(700,620);
drawPipe(1840,620);

drawTrashBin(430,775);
drawTrashBin(2180,770);

drawCloud(280,170,1);
drawCloud(950,120,.8);
drawCloud(1800,190,1.1)
}

function drawBuilding(x,y){

let colors=["#ad735e","#587f9e","#8c665f","#5e7896","#b17662"];

let w=180;
let h=180+(x%3)*50;

let c=colors[Math.floor(x/330)%colors.length];

ctx.fillStyle=c;
ctx.fillRect(x,y-h,w,h);

ctx.fillStyle="#3d5260";
ctx.fillRect(x+15,y-h+15,w-30,35);

for(let yy=y-h+70;yy<y-20;yy+=55){

for(let xx=x+22;xx<x+w-20;xx+=45){

ctx.fillStyle=(xx+yy)%90?"#9fe0ed":"#f7d85a";

ctx.fillRect(xx,yy,25,30)
}
}

ctx.fillStyle="#414c52";
ctx.fillRect(x+72,y-55,40,55)
}

function drawTree(x,y){

ctx.fillStyle="#754b2d";
ctx.fillRect(x-9,y,18,70);

ctx.fillStyle="#3c9a52";

ctx.beginPath();
ctx.arc(x,y-25,48,0,Math.PI*2);
ctx.arc(x-38,y,35,0,Math.PI*2);
ctx.arc(x+38,y,35,0,Math.PI*2);
ctx.fill()
}

function drawManhole(x,y){

ctx.fillStyle="#31383a";

ctx.beginPath();
ctx.ellipse(x,y,48,17,0,0,Math.PI*2);
ctx.fill();

ctx.strokeStyle="#15191a";
ctx.stroke()
}

function drawPipe(x,y){

ctx.fillStyle="#53616a";

ctx.fillRect(x,y-140,25,140);
ctx.fillRect(x-30,y-140,80,25);

drawTap(x+65,y-115)
}

function drawTap(x,y){

ctx.fillStyle="#4f6870";
ctx.fillRect(x,y,15,45);
ctx.fillRect(x-25,y,40,15);

ctx.fillStyle="#7ddfff";

ctx.beginPath();
ctx.moveTo(x+7,y+45);
ctx.quadraticCurveTo(x-10,y+70,x+7,y+85);
ctx.quadraticCurveTo(x+25,y+65,x+7,y+45);
ctx.fill()
}

function drawTrashBin(x,y){

ctx.fillStyle="#397f3b";
ctx.fillRect(x,y,58,65);

ctx.fillStyle="#265f2e";
ctx.fillRect(x-5,y-8,68,12);

ctx.fillStyle="#d4e9d4";
ctx.font="28px Arial";
ctx.fillText("♻",x+13,y+45)
}

function drawForest(){

for(let i=0;i<80;i++){
drawTree((i*307)%world.w,(i*181)%world.h)
}

ctx.fillStyle="#277d8f";
ctx.fillRect(world.w*.43,0,world.w*.14,world.h)
}

function drawRiver(){

ctx.fillStyle="#2992ad";
ctx.fillRect(0,0,world.w,world.h);

ctx.fillStyle="#72b45e";

ctx.fillRect(0,0,world.w*.25,world.h);
ctx.fillRect(world.w*.75,0,world.w*.25,world.h);

for(let i=0;i<30;i++){
drawTree((i*211)%world.w,(i*331)%world.h)
}
}

function drawOcean(){

ctx.fillStyle="#147ca4";
ctx.fillRect(0,0,world.w,world.h);

for(let i=0;i<50;i++){

ctx.fillStyle="#1e91b7";

ctx.beginPath();
ctx.arc((i*377)%world.w,(i*213)%world.h,40,0,Math.PI*2);
ctx.fill()
}

for(let i=0;i<18;i++){
drawFish((i*431)%world.w,(i*271)%world.h)
}
}

function drawFish(x,y){

ctx.fillStyle="#f6c84a";

ctx.beginPath();
ctx.ellipse(x,y,25,12,0,0,Math.PI*2);
ctx.fill();

ctx.beginPath();
ctx.moveTo(x-22,y);
ctx.lineTo(x-43,y-15);
ctx.lineTo(x-43,y+15);
ctx.fill()
}

function drawPlanet(){

ctx.fillStyle="#67a96b";
ctx.fillRect(0,0,world.w,world.h);

ctx.fillStyle="#2984a0";

for(let i=0;i<25;i++){

ctx.beginPath();
ctx.arc((i*529)%world.w,(i*313)%world.h,100,0,Math.PI*2);
ctx.fill()
}

for(let i=0;i<40;i++){
drawTree((i*271)%world.w,(i*173)%world.h)
}
}

function drawObjects(){

for(let o of objects){

ctx.save();

ctx.translate(o.x,o.y);
ctx.rotate(o.rot);

if(o.type==="water")drawDrop();
else if(o.type==="tap")drawTapObject();
else if(o.type==="trash")drawTrash();
else if(o.type==="plastic")drawBottle();
else if(o.type==="danger")drawDanger();
else drawPower();

ctx.restore()
}
}

function drawDrop(){

ctx.fillStyle="#35c8f1";
ctx.strokeStyle="#075a83";
ctx.lineWidth=3;

ctx.beginPath();

ctx.moveTo(0,-25);

ctx.bezierCurveTo(
-25,5,
-18,22,
0,24
);

ctx.bezierCurveTo(
18,22,
25,5,
0,-25
);

ctx.fill();
ctx.stroke()
}

function drawTapObject(){

ctx.fillStyle="#e0a02e";

ctx.fillRect(-5,-18,12,30);
ctx.fillRect(-25,-18,30,10);

ctx.fillStyle="#42d4fa";

ctx.beginPath();

ctx.moveTo(8,10);
ctx.lineTo(-2,32);
ctx.lineTo(18,32);

ctx.fill()
}

function drawTrash(){

ctx.fillStyle="#3b3b3b";
ctx.fillRect(-18,-15,36,32);

ctx.fillStyle="#222";
ctx.fillRect(-21,-21,42,7)
}

function drawBottle(){

ctx.fillStyle="#e9e9e9";
ctx.fillRect(-12,-22,24,42);

ctx.fillStyle="#55cbe6";
ctx.fillRect(-9,-12,18,19);

ctx.fillStyle="#2f6d7c";
ctx.fillRect(-7,-29,14,8)
}

function drawDanger(){

ctx.fillStyle="#282828";

ctx.beginPath();
ctx.arc(0,0,25,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="#ffde36";

ctx.beginPath();
ctx.moveTo(0,-16);
ctx.lineTo(-16,14);
ctx.lineTo(16,14);
ctx.closePath();
ctx.fill();

ctx.fillStyle="#111";
ctx.font="22px Arial";
ctx.textAlign="center";
ctx.fillText("!",0,9)
}

function drawPower(){

ctx.fillStyle="#ffd83c";

ctx.beginPath();
ctx.arc(0,0,25,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="#fff";
ctx.font="28px Arial";
ctx.textAlign="center";
ctx.fillText("★",0,10)
}

function drawHero(){

if(player.inv>0&&Math.floor(player.inv*10)%2===0)return;

ctx.save();

ctx.translate(player.x,player.y);

let step=player.moving?Math.sin(player.walk)*6:0;

ctx.fillStyle="rgba(0,0,0,.45)";

ctx.beginPath();
ctx.ellipse(0,54,30,10,0,0,Math.PI*2);
ctx.fill();

if(player.shield>0){

ctx.strokeStyle="#59edff";
ctx.lineWidth=6;
ctx.shadowBlur=25;
ctx.shadowColor="#00eaff";

ctx.beginPath();
ctx.arc(0,0,52,0,Math.PI*2);
ctx.stroke();

ctx.shadowBlur=0
}

if(player.dir==="down"){
drawFrontHero(step)
}else if(player.dir==="up"){
drawBackHero(step)
}else{
drawSideHero(step,player.dir==="right"?1:-1)
}

ctx.restore()
}

function drawFrontHero(step){

ctx.strokeStyle="#142332";
ctx.lineWidth=3;

ctx.fillStyle="#182839";
ctx.fillRect(-15,29+step,12,28);
ctx.fillRect(3,29-step,12,28);

ctx.fillStyle="#101820";
ctx.fillRect(-19,52+step,20,9);
ctx.fillRect(0,52-step,20,9);

ctx.fillStyle="#1379ad";
ctx.fillRect(-27,-5,54,39);

ctx.strokeRect(-27,-5,54,39);

ctx.fillStyle="#e9a473";

ctx.fillRect(-39,0+step,12,31);
ctx.fillRect(27,0-step,12,31);

ctx.fillStyle="#1379ad";

ctx.fillRect(-42,0+step,16,25);
ctx.fillRect(26,0-step,16,25);

ctx.fillStyle="#e9a473";

ctx.beginPath();
ctx.arc(0,-34,30,0,Math.PI*2);
ctx.fill();

ctx.stroke();

ctx.fillStyle="#563019";

ctx.beginPath();
ctx.arc(0,-43,31,Math.PI,Math.PI*2);
ctx.fill();

ctx.fillRect(-30,-45,60,12);

ctx.fillStyle="#123e59";
ctx.fillRect(-32,-37,64,19);

ctx.fillStyle="#66e8ff";
ctx.fillRect(-24,-33,19,10);
ctx.fillRect(5,-33,19,10);

ctx.fillStyle="#ffffff";
ctx.font="bold 22px Arial";
ctx.textAlign="center";
ctx.fillText("💧",0,21)
}

function drawBackHero(step){

ctx.fillStyle="#182839";

ctx.fillRect(-15,29+step,12,28);
ctx.fillRect(3,29-step,12,28);

ctx.fillStyle="#101820";

ctx.fillRect(-19,52+step,20,9);
ctx.fillRect(0,52-step,20,9);

ctx.fillStyle="#1379ad";

ctx.fillRect(-27,-5,54,39);

ctx.fillStyle="#e9a473";

ctx.beginPath();
ctx.arc(0,-34,30,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="#563019";

ctx.beginPath();
ctx.arc(0,-43,31,Math.PI,Math.PI*2);
ctx.fill();

ctx.fillRect(-30,-43,60,14);

ctx.fillStyle="#0d4f72";
ctx.fillRect(-20,-3,40,35)
}

function drawSideHero(step,dir){

ctx.scale(dir,1);

ctx.fillStyle="#182839";

ctx.fillRect(-15,29+step,12,28);
ctx.fillRect(3,29-step,12,28);

ctx.fillStyle="#101820";

ctx.fillRect(-19,52+step,20,9);
ctx.fillRect(0,52-step,20,9);

ctx.fillStyle="#1379ad";

ctx.fillRect(-27,-5,54,39);

ctx.fillStyle="#e9a473";

ctx.fillRect(23,0-step,15,30);

ctx.fillStyle="#e9a473";

ctx.beginPath();
ctx.arc(4,-34,30,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="#563019";

ctx.beginPath();
ctx.arc(4,-43,31,Math.PI,Math.PI*2);
ctx.fill();

ctx.fillRect(-25,-43,57,13);

ctx.fillStyle="#123e59";

ctx.fillRect(0,-37,32,19);

ctx.fillStyle="#66e8ff";

ctx.fillRect(6,-33,20,10)
}

function drawParticles(){

for(let p of particles){

ctx.globalAlpha=Math.max(0,p.life);

ctx.fillStyle=p.color;

ctx.fillRect(p.x,p.y,6,6)
}

ctx.globalAlpha=1
}

function drawCloud(x,y,s){

ctx.fillStyle="rgba(255,255,255,.75)";

ctx.beginPath();

ctx.arc(x,y,35*s,0,Math.PI*2);
ctx.arc(x+40*s,y-10*s,45*s,0,Math.PI*2);
ctx.arc(x+80*s,y,32*s,0,Math.PI*2);

ctx.fill()
}

function loop(t){

let dt=Math.min(.05,(t-last)/1000);

last=t;

update(dt);
draw();

requestAnimationFrame(loop)
}

requestAnimationFrame(loop);