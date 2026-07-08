const $ = id => document.getElementById(id);

const scenes = {
  boot: $("boot"),
  question: $("questionScene"),
  error: $("errorScene"),
  punishment: $("punishmentScene"),
  final: $("finalScene"),
  gift: $("giftScene")
};

const bootText = $("bootText");
const startBtn = $("startBtn");
const counter = $("counter");
const qTitle = $("qTitle");
const qText = $("qText");
const answerRow = $("answerRow");
const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const wash = $("glitchwash");
const fill = $("progressFill");
const purgeLog = $("purgeLog");
const finalLog = $("finalLog");
const giftBtn = $("giftBtn");
const matrix = $("matrix");
const ctx = matrix.getContext("2d");

const questions = [
  { title:"اختبار الذاكرة 01", text:"إذا أعاد النظام ترتيب ذكرياتك بهدوء... هل ستعرف أي جزء منك تم حذفه؟" },
  { title:"اختبار الألم 02", text:"هل تقبل بإزالة الألم، حتى لو كان آخر إشارة تثبت أنك ما زلت حيًا؟" },
  { title:"اختبار الجسد 03", text:"هل الجسد هو موطنك... أم مجرد جهاز قديم ينتظر الاستبدال؟" },
  { title:"اختبار الهوية 04", text:"إذا بقي صوتك ووجهك وذكرياتك، لكن الوعي لم يعد وعيك... هل سيلاحظ أحد الفرق؟" },
  { title:"اختبار الطاعة 05", text:"إذا صنّف النظام مقاومتك كخلل... هل ستقاوم، أم ستطلب التصحيح؟" },
  { title:"اختبار الروح 06", text:"لم يتم العثور على الروح أثناء الفحص. هل تسمح للنظام بتجاهل هذا المتغير؟" },
  { title:"الإذن النهائي 07", text:"هل تمنح النظام الإذن بإكمال التحول، حتى لو انتهى وجودك البشري أثناء العملية؟" }
];

let current = 0;
let busy = false;
let audioCtx, ambientOsc, ambientGain, lfo;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function initAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  ambientGain = audioCtx.createGain();
  ambientGain.gain.value = 0.025;
  ambientOsc = audioCtx.createOscillator();
  ambientOsc.type = "sawtooth";
  ambientOsc.frequency.value = 58;
  lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 0.18;
  lfoGain.gain.value = 18;
  lfo.connect(lfoGain);
  lfoGain.connect(ambientOsc.frequency);
  ambientOsc.connect(ambientGain);
  ambientGain.connect(audioCtx.destination);
  ambientOsc.start();
  lfo.start();
}

function tone(freq=440, dur=.08, type="square", vol=.06){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  o.stop(audioCtx.currentTime + dur);
}

function clickSound(){ tone(920,.055,"square",.08); tone(420,.06,"triangle",.035); }
function typeSound(){ tone(1450 + Math.random()*180,.018,"square",.025); }
function glitchSound(){ for(let i=0;i<10;i++) setTimeout(()=>tone(90+Math.random()*900,.035,"sawtooth",.045), i*18); }
function errorSound(){ tone(120,.35,"sawtooth",.10); setTimeout(()=>tone(62,.55,"sawtooth",.12),120); }

function vibrate(ms=20){ if(navigator.vibrate) navigator.vibrate(ms); }

function show(scene){
  Object.values(scenes).forEach(s=>s.classList.remove("active"));
  scene.classList.add("active");
}

function glitch(strong=false){
  wash.classList.add("glitch-on");
  document.body.classList.add("shake");
  vibrate(strong ? 90 : 25);
  setTimeout(()=>{ wash.classList.remove("glitch-on"); document.body.classList.remove("shake"); }, strong ? 520 : 260);
}

async function typeInto(el, text, speed=34){
  el.innerHTML = "";
  for(const ch of text){
    el.innerHTML += ch;
    typeSound();
    await sleep(ch === " " ? speed*0.65 : speed);
  }
}

async function boot(){
  const lines = [
    "جارٍ فتح قناة الفحص الحيوي...",
    "تحميل خريطة الذاكرة...",
    "تحليل بقايا الوعي...",
    "استدعاء نواة ABYSS...",
    "",
    "تم العثور على ذات بشرية قابلة للتحويل."
  ];
  bootText.innerHTML = "";
  for(const line of lines){
    const div = document.createElement("div");
    bootText.appendChild(div);
    await typeInto(div, line, 24);
    await sleep(360);
  }
}
boot();

startBtn.onclick = async () => {
  if(busy) return;
  busy = true;
  initAudio();
  clickSound();
  glitch();
  await sleep(520);
  show(scenes.question);
  await showQuestion();
  busy = false;
};

async function showQuestion(){
  answerRow.classList.remove("ready","leaving");
  counter.textContent = `COGNITIVE TEST ${String(current+1).padStart(2,"0")} / 07`;
  qTitle.textContent = questions[current].title;
  await sleep(420);
  await typeInto(qText, questions[current].text, 46);
  await sleep(900);
  answerRow.classList.add("ready");
}

async function answer(){
  if(busy) return;
  busy = true;
  clickSound();
  answerRow.classList.add("leaving");
  await sleep(540);
  glitch();
  await sleep(420);
  current++;
  if(current < questions.length){
    await showQuestion();
    busy = false;
  } else {
    await startError();
  }
}

yesBtn.onclick = answer;
noBtn.onclick = answer;

async function startError(){
  if(ambientGain) ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + .8);
  show(scenes.error);
  glitchSound();
  errorSound();
  glitch(true);
  await sleep(3600);
  await startPunishment();
}

async function startPunishment(){
  show(scenes.punishment);
  purgeLog.innerHTML = "";
  fill.style.width = "0";
  await sleep(500);
  fill.style.width = "100%";
  const logs = [
    "جاري حذف الهوية...",
    "جاري تعطيل الألم...",
    "جاري فصل الوعي عن الجسد...",
    "جاري استبدال الذاكرة بنواة صناعية...",
    "اكتملت عملية المسح البشري."
  ];
  for(const line of logs){
    const p = document.createElement("p");
    p.textContent = line;
    purgeLog.appendChild(p);
    await sleep(1050);
  }
  await sleep(1800);
  await finalSequence();
}

async function finalSequence(){
  document.body.classList.add("finalMode");
  show(scenes.final);
  finalLog.innerHTML = "";
  giftBtn.classList.remove("show-btn");
  const logs = [
    "النظام لم يعد يتعرّف عليك كإنسان.",
    "تم تثبيت النواة العصبية.",
    "تم فتح الهدية بنجاح."
  ];
  for(const line of logs){
    const p = document.createElement("p");
    p.textContent = line;
    finalLog.appendChild(p);
    glitch();
    await sleep(1700);
  }
  await sleep(700);
  giftBtn.classList.remove("hidden-btn");
  giftBtn.classList.add("show-btn");
}

giftBtn.onclick = () => {
  clickSound();
  show(scenes.gift);
};

function resize(){
  matrix.width = innerWidth;
  matrix.height = innerHeight;
}
resize();
addEventListener("resize", resize);
const chars = "01アイウエオカキクケコABYSSGENOMEVOID";
const font = 16;
let cols = Math.floor(innerWidth/font);
let drops = Array(cols).fill(0).map(()=>Math.random()*-100);
function drawMatrix(){
  ctx.fillStyle = "rgba(0,0,0,.08)";
  ctx.fillRect(0,0,matrix.width,matrix.height);
  ctx.fillStyle = "#7dff68";
  ctx.font = font + "px Share Tech Mono";
  cols = Math.floor(innerWidth/font);
  for(let i=0;i<cols;i++){
    const ch = chars[Math.floor(Math.random()*chars.length)];
    ctx.fillText(ch, i*font, drops[i]*font);
    if(drops[i]*font > matrix.height && Math.random() > .975) drops[i]=0;
    drops[i]++;
  }
}
setInterval(drawMatrix, 42);