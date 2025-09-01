const instruments = ['kick', 'snare', 'hihat'];
const patternLibrary = [
  {
    name: 'Four on the Floor',
    tip: 'Classic dance beat heard in house and techno.',
    pattern: {
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14]
    }
  },
  {
    name: 'Rock Beat',
    tip: 'Standard rock groove for many songs.',
    pattern: {
      kick: [0, 8],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14]
    }
  },
  {
    name: 'Funk Groove',
    tip: 'Syncopated pattern with a funky feel.',
    pattern: {
      kick: [0, 7, 10, 12],
      snare: [4, 11],
      hihat: [0, 2, 5, 7, 8, 10, 13, 15]
    }
  }
];

const sequencerEl = document.getElementById('sequencer');
const patternSelect = document.getElementById('patternSelect');
const tipEl = document.getElementById('tip');
const savedList = document.getElementById('savedPatterns');

function initSelect(){
  patternLibrary.forEach(p=>{
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.name;
    patternSelect.appendChild(opt);
  });
  showTip(patternLibrary[0]);
}

function initSequencer(){
  instruments.forEach(inst=>{
    const row = document.createElement('div');
    row.className = 'row';
    for(let i=0;i<16;i++){
      const step = document.createElement('div');
      step.className='step';
      step.dataset.inst=inst;
      step.dataset.step=i;
      step.addEventListener('click',()=>step.classList.toggle('active'));
      row.appendChild(step);
    }
    sequencerEl.appendChild(row);
  });
}

function clearSequencer(){
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
}

function loadPattern(p){
  clearSequencer();
  instruments.forEach(inst=>{
    if(p.pattern[inst]){
      p.pattern[inst].forEach(i=>{
        const step = document.querySelector(`.step[data-inst="${inst}"][data-step="${i}"]`);
        if(step) step.classList.add('active');
      });
    }
  });
  showTip(p);
}

function getCurrentPattern(){
  const pat={kick:[],snare:[],hihat:[]};
  document.querySelectorAll('.step.active').forEach(step=>{
    pat[step.dataset.inst].push(parseInt(step.dataset.step));
  });
  return pat;
}

function showTip(p){
  tipEl.textContent = `${p.name}: ${p.tip}`;
}

function saveCurrent(){
  const name = prompt('Name this pattern');
  if(!name) return;
  const pat = getCurrentPattern();
  const stored = JSON.parse(localStorage.getItem('saved')||'[]');
  stored.push({name, pattern: pat});
  localStorage.setItem('saved', JSON.stringify(stored));
  renderSaved();
}

function renderSaved(){
  savedList.innerHTML='';
  const stored = JSON.parse(localStorage.getItem('saved')||'[]');
  stored.forEach((p,idx)=>{
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent=p.name;
    btn.addEventListener('click',()=>loadPattern(p));
    li.appendChild(btn);
    savedList.appendChild(li);
  });
}

// Audio setup
const synths = {
  kick: new Tone.MembraneSynth().toDestination(),
  snare: new Tone.NoiseSynth({noise:{type:'white'}}).toDestination(),
  hihat: new Tone.MetalSynth({frequency:200, envelope:{decay:0.1}}).toDestination()
};

let currentStep = 0;
Tone.Transport.scheduleRepeat(time=>{
  instruments.forEach(inst=>{
    const stepEl = document.querySelector(`.step[data-inst="${inst}"][data-step="${currentStep}"]`);
    if(stepEl && stepEl.classList.contains('active')){
      const synth = synths[inst];
      synth.triggerAttackRelease('C2', '8n', time);
    }
  });
  currentStep = (currentStep+1)%16;
}, '16n');

// Controls
 document.getElementById('start').addEventListener('click', async ()=>{
  await Tone.start();
  currentStep = 0;
  Tone.Transport.start();
});

 document.getElementById('stop').addEventListener('click', ()=>{
  Tone.Transport.stop();
});

 document.getElementById('loadPattern').addEventListener('click', ()=>{
  const name = patternSelect.value;
  const p = patternLibrary.find(pl=>pl.name===name);
  if(p) loadPattern(p);
});

document.getElementById('savePattern').addEventListener('click', saveCurrent);

// Init
initSelect();
initSequencer();
renderSaved();
