const $=id=>document.getElementById(id);
const scenes={boot:$("bootScene"),q:$("questionScene"),e:$("errorScene"),p:$("punishScene"),f:$("finalScene"),g:$("giftScene")};
const bootText=$("bootText"), startBtn=$("startBtn"), counter=$("counter"), qTitle=$("qTitle"), qText=$("qText"), answers=$("answers"), yes=$("yesBtn"), no=$("noBtn"), glitchLayer=$("glitchLayer"), fill=$("fill"), purgeLog=$("purgeLog"), finalLog=$("finalLog"), giftBtn=$("giftBtn");
const questions=[
{title:"اختبار الذاكرة 01",text:"إذا أعاد النظام ترتيب ذكرياتك بهدوء... هل ستعرف أي جزء منك تم حذفه؟"},
{title:"اختبار الألم 02",text:"هل تقبل بإزالة الألم، حتى لو كان آخر إشارة تثبت أنك ما زلت حيًا؟"},
{title:"اختبار الجسد 03",text:"هل الجسد هو موطنك... أم مجرد جهاز قديم ينتظر الاستبدال؟"},
{title:"اختبار الهوية 04",text:"إذا بقي صوتك ووجهك وذكرياتك، لكن الوعي لم يعد وعيك... هل سيلاحظ أحد الفرق؟"},
{title:"اختبار الطاعة 05",text:"إذا صنّف النظام مقاومتك كخلل... هل ستقاوم، أم ستطلب التصحيح؟"},
{title:"اختبار الروح 06",text:"لم يتم العثور على الروح أثناء الفحص. هل تسمح للنظام بتجاهل هذا المتغير؟"},
{title:"الإذن النهائي 07",text:"هل تمنح النظام الإذن بإكمال التحول، حتى لو انتهى وجودك البشري أثناء العملية؟"}
];
let i=0,busy=false,audio,amb,ambGain;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function show(s){Object.values(scenes).forEach(x=>x.classList.remove("active"));s.classList.add("active")}
function initAudio(){if(audio)return;audio=new (window.AudioContext||window.webkitAudioContext)();amb=audio.createOscillator();amb.type="sawtooth";amb.frequency.value=52;ambGain=audio.createGain();ambGain.gain.value=.025;amb.connect(ambGain);ambGain.connect(audio.destination);amb.start()}
function tone(f,d=.06,t="square",v=.05){if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+d);o.stop(audio.currentTime+d)}
function click(){tone(920,.05,"square",.08);tone(440,.05,"triangle",.03)}
function key(){tone(1400+Math.random()*260,.018,"square",.02)}
function glitchSound(){for(let n=0;n<10;n++)setTimeout(()=>tone(80+Math.random()*900,.03,"sawtooth",.045),n*18)}
function errorSound(){tone(120,.35,"sawtooth",.11);setTimeout(()=>tone(62,.55,"sawtooth",.13),120)}
function vib(ms=20){if(navigator.vibrate)navigator.vibrate(ms)}
function glitch(strong=false){glitchLayer.classList.add("on");document.body.classList.add("shake");vib(strong?100:25);setTimeout(()=>{glitchLayer.classList.remove("on");document.body.classList.remove("shake")},strong?520:260)}
async function type(el,text,spd=42){el.innerHTML="";for(const ch of text){el.innerHTML+=ch;key();await sleep(ch===" "?spd*.55:spd)}}
async function boot(){for(const l of["جارٍ فتح قناة الفحص الحيوي...","تحميل خريطة الذاكرة...","تحليل بقايا الوعي...","استدعاء نواة ABYSS...","","تم العثور على ذات بشرية قابلة للتحويل."]){const d=document.createElement("div");bootText.appendChild(d);await type(d,l,25);await sleep(360)}}boot();
startBtn.onclick=async()=>{if(busy)return;busy=true;initAudio();click();glitch();await sleep(560);show(scenes.q);await showQ();busy=false}
async function showQ(){answers.classList.remove("ready","leaving");counter.textContent=`COGNITIVE TEST ${String(i+1).padStart(2,"0")} / 07`;qTitle.textContent=questions[i].title;await sleep(520);await type(qText,questions[i].text,54);await sleep(1100);answers.classList.add("ready")}
async function answer(){if(busy)return;busy=true;click();answers.classList.add("leaving");await sleep(620);glitch();await sleep(480);i++;if(i<questions.length){await showQ();busy=false}else await startError()}
yes.onclick=answer;no.onclick=answer;
async function startError(){if(ambGain)ambGain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.8);show(scenes.e);glitchSound();errorSound();glitch(true);await sleep(3600);await punishment()}
async function punishment(){show(scenes.p);purgeLog.innerHTML="";fill.style.width="0";await sleep(500);fill.style.width="100%";for(const l of["جاري حذف الهوية...","جاري تعطيل الألم...","جاري فصل الوعي عن الجسد...","جاري استبدال الذاكرة بنواة صناعية...","اكتملت عملية المسح البشري."]){const p=document.createElement("p");p.textContent=l;purgeLog.appendChild(p);await sleep(1050)}await sleep(1700);await finalSeq()}
async function finalSeq(){show(scenes.f);finalLog.innerHTML="";giftBtn.classList.remove("show");for(const l of["النظام لم يعد يتعرّف عليك كإنسان.","تم تثبيت النواة العصبية.","تم فتح الهدية بنجاح."]){const p=document.createElement("p");p.textContent=l;finalLog.appendChild(p);glitch();await sleep(1700)}await sleep(700);giftBtn.classList.add("show")}
giftBtn.onclick=()=>{click();show(scenes.g)}
const c=$("rain"),ctx=c.getContext("2d");function resize(){c.width=innerWidth;c.height=innerHeight}resize();addEventListener("resize",resize);const chars="01VOIDGENOMEABYSSアイウエオカキクケコ";const fs=16;let drops=Array(Math.ceil(innerWidth/fs)).fill(0).map(()=>Math.random()*-80);setInterval(()=>{ctx.fillStyle="rgba(0,0,0,.08)";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#78ff61";ctx.font=fs+"px Share Tech Mono";for(let x=0;x<Math.ceil(innerWidth/fs);x++){ctx.fillText(chars[Math.floor(Math.random()*chars.length)],x*fs,drops[x]*fs);if(drops[x]*fs>c.height&&Math.random()>.975)drops[x]=0;drops[x]++}},42);