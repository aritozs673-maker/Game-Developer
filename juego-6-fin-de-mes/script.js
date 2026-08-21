let money=800;
let saving=0;
let happiness=100;
let day=1;
let decisions=0;
let gameOver=false;
let decisionWaiting=false;
let eventWaiting=false;
let keys={};
let lastTime=0;
let dayEvents=0;
let eventProgress=0;

let player={
x:7,
y:68,
speed:.48,
direction:"right"
};

let cornerReached=[false,false,false,false,false];

const corners=[
{x:30,y:68},
{x:58,y:48},
{x:31,y:30},
{x:69,y:12},
{x:89,y:2}
];

const dailySituations=[
{
icon:"💼",
title:"¡HORA DE IR AL TRABAJO!",
text:"☀️ Son las 7:30 AM. Tienes que llegar al trabajo antes de las 8:30 AM. No puedes faltar hoy.",
options:[
["💼 Ir al trabajo","workday",0,0],
["😴 Volver a casa","badwork",0,-20]
]
},
{
icon:"🚌",
title:"¿CÓMO VAS AL TRABAJO?",
text:"🕗 Son las 8:10 AM. El trabajo está lejos. El bus cuesta $8, pero caminar te hará llegar tarde.",
options:[
["🚌 Tomar el bus (-$8)","buy",8,2],
["🚶 Caminar y llegar tarde","late",0,-10]
]
},
{
icon:"🍔",
title:"¡HORA DEL ALMUERZO!",
text:"☀️ Son las 12:30 PM. Tienes hambre. Hoy no trajiste comida de casa.",
options:[
["🍔 Comprar almuerzo (-$15)","buy",15,8],
["🥪 Comprar algo económico (-$7)","buy",7,3]
]
},
{
icon:"💼",
title:"¡TERMINÓ TU TURNO!",
text:"🌇 Son las 6:00 PM. Terminaste tu trabajo. Antes de irte, tu jefe te ofrece trabajar 2 horas más por $40.",
options:[
["💼 Trabajar 2 horas (+$40)","work",40,-5],
["🏠 Ir a casa","rest",0,5]
]
},
{
icon:"🌙",
title:"¡TERMINASTE EL DÍA!",
text:"🌙 Son las 9:00 PM. Llegaste a casa. Antes de dormir puedes separar parte de tu dinero para tu meta.",
options:[
["🐷 Ahorrar $20","bank",20,0],
["💵 Guardarlo disponible","save",0,0]
]
}
];

const alternateSituations=[
{
icon:"🎓",
title:"¡TIENES CLASE HOY!",
text:"☀️ Son las 8:00 AM. Tienes que ir a clases. Necesitas transporte para llegar a tiempo.",
options:[
["🚌 Tomar el bus (-$8)","buy",8,2],
["🚶 Caminar y arriesgarte a llegar tarde","late",0,-8]
]
},
{
icon:"📚",
title:"MATERIAL PARA CLASE",
text:"📚 El profesor pidió material para hoy. Comprar lo necesario cuesta $12.",
options:[
["📚 Comprar lo necesario (-$12)","buy",12,0],
["🧠 Buscar una alternativa gratis","save",0,2]
]
},
{
icon:"🍽️",
title:"HORA DE COMER",
text:"🍽️ Ya es mediodía. Tienes hambre y todavía tienes actividades por hacer.",
options:[
["🍔 Comprar comida (-$15)","buy",15,8],
["🥗 Buscar una opción económica (-$8)","buy",8,4]
]
},
{
icon:"💼",
title:"OPORTUNIDAD DE TRABAJO",
text:"🌇 Una persona necesita ayuda durante dos horas y te ofrece $35.",
options:[
["💼 Aceptar (+$35)","work",35,-5],
["🏠 Ir a casa","rest",0,5]
]
},
{
icon:"🐷",
title:"META DE AHORRO",
text:"🌙 Terminó tu día. Recuerdas que quieres llegar a fin de mes con dinero guardado.",
options:[
["🐷 Ahorrar $25","bank",25,0],
["💵 Mantenerlo disponible","save",0,0]
]
}
];

const decisionsList=[
{
icon:"☕",
title:"CAFÉ DE LA MAÑANA",
text:"Pasas frente a tu cafetería favorita. El café cuesta $6.",
options:[
["☕ Comprar café (-$6)","buy",6,5],
["🏠 Prepararlo en casa","save",0,0]
]
},
{
icon:"🎮",
title:"NUEVO VIDEOJUEGO",
text:"Acaba de salir un juego que quieres. Cuesta $45.",
options:[
["🎮 Comprar (-$45)","buy",45,12],
["⏳ Esperar una oferta","save",0,0]
]
},
{
icon:"🎬",
title:"PLAN CON AMIGOS",
text:"Tus amigos quieren salir al cine. La entrada cuesta $12.",
options:[
["🎬 Ir al cine (-$12)","buy",12,12],
["🏠 Quedarte en casa","save",0,0]
]
},
{
icon:"👟",
title:"COMPRA IMPULSIVA",
text:"Ves unos zapatos que te encantan. Cuestan $70 y los que tienes todavía sirven.",
options:[
["👟 Comprar (-$70)","buy",70,10],
["🧠 No comprarlos","save",0,2]
]
},
{
icon:"🛍️",
title:"OFERTA RELÁMPAGO",
text:"Una tienda ofrece unos audífonos de $100 por solo $60.",
options:[
["🛍️ Comprar (-$60)","buy",60,10],
["🧠 Ignorar la oferta","save",0,0]
]
},
{
icon:"🏦",
title:"DEPÓSITO DE AHORRO",
text:"Puedes separar parte de tu dinero antes de seguir.",
options:[
["🏦 Guardar $30","bank",30,0],
["💵 No ahorrar","save",0,0]
]
},
{
icon:"🚨",
title:"EMERGENCIA",
text:"Tu bicicleta se dañó. Repararla cuesta $40.",
options:[
["🔧 Repararla (-$40)","buy",40,0],
["💳 Pedir prestado","debt",60,-10]
]
},
{
icon:"💰",
title:"TRABAJO EXTRA",
text:"Te ofrecen $50 por ayudar durante unas horas.",
options:[
["💼 Aceptar (+$50)","work",50,-3],
["😴 Descansar","rest",0,4]
]
},
{
icon:"📱",
title:"NUEVO CELULAR",
text:"Tu celular funciona perfectamente, pero aparece un modelo nuevo de $150.",
options:[
["📱 Comprar (-$150)","buy",150,15],
["🧠 Conservar el actual","save",0,0]
]
},
{
icon:"🎁",
title:"DINERO INESPERADO",
text:"Recibes $40 como regalo. ¿Qué haces?",
options:[
["🐷 Guardar todo","bank",40,0],
["🎁 Gastar $20 y guardar $20","mixed",20,5]
]
},
{
icon:"⚠️",
title:"¡CUIDADO CON LA ESTAFA!",
text:"Alguien promete duplicar tu dinero si le entregas $100. No existe ninguna garantía.",
options:[
["💸 Entregar $100","risk",100,-15],
["🧠 No arriesgarlo","save",0,3]
]
},
{
icon:"🏠",
title:"PAGO IMPORTANTE",
text:"Recuerdas que tienes una obligación de $35 que debes pagar hoy.",
options:[
["💵 Pagar ahora (-$35)","buy",35,0],
["⚠️ Ignorarla","debt",50,-10]
]
},
{
icon:"🥤",
title:"PEQUEÑOS GASTOS",
text:"Tienes ganas de comprar una bebida y un snack por $10.",
options:[
["🥤 Comprar (-$10)","buy",10,6],
["💧 Llevar agua de casa","save",0,0]
]
},
{
icon:"🛒",
title:"COMPRA DEL MES",
text:"Necesitas alimentos para la semana.",
options:[
["🛒 Comprar solo lo necesario (-$50)","buy",50,0],
["🛍️ Comprar extras (-$80)","buy",80,8]
]
},
{
icon:"📚",
title:"CURSO",
text:"Encuentras un curso que puede ayudarte a mejorar tus oportunidades laborales.",
options:[
["📚 Pagar $30","buy",30,5],
["🐷 Guardar el dinero","save",0,0]
]
},
{
icon:"🚲",
title:"TRANSPORTE",
text:"Puedes usar tu bicicleta o pagar $7 por transporte.",
options:[
["🚌 Pagar transporte (-$7)","buy",7,2],
["🚲 Usar bicicleta","save",0,4]
]
},
{
icon:"🎉",
title:"FIESTA",
text:"Tus amigos organizaron una fiesta. Participar cuesta $25.",
options:[
["🎉 Ir (-$25)","buy",25,15],
["🐷 No ir y ahorrar","save",0,0]
]
}
];

const events=[
{
icon:"💸",
title:"¡COMPRA IMPULSIVA!",
text:"Pasas frente a una tienda y ves una oferta increíble. No la necesitas, pero cuesta solo $25.",
options:[
["🛍️ Comprar (-$25)","buy",25,8],
["🧠 Seguir caminando","save",0,0]
]
},
{
icon:"💼",
title:"TRABAJO EXTRA",
text:"Mientras caminas, alguien te ofrece $60 por ayudarle durante un rato.",
options:[
["💼 Aceptar (+$60)","work",60,-5],
["🚶 Continuar caminando","rest",0,3]
]
},
{
icon:"🚨",
title:"¡SE ROMPIÓ TU BICICLETA!",
text:"Tu transporte se dañó. Repararlo cuesta $35.",
options:[
["🔧 Repararlo (-$35)","buy",35,0],
["💳 Pedir prestado","debt",45,-8]
]
},
{
icon:"🎁",
title:"¡DINERO INESPERADO!",
text:"Encuentras $20 que habías olvidado en tu mochila.",
options:[
["🐷 Guardar los $20","bank",20,0],
["🎉 Gastarlos","buy",20,7]
]
},
{
icon:"⚠️",
title:"¡OFERTA SOSPECHOSA!",
text:"Alguien te promete duplicar tu dinero rápidamente.",
options:[
["💸 Entregar $50","risk",50,-10],
["🧠 No arriesgar tu dinero","save",0,3]
]
},
{
icon:"🚌",
title:"¿BUS O CAMINAR?",
text:"Estás cansado. El bus cuesta $8.",
options:[
["🚌 Tomar el bus (-$8)","buy",8,4],
["🚶 Caminar y ahorrar","save",0,-2]
]
},
{
icon:"🍔",
title:"¡TIENES HAMBRE!",
text:"Pasas frente a un restaurante. Comer cuesta $18.",
options:[
["🍔 Comprar comida (-$18)","buy",18,8],
["🏠 Esperar y comer en casa","save",0,0]
]
},
{
icon:"🐷",
title:"MOMENTO PERFECTO PARA AHORRAR",
text:"Recuerdas tu meta de ahorro. Puedes separar $25.",
options:[
["🐷 Guardar $25","bank",25,0],
["💵 Mantenerlo disponible","save",0,0]
]
},
{
icon:"🎮",
title:"NUEVO JUEGO",
text:"Un videojuego está en oferta por $30.",
options:[
["🎮 Comprar (-$30)","buy",30,10],
["⏳ Esperar otra oferta","save",0,0]
]
}
];

document.addEventListener("keydown",e=>{
const key=e.key.toLowerCase();
keys[key]=true;
if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(key))e.preventDefault();
});

document.addEventListener("keyup",e=>{
keys[e.key.toLowerCase()]=false;
});

function startGame(){
money=800;
saving=0;
happiness=100;
day=1;
decisions=0;
dayEvents=0;
eventProgress=0;
gameOver=false;
decisionWaiting=false;
eventWaiting=false;
lastTime=0;
cornerReached=[false,false,false,false,false];
player.x=7;
player.y=68;
player.direction="right";
document.getElementById("menu").classList.remove("active");
document.getElementById("game").classList.add("active");
updateUI();
showToast("🎮 Usa WASD o las flechas para caminar");
requestAnimationFrame(gameLoop);
}

function gameLoop(time){
if(!lastTime)lastTime=time;
const delta=Math.min((time-lastTime)/16.67,2);
lastTime=time;
if(!gameOver&&!decisionWaiting&&!eventWaiting)movePlayer(delta);
updatePlayer();
requestAnimationFrame(gameLoop);
}

function movePlayer(delta){
let dx=0,dy=0;
if(keys["w"]||keys["arrowup"])dy=-1;
if(keys["s"]||keys["arrowdown"])dy=1;
if(keys["a"]||keys["arrowleft"])dx=-1;
if(keys["d"]||keys["arrowright"])dx=1;
if(dx===0&&dy===0){
setWalking(false);
return;
}
setWalking(true);
if(dx<0)player.direction="left";
if(dx>0)player.direction="right";
const length=Math.sqrt(dx*dx+dy*dy);
dx/=length;
dy/=length;
const speed=player.speed*delta;
const newX=player.x+dx*speed;
const newY=player.y+dy*speed;
if(canMoveTo(newX,newY)){
player.x=newX;
player.y=newY;
}else{
snapToRoad();
}
checkCorners();
if(day>=3)checkRandomEvent();
}

function canMoveTo(x,y){
if(x<4||x>94||y<0||y>72)return false;
const onH1=y>63&&y<73&&x>=7&&x<=32;
const onV1=x>27&&x<35&&y>=47&&y<=70;
const onH2=y>43&&y<53&&x>=29&&x<=60;
const onV2=x>55&&x<63&&y>=29&&y<=50;
const onH3=y>25&&y<35&&x>=29&&x<=60;
const onV3=x>28&&x<36&&y>=10&&y<=33;
const onH4=y>8&&y<18&&x>=30&&x<=70;
const onV4=x>66&&x<74&&y>=0&&y<=16;
const onH5=y>=0&&y<8&&x>=68&&x<=90;
return onH1||onV1||onH2||onV2||onH3||onV3||onH4||onV4||onH5;
}

function snapToRoad(){
let closest=corners[0];
let distance=999;
for(const point of corners){
const d=Math.pow(player.x-point.x,2)+Math.pow(player.y-point.y,2);
if(d<distance){
distance=d;
closest=point;
}
}
player.x+=(closest.x-player.x)*.08;
player.y+=(closest.y-player.y)*.08;
}

function updatePlayer(){
const character=document.getElementById("character");
character.style.left=player.x+"%";
character.style.bottom=(100-player.y)+"%";
if(player.direction==="left")character.classList.add("face-left");
else character.classList.remove("face-left");
}

function setWalking(value){
document.getElementById("character").classList.toggle("walking",value);
}

function checkCorners(){
if(decisionWaiting||eventWaiting)return;
for(let i=0;i<5;i++){
if(cornerReached[i])continue;
const corner=corners[i];
const distance=Math.sqrt(Math.pow(player.x-corner.x,2)+Math.pow(player.y-corner.y,2));
if(distance<5){
cornerReached[i]=true;
player.x=corner.x;
player.y=corner.y;
setWalking(false);
decisionWaiting=true;
showDecision(i);
return;
}
}
}

function getSituation(index){
if(index<5&&day%3===0)return alternateSituations[index];
if(index<5&&day<=2)return dailySituations[index];
if(index===0)return{
icon:"☀️",
title:"¡COMIENZA TU MAÑANA!",
text:"Son las 7:30 AM. Antes de continuar con tu día, debes decidir cómo organizar tu mañana.",
options:[
["💼 Ir directamente al trabajo","workday",0,0],
["☕ Comprar algo antes de ir","buy",6,5]
]
};
if(index===1)return{
icon:"🍔",
title:"HORA DE ALMORZAR",
text:"Es mediodía y tienes hambre. Recuerda que todavía faltan muchos días para terminar el mes.",
options:[
["🍔 Comprar almuerzo (-$15)","buy",15,8],
["🥗 Buscar una opción económica (-$7)","buy",7,3]
]
};
if(index===2)return{
icon:"💼",
title:"OPORTUNIDAD DE LA TARDE",
text:"Tu trabajo terminó, pero puedes ganar dinero extra si trabajas un par de horas más.",
options:[
["💼 Trabajar (+$40)","work",40,-5],
["🏠 Ir a casa","rest",0,5]
]
};
if(index===3)return{
icon:"🛒",
title:"GASTO DE LA TARDE",
text:"Necesitas comprar algo para mañana. Puedes comprar solo lo necesario o gastar un poco más.",
options:[
["🛒 Comprar lo necesario (-$15)","buy",15,0],
["🛍️ Comprar extras (-$35)","buy",35,6]
]
};
return{
icon:"🌙",
title:"¡LLEGASTE A LA NOCHE!",
text:"Son las 9:00 PM. Terminaste tus obligaciones. ¿Cuánto quieres separar para tu meta?",
options:[
["🐷 Ahorrar $30","bank",30,0],
["💵 No ahorrar hoy","save",0,0]
]
};
}

function showDecision(cornerIndex){
const event=getSituation(cornerIndex);
document.getElementById("eventIcon").textContent=event.icon;
document.getElementById("eventDay").textContent="DÍA "+day+" · "+getTimeForCorner(cornerIndex)+" · DECISIÓN "+(cornerIndex+1)+"/5";
document.getElementById("eventTitle").textContent=event.title;
document.getElementById("eventText").textContent=event.text;
const options=document.getElementById("options");
options.innerHTML="";
event.options.forEach((option,index)=>{
const button=document.createElement("button");
button.className="option "+(index===0?"bad":"good");
button.textContent=option[0];
button.onclick=()=>chooseDecision(option);
options.appendChild(button);
});
document.getElementById("decision").classList.add("show");
}

function getTimeForCorner(index){
const times=["7:30 AM","12:30 PM","6:00 PM","7:30 PM","9:00 PM"];
return times[index];
}

function chooseDecision(option){
document.getElementById("decision").classList.remove("show");
applyChoice(option);
if(gameOver)return;
decisions++;
updateUI();
if(decisions>=5){
decisionWaiting=false;
showToast("🏁 ¡Llegaste a la META!");
setTimeout(()=>finishDay(),1000);
return;
}
decisionWaiting=false;
showToast("🚶 ¡Continúa con tu día!");
}

function checkRandomEvent(){
if(eventWaiting)return;
if(dayEvents>=1&&day<=7)return;
if(dayEvents>=2&&day<=15)return;
if(dayEvents>=3)return;
eventProgress+=.002;
const chance=day<=7?.003:day<=15?.005:.007;
if(eventProgress>.35&&Math.random()<chance){
dayEvents++;
eventProgress=0;
showRandomEvent();
}
}

function showRandomEvent(){
eventWaiting=true;
setWalking(false);
const event=events[Math.floor(Math.random()*events.length)];
document.getElementById("randomEventIcon").textContent=event.icon;
document.getElementById("randomEventTitle").textContent=event.title;
document.getElementById("randomEventText").textContent=event.text;
const options=document.getElementById("randomEventOptions");
options.innerHTML="";
event.options.forEach((option,index)=>{
const button=document.createElement("button");
button.className="option "+(index===0?"bad":"good");
button.textContent=option[0];
button.onclick=()=>chooseRandomEvent(option);
options.appendChild(button);
});
document.getElementById("eventModal").classList.add("show");
}

function chooseRandomEvent(option){
document.getElementById("eventModal").classList.remove("show");
applyChoice(option);
if(gameOver)return;
eventWaiting=false;
showToast("🚶 El camino continúa...");
}

function applyChoice(option){
const type=option[1];
const amount=option[2];
const happinessChange=option[3];

if(type==="work"){
money+=amount;
happiness+=happinessChange;
}

if(type==="workday"){
happiness+=2;
showToast("💼 ¡Llegaste al trabajo a tiempo!");
}

if(type==="badwork"){
happiness+=happinessChange;
showToast("⚠️ Faltar al trabajo puede tener consecuencias.");
}

if(type==="late"){
happiness+=happinessChange;
showToast("⏰ Llegaste tarde. La próxima vez planifica mejor.");
}

if(type==="buy"){
money-=amount;
happiness+=happinessChange;
}

if(type==="bank"){
if(money>=amount){
money-=amount;
saving+=amount;
showToast("🐷 ¡Dinero guardado para tu futuro!");
}else{
showToast("❌ No tienes suficiente dinero para ahorrar esa cantidad.");
}
}

if(type==="save"){
happiness+=happinessChange;
}

if(type==="rest"){
happiness+=happinessChange;
}

if(type==="debt"){
money-=amount;
happiness+=happinessChange;
showToast("💳 Pedir prestado resuelve el problema ahora, pero aumenta tu deuda.");
}

if(type==="risk"){
money-=amount;
happiness+=happinessChange;
showToast("⚠️ Nunca arriesgues tu dinero sin conocer el riesgo.");
}

if(type==="mixed"){
money-=amount;
saving+=20;
happiness+=happinessChange;
}

happiness=Math.max(0,Math.min(100,happiness));

if(money<0){
lose("💸","¡TE QUEDASTE SIN DINERO!","Tus gastos superaron el dinero que tenías disponible. Necesitas planificar mejor tus gastos.");
return;
}

if(happiness<=0){
lose("😵","¡NECESITAS CUIDARTE!","El dinero es importante, pero también lo es tu bienestar.");
return;
}

updateUI();
checkMoneyWarning();
}

function checkMoneyWarning(){
const daysLeft=30-day;
if(daysLeft>0&&money<150){
showToast("⚠️ ¡Cuidado! Te quedan $"+Math.floor(money)+" y todavía faltan "+daysLeft+" días.");
}else if(saving>=200&&saving%100<5){
showToast("🐷 ¡Vas muy bien! Ya tienes $"+Math.floor(saving)+" ahorrados.");
}
}

function finishDay(){
if(day===30){
win();
return;
}

const spent=800-money-saving;

if(day<30&&money<100){
showToast("🌙 Fin del día. ¡Tu dinero está muy ajustado!");
}else if(saving>=day*10){
showToast("🌙 Fin del día. ¡Tu ahorro va por buen camino!");
}else{
showToast("🌅 ¡TERMINASTE EL DÍA "+day+"!");
}

setTimeout(()=>{
day++;
decisions=0;
dayEvents=0;
eventProgress=0;
cornerReached=[false,false,false,false,false];
player.x=7;
player.y=68;
player.direction="right";

if(day%5===0){
money+=50;
showToast("🎁 ¡RECIBISTE UN BONO DE $50!");
}

decisionWaiting=false;
eventWaiting=false;
updateUI();
},1500);
}

function updateUI(){
document.getElementById("money").textContent="$"+Math.floor(money);
document.getElementById("saving").textContent="$"+Math.floor(saving);
document.getElementById("happiness").textContent=happiness+"%";
document.getElementById("happyBar").style.width=happiness+"%";
document.getElementById("day").textContent=day;

const currentTime=Math.min(decisions,4);
const times=[
["☀️","7:30 AM"],
["🚌","8:10 AM"],
["🍔","12:30 PM"],
["🌇","6:00 PM"],
["🌙","9:00 PM"]
];

document.getElementById("timeIcon").textContent=times[currentTime][0];
document.getElementById("timeText").textContent=times[currentTime][1];

document.querySelectorAll(".decision-progress span").forEach((item,index)=>{
item.classList.toggle("done",index<decisions);
});

if(day<3){
document.getElementById("status").textContent=
decisions===0
?"☀️ Es de mañana. Tienes obligaciones hoy. Llega a la primera esquina."
:"📍 "+decisions+"/5 · Sigue con tu día.";
}else{
document.getElementById("status").textContent=
decisions===0
?"🔥 Día "+day+": pueden aparecer eventos mientras caminas."
:"📍 "+decisions+"/5 · 🔥 Eventos activos";
}
}

function showToast(text){
const toast=document.getElementById("toast");
toast.textContent=text;
toast.classList.add("show");
setTimeout(()=>toast.classList.remove("show"),2300);
}

function win(){
gameOver=true;
document.getElementById("game").classList.remove("active");
document.getElementById("result").classList.add("active");

document.getElementById("resultEmoji").textContent=saving>=300?"🏆":"🎉";
document.getElementById("resultTitle").textContent=saving>=300?"¡MAESTRO DEL DINERO!":"¡LLEGASTE A FIN DE MES!";
document.getElementById("resultText").textContent=saving>=300?"¡Increíble! Llegaste al día 30 con una gran cantidad de ahorro. Demostraste que puedes disfrutar tu dinero y al mismo tiempo cuidar tu futuro.":"¡Lo lograste! Llegaste al día 30. Cada decisión que tomaste cambió tu mes.";
document.getElementById("finalMoney").textContent="$"+Math.floor(money);
document.getElementById("finalSaving").textContent="$"+Math.floor(saving);
document.getElementById("finalHappy").textContent=happiness+"%";
}

function lose(emoji,title,text){
gameOver=true;
document.getElementById("game").classList.remove("active");
document.getElementById("result").classList.add("active");
document.getElementById("resultEmoji").textContent=emoji;
document.getElementById("resultTitle").textContent=title;
document.getElementById("resultText").textContent=text+" ¡Puedes volver a intentarlo y tomar decisiones diferentes!";
document.getElementById("finalMoney").textContent="$"+Math.floor(money);
document.getElementById("finalSaving").textContent="$"+Math.floor(saving);
document.getElementById("finalHappy").textContent=happiness+"%";
}
