// PROTOTYPE - NOT FOR PRODUCTION (v4 - Mobile QA Fix)
// Question: Is slot-based tower placement + wave defense fun on mobile landscape?
// Date: 2026-03-26

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// ── Responsive Canvas (accounts for right panel 72px) ──
const W = 960, H = 540;
const RIGHT_PANEL_W = 72;
let canvasScale = { x: 1, y: 1 };
let canvasOffset = { x: 0, y: 0 };

let currentDpr = 1;
let currentUniformScale = 1;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  currentDpr = dpr;
  const cw = window.innerWidth - RIGHT_PANEL_W;
  const ch = window.innerHeight;

  // Aspect-ratio-preserving uniform scale with letterbox
  const scaleX = cw / W;
  const scaleY = ch / H;
  const uniformScale = Math.min(scaleX, scaleY);
  currentUniformScale = uniformScale;
  const drawW = W * uniformScale;
  const drawH = H * uniformScale;
  const offsetX = (cw - drawW) / 2;
  const offsetY = (ch - drawH) / 2;

  // Buffer at full game resolution * dpr, CSS scales to display size
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = drawW + 'px';
  canvas.style.height = drawH + 'px';
  canvas.style.left = offsetX + 'px';
  canvas.style.top = offsetY + 'px';

  canvasScale = { x: W / drawW, y: H / drawH };
  canvasOffset = { x: offsetX, y: offsetY };

  // DPR-only transform (game draws in 960x540 world coords, CSS handles display scaling)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 200));
resizeCanvas();

// ── Input deduplication (prevent both click + touchend firing) ──
let isTouchDevice = false;

// ── Pixel Drawing Helpers ──
const PIX = 3;

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

function drawPixelSprite(cx, cy, pixels, scale) {
  const s = scale || PIX;
  const halfW = (pixels[0].length * s) / 2;
  const halfH = (pixels.length * s) / 2;
  for (let r = 0; r < pixels.length; r++) {
    for (let c = 0; c < pixels[r].length; c++) {
      if (pixels[r][c]) {
        ctx.fillStyle = pixels[r][c];
        ctx.fillRect(Math.floor(cx - halfW + c * s), Math.floor(cy - halfH + r * s), s, s);
      }
    }
  }
}

// ── Pixel Sprite Data ──
const SPRITES = {
  musa: [
    [0,0,'#c41e3a',0,0],
    [0,'#fdd','#c41e3a','#fdd',0],
    [0,'#fdd','#c41e3a','#fdd',0],
    ['#888','#c41e3a','#c41e3a','#c41e3a','#888'],
    [0,0,'#c41e3a',0,0],
    [0,'#c41e3a',0,'#c41e3a',0],
    [0,'#555',0,'#555',0],
  ],
  gungsu: [
    [0,'#3a5','#3a5','#3a5',0],
    [0,'#fdd','#3a5','#fdd',0],
    [0,'#fdd','#3a5','#fdd',0],
    [0,'#3a5','#3a5','#3a5','#864'],
    [0,0,'#3a5',0,'#864'],
    [0,'#3a5',0,'#3a5',0],
    [0,'#555',0,'#555',0],
  ],
  dosa: [
    [0,'#93f','#93f','#93f',0],
    [0,'#fdd','#93f','#fdd',0],
    ['#93f','#fdd','#93f','#fdd','#93f'],
    [0,'#93f','#93f','#93f',0],
    [0,'#60f','#93f','#60f',0],
    [0,'#93f',0,'#93f',0],
    [0,'#555',0,'#555',0],
  ],
  mugnyeo: [
    ['#f8c','#f8c','#f8c','#f8c','#f8c'],
    [0,'#fdd','#f8c','#fdd',0],
    [0,'#fdd','#f8c','#fdd',0],
    [0,'#f8c','#fff','#f8c',0],
    [0,'#f8c','#fff','#f8c',0],
    [0,'#f8c','#fff','#f8c',0],
    [0,'#555',0,'#555',0],
  ],
  goblin: [
    [0,'#4a4',0,'#4a4',0],
    [0,'#4a4','#4a4','#4a4',0],
    ['#f00','#4a4','#4a4','#4a4','#f00'],
    [0,'#4a4','#4a4','#4a4',0],
    [0,0,'#4a4',0,0],
    [0,'#4a4',0,'#4a4',0],
  ],
  wolf: [
    [0,'#875',0,0,0],
    ['#875','#875','#875','#875',0],
    ['#a97','#875','#fff','#875','#875'],
    [0,'#875','#875','#875',0],
    ['#875',0,'#875',0,'#875'],
  ],
  ghost: [
    [0,'#aad','#aad','#aad',0],
    ['#aad','#226','#aad','#226','#aad'],
    ['#aad','#aad','#aad','#aad','#aad'],
    ['#88b','#aad','#aad','#aad','#88b'],
    ['#88b',0,'#88b',0,'#88b'],
  ],
  ogre: [
    ['#a33','#a33','#a33','#a33','#a33'],
    ['#a33','#ff0','#a33','#ff0','#a33'],
    ['#c44','#a33','#a33','#a33','#c44'],
    ['#a33','#a33','#a33','#a33','#a33'],
    [0,'#a33',0,'#a33',0],
    ['#a33','#666',0,'#666','#a33'],
  ],
  boss: [
    ['#f00','#811','#f00','#811','#f00'],
    ['#811','#ff0','#f00','#ff0','#811'],
    ['#a22','#811','#f00','#811','#a22'],
    ['#f00','#811','#f00','#811','#f00'],
    ['#811','#f00','#f00','#f00','#811'],
    [0,'#811','#f00','#811',0],
    ['#811','#444','#811','#444','#811'],
  ],
  bat: [
    ['#636',0,0,0,'#636'],
    ['#636','#636',0,'#636','#636'],
    [0,'#636','#f00','#636',0],
    [0,0,'#636',0,0],
  ],
  shaman: [
    [0,'#0a8','#0a8','#0a8',0],
    [0,'#f00','#0a8','#f00',0],
    ['#0a8','#0a8','#0a8','#0a8','#0a8'],
    [0,'#0a8','#0a8','#0a8',0],
    [0,'#0a8',0,'#0a8',0],
    [0,'#555',0,'#555',0],
  ],
  tree: [
    [0,0,'#2a5',0,0],
    [0,'#2a5','#3b6','#2a5',0],
    ['#2a5','#3b6','#3b6','#3b6','#2a5'],
    [0,'#2a5','#3b6','#2a5',0],
    [0,0,'#642',0,0],
    [0,0,'#642',0,0],
  ],
  rock: [
    [0,'#666','#777',0],
    ['#555','#777','#888','#666'],
    ['#666','#888','#777','#555'],
  ],
  house: [
    [0,0,'#a33',0,0],
    [0,'#a33','#a33','#a33',0],
    ['#a33','#a33','#a33','#a33','#a33'],
    ['#864','#864','#542','#864','#864'],
    ['#864','#864','#542','#864','#864'],
  ],
};

// ── Game State ──
const state = {
  gold: 150,
  lives: 20,
  wave: 0,
  kills: 0,
  totalWaves: 8,
  phase: 'placement',
  selectedHeroType: null,
  selectedTowerIdx: null,
  enemies: [],
  towers: [],
  projectiles: [],
  particles: [],
  floatingTexts: [],
  screenShake: { x: 0, y: 0, intensity: 0 },
  combo: { count: 0, timer: 0 },
  waveTimer: 0,
  spawnQueue: [],
  skillCooldowns: {},
  gameTime: 0,
  speedMult: 1,
  totalDamageDealt: 0,
  environmentObjects: [],
  fog: [],
};

// ── Path Definition (adjusted for 960x540) ──
const PATH = [
  { x: -30, y: 260 },
  { x: 100, y: 260 },
  { x: 100, y: 120 },
  { x: 280, y: 120 },
  { x: 280, y: 380 },
  { x: 460, y: 380 },
  { x: 460, y: 170 },
  { x: 640, y: 170 },
  { x: 640, y: 400 },
  { x: 790, y: 400 },
  { x: 790, y: 260 },
  { x: 920, y: 260 },
];

// ── Tower Slots (rightmost slots pulled in so they don't go under panel) ──
const SLOT_TOUCH_RADIUS = 36;
const SLOTS = [
  { x: 50,  y: 190, tower: null, terrain: 'normal' },
  { x: 190, y: 70,  tower: null, terrain: 'high' },
  { x: 190, y: 260, tower: null, terrain: 'normal' },
  { x: 370, y: 250, tower: null, terrain: 'normal' },
  { x: 370, y: 440, tower: null, terrain: 'normal' },
  { x: 550, y: 280, tower: null, terrain: 'high' },
  { x: 550, y: 110, tower: null, terrain: 'normal' },
  { x: 700, y: 290, tower: null, terrain: 'normal' },
  { x: 700, y: 460, tower: null, terrain: 'normal' },
  { x: 780, y: 330, tower: null, terrain: 'high' },  // was 850, pulled in
];

// ── Hero Definitions ──
const HEROES = {
  musa: {
    name: '무사',
    icon: '⚔️',
    cost: 40,
    damage: 18,
    range: 85,
    attackSpeed: 0.9,
    color: '#e74c3c',
    type: 'melee',
    desc: '근접 고데미지 전사',
    sprite: 'musa',
    skill: { name: '질풍참', icon: '🌪️', cooldown: 10, effect: 'aoe_burst', desc: '주변 적 전체에 3배 데미지' },
    synergy: 'mugnyeo', synergyBonus: '공격력 +25%',
  },
  gungsu: {
    name: '궁수',
    icon: '🏹',
    cost: 30,
    damage: 12,
    range: 170,
    attackSpeed: 1.4,
    color: '#2ecc71',
    type: 'ranged',
    desc: '원거리 속사 딜러',
    sprite: 'gungsu',
    skill: { name: '만궁술', icon: '🎯', cooldown: 8, effect: 'rapid_fire', desc: '4초간 3배 공속' },
    synergy: 'dosa', synergyBonus: '사거리 +20%',
  },
  dosa: {
    name: '도사',
    icon: '🔮',
    cost: 50,
    damage: 10,
    range: 140,
    attackSpeed: 0.5,
    color: '#9b59b6',
    type: 'aoe',
    desc: '범위 마법 공격',
    sprite: 'dosa',
    skill: { name: '뇌전술', icon: '⚡', cooldown: 14, effect: 'lightning', desc: '5체인 번개 (4배 데미지)' },
    synergy: 'gungsu', synergyBonus: '범위 +30%',
  },
  mugnyeo: {
    name: '무녀',
    icon: '🌸',
    cost: 45,
    damage: 6,
    range: 130,
    attackSpeed: 0.6,
    color: '#f39c12',
    type: 'support',
    desc: '감속 + 인접 아군 버프',
    sprite: 'mugnyeo',
    skill: { name: '결계', icon: '🛡️', cooldown: 16, effect: 'barrier', desc: '5초간 전체 적 60% 감속' },
    synergy: 'musa', synergyBonus: '감속 효과 +40%',
  },
};

// ── Synergy Check ──
function checkSynergy(tower) {
  const hero = HEROES[tower.heroType];
  if (!hero.synergy) return false;
  return state.towers.some(t => {
    if (t === tower) return false;
    if (t.heroType !== hero.synergy) return false;
    const dx = t.x - tower.x, dy = t.y - tower.y;
    return Math.sqrt(dx * dx + dy * dy) < 180;
  });
}

// ── Wave Definitions (8 waves, escalating) ──
const WAVES = [
  {
    name: '도깨비 무리',
    enemies: [{ type: 'goblin', count: 8, interval: 1.0 }],
  },
  {
    name: '산짐승의 습격',
    enemies: [
      { type: 'goblin', count: 5, interval: 0.8 },
      { type: 'wolf', count: 5, interval: 0.7, delay: 4 },
    ],
  },
  {
    name: '원귀의 한',
    enemies: [
      { type: 'ghost', count: 8, interval: 0.9 },
      { type: 'bat', count: 4, interval: 1.2, delay: 3 },
    ],
  },
  {
    name: '혼돈의 물결',
    enemies: [
      { type: 'goblin', count: 10, interval: 0.4 },
      { type: 'wolf', count: 6, interval: 0.6, delay: 2 },
      { type: 'ghost', count: 4, interval: 0.8, delay: 5 },
    ],
  },
  {
    name: '산적 두목 등장',
    enemies: [
      { type: 'wolf', count: 8, interval: 0.5 },
      { type: 'ogre', count: 2, interval: 3, delay: 3 },
      { type: 'bat', count: 6, interval: 0.6, delay: 1 },
    ],
  },
  {
    name: '요술사의 군세',
    enemies: [
      { type: 'shaman', count: 4, interval: 2.0 },
      { type: 'ghost', count: 8, interval: 0.5, delay: 1 },
      { type: 'goblin', count: 12, interval: 0.3, delay: 4 },
    ],
  },
  {
    name: '어둠의 대군',
    enemies: [
      { type: 'ogre', count: 4, interval: 1.5 },
      { type: 'wolf', count: 10, interval: 0.4, delay: 2 },
      { type: 'shaman', count: 3, interval: 2.0, delay: 4 },
      { type: 'bat', count: 8, interval: 0.4, delay: 6 },
    ],
  },
  {
    name: '⚠ 대요괴 강림 ⚠',
    enemies: [
      { type: 'goblin', count: 8, interval: 0.3 },
      { type: 'ogre', count: 3, interval: 2.0, delay: 2 },
      { type: 'shaman', count: 3, interval: 1.5, delay: 4 },
      { type: 'boss', count: 1, interval: 0, delay: 8 },
      { type: 'bat', count: 10, interval: 0.3, delay: 9 },
    ],
  },
];

// ── Enemy Types ──
const ENEMY_TYPES = {
  goblin:  { name: '도깨비', hp: 45,  speed: 1.3, reward: 8,  color: '#55aa55', size: 12, sprite: 'goblin', flying: false },
  wolf:    { name: '산짐승', hp: 65,  speed: 2.0, reward: 12, color: '#aa8866', size: 13, sprite: 'wolf', flying: false },
  ghost:   { name: '원귀',   hp: 55,  speed: 1.1, reward: 15, color: '#aabbdd', size: 12, sprite: 'ghost', flying: false, phase: true },
  bat:     { name: '박쥐',   hp: 30,  speed: 2.5, reward: 10, color: '#996699', size: 10, sprite: 'bat', flying: true },
  ogre:    { name: '오우거', hp: 250, speed: 0.7, reward: 30, color: '#cc4444', size: 16, sprite: 'ogre', flying: false, armor: 3 },
  shaman:  { name: '요술사', hp: 80,  speed: 0.9, reward: 25, color: '#00aa88', size: 13, sprite: 'shaman', flying: false, healer: true },
  boss:    { name: '대요괴', hp: 800, speed: 0.5, reward: 120, color: '#ff2244', size: 22, sprite: 'boss', flying: false, armor: 5 },
};

// ── Skill bar DOM cache ──
let lastSkillBarHash = '';

// ── Initialize ──
function init() {
  generateEnvironment();
  generateFog();
  buildHeroPanel();

  // Wire up button event listeners (v4: no more inline onclick)
  // Both click (desktop) and touchend (mobile) for reliability
  const waveBtn = document.getElementById('wave-btn');
  const sellBtn = document.getElementById('sell-btn');
  const speedBtn = document.getElementById('speed-btn');

  waveBtn.addEventListener('click', () => { if (!isTouchDevice) startNextWave(); });
  sellBtn.addEventListener('click', () => { if (!isTouchDevice) sellSelectedTower(); });
  speedBtn.addEventListener('click', () => { if (!isTouchDevice) toggleSpeed(); });

  waveBtn.addEventListener('touchend', (e) => { e.preventDefault(); isTouchDevice = true; startNextWave(); });
  sellBtn.addEventListener('touchend', (e) => { e.preventDefault(); isTouchDevice = true; sellSelectedTower(); });
  speedBtn.addEventListener('touchend', (e) => { e.preventDefault(); isTouchDevice = true; toggleSpeed(); });

  // Touch events (mobile) — set flag to suppress click
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });

  // Mouse events (desktop only — skipped if touch detected)
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('mousemove', onMouseMove);

  requestAnimationFrame(gameLoop);
}

// ── Touch Handling ──
let touchStartPos = null;
function getGamePos(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left) * canvasScale.x,
    y: (touch.clientY - rect.top) * canvasScale.y,
  };
}

function onTouchStart(e) {
  e.preventDefault();
  isTouchDevice = true;
  const touch = e.touches[0];
  const pos = getGamePos(touch);
  mouseX = pos.x;
  mouseY = pos.y;
  touchStartPos = { x: touch.clientX, y: touch.clientY };

  // Touch feedback ring (reuse existing or create)
  const ring = document.createElement('div');
  ring.style.cssText = `position:fixed;width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,215,0,0.5);pointer-events:none;z-index:50;transform:translate(-50%,-50%);animation:touchRingFade 0.4s ease-out forwards;left:${touch.clientX}px;top:${touch.clientY}px`;
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 400);
}

function onTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const pos = getGamePos(touch);
  mouseX = pos.x;
  mouseY = pos.y;
}

function onTouchEnd(e) {
  e.preventDefault();
  if (!touchStartPos) return;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartPos.x;
  const dy = touch.clientY - touchStartPos.y;
  if (dx * dx + dy * dy < 20 * 20) {
    const pos = getGamePos(touch);
    handleTap(pos.x, pos.y);
  }
  touchStartPos = null;
}

function handleTap(mx, my) {
  if (state.phase === 'gameover' || state.phase === 'victory') return;

  for (let i = 0; i < SLOTS.length; i++) {
    const slot = SLOTS[i];
    const dx = mx - slot.x, dy = my - slot.y;
    if (dx * dx + dy * dy < SLOT_TOUCH_RADIUS * SLOT_TOUCH_RADIUS) {
      if (slot.tower !== null && !state.selectedHeroType) {
        if (state.selectedTowerIdx === slot.tower) {
          tryUpgradeTower(slot.tower);
        } else {
          state.selectedTowerIdx = slot.tower;
          state.selectedHeroType = null;
          document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
          const t = state.towers[slot.tower];
          document.getElementById('sell-btn').style.display = 'block';
          document.getElementById('sell-btn').textContent = `🗑 매각 (+${Math.floor(HEROES[t.heroType].cost * 0.6)}💰)`;
        }
      } else if (slot.tower !== null && state.selectedHeroType) {
        addFloatingText(slot.x, slot.y - 30, '이미 배치됨!', '#ff6b6b');
      } else if (state.selectedHeroType) {
        tryPlaceTower(i);
      }
      return;
    }
  }
  // Tap on empty space → deselect
  state.selectedTowerIdx = null;
  state.selectedHeroType = null;
  document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('sell-btn').style.display = 'none';
}

function generateEnvironment() {
  const env = state.environmentObjects;
  const MAX_RETRIES = 200;
  for (let i = 0; i < 25; i++) {
    let x, y, valid, retries = 0;
    do {
      x = 30 + Math.random() * (W - 60);
      y = 30 + Math.random() * (H - 60);
      valid = true;
      for (let p = 0; p < PATH.length - 1; p++) {
        const px = (PATH[p].x + PATH[p + 1].x) / 2;
        const py = (PATH[p].y + PATH[p + 1].y) / 2;
        if (Math.abs(x - px) < 60 && Math.abs(y - py) < 60) valid = false;
      }
      for (const s of SLOTS) {
        if (Math.abs(x - s.x) < 40 && Math.abs(y - s.y) < 40) valid = false;
      }
      retries++;
    } while (!valid && retries < MAX_RETRIES);
    if (valid) {
      env.push({ type: Math.random() < 0.7 ? 'tree' : 'rock', x, y, scale: 2 + Math.random() * 2 });
    }
  }
  env.push({ type: 'house', x: 920, y: 230, scale: 3 });
  env.push({ type: 'house', x: 910, y: 290, scale: 2.5 });
}

function generateFog() {
  for (let i = 0; i < 15; i++) {
    state.fog.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 40 + Math.random() * 80,
      speed: 5 + Math.random() * 15,
      alpha: 0.02 + Math.random() * 0.04,
    });
  }
}

function buildHeroPanel() {
  const panel = document.getElementById('hero-panel');
  panel.innerHTML = '';
  Object.entries(HEROES).forEach(([key, hero]) => {
    const card = document.createElement('div');
    card.className = 'hero-card';
    card.dataset.hero = key;
    card.style.setProperty('--hero-color', hero.color);
    card.innerHTML = `
      <div class="icon">${hero.icon}</div>
      <div class="name">${hero.name}</div>
      <div class="cost">💰${hero.cost}</div>
    `;
    card.addEventListener('click', () => { if (!isTouchDevice) selectHero(key); });
    card.addEventListener('touchend', (e) => {
      e.preventDefault();
      isTouchDevice = true;
      selectHero(key);
    });
    panel.appendChild(card);
  });
}

// ── Skill Bar (cached — only rebuild when hash changes) ──
function updateSkillBar() {
  // Build a hash of current state to avoid DOM thrashing
  let hash = '';
  state.towers.forEach((tower, i) => {
    if (tower.removed) return;
    const hero = HEROES[tower.heroType];
    if (!hero.skill) return;
    const cd = state.skillCooldowns[i] || 0;
    hash += `${i}:${tower.heroType}:${Math.ceil(cd)}:${cd <= 0 ? 'r' : 'c'},`;
  });

  if (hash === lastSkillBarHash) return;
  lastSkillBarHash = hash;

  const bar = document.getElementById('skill-bar');
  bar.innerHTML = '';
  state.towers.forEach((tower, i) => {
    if (tower.removed) return;
    const hero = HEROES[tower.heroType];
    if (!hero.skill) return;
    const cd = state.skillCooldowns[i] || 0;
    const btn = document.createElement('div');
    btn.className = 'skill-btn' + (cd <= 0 ? ' ready' : '');
    btn.title = `${hero.name}: ${hero.skill.name}`;
    btn.innerHTML = hero.skill.icon;
    if (cd > 0) {
      btn.innerHTML += `<div class="cd-overlay">${Math.ceil(cd)}</div>`;
    }
    btn.addEventListener('click', () => { if (!isTouchDevice) activateSkill(i); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); isTouchDevice = true; activateSkill(i); });
    bar.appendChild(btn);
  });
}

// ── Speed Toggle ──
function toggleSpeed() {
  state.speedMult = state.speedMult === 1 ? 2 : state.speedMult === 2 ? 3 : 1;
  document.getElementById('speed-btn').textContent = `⏩ x${state.speedMult}`;
}

// ── Hero Selection ──
function selectHero(key) {
  state.selectedTowerIdx = null;
  document.getElementById('sell-btn').style.display = 'none';
  if (state.selectedHeroType === key) {
    state.selectedHeroType = null;
  } else {
    state.selectedHeroType = key;
  }
  document.querySelectorAll('.hero-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.hero === state.selectedHeroType);
  });
}

// ── Mouse Move ──
let mouseX = 0, mouseY = 0;
function onMouseMove(e) {
  if (isTouchDevice) return;
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * canvasScale.x;
  mouseY = (e.clientY - rect.top) * canvasScale.y;
}

// ── Canvas Click (desktop only — skipped on touch devices) ──
function onCanvasClick(e) {
  if (isTouchDevice) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * canvasScale.x;
  const my = (e.clientY - rect.top) * canvasScale.y;
  handleTap(mx, my);
}

function tryPlaceTower(slotIndex) {
  const hero = HEROES[state.selectedHeroType];
  if (state.gold < hero.cost) {
    addFloatingText(SLOTS[slotIndex].x, SLOTS[slotIndex].y - 30, '금화 부족!', '#ff4444');
    shakeScreen(3);
    return;
  }
  state.gold -= hero.cost;
  const rangeBonus = SLOTS[slotIndex].terrain === 'high' ? 20 : 0;
  const tower = {
    heroType: state.selectedHeroType,
    x: SLOTS[slotIndex].x,
    y: SLOTS[slotIndex].y,
    level: 1,
    attackTimer: 0,
    target: null,
    damage: hero.damage,
    range: hero.range + rangeBonus,
    attackSpeed: hero.attackSpeed,
    skillActive: false,
    skillTimer: 0,
    animTimer: 0,
    highGround: SLOTS[slotIndex].terrain === 'high',
  };
  state.towers.push(tower);
  SLOTS[slotIndex].tower = state.towers.length - 1;
  state.skillCooldowns[state.towers.length - 1] = 0;
  addFloatingText(tower.x, tower.y - 40, `${hero.name} 배치!`, hero.color);
  spawnPlaceEffect(tower.x, tower.y, hero.color);
  state.selectedHeroType = null;
  document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
  updateSkillBar();
  updateUI();
}

function tryUpgradeTower(towerIdx) {
  const tower = state.towers[towerIdx];
  const upgradeCost = 25 * tower.level;
  if (tower.level >= 3) {
    addFloatingText(tower.x, tower.y - 30, '최대 레벨!', '#ffd700');
    return;
  }
  if (state.gold < upgradeCost) {
    addFloatingText(tower.x, tower.y - 30, `금화 부족! (${upgradeCost}💰)`, '#ff4444');
    shakeScreen(3);
    return;
  }
  state.gold -= upgradeCost;
  tower.level++;
  tower.damage = Math.floor(HEROES[tower.heroType].damage * (1 + (tower.level - 1) * 0.6));
  tower.range += 12;
  tower.attackSpeed *= 1.15;
  addFloatingText(tower.x, tower.y - 40, `★ Lv${tower.level} 강화! ★`, '#ffd700');
  spawnPlaceEffect(tower.x, tower.y, '#ffd700');
  shakeScreen(4);
  updateUI();
}

function sellSelectedTower() {
  if (state.selectedTowerIdx === null) return;
  const tower = state.towers[state.selectedTowerIdx];
  const hero = HEROES[tower.heroType];
  const refund = Math.floor(hero.cost * 0.6);
  state.gold += refund;
  addFloatingText(tower.x, tower.y - 30, `+${refund}💰 매각`, '#ffd700');
  spawnPlaceEffect(tower.x, tower.y, '#ff6b6b');
  for (const s of SLOTS) {
    if (s.tower === state.selectedTowerIdx) { s.tower = null; break; }
  }
  tower.removed = true;
  state.selectedTowerIdx = null;
  document.getElementById('sell-btn').style.display = 'none';
  updateSkillBar();
  updateUI();
}

// ── Skill Activation ──
function activateSkill(towerIdx) {
  if (state.skillCooldowns[towerIdx] > 0) return;
  if (state.phase !== 'combat') return;
  const tower = state.towers[towerIdx];
  if (tower.removed) return;
  const hero = HEROES[tower.heroType];
  const skill = hero.skill;
  const hasSynergy = checkSynergy(tower);

  state.skillCooldowns[towerIdx] = skill.cooldown * (hasSynergy ? 0.8 : 1);

  switch (skill.effect) {
    case 'aoe_burst': {
      const mult = hasSynergy ? 4 : 3;
      state.enemies.forEach(e => {
        if (!e.alive) return;
        const dx = e.x - tower.x, dy = e.y - tower.y;
        if (dx * dx + dy * dy < (tower.range + 50) ** 2) {
          damageEnemy(e, tower.damage * mult);
        }
      });
      spawnExplosion(tower.x, tower.y, '#e74c3c', 30);
      addFloatingText(tower.x, tower.y - 50, '🌪️ 질풍참!', '#ff6b6b');
      shakeScreen(8);
      break;
    }
    case 'rapid_fire': {
      tower.skillActive = true;
      tower.skillTimer = 4;
      addFloatingText(tower.x, tower.y - 50, '🎯 만궁술!', '#2ecc71');
      spawnAura(tower.x, tower.y, '#2ecc71');
      break;
    }
    case 'lightning': {
      const mult = hasSynergy ? 5 : 4;
      let targets = state.enemies.filter(e => {
        if (!e.alive) return false;
        const dx = e.x - tower.x, dy = e.y - tower.y;
        return dx * dx + dy * dy < (tower.range + 80) ** 2;
      }).slice(0, hasSynergy ? 7 : 5);
      let prev = { x: tower.x, y: tower.y };
      targets.forEach(e => {
        damageEnemy(e, tower.damage * mult);
        spawnLightning(prev.x, prev.y, e.x, e.y);
        prev = e;
      });
      addFloatingText(tower.x, tower.y - 50, '⚡ 뇌전술!', '#bb77ff');
      shakeScreen(6);
      break;
    }
    case 'barrier': {
      const slowAmount = hasSynergy ? 0.25 : 0.4;
      tower.skillActive = true;
      tower.skillTimer = 5;
      state.enemies.forEach(e => { if (e.alive) e.slowTimer = Math.max(e.slowTimer, 5); e.slowAmount = slowAmount; });
      addFloatingText(tower.x, tower.y - 50, '🛡️ 결계!', '#f39c12');
      spawnBarrier(tower.x, tower.y);
      shakeScreen(5);
      break;
    }
  }
}

// ── Wave System ──
function startNextWave() {
  if (state.phase === 'combat') return;
  if (state.wave >= state.totalWaves) return;

  state.wave++;
  state.phase = 'combat';
  document.getElementById('wave-btn').disabled = true;

  const waveDef = WAVES[state.wave - 1];
  state.spawnQueue = [];
  waveDef.enemies.forEach(group => {
    for (let i = 0; i < group.count; i++) {
      state.spawnQueue.push({
        type: group.type,
        time: (group.delay || 0) + i * group.interval,
      });
    }
  });
  state.waveTimer = 0;

  announceWave(waveDef.name);
  updateUI();
}

function announceWave(name) {
  const el = document.getElementById('wave-announce');
  el.textContent = `Wave ${state.wave}: ${name}`;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 2000);
}

function spawnEnemy(type) {
  const def = ENEMY_TYPES[type];
  const start = PATH[0];
  const waveScale = 1 + (state.wave - 1) * 0.12;
  state.enemies.push({
    type,
    x: start.x,
    y: start.y,
    hp: Math.floor(def.hp * waveScale),
    maxHp: Math.floor(def.hp * waveScale),
    speed: def.speed,
    reward: def.reward,
    color: def.color,
    size: def.size,
    sprite: def.sprite,
    pathIndex: 1,
    alive: true,
    slowTimer: 0,
    slowAmount: 0.4,
    hitFlash: 0,
    flying: def.flying || false,
    phase: def.phase || false,
    armor: def.armor || 0,
    healer: def.healer || false,
    healTimer: 0,
    animOffset: Math.random() * Math.PI * 2,
    trail: [],
  });
}

// ── Combat Logic ──
function updateEnemies(dt) {
  state.enemies.forEach(enemy => {
    if (!enemy.alive) return;

    if (enemy.healer) {
      enemy.healTimer -= dt;
      if (enemy.healTimer <= 0) {
        enemy.healTimer = 2;
        state.enemies.forEach(other => {
          if (!other.alive || other === enemy) return;
          const dx = other.x - enemy.x, dy = other.y - enemy.y;
          if (dx * dx + dy * dy < 100 * 100 && other.hp < other.maxHp) {
            other.hp = Math.min(other.maxHp, other.hp + Math.floor(other.maxHp * 0.1));
            addFloatingText(other.x, other.y - other.size - 10, '+heal', '#00ff88');
            spawnHealEffect(other.x, other.y);
          }
        });
      }
    }

    const speedMult = enemy.slowTimer > 0 ? (enemy.slowAmount || 0.4) : 1;
    enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

    const target = PATH[enemy.pathIndex];
    if (!target) {
      enemy.alive = false;
      const dmg = enemy.type === 'boss' ? 5 : 1;
      state.lives -= dmg;
      addFloatingText(enemy.x, enemy.y, `-${dmg} ❤️`, '#ff4444');
      shakeScreen(dmg * 4);
      if (state.lives <= 0) {
        state.lives = 0;
        state.phase = 'gameover';
        document.getElementById('go-stats').textContent = `Wave ${state.wave} | 처치 ${state.kills} | 데미지 ${state.totalDamageDealt}`;
        document.getElementById('game-over-screen').style.display = 'flex';
      }
      updateUI();
      return;
    }

    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 3) {
      enemy.pathIndex++;
    } else {
      const spd = enemy.speed * speedMult * 60 * dt;
      enemy.x += (dx / dist) * spd;
      enemy.y += (dy / dist) * spd;
    }

    if (enemy.phase || enemy.type === 'boss') {
      enemy.trail.push({ x: enemy.x, y: enemy.y, alpha: 0.5 });
      if (enemy.trail.length > 8) enemy.trail.shift();
      enemy.trail.forEach(t => t.alpha *= 0.92);
    }
  });
}

function updateTowers(dt) {
  state.towers.forEach((tower, idx) => {
    if (tower.removed) return;
    const hero = HEROES[tower.heroType];
    const hasSynergy = checkSynergy(tower);

    tower.animTimer += dt;

    if (tower.skillActive) {
      tower.skillTimer -= dt;
      if (tower.skillTimer <= 0) tower.skillActive = false;
    }
    if (state.skillCooldowns[idx] > 0) {
      state.skillCooldowns[idx] = Math.max(0, state.skillCooldowns[idx] - dt);
    }

    tower.attackTimer -= dt;
    if (tower.attackTimer <= 0) {
      let atkSpeed = tower.attackSpeed;
      if (tower.skillActive && hero.type === 'ranged') atkSpeed *= 3;
      if (hasSynergy && hero.type === 'melee') atkSpeed *= 1.25;
      tower.attackTimer = 1 / atkSpeed;

      let closest = null, closestDist = Infinity;
      const range = hasSynergy && hero.type === 'aoe' ? tower.range * 1.3 : tower.range;
      state.enemies.forEach(e => {
        if (!e.alive) return;
        if (e.phase && hero.type === 'melee') return;
        const dx = e.x - tower.x, dy = e.y - tower.y;
        const d = dx * dx + dy * dy;
        if (d < range * range && d < closestDist) {
          closest = e;
          closestDist = d;
        }
      });

      if (closest) {
        tower.target = closest;
        let dmg = tower.damage;
        if (hasSynergy && hero.type === 'melee') dmg = Math.floor(dmg * 1.25);

        if (hero.type === 'aoe') {
          const aoeRange = hasSynergy ? 65 : 50;
          state.enemies.forEach(e => {
            if (!e.alive) return;
            const dx = e.x - closest.x, dy = e.y - closest.y;
            if (dx * dx + dy * dy < aoeRange * aoeRange) {
              damageEnemy(e, dmg);
            }
          });
          spawnExplosion(closest.x, closest.y, hero.color, 6);
        } else if (hero.type === 'support') {
          damageEnemy(closest, dmg);
          const slowDur = hasSynergy ? 2.5 : 1.5;
          closest.slowTimer = Math.max(closest.slowTimer, slowDur);
          state.projectiles.push(makeProjectile(tower, closest, hero.color, 'orb'));
        } else {
          damageEnemy(closest, dmg);
          const pType = hero.type === 'ranged' ? 'arrow' : 'slash';
          state.projectiles.push(makeProjectile(tower, closest, hero.color, pType));
        }
      }
    }
  });
}

function makeProjectile(tower, target, color, type) {
  return {
    x: tower.x, y: tower.y,
    tx: target.x, ty: target.y,
    color, type, t: 0,
    trail: [],
  };
}

function damageEnemy(enemy, rawDamage) {
  const dmg = Math.max(1, rawDamage - enemy.armor);
  enemy.hp -= dmg;
  enemy.hitFlash = 0.15;
  state.totalDamageDealt += dmg;

  const fontSize = dmg >= 30 ? 16 : dmg >= 15 ? 13 : 11;
  addFloatingText(enemy.x + (Math.random() - 0.5) * 10, enemy.y - enemy.size - 8, `-${dmg}`, dmg >= 30 ? '#ff4444' : '#ffcc00', fontSize);

  if (enemy.hp <= 0 && enemy.alive) {
    enemy.alive = false;
    state.gold += enemy.reward;
    state.kills++;

    state.combo.count++;
    state.combo.timer = 2;
    if (state.combo.count >= 3) {
      const bonus = Math.floor(state.combo.count * 1.5);
      state.gold += bonus;
      const comboEl = document.getElementById('combo-display');
      comboEl.textContent = `${state.combo.count}x COMBO! +${bonus}💰`;
      comboEl.style.opacity = '1';
      comboEl.style.fontSize = Math.min(36, 20 + state.combo.count * 2) + 'px';
    }

    addFloatingText(enemy.x, enemy.y - 25, `+${enemy.reward}💰`, '#ffd700', 14);
    spawnDeathEffect(enemy.x, enemy.y, enemy.color, enemy.size);

    if (enemy.type === 'boss') {
      shakeScreen(15);
      spawnExplosion(enemy.x, enemy.y, '#ff4444', 40);
      spawnExplosion(enemy.x, enemy.y, '#ffd700', 30);
    } else {
      shakeScreen(2);
    }
    updateUI();
  }
}

// ── Visual Effects ──
function spawnPlaceEffect(x, y, color) {
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * 60,
      vy: Math.sin(angle) * 60 - 30,
      color,
      life: 0.5,
      maxLife: 0.5,
      size: 3,
      type: 'spark',
    });
  }
}

function spawnExplosion(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 120;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      color,
      life: 0.3 + Math.random() * 0.5,
      maxLife: 0.3 + Math.random() * 0.5,
      size: 2 + Math.random() * 4,
      type: 'fire',
    });
  }
  state.particles.push({
    x, y,
    vx: 0, vy: 0,
    color,
    life: 0.4,
    maxLife: 0.4,
    size: 5,
    type: 'ring',
    radius: 10,
  });
}

function spawnDeathEffect(x, y, color, size) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 80;
    state.particles.push({
      x: x + (Math.random() - 0.5) * size,
      y: y + (Math.random() - 0.5) * size,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      color,
      life: 0.4 + Math.random() * 0.3,
      maxLife: 0.4 + Math.random() * 0.3,
      size: 2 + Math.random() * 3,
      type: 'pixel',
    });
  }
}

function spawnLightning(x1, y1, x2, y2) {
  const segments = 6;
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const nx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
    const ny = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
    state.particles.push({
      x: nx, y: ny,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      color: '#bb77ff',
      life: 0.3,
      maxLife: 0.3,
      size: 3 + Math.random() * 2,
      type: 'spark',
    });
  }
}

function spawnAura(x, y, color) {
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    state.particles.push({
      x: x + Math.cos(angle) * 30,
      y: y + Math.sin(angle) * 30,
      vx: Math.cos(angle) * 20,
      vy: Math.sin(angle) * 20 - 40,
      color,
      life: 0.6,
      maxLife: 0.6,
      size: 2,
      type: 'spark',
    });
  }
}

function spawnBarrier(x, y) {
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    state.particles.push({
      x: x + Math.cos(angle) * 50,
      y: y + Math.sin(angle) * 50,
      vx: Math.cos(angle) * 100,
      vy: Math.sin(angle) * 100,
      color: '#f39c12',
      life: 0.8,
      maxLife: 0.8,
      size: 3,
      type: 'spark',
    });
  }
}

function spawnHealEffect(x, y) {
  for (let i = 0; i < 5; i++) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 15,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: -40 - Math.random() * 30,
      color: '#00ff88',
      life: 0.5,
      maxLife: 0.5,
      size: 2,
      type: 'spark',
    });
  }
}

function shakeScreen(intensity) {
  state.screenShake.intensity = Math.max(state.screenShake.intensity, intensity);
}

function addFloatingText(x, y, text, color, fontSize) {
  state.floatingTexts.push({ x, y, text, color, life: 1.2, fontSize: fontSize || 12 });
}

// ── Update helpers ──
function updateParticles(dt) {
  state.particles = state.particles.filter(p => {
    p.life -= dt;
    if (p.type === 'ring') {
      p.radius += 200 * dt;
      return p.life > 0;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.type !== 'spark') p.vy += 150 * dt;
    return p.life > 0;
  });
}

function updateProjectiles(dt) {
  state.projectiles = state.projectiles.filter(p => {
    p.t += dt * 6;
    const lx = p.x, ly = p.y;
    p.x += (p.tx - p.x) * Math.min(1, p.t * 0.5);
    p.y += (p.ty - p.y) * Math.min(1, p.t * 0.5);
    p.trail.push({ x: lx, y: ly, alpha: 0.6 });
    if (p.trail.length > 5) p.trail.shift();
    p.trail.forEach(t => t.alpha *= 0.7);
    return p.t < 1;
  });
}

function updateFloatingTexts(dt) {
  state.floatingTexts = state.floatingTexts.filter(t => {
    t.y -= 50 * dt;
    t.life -= dt;
    return t.life > 0;
  });
}

function updateCombo(dt) {
  if (state.combo.timer > 0) {
    state.combo.timer -= dt;
    if (state.combo.timer <= 0) {
      state.combo.count = 0;
      document.getElementById('combo-display').style.opacity = '0';
    }
  }
}

function updateScreenShake(dt) {
  if (state.screenShake.intensity > 0) {
    state.screenShake.x = (Math.random() - 0.5) * state.screenShake.intensity * 2;
    state.screenShake.y = (Math.random() - 0.5) * state.screenShake.intensity * 2;
    state.screenShake.intensity *= 0.85;
    if (state.screenShake.intensity < 0.3) {
      state.screenShake.intensity = 0;
      state.screenShake.x = 0;
      state.screenShake.y = 0;
    }
  }
}

// ── Fog update (use real dt, not hardcoded) ──
function updateFog(dt) {
  state.fog.forEach(f => {
    f.x += f.speed * dt;
    if (f.x > W + f.r) f.x = -f.r;
  });
}

// ── Rendering ──
function draw() {
  // Reset DPR transform each frame (game draws in 960x540, CSS handles display scaling)
  ctx.setTransform(currentDpr, 0, 0, currentDpr, 0, 0);

  ctx.save();
  ctx.translate(state.screenShake.x, state.screenShake.y);

  drawBackground();
  drawEnvironment();
  drawPath();
  drawSlots();
  drawEnemyTrails();
  drawEnemies();
  drawTowers();
  drawProjectiles();
  drawParticles();
  drawFloatingTexts();
  drawFog();
  drawTowerRanges();

  ctx.restore();
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0c1a0c');
  grad.addColorStop(0.3, '#142814');
  grad.addColorStop(1, '#1a2e1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const t = state.gameTime * 0.3;
  for (let x = 0; x < W; x += 32) {
    for (let y = 0; y < H; y += 32) {
      const noise = Math.sin(x * 0.05 + t) * Math.cos(y * 0.07 + t * 0.5) * 0.5 + 0.5;
      const g = Math.floor(30 + noise * 12);
      ctx.fillStyle = `rgb(${Math.floor(g * 0.7)}, ${g}, ${Math.floor(g * 0.6)})`;
      ctx.fillRect(x, y, 32, 32);
    }
  }
}

function drawEnvironment() {
  state.environmentObjects.forEach(obj => {
    const sprite = SPRITES[obj.type];
    if (sprite) {
      drawPixelSprite(obj.x, obj.y, sprite, obj.scale);
    }
  });
}

function drawFog() {
  // Fog position is now updated in updateFog(), just draw here
  state.fog.forEach(f => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,200,180,${f.alpha})`;
    ctx.fill();
  });
}

function drawPath() {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 42;
  ctx.beginPath();
  ctx.moveTo(PATH[0].x, PATH[0].y);
  for (let i = 1; i < PATH.length; i++) ctx.lineTo(PATH[i].x, PATH[i].y);
  ctx.stroke();

  ctx.strokeStyle = '#5a4a3a';
  ctx.lineWidth = 36;
  ctx.beginPath();
  ctx.moveTo(PATH[0].x, PATH[0].y);
  for (let i = 1; i < PATH.length; i++) ctx.lineTo(PATH[i].x, PATH[i].y);
  ctx.stroke();

  ctx.strokeStyle = '#6b5a4a';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.moveTo(PATH[0].x, PATH[0].y);
  for (let i = 1; i < PATH.length; i++) ctx.lineTo(PATH[i].x, PATH[i].y);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let i = 0; i < PATH.length - 1; i++) {
    const ax = (PATH[i].x + PATH[i + 1].x) / 2;
    const ay = (PATH[i].y + PATH[i + 1].y) / 2;
    const angle = Math.atan2(PATH[i + 1].y - PATH[i].y, PATH[i + 1].x - PATH[i].x);
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(200,169,110,0.12)';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -7);
    ctx.lineTo(-8, 7);
    ctx.fill();
    ctx.restore();
  }
}

function drawSlots() {
  SLOTS.forEach((slot, i) => {
    if (slot.tower !== null) return;
    const hover = state.selectedHeroType !== null;
    const dx = mouseX - slot.x, dy = mouseY - slot.y;
    const isHover = dx * dx + dy * dy < SLOT_TOUCH_RADIUS * SLOT_TOUCH_RADIUS;

    ctx.beginPath();
    ctx.arc(slot.x, slot.y, 24, 0, Math.PI * 2);
    ctx.fillStyle = isHover && hover ? 'rgba(200,169,110,0.3)' : 'rgba(60,50,40,0.4)';
    ctx.fill();

    if (slot.terrain === 'high') {
      ctx.strokeStyle = '#8b7355';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(200,169,110,0.08)';
      ctx.fill();
    }

    ctx.strokeStyle = isHover && hover ? '#ffd700' : (hover ? '#c8a96e' : '#4a3a2a');
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(slot.x, slot.y, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isHover && hover ? '#ffd700' : '#6b5344';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', slot.x, slot.y);

    if (slot.terrain === 'high') {
      ctx.fillStyle = '#8b7355';
      ctx.font = '8px sans-serif';
      ctx.fillText('▲고지', slot.x, slot.y + 32);
    }
  });
}

function drawTowers() {
  state.towers.forEach((tower, idx) => {
    if (tower.removed) return;
    const hero = HEROES[tower.heroType];
    const isSelected = state.selectedTowerIdx === idx;

    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 24, 0, Math.PI * 2);
    ctx.fillStyle = tower.skillActive ? '#2a2a10' : '#1a1530';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#ffd700' : hero.color;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    if (checkSynergy(tower)) {
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 28, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,200,255,${0.3 + Math.sin(state.gameTime * 4) * 0.15})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (tower.skillActive) {
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 30, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,215,0,${0.5 + Math.sin(state.gameTime * 8) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const bounce = Math.sin(state.gameTime * 3 + idx) * 2;
    drawPixelSprite(tower.x, tower.y - 2 + bounce, SPRITES[hero.sprite], 3.5);

    if (tower.level > 1) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '10px serif';
      ctx.textAlign = 'center';
      ctx.fillText('★'.repeat(tower.level - 1), tower.x, tower.y + 32);
    }

    if (isSelected && tower.level < 3) {
      const cost = 25 * tower.level;
      ctx.fillStyle = state.gold >= cost ? '#ffd700' : '#ff6b6b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`탭: 강화 (${cost}💰)`, tower.x, tower.y - 35);
    }
  });
}

function drawTowerRanges() {
  if (state.selectedHeroType) {
    const hero = HEROES[state.selectedHeroType];
    SLOTS.forEach(slot => {
      if (slot.tower !== null) return;
      const dx = mouseX - slot.x, dy = mouseY - slot.y;
      if (dx * dx + dy * dy < SLOT_TOUCH_RADIUS * SLOT_TOUCH_RADIUS) {
        const rangeBonus = slot.terrain === 'high' ? 20 : 0;
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, hero.range + rangeBonus, 0, Math.PI * 2);
        ctx.fillStyle = `${hero.color}11`;
        ctx.fill();
        ctx.strokeStyle = `${hero.color}44`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }
  if (state.selectedTowerIdx !== null) {
    const tower = state.towers[state.selectedTowerIdx];
    if (tower && !tower.removed) {
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
      ctx.fillStyle = `${HEROES[tower.heroType].color}11`;
      ctx.fill();
      ctx.strokeStyle = `${HEROES[tower.heroType].color}44`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function drawEnemyTrails() {
  state.enemies.forEach(enemy => {
    if (!enemy.alive) return;
    enemy.trail.forEach(t => {
      ctx.globalAlpha = t.alpha * 0.3;
      drawPixelSprite(t.x, t.y, SPRITES[enemy.sprite], PIX * 0.8);
    });
  });
  ctx.globalAlpha = 1;
}

function drawEnemies() {
  state.enemies.forEach(enemy => {
    if (!enemy.alive) return;

    const bob = Math.sin(state.gameTime * 5 + enemy.animOffset);

    if (!enemy.flying) {
      ctx.beginPath();
      ctx.ellipse(enemy.x, enemy.y + enemy.size + 2, enemy.size * 0.6, enemy.size * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fill();
    }

    const flyY = enemy.flying ? -15 + bob * 4 : bob;

    // Hit flash — use save/restore to prevent shadow leak
    if (enemy.hitFlash > 0) {
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
    }

    if (enemy.slowTimer > 0) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y + flyY, enemy.size + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100,150,255,0.15)';
      ctx.fill();
    }

    const spriteData = SPRITES[enemy.sprite];
    if (spriteData) {
      const scale = enemy.type === 'boss' ? 4.5 : PIX;
      drawPixelSprite(enemy.x, enemy.y + flyY, spriteData, scale);
    }

    if (enemy.hitFlash > 0) {
      ctx.restore();
    }

    // HP bar
    const barW = Math.max(enemy.size * 2.5, 20);
    const barH = 3;
    const barX = enemy.x - barW / 2;
    const barY = enemy.y + flyY - enemy.size - 10;
    ctx.fillStyle = '#111';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    const hpRatio = enemy.hp / enemy.maxHp;
    const hpColor = hpRatio > 0.6 ? '#2ecc71' : hpRatio > 0.3 ? '#f39c12' : '#e74c3c';
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    if (enemy.armor > 0) {
      ctx.fillStyle = '#aaa';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛡' + enemy.armor, enemy.x, barY - 3);
    }

    if (enemy.healer) {
      ctx.fillStyle = '#00ff88';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', enemy.x + enemy.size + 5, enemy.y + flyY);
    }
  });
}

function drawProjectiles() {
  state.projectiles.forEach(p => {
    p.trail.forEach(t => {
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(t.x - 1, t.y - 1, 2, 2);
    });
    ctx.globalAlpha = 1;

    if (p.type === 'arrow') {
      const angle = Math.atan2(p.ty - p.y, p.tx - p.x);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-3, -2);
      ctx.lineTo(-3, 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'slash') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 0.8);
      ctx.stroke();
    } else {
      // Orb — use save/restore to prevent shadow leak
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawParticles() {
  state.particles.forEach(p => {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;

    if (p.type === 'ring') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 * alpha;
      ctx.stroke();
    } else if (p.type === 'fire') {
      const s = p.size * (0.5 + alpha * 0.5);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillRect(p.x - s / 4, p.y - s / 4, s / 2, s / 2);
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size * alpha, p.size * alpha);
    }
  });
  ctx.globalAlpha = 1;
}

function drawFloatingTexts() {
  state.floatingTexts.forEach(t => {
    const scale = t.life > 0.8 ? 1 + (1 - (t.life - 0.8) / 0.4) * 0.3 : 1;
    ctx.globalAlpha = Math.min(1, t.life * 1.5);
    ctx.fillStyle = t.color;
    ctx.font = `bold ${Math.floor((t.fontSize || 12) * scale)}px 'Noto Sans KR', sans-serif`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
  });
  ctx.globalAlpha = 1;
}

// ── UI Update ──
function updateUI() {
  document.getElementById('gold').textContent = state.gold;
  document.getElementById('lives').textContent = state.lives;
  document.getElementById('wave-num').textContent = state.wave;
  document.getElementById('kills').textContent = state.kills;
}

// ── Game Loop (fix: use first frame timestamp for lastTime) ──
let lastTime = -1;
function gameLoop(timestamp) {
  if (lastTime < 0) {
    lastTime = timestamp;
    requestAnimationFrame(gameLoop);
    return;
  }

  const rawDt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  const dt = rawDt * state.speedMult;
  state.gameTime += rawDt;

  if (state.phase === 'combat') {
    state.waveTimer += dt;
    state.spawnQueue = state.spawnQueue.filter(s => {
      if (state.waveTimer >= s.time) {
        spawnEnemy(s.type);
        return false;
      }
      return true;
    });

    updateEnemies(dt);
    updateTowers(dt);

    const allSpawned = state.spawnQueue.length === 0;
    const allDead = state.enemies.every(e => !e.alive);
    if (allSpawned && allDead && state.phase === 'combat') {
      if (state.wave >= state.totalWaves) {
        state.phase = 'victory';
        document.getElementById('v-stats').textContent = `처치 ${state.kills} | 총 데미지 ${state.totalDamageDealt} | 남은 생명 ${state.lives}`;
        document.getElementById('victory-screen').style.display = 'flex';
      } else {
        state.phase = 'between';
        const waveBonus = 15 + state.wave * 5;
        state.gold += waveBonus;
        addFloatingText(W / 2, H / 2 - 20, `웨이브 ${state.wave} 클리어!`, '#ffd700', 20);
        addFloatingText(W / 2, H / 2 + 10, `+${waveBonus}💰 보너스`, '#ffaa00', 14);
        document.getElementById('wave-btn').disabled = false;
        if (state.wave < state.totalWaves) {
          document.getElementById('wave-btn').textContent = `▶ W${state.wave + 1}`;
        }
        updateUI();
      }
    }
  }

  updateProjectiles(dt);
  updateParticles(dt);
  updateFloatingTexts(dt);
  updateCombo(dt);
  updateScreenShake(rawDt);
  updateFog(rawDt); // fog uses real dt, moved out of draw
  updateSkillBar(); // cached — only rebuilds DOM when state changes

  draw();
  requestAnimationFrame(gameLoop);
}

// ── CSS for touch ring animation ──
const style = document.createElement('style');
style.textContent = `@keyframes touchRingFade{0%{opacity:1;width:20px;height:20px}100%{opacity:0;width:60px;height:60px}}`;
document.head.appendChild(style);

// ── Start ──
init();
document.getElementById('wave-btn').textContent = `▶ W1 시작`;
