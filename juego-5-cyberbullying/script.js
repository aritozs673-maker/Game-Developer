const dialogue=document.getElementById("dialogue");
const speaker=document.getElementById("speaker");
const next=document.getElementById("next");
const choices=document.getElementById("choices");
const phone=document.getElementById("phone");
const phoneScreen=document.getElementById("phone-screen");
const emotion=document.getElementById("emotion");
const perspective=document.getElementById("perspective");
const locationText=document.getElementById("location");
const transition=document.getElementById("transition");
const transitionTitle=document.getElementById("transition-title");
const transitionSub=document.getElementById("transition-sub");
const alex=document.getElementById("alex");
const mateo=document.getElementById("mateo");
const dani=document.getElementById("dani");

let scene=[];
let position=0;
let typing=false;
let typingTimer=null;
let nextAction=null;
let phoneTimer=null;
let emotionTimer=null;

const state={
act:1,
alexIsolation:0,
alexAnxiety:0,
support:0,
mateoEmpathy:0,
mateoHarm:0,
defended:false,
message:false
};

function particles(){
const container=document.getElementById("particles");
if(!container)return;
for(let i=0;i<30;i++){
const p=document.createElement("div");
p.className="particle";
p.style.left=Math.random()*100+"%";
p.style.top=Math.random()*100+"%";
p.style.animationDelay=Math.random()*7+"s";
p.style.animationDuration=5+Math.random()*5+"s";
container.appendChild(p);
}
}

function character(name){
if(alex)alex.classList.remove("active");
if(mateo)mateo.classList.remove("active");
if(dani)dani.classList.remove("active");

if(name==="ALEX"&&alex)alex.classList.add("active");
if(name==="MATEO"&&mateo)mateo.classList.add("active");
if(name==="DANI"&&dani)dani.classList.add("active");
}

function locationScene(name,time){
if(locationText)locationText.textContent=name+" · "+time;
}

function typeText(text){
if(typingTimer){
clearInterval(typingTimer);
typingTimer=null;
}

typing=true;
dialogue.textContent="";

let i=0;

typingTimer=setInterval(()=>{
dialogue.textContent+=text.charAt(i);
i++;

if(i>=text.length){
clearInterval(typingTimer);
typingTimer=null;
typing=false;
}
},15);
}

function finishTyping(){
if(!typing)return false;

if(typingTimer){
clearInterval(typingTimer);
typingTimer=null;
}

if(scene[position])dialogue.textContent=scene[position][1];

typing=false;
return true;
}

function hidePhone(){
if(phone)phone.classList.remove("show");
}

function showPhonePost(){
if(!phone||!phoneScreen)return;

phoneScreen.innerHTML=`
<div class="phone-post">
<b>Tu publicación</b>
<div class="phone-comment">Mateo: ¿De verdad vas a subir eso?</div>
<div class="phone-comment">Lucas: JAJA.</div>
<div class="phone-comment">Mateo: Mejor bórralo.</div>
</div>
`;

phone.classList.add("show");
}

function showPhoneNotification(){
if(!phone||!phoneScreen)return;

phoneScreen.innerHTML=`
<div class="phone-notification">♡ Nueva notificación</div>
<div class="phone-post">Tienes nuevos comentarios.</div>
`;

phone.classList.add("show");
}

function showPhoneMessage(){
if(!phone||!phoneScreen)return;

phoneScreen.innerHTML=`
<div class="phone-post">
<b>Mensajes</b>
<div class="phone-message">Mateo: ¿Estás bien?</div>
</div>
`;

phone.classList.add("show");
}

function emotionText(text,good){
if(!emotion)return;

if(emotionTimer)clearTimeout(emotionTimer);

emotion.textContent=text;
emotion.style.color=good?"#baffdf":"#ffbddb";
emotion.classList.add("show");

emotionTimer=setTimeout(()=>{
emotion.classList.remove("show");
},2500);
}

function setNextAction(action){
nextAction=action;
next.style.display="block";
}

function play(data,onFinish=null){
scene=data;
position=0;
nextAction=onFinish;
choices.innerHTML="";
choices.style.display="none";
next.style.display="block";
render();
}

function render(){
if(position>=scene.length){
next.style.display="none";
if(nextAction){
const action=nextAction;
nextAction=null;
action();
}
return;
}

const item=scene[position];

speaker.textContent=item[0];
typeText(item[1]);
character(item[0]);

if(item[2])locationScene(item[2],item[3]||"10:24");

hidePhone();
}

function advance(){
if(finishTyping())return;

if(position<scene.length-1){
position++;
render();
}else{
position=scene.length;
render();
}
}

next.onclick=advance;

function choicesList(list){
choices.innerHTML="";
choices.style.display="flex";
next.style.display="none";

list.forEach(item=>{
const button=document.createElement("button");

button.className="choice";
button.textContent=item.text;

button.addEventListener("click",()=>{
choices.style.display="none";
item.action();
});

choices.appendChild(button);
});
}

function transitionTo(title,sub,callback){
if(transitionTitle)transitionTitle.textContent=title;
if(transitionSub)transitionSub.textContent=sub;

if(transition){
transition.classList.add("show");

setTimeout(()=>{
transition.classList.remove("show");

setTimeout(()=>{
callback();
},700);

},2200);
}else{
callback();
}
}

function start(){
state.act=1;
perspective.textContent="PERSPECTIVA · ALEX";

play([
["NARRADOR","Son las 8:10 de la mañana. El aula todavía está medio vacía.","AULA","08:10"],
["ALEX","Llegué temprano...","AULA","08:10"],
["NARRADOR","Alex deja la mochila sobre el pupitre y saca su cuaderno.","AULA","08:11"],
["NARRADOR","Su teléfono vibra sobre la mesa.","AULA","08:11"]
],()=>{
alexPhone();
});

if(phoneTimer)clearTimeout(phoneTimer);

phoneTimer=setTimeout(()=>{
showPhoneNotification();
},1500);
}

function alexPhone(){
play([
["ALEX","¿Quién está comentando?","AULA","08:11"],
["NARRADOR","Alex desbloquea el teléfono.","AULA","08:11"],
["NARRADOR","Hay una publicación suya con varios comentarios.","AULA","08:12"]
],()=>{
alexDecision();
});

if(phoneTimer)clearTimeout(phoneTimer);

phoneTimer=setTimeout(()=>{
showPhonePost();
},1200);
}

function alexDecision(){
choicesList([
{
text:"Responder al comentario",
action:()=>{
state.alexAnxiety++;
state.alexIsolation++;

emotionText("Defenderte cuando estás solo también puede cansarte.",false);

play([
["ALEX","¿Y cuál es el problema?","AULA","08:12"],
["NARRADOR","Alex pulsa enviar.","AULA","08:12"],
["NARRADOR","Los tres puntos aparecen.","AULA","08:13"],
["NARRADOR","Después desaparecen.","AULA","08:13"],
["ALEX","...","AULA","08:13"]
],alexClass);
}
},
{
text:"Cerrar los comentarios",
action:()=>{
state.alexAnxiety++;
state.alexIsolation++;

emotionText("Cerrar la pantalla no siempre consigue apagar lo que sientes.",false);

play([
["ALEX","No quiero leer más.","AULA","08:12"],
["NARRADOR","Alex bloquea el teléfono.","AULA","08:12"],
["NARRADOR","Lo deja boca abajo sobre el pupitre.","AULA","08:13"],
["NARRADOR","El profesor entra.","AULA","08:14"]
],alexClass);
}
}
]);
}

function alexClass(){
play([
["PROFESOR","Buenos días. Saquen sus cuadernos.","AULA","08:14"],
["NARRADOR","Alex intenta concentrarse.","AULA","08:20"],
["NARRADOR","Su teléfono vibra otra vez.","AULA","08:32"],
["ALEX","...","AULA","08:32"],
["NARRADOR","Alex no lo toca.","AULA","08:32"],
["NARRADOR","Al fondo del aula, alguien se ríe.","AULA","08:35"]
],alexRecess);
}

function alexRecess(){
play([
["NARRADOR","Suena el timbre del recreo.","PASILLO","10:15"],
["NARRADOR","Los estudiantes salen al pasillo.","PASILLO","10:16"],
["ALEX","Voy en un minuto.","PASILLO","10:16"],
["NARRADOR","Alex se queda solo.","PASILLO","10:17"]
],alexRecessDecision);

if(phoneTimer)clearTimeout(phoneTimer);

phoneTimer=setTimeout(()=>{
if(phoneScreen){
phoneScreen.innerHTML=`
<div class="phone-notification">♡ Nuevo comentario</div>
<div class="phone-post">Lucas: ¿Todavía sigues con eso?</div>
`;
}
if(phone)phone.classList.add("show");
},1200);
}

function alexRecessDecision(){
choicesList([
{
text:"Abrir el comentario",
action:()=>{
state.alexIsolation++;

emotionText("A veces mirar una vez más solo hace que duela otra vez.",false);

play([
["ALEX","...","PASILLO","10:18"],
["NARRADOR","Alex abre el comentario.","PASILLO","10:18"],
["NARRADOR","Escribe una respuesta.","PASILLO","10:19"],
["NARRADOR","Se detiene.","PASILLO","10:19"],
["NARRADOR","Borra todo.","PASILLO","10:20"],
["ALEX","Quiero irme.","PASILLO","10:20"]
],alexEnd);
}
},
{
text:"Guardar el teléfono",
action:()=>{
state.support++;

emotionText("No tienes que enfrentarte a todo en un solo momento.",true);

play([
["ALEX","Después.","PASILLO","10:18"],
["NARRADOR","Alex guarda el teléfono.","PASILLO","10:18"],
["NARRADOR","Respira lentamente.","PASILLO","10:19"],
["NARRADOR","Después se levanta y vuelve al aula.","PASILLO","10:20"]
],alexEnd);
}
}
]);
}

function alexEnd(){
play([
["NARRADOR","Las clases terminan.","SALIDA","15:30"],
["NARRADOR","Alex recoge su mochila.","SALIDA","15:31"],
["NARRADOR","Antes de salir, mira el teléfono.","SALIDA","15:31"],
["NARRADOR","La pantalla se ilumina.","SALIDA","15:31"],
["ALEX","...","SALIDA","15:32"],
["NARRADOR","Alex apaga el teléfono.","SALIDA","15:32"]
],()=>{
transitionTo("EL MISMO DÍA","PERSPECTIVA · MATEO",mateoStart);
});
}

function mateoStart(){
state.act=2;

if(perspective)perspective.textContent="PERSPECTIVA · MATEO";

play([
["NARRADOR","La misma mañana.","AULA","08:10"],
["NARRADOR","El mismo salón.","AULA","08:11"],
["NARRADOR","La misma publicación.","AULA","08:12"],
["MATEO","Solo era una broma.","AULA","08:12"],
["NARRADOR","Mateo mira los comentarios que escribió.","AULA","08:12"]
],mateoDecision);

if(phoneTimer)clearTimeout(phoneTimer);

phoneTimer=setTimeout(()=>{
showPhonePost();
},1000);
}

function mateoDecision(){
choicesList([
{
text:"Dar “me gusta”",
action:()=>{
state.mateoHarm++;

emotionText("Un clic puede parecer pequeño desde tu pantalla.",false);

play([
["MATEO","JAJA.","AULA","08:12"],
["NARRADOR","Mateo pulsa el corazón.","AULA","08:12"],
["NARRADOR","El corazón se ilumina.","AULA","08:12"],
["MATEO","Da igual.","AULA","08:13"]
],mateoClass);
}
},
{
text:"Seguir de largo",
action:()=>{
state.mateoEmpathy++;

emotionText("No sumarte también es una decisión.",true);

play([
["MATEO","No es asunto mío.","AULA","08:12"],
["NARRADOR","Mateo cierra la publicación.","AULA","08:12"],
["NARRADOR","Antes de bloquear el teléfono vuelve a mirar el nombre de Alex.","AULA","08:13"]
],mateoClass);
}
},
{
text:"Defender a Alex",
action:()=>{
state.mateoEmpathy+=2;
state.defended=true;

emotionText("Una voz puede cambiar el ambiente de una conversación.",true);

play([
["MATEO","Ya basta.","AULA","08:12"],
["MATEO","No hace falta meterse con él.","AULA","08:12"],
["NARRADOR","Mateo pulsa enviar.","AULA","08:13"],
["NARRADOR","Los demás dejan de escribir durante unos segundos.","AULA","08:13"]
],mateoClass);
}
}
]);
}

function mateoClass(){
play([
["NARRADOR","El profesor entra en el aula.","AULA","08:14"],
["PROFESOR","Guarden los teléfonos.","AULA","08:14"],
["NARRADOR","Mateo guarda el suyo.","AULA","08:15"],
["NARRADOR","Mira hacia Alex.","AULA","08:15"],
["MATEO","...","AULA","08:15"]
],mateoRecess);
}

function mateoRecess(){
play([
["NARRADOR","Llega el recreo.","PASILLO","10:15"],
["NARRADOR","Mateo sale al pasillo.","PASILLO","10:16"],
["NARRADOR","Alex está sentado solo.","PASILLO","10:17"],
["NARRADOR","Mateo mira su teléfono.","PASILLO","10:17"]
],mateoMessage);
}

function mateoMessage(){
choicesList([
{
text:"Enviar un mensaje privado",
action:()=>{
state.message=true;
state.mateoEmpathy++;
state.support++;

emotionText("A veces un “¿estás bien?” es suficiente para empezar.",true);

play([
["MATEO","¿Estás bien?","PASILLO","10:18"],
["NARRADOR","Mateo pulsa enviar.","PASILLO","10:18"],
["NARRADOR","Tres puntos aparecen.","PASILLO","10:19"],
["NARRADOR","Alex está escribiendo.","PASILLO","10:19"]
],alexReply);

if(phoneTimer)clearTimeout(phoneTimer);

phoneTimer=setTimeout(()=>{
showPhoneMessage();
},700);
}
},
{
text:"Guardar el teléfono",
action:()=>{
state.mateoHarm++;

emotionText("Lo que decides no hacer también forma parte de la historia.",false);

play([
["MATEO","Mejor no.","PASILLO","10:18"],
["NARRADOR","Mateo guarda el teléfono.","PASILLO","10:18"],
["NARRADOR","Alex permanece sentado.","PASILLO","10:19"],
["NARRADOR","Mateo se marcha con sus amigos.","PASILLO","10:20"]
],finalScene);
}
}
]);
}

function alexReply(){
play([
["ALEX","Sí...","PASILLO","10:19"],
["ALEX","Gracias.","PASILLO","10:19"],
["NARRADOR","Alex mira el mensaje durante unos segundos.","PASILLO","10:20"],
["NARRADOR","Después guarda el teléfono.","PASILLO","10:20"]
],finalScene);
}

function finalScene(){
play([
["NARRADOR","El último timbre suena.","SALIDA","15:30"],
["NARRADOR","Los estudiantes empiezan a salir.","SALIDA","15:31"],
["NARRADOR","Alex y Mateo coinciden en el pasillo.","SALIDA","15:32"],
["MATEO","...","SALIDA","15:32"],
["ALEX","...","SALIDA","15:32"]
],finalResult);
}

function finalResult(){
if(state.defended&&state.message){
play([
["MATEO","¿Nos vemos mañana?","SALIDA","15:33"],
["ALEX","Sí.","SALIDA","15:33"],
["NARRADOR","Alex sonríe ligeramente.","SALIDA","15:34"],
["NARRADOR","Los dos continúan por el pasillo.","SALIDA","15:34"],
["NARRADOR","El teléfono de Alex vibra.","SALIDA","15:35"],
["NARRADOR","Esta vez, Alex mira la pantalla sin apartarla.","SALIDA","15:35"]
]);

emotionText("Una pequeña acción puede hacer que alguien se sienta acompañado.",true);

setTimeout(()=>{
showEndButton();
},3500);

return;
}

if(state.mateoEmpathy>0){
play([
["MATEO","Oye...","SALIDA","15:33"],
["ALEX","¿Sí?","SALIDA","15:33"],
["MATEO","Nada.","SALIDA","15:33"],
["NARRADOR","Alex asiente.","SALIDA","15:34"],
["NARRADOR","No todo cambió.","SALIDA","15:34"],
["NARRADOR","Pero algo fue diferente.","SALIDA","15:34"]
]);

emotionText("Cambiar una decisión puede cambiar lo que ocurre después.",true);

setTimeout(()=>{
showEndButton();
},3500);

return;
}

play([
["NARRADOR","Alex baja la mirada.","SALIDA","15:33"],
["NARRADOR","Se pone los auriculares.","SALIDA","15:33"],
["NARRADOR","Pasa junto a Mateo sin decir nada.","SALIDA","15:34"],
["MATEO","...","SALIDA","15:34"],
["NARRADOR","Mateo mira su teléfono.","SALIDA","15:35"],
["NARRADOR","La publicación sigue ahí.","SALIDA","15:35"]
]);

emotionText("Una acción pequeña puede dejar una huella mucho más grande.",false);

setTimeout(()=>{
showEndButton();
},3500);
}

function showEndButton(){
next.textContent="↻ VOLVER A JUGAR";
next.style.display="block";

next.onclick=()=>{
location.reload();
};
}

particles();
start();
