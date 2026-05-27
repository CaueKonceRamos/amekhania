const nameMap = {
  'lucas':'Quasar',
  'mateus':'Prisma',
  'reinan':'Vórtice',
  'marcelo':'Atlas',
  'beatriz':'Ametista',
  'wanderson':'Carvalho',
  'ygor':'Eco',
  'kaique':'Índigo',
  'neto':'Plutão'
};
const reserves = ['Neblina','Lúmen','Cifra','Órbita'];

// keep used generated names in localStorage to avoid repeats
const usedKey = 'amekhania_used_names';
function getUsed(){try{return JSON.parse(localStorage.getItem(usedKey)||'[]')}catch(e){return []}}
function addUsed(n){const u=getUsed();u.push(n);localStorage.setItem(usedKey,JSON.stringify(u))}

// small utilities (ensure available)
function delay(ms){return new Promise(r=>setTimeout(r,ms))}

// normalize and identity generation
function normalizeName(n){return String(n||'').trim().toLowerCase().replace(/[^a-zà-ú\s-]/gi,'')}

function generateIdentity(real){
  const n = normalizeName(real);
  if(nameMap[n]) return nameMap[n];
  const used = getUsed();
  for(const r of reserves){ if(!used.includes(r)) return r }
  return 'Lúmen-'+Math.floor(Math.random()*900+100);
}

// helpers
const $ = s=>document.querySelector(s);
let screens = {};
let currentRealName = '';
let currentIdentity = '';

function showScreen(name){
  Object.values(screens).forEach(el=>{ if(el) el.classList.remove('active') });
  if(screens[name]) screens[name].classList.add('active');
}

async function typeText(target, text, speed=35){target.textContent='';
  const parts = text.split(/(\*\*[^*]+\*\*)|\n/).filter(Boolean);
  for(const part of parts){
    if(part.startsWith('**') && part.endsWith('**')){
      const inner = part.slice(2,-2);
      const el = document.createElement('span'); el.style.color='var(--accent)'; el.textContent=inner; target.appendChild(el);
      await delay(600);
      continue;
    }
    for(let i=0;i<part.length;i++){ target.textContent += part[i]; await delay(speed) }
    await delay(500);
  }
}

async function initApp(){
  screens = {enter:$('#screen-enter'), intro:$('#screen-intro'), choices:$('#screen-choices'), rules:$('#screen-rules')};

  const input = $('#name-input');
  if(input){ input.focus();
    input.addEventListener('keydown', async (e)=>{
      if(e.key === 'Enter'){
        const name = input.value.trim();
        if(!name){ await flashMessage('Você não deveria estar aqui.'); return }
        await proceedWithName(name);
      }
    });
  }

  // submit button (mobile-friendly)
  const submitBtn = $('#submit-btn');
  if(submitBtn){
    submitBtn.addEventListener('click', async ()=>{
      const name = input.value.trim();
      if(!name){ await flashMessage('Você não deveria estar aqui.'); return }
      try{ input.blur(); }catch(e){}
      await proceedWithName(name);
    });
  }

  // choices handlers
  const choiceButtons = document.querySelectorAll('.choices button');
  if(choiceButtons && choiceButtons.length){
    choiceButtons.forEach(btn=>btn.addEventListener('click', async (e)=>{
      const a = btn.getAttribute('data-action');
      showScreen('rules');
      // clear previous rules text
      const rulesContainer = $('#rules-text'); rulesContainer.innerHTML = '';
      const fragments = [
        'Você já estava na lista antes mesmo de entrar.',
        'Todos vocês estavam.',
        'Aqui… ninguém é confiável.',
        'Nem mesmo você.',
        'Amekhania é um jogo.',
        'Um jogo de mistério… assassinato… e dedução social.',
        'Sete jogadores entram.',
        'Nem todos sairão.',
        'O Faísca pode marcar um jogador interagindo com ele a cada rodada.',
        'A cada dois minutos, o Faísca pode trocar de lugar com outro jogador.',
        'Ao fim da rodada, todos ficam cegos e imobilizados.',
        'O jogador marcado pelo Faísca morre ao final da rodada.',
        'A morte é anunciada na tela de todos os jogadores.',
        'Existe o papel do Médico que pode marcar um jogador por rodada.',
        'O jogador marcado pelo Médico fica imune ao Faísca nessa rodada.',
        'Durante a reunião, o protegido é informado que sobreviveu à tentativa.',
        'Os jogadores estão em adventure mode e devem se comunicar usando placas.',
        'Os nomes são anônimos durante o jogo, mas aparecem nas reuniões.',
        'A cada rodada, os jogadores recebem uma flecha para disparar e revelar um nome.',
        'Cada rodada dura 7 minutos.',
        'O timer começa quando todos os jogadores estiverem na arena.',
        'O jogo termina quando o Faísca for eliminado ou quando restarem apenas 2 jogadores.',
    ];
      await showRulesFragments(fragments);
    }));
  }

  const enterGameBtn = $('#enter-game');
  if(enterGameBtn){
    enterGameBtn.addEventListener('click', ()=>{
      // reveal the final image with a slow fade-in overlay
      const img = $('#amekhania-image-wrap');
      if(img){ setTimeout(()=> img.classList.add('visible'), 60); }
      enterGameBtn.textContent = 'Aguarde...';
      setTimeout(()=>{ enterGameBtn.textContent = 'Entrar em Amekhania'; },1500);
    });
  }

  const resetBtn = $('#reset-game');
  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      const img = $('#amekhania-image-wrap');
      if(img){ img.classList.remove('visible'); }
      showScreen('enter');
      const input = $('#name-input');
      if(input){ input.value = ''; input.focus(); }
      const rulesText = $('#rules-text'); if(rulesText) rulesText.innerHTML = '';
      const reveal = $('#reveal'); if(reveal) reveal.textContent = '';
    });
  }
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();

async function flashMessage(msg){const el = $('#prompt'); const prev = el.textContent; el.textContent=''; await typeText(el,msg,30); await delay(1200); el.textContent=prev}

async function proceedWithName(name){
  // validation: only letters allowed (soft)
  const normalized = normalizeName(name);
  if(!normalized){ await flashMessage('Você não deveria estar aqui.'); return }
  // only allow names from the fixed mapping list for the role reveal flow
  const allowed = Object.keys(nameMap || {});
  if(!allowed.includes(normalized)){
    await flashMessage('Desculpe, não é o momento para você, ou use o seu nome real.');
    return;
  }
  currentRealName = normalizeName(name);
  // fade to intro
  showScreen('intro');
  const intro = $('#intro-text');
  const realLine = `Ah…\nÉ você…\nClaro.\nQuem mais seria?\n\nBem-vindo, ${name}.\n\nAqui… você não é mais isso.\n\nSeu novo nome é…\n`;
  await typeText(intro, introTextPrep(intro, realLine), 36);
  await delay(700);
  const identity = generateIdentity(name);
  currentIdentity = identity;
  const reveal = document.createElement('div'); reveal.className='mono'; reveal.style.marginTop='12px';
  intro.appendChild(reveal);
  await typeText(reveal, `**${identity}**\n`, 50);
  addUsed(identity);
  await delay(800);
  // move to choices
  showScreen('choices');
  $('#reveal').textContent = `Seu novo nome é ${identity}.`;
}

function introTextPrep(el, text){return text}

// show rules as fragments with progress and next button
async function showRulesFragments(fragments, autoAdvance=true){
  const container = $('#rules-text');
  const progress = $('#rules-progress');
  const nextBtn = $('#rules-next');
  // build progress dots
  progress.innerHTML = '';
  fragments.forEach(()=>{ const d=document.createElement('div'); d.className='dot'; progress.appendChild(d)});

  // ensure next button behavior
  let current = 0;
  nextBtn.style.display = 'none';
  function setActiveDot(i){ Array.from(progress.children).forEach((c,idx)=>{ c.classList.toggle('active', idx===i) }) }

  while(current < fragments.length){
    const frag = fragments[current];
    // show one fragment at a time
    container.innerHTML = '';
    const line = document.createElement('div'); line.className='dialog-line'; container.appendChild(line);
    await typeText(line, frag, 36);
    setActiveDot(current);
    current++;
    // show next button briefly
    if(current < fragments.length){
      nextBtn.style.display = 'inline-block';
      // wait for user click or auto-advance (slower)
      await waitForNext(nextBtn, autoAdvance ? 3000 : 999999);
      nextBtn.style.display = 'none';
    }
  }
  // finished
  nextBtn.style.display = 'none';
  // after fragments, possibly reveal role-specific message, then date, then controls
  await revealRoleIfSpecial();
  // show date for all
  container.innerHTML = '';
  const dateLine = document.createElement('div'); dateLine.className='dialog-line'; container.appendChild(dateLine);
  await typeText(dateLine, 'Junho de 2026', 40);
  await finalizeRulesDisplay();
}

function waitForNext(btn, timeout){
  return new Promise(resolve=>{
    let done = false;
    const onClick = ()=>{ if(done) return; done=true; btn.removeEventListener('click', onClick); clearTimeout(t); resolve(); };
    btn.addEventListener('click', onClick);
    const t = setTimeout(()=>{ if(done) return; done=true; btn.removeEventListener('click', onClick); resolve(); }, timeout);
  })
}

// Reveal special role if the player's real name matches
async function revealRoleIfSpecial(){
  const container = $('#rules-text');
  // only Mateus -> Faísca, Beatriz -> Médico
  if(!currentRealName) return;
  if(currentRealName === 'mateus'){
    container.innerHTML = '';
    const a = document.createElement('div'); a.className='dialog-line'; container.appendChild(a);
    await typeText(a, 'e a.....por sinal,', 40);
    await delay(600);
    const b = document.createElement('div'); b.className='dialog-line'; container.appendChild(b);
    // type prefix then colored role
    await typeText(b, 'você é o ', 36);
    const roleSpan = document.createElement('span'); roleSpan.textContent = 'Faísca'; roleSpan.style.color = '#ff5c5c'; roleSpan.style.fontWeight = '600'; b.appendChild(roleSpan);
    await delay(800);
  } else if(currentRealName === 'beatriz'){
    container.innerHTML = '';
    const a = document.createElement('div'); a.className='dialog-line'; container.appendChild(a);
    await typeText(a, 'e a.....por sinal,', 40);
    await delay(600);
    const b = document.createElement('div'); b.className='dialog-line'; container.appendChild(b);
    await typeText(b, 'você é o ', 36);
    const roleSpan = document.createElement('span'); roleSpan.textContent = 'Médico'; roleSpan.style.color = '#4da6ff'; roleSpan.style.fontWeight = '600'; b.appendChild(roleSpan);
    await delay(800);
  }
}

// after finishing fragments, reveal video link and enable enter
async function finalizeRulesDisplay(){
  const link = $('#rules-video-link'); if(link) link.style.display = 'inline-block';
  const enterBtn = $('#enter-game'); if(enterBtn) enterBtn.style.display = 'inline-block';
}

// Audio setup: global audio context, subtle static and heartbeat, and button blips
let audioCtx = null;
let masterGain = null;
let ambientNodes = [];

function initAudioContext(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain(); masterGain.gain.value = 0.02; masterGain.connect(audioCtx.destination);
}

function startAmbient(){
  try{
    initAudioContext();
    // create looped subtle static noise
    const bufferSize = audioCtx.sampleRate * 1.5; // 1.5s buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * 0.12 }
      const src = audioCtx.createBufferSource(); src.buffer = buffer; src.loop = true;
      const noiseGain = audioCtx.createGain(); noiseGain.gain.value = 0.0065;
    const hp = audioCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400; // reduce low rumble
    src.connect(hp); hp.connect(noiseGain); noiseGain.connect(masterGain);
    src.start(); ambientNodes.push(src);

    // subtle low heartbeat oscillator
    const hb = audioCtx.createOscillator(); hb.type = 'sine'; hb.frequency.value = 38;
    const hbGain = audioCtx.createGain(); hbGain.gain.value = 0.0009; hb.connect(hbGain); hbGain.connect(masterGain); hb.start(); ambientNodes.push(hb);

    // occasional static zap (short crack) scheduled randomly
    function scheduleZap(){
      const t = 2000 + Math.random()*8000; // 2-10s
      setTimeout(()=>{
        try{
          const zapBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.06, audioCtx.sampleRate);
          const zd = zapBuf.getChannelData(0);
          for(let i=0;i<zd.length;i++){ zd[i] = (Math.random()*2-1) * (1 - i/zd.length) * 0.6 }
          const zs = audioCtx.createBufferSource(); zs.buffer = zapBuf;
          const zFilt = audioCtx.createBiquadFilter(); zFilt.type='bandpass'; zFilt.frequency.value = 1200 + Math.random()*800;
          const zg = audioCtx.createGain(); zg.gain.value = 0.008;
          zs.connect(zFilt); zFilt.connect(zg); zg.connect(masterGain);
          zs.start();
        }catch(e){ }
        scheduleZap();
      }, t);
    }
    scheduleZap();
  }catch(e){ console.warn('audio not available', e) }
}

// play a short button blip
function playButtonSound(){
  try{
    initAudioContext();
    const o = audioCtx.createOscillator(); o.type = 'square'; o.frequency.value = 1000 + Math.random()*300;
    const g = audioCtx.createGain(); g.gain.value = 0.00001;
    o.connect(g); g.connect(masterGain);
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(0.00001, now);
    g.gain.exponentialRampToValueAtTime(0.004, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.00001, now + 0.12);
    o.start(now); o.stop(now + 0.13);
  }catch(e){ }
}

// attach button blip to pointerdown for immediacy
function attachButtonSounds(){
  document.addEventListener('pointerdown', (ev)=>{
    if(ev.target.closest && ev.target.closest('button')) playButtonSound();
  }, {capture:true});
}

// start ambient after first user gesture (to allow audio autoplay)
document.addEventListener('click', function initAudio(){ startAmbient(); attachButtonSounds(); document.removeEventListener('click', initAudio); });
