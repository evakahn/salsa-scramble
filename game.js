(() => {
  'use strict';

  const COLS = 10;
  const ROWS = 20;
  const HIDDEN = 2; // spawn rows above the visible stage
  const CELL = 30;

  const LOCK_DELAY = 500;
  const MAX_LOCK_RESETS = 15;
  const DAS = 170;
  const ARR = 50;
  const SOFT_DROP_INTERVAL = 35;
  const CARTWHEEL_TIME = 950;

  // Each performer: a spotlight tile color and a costume accent color.
  const PALETTE = {
    I: { tile: '#ff3d8b', accent: '#ffe14d' },
    O: { tile: '#ffc629', accent: '#e0115f' },
    T: { tile: '#9d4dff', accent: '#4dfff3' },
    S: { tile: '#1fd98a', accent: '#ff4d4d' },
    Z: { tile: '#ff4a3d', accent: '#ffd84d' },
    J: { tile: '#22c7e8', accent: '#ff5cc8' },
    L: { tile: '#ff8a1f', accent: '#7a2cff' },
  };
  const SILHOUETTE = '#1a0710';

  const SHAPES = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
  };

  // Dancer poses, drawn in the piece's unrotated matrix space (1 unit = 1 cell).
  // Everything is clipped to the piece's own cells, so limbs must stay inside them.
  const POSES = {
    // Grand jeté: a split leap stretched across the bar
    I: [{
      head: [2.3, 1.26], headR: 0.14, flower: [0.1, -0.1],
      torso: [[2.15, 1.42], [1.95, 1.68]],
      limbs: [
        [[2.15, 1.46], [2.7, 1.26], [3.35, 1.12]],
        [[2.1, 1.46], [1.6, 1.3], [0.95, 1.14]],
        [[1.95, 1.68], [1.0, 1.8], [0.1, 1.68]],
        [[1.95, 1.68], [2.9, 1.86], [3.9, 1.74]],
      ],
      skirt: [[2.05, 1.52], [1.8, 1.58], [1.5, 1.96], [2.45, 1.96]],
      dots: [[0.12, 1.68, 0.08], [3.88, 1.74, 0.08]],
    }],
    // A salsa couple, hands joined
    O: [
      {
        head: [0.5, 0.28], flower: [-0.13, -0.08],
        torso: [[0.5, 0.48], [0.5, 1.22]],
        limbs: [
          [[0.5, 0.64], [0.8, 0.56], [1.0, 0.42]],
          [[0.5, 0.64], [0.22, 0.44], [0.16, 0.1]],
          [[0.5, 1.2], [0.3, 1.95]],
          [[0.5, 1.2], [0.75, 1.95]],
        ],
        skirt: [[0.4, 0.98], [0.6, 0.98], [0.96, 1.6], [0.04, 1.6]],
      },
      {
        head: [1.5, 0.3], hat: true, torsoW: 0.24,
        torso: [[1.5, 0.5], [1.5, 1.2]],
        limbs: [
          [[1.5, 0.64], [1.2, 0.56], [1.0, 0.42]],
          [[1.5, 0.64], [1.78, 0.9], [1.6, 1.06]],
          [[1.5, 1.18], [1.36, 1.95]],
          [[1.5, 1.18], [1.76, 1.95]],
        ],
      },
    ],
    // Ta-da! Arms swooping out with maracas, skirt flared
    T: [{
      head: [1.5, 0.36], headR: 0.18, flower: [0.15, -0.09],
      torso: [[1.5, 0.58], [1.5, 1.35]],
      limbs: [
        [[1.5, 0.8], [1.02, 1.36], [0.5, 1.46], [0.2, 1.2]],
        [[1.5, 0.8], [1.98, 1.36], [2.5, 1.46], [2.8, 1.2]],
      ],
      skirt: [[1.36, 1.22], [1.64, 1.22], [2.05, 1.96], [0.95, 1.96]],
      dots: [[0.2, 1.14, 0.13], [2.8, 1.14, 0.13]],
    }],
    // High kick: arm reaching up, leg extended sideways
    J: [{
      head: [0.5, 0.36], flower: [-0.13, -0.08],
      torso: [[0.5, 0.56], [0.52, 1.28]],
      limbs: [
        [[0.5, 0.66], [0.76, 0.38], [0.84, 0.06]],
        [[0.5, 0.7], [0.22, 0.95], [0.16, 1.2]],
        [[0.52, 1.28], [0.46, 1.95]],
        [[0.52, 1.28], [1.6, 1.3], [2.86, 1.18]],
      ],
      skirt: [[0.4, 1.08], [0.62, 1.08], [0.96, 1.56], [0.08, 1.56]],
      dots: [[2.86, 1.18, 0.1]],
    }],
    // Hip sway: a diagonal lean with a spinning skirt
    S: [{
      head: [2.4, 0.3], flower: [0.13, -0.08],
      torso: [[2.2, 0.5], [1.4, 0.95]],
      limbs: [
        [[2.12, 0.56], [2.6, 0.52], [2.9, 0.14]],
        [[2.0, 0.6], [1.5, 0.4], [1.1, 0.14]],
        [[1.4, 0.95], [0.8, 1.4], [0.1, 1.6]],
        [[1.4, 0.95], [1.5, 1.5], [1.3, 1.95]],
      ],
      skirt: [[1.62, 0.84], [1.25, 1.0], [0.9, 1.5], [1.82, 1.45]],
      dots: [[0.14, 1.6, 0.09]],
    }],
  };

  function mirrorFigure(f, w) {
    const mx = ([x, y]) => [w - x, y];
    return {
      ...f,
      head: mx(f.head),
      flower: f.flower && [-f.flower[0], f.flower[1]],
      torso: f.torso.map(mx),
      limbs: f.limbs.map(l => l.map(mx)),
      skirt: f.skirt && f.skirt.map(mx),
      dots: f.dots && f.dots.map(([x, y, r]) => [w - x, y, r]),
    };
  }
  POSES.L = POSES.J.map(f => mirrorFigure(f, 3));
  POSES.Z = POSES.S.map(f => mirrorFigure(f, 3));

  // SRS wall kicks, keyed "from>to". Offsets are [dx, dy] with y pointing up (SRS convention).
  const KICKS_JLSTZ = {
    '0>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    '1>0': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    '1>2': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    '2>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    '2>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    '3>2': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    '3>0': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    '0>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  };
  const KICKS_I = {
    '0>1': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
    '1>0': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
    '1>2': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
    '2>1': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
    '2>3': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
    '3>2': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
    '3>0': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
    '0>3': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
  };

  const LINE_SCORES = [0, 100, 300, 500, 800];
  const CHEERS = ['', '¡Eso!', '¡Wepa!', '¡Fuego!', '¡AZÚCAR!'];
  const CONFETTI_COLORS = ['#ffe14d', '#ff3d8b', '#4dfff3', '#ff8a1f', '#9d4dff', '#ffffff'];

  // ---------- DOM ----------
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  function setupCanvas(id) {
    const canvas = document.getElementById(id);
    const w = +canvas.dataset.w, h = +canvas.dataset.h;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (id !== 'board') { canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; }
    const c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c;
  }
  const ctx = setupCanvas('board');
  const holdCtx = setupCanvas('hold');
  const nextCtx = setupCanvas('next');
  const W = COLS * CELL, H = ROWS * CELL;

  const scoreEl = document.getElementById('score');
  const linesEl = document.getElementById('lines');
  const levelEl = document.getElementById('level');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const overlayMsg = document.getElementById('overlay-msg');
  const startBtn = document.getElementById('start-btn');
  const olePrompt = document.getElementById('ole');
  const oleFill = document.getElementById('ole-fill');
  const oleHint = document.getElementById('ole-hint');
  const oleTap = document.getElementById('ole-tap');
  const oleKicker = document.getElementById('ole-kicker');

  // ---------- Storage ----------
  const BEST_KEY = 'salsa-scramble-best';
  function loadBest() {
    try { return parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* ignore */ }
  }

  // ---------- State ----------
  // Locked grid cells hold { type, rot, lc, lr, id }: which performer, which part of them,
  // and which piece they came from (so fragments of one dancer bow and cartwheel together).
  let grid, bag, queue, piece, holdType, holdUsed, pieceId = 0;
  let score, lines, level, best = loadBest();
  let state = 'idle'; // idle | playing | paused | over
  let dropTimer, lockTimer, lockResets, lastTime, clock = 0;
  // Curtain call after a line clear: { rows, groups, t, phase: 'bow' | 'exit', exitT }
  let curtainCall = null;
  let effects = [];    // confetti + cheers

  const input = { left: false, right: false, soft: false, dir: 0, dasTimer: 0, arrTimer: 0, softTimer: 0 };

  bestEl.textContent = best;

  // ---------- Helpers ----------
  function rotateMatrix(m) {
    const n = m.length;
    const out = Array.from({ length: n }, () => Array(n).fill(0));
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        out[x][n - 1 - y] = m[y][x];
    return out;
  }

  function makeRotations(type) {
    const rots = [SHAPES[type]];
    for (let i = 1; i < 4; i++) rots.push(rotateMatrix(rots[i - 1]));
    return rots;
  }
  const ROTATIONS = Object.fromEntries(Object.keys(SHAPES).map(t => [t, makeRotations(t)]));

  function refillBag() {
    const types = Object.keys(SHAPES);
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    bag.push(...types);
  }

  function nextType() {
    while (queue.length < 6) {
      if (bag.length === 0) refillBag();
      queue.push(bag.shift());
    }
    return queue.shift();
  }

  function spawn(type) {
    const shape = ROTATIONS[type][0];
    piece = {
      type,
      id: ++pieceId,
      rot: 0,
      x: Math.floor((COLS - shape.length) / 2),
      y: type === 'I' ? HIDDEN - 1 : HIDDEN,
    };
    // Top out: spawn position is blocked
    if (collides(piece.x, piece.y, piece.rot)) {
      piece.y -= 1;
      if (collides(piece.x, piece.y, piece.rot)) return gameOver();
    }
    lockTimer = 0;
    lockResets = 0;
    dropTimer = 0;
    holdUsed = false;
  }

  // Returns [boardX, boardY, localCol, localRow] for each block of a piece.
  function cells(p = piece, rot = p.rot, x = p.x, y = p.y) {
    const out = [];
    const m = ROTATIONS[p.type][rot];
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m.length; c++)
        if (m[r][c]) out.push([x + c, y + r, c, r]);
    return out;
  }

  function collides(x, y, rot, p = piece) {
    for (const [cx, cy] of cells(p, rot, x, y)) {
      if (cx < 0 || cx >= COLS || cy >= ROWS + HIDDEN) return true;
      if (cy >= 0 && grid[cy][cx]) return true;
    }
    return false;
  }

  function onGround() {
    return collides(piece.x, piece.y + 1, piece.rot);
  }

  function resetLockIfGrounded() {
    if (lockResets < MAX_LOCK_RESETS) {
      lockTimer = 0;
      lockResets++;
    }
  }

  function tryMove(dx, dy) {
    if (collides(piece.x + dx, piece.y + dy, piece.rot)) return false;
    piece.x += dx;
    piece.y += dy;
    if (dx !== 0) resetLockIfGrounded();
    return true;
  }

  function tryRotate(dir) {
    if (piece.type === 'O') return;
    const from = piece.rot;
    const to = (from + dir + 4) % 4;
    const table = piece.type === 'I' ? KICKS_I : KICKS_JLSTZ;
    for (const [kx, ky] of table[`${from}>${to}`]) {
      const nx = piece.x + kx;
      const ny = piece.y - ky; // SRS y is up; our grid y is down
      if (!collides(nx, ny, to)) {
        piece.x = nx;
        piece.y = ny;
        piece.rot = to;
        resetLockIfGrounded();
        return;
      }
    }
  }

  function ghostY() {
    let y = piece.y;
    while (!collides(piece.x, y + 1, piece.rot)) y++;
    return y;
  }

  function hardDrop() {
    const gy = ghostY();
    score += (gy - piece.y) * 2;
    piece.y = gy;
    lock();
  }

  function hold() {
    if (holdUsed) return;
    const current = piece.type;
    if (holdType) {
      const swap = holdType;
      holdType = current;
      spawn(swap);
    } else {
      holdType = current;
      spawn(nextType());
    }
    holdUsed = true;
  }

  function lock() {
    let aboveVisible = true;
    for (const [x, y, lc, lr] of cells()) {
      if (y >= 0) grid[y][x] = { type: piece.type, rot: piece.rot, lc, lr, id: piece.id };
      if (y >= HIDDEN) aboveVisible = false;
    }
    // Lock out: piece locked entirely above the visible stage
    if (aboveVisible) return gameOver();

    const full = [];
    for (let y = 0; y < ROWS + HIDDEN; y++)
      if (grid[y].every(Boolean)) full.push(y);

    if (full.length) startCurtainCall(full);
    else spawn(nextType());
    updateHud();
  }

  // Cleared rows turn into a curtain call: the dancers in them step out of the grid and bow
  // until the player shouts ¡OLÉ!, then cartwheel off into the wings.
  function startCurtainCall(rows) {
    const byId = new Map();
    for (const y of rows) {
      for (let x = 0; x < COLS; x++) {
        const cell = grid[y][x];
        if (!byId.has(cell.id)) byId.set(cell.id, []);
        byId.get(cell.id).push({ x, y, cell });
        grid[y][x] = null;
      }
    }
    const groups = [...byId.values()].map((parts) => {
      const xs = parts.map(p => p.x), ys = parts.map(p => p.y - HIDDEN);
      const left = Math.min(...xs) * CELL, right = (Math.max(...xs) + 1) * CELL;
      const top = Math.min(...ys) * CELL, bottom = (Math.max(...ys) + 1) * CELL;
      const cx = (left + right) / 2;
      const dir = cx < W / 2 ? -1 : 1; // exit through the nearer wing
      return {
        parts, cx, cy: (top + bottom) / 2, bottom, dir,
        dist: (dir < 0 ? right : W - left) + CELL,
        delay: Math.random() * 220,
      };
    });

    const n = rows.length;
    score += LINE_SCORES[n] * level;
    lines += n;
    level = Math.floor(lines / 10) + 1;
    updateHud();

    curtainCall ={ rows, groups, t: 0, phase: 'bow', exitT: 0 };
    piece = null;
    const midY = (rows.reduce((a, b) => a + b, 0) / n - HIDDEN + 0.5) * CELL;
    effects.push({ kind: 'cheer', text: CHEERS[n], big: n === 4, x: W / 2, y: midY - CELL * 1.5, t: 0, life: 1300 });
    showOlePrompt();
  }

  function oleHeard() {
    if (!curtainCall || curtainCall.phase !== 'bow') return;
    curtainCall.phase = 'exit';
    hideOlePrompt();
    celebrate(curtainCall.rows, '¡OLÉ!');
  }

  function finishCurtainCall() {
    for (const y of curtainCall.rows) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(null));
    }
    curtainCall = null;
    updateHud();
    spawn(nextType());
  }

  function gravityInterval() {
    // Tetris guideline gravity curve, in ms per row
    const l = Math.min(level, 20) - 1;
    return Math.pow(0.8 - l * 0.007, l) * 1000;
  }

  function updateHud() {
    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      saveBest(best);
    }
  }

  // ---------- Microphone: shout ¡OLÉ! ----------
  // Listens for a sustained loud shout, measured against the room's background noise.
  // (Loudness works offline on every browser; speech recognition doesn't.)
  const OLE_HOLD = 300;           // ms of shouting needed to fill the meter
  const OLE_FALLBACK_AFTER = 5000; // show "can't shout? tap" after this long
  const mic = { status: 'idle', ctx: null, analyser: null, buf: null, level: 0, ambient: 0.02, meter: 0 };

  async function initMic() {
    if (mic.status !== 'idle') return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { mic.status = 'off'; return; }
    mic.status = 'pending';
    try {
      // Create and resume the audio context inside the tap, before awaiting (required on iOS)
      const AC = window.AudioContext || window.webkitAudioContext;
      mic.ctx = new AC();
      mic.ctx.resume();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      mic.analyser = mic.ctx.createAnalyser();
      mic.analyser.fftSize = 1024;
      mic.ctx.createMediaStreamSource(stream).connect(mic.analyser);
      mic.buf = new Uint8Array(mic.analyser.fftSize);
      mic.status = 'on';
    } catch {
      mic.status = 'off';
    }
  }

  function sampleMic() {
    if (mic.status !== 'on') return;
    mic.analyser.getByteTimeDomainData(mic.buf);
    let sum = 0;
    for (let i = 0; i < mic.buf.length; i++) {
      const v = (mic.buf[i] - 128) / 128;
      sum += v * v;
    }
    mic.level = Math.sqrt(sum / mic.buf.length);
    // Track background noise while nobody is being asked to shout
    if (!(curtainCall && curtainCall.phase === 'bow') && mic.level < 0.25)
      mic.ambient += (mic.level - mic.ambient) * 0.02;
  }

  const shoutThreshold = () => Math.min(0.35, Math.max(0.08, mic.ambient * 4));

  function listenForOle(dt) {
    if (mic.status === 'on') {
      const threshold = shoutThreshold();
      if (mic.level > threshold) mic.meter += dt / OLE_HOLD;
      else mic.meter = Math.max(0, mic.meter - dt / 900);
      const shown = Math.max(mic.meter, Math.min(0.95, mic.level / threshold) * 0.35);
      oleFill.style.width = `${Math.min(1, shown) * 100}%`;
      olePrompt.style.setProperty('--pulse', Math.min(1, mic.level / threshold).toFixed(2));
      if (mic.meter >= 1) return oleHeard();
    }
    if (curtainCall.t > OLE_FALLBACK_AFTER) oleTap.classList.remove('hidden');
  }

  function showOlePrompt() {
    mic.meter = 0;
    oleFill.style.width = '0%';
    olePrompt.style.setProperty('--pulse', 0);
    const listening = mic.status === 'on';
    oleKicker.textContent = listening ? '🎤 Shout' : '👏 Give them an';
    oleHint.textContent = listening ? 'to send the dancers off' : 'Mic is off: tap here to send the dancers off';
    olePrompt.classList.toggle('no-mic', !listening);
    oleTap.classList.toggle('hidden', listening);
    oleTap.textContent = listening ? "Can't shout? Tap" : '¡Olé!';
    olePrompt.classList.remove('hidden');
  }

  function hideOlePrompt() {
    olePrompt.classList.add('hidden');
  }

  // ---------- Effects ----------
  function celebrate(rows, text) {
    const n = rows.length;
    const midY = (rows.reduce((a, b) => a + b, 0) / n - HIDDEN + 0.5) * CELL;
    effects.push({ kind: 'cheer', text, big: true, x: W / 2, y: midY - CELL * 2, t: 0, life: 1400 });
    for (let i = 0; i < 28 * n + 20; i++) {
      const row = rows[i % n];
      effects.push({
        kind: 'confetti',
        x: Math.random() * W,
        y: (row - HIDDEN + Math.random()) * CELL,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.3,
        spin: Math.random() * Math.PI,
        vs: (Math.random() - 0.5) * 0.02,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        t: 0,
        life: 1400 + Math.random() * 600,
      });
    }
  }

  function updateEffects(dt) {
    for (const e of effects) {
      e.t += dt;
      if (e.kind === 'confetti') {
        e.vy += 0.0009 * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.spin += e.vs * dt;
      }
    }
    effects = effects.filter(e => e.t < e.life);
  }

  // ---------- Game flow ----------
  function newGame() {
    grid = Array.from({ length: ROWS + HIDDEN }, () => Array(COLS).fill(null));
    bag = [];
    queue = [];
    holdType = null;
    score = 0;
    lines = 0;
    level = 1;
    curtainCall = null;
    effects = [];
    hideOlePrompt();
    state = 'playing';
    overlay.classList.add('open');
    updateHud();
    spawn(nextType());
    lastTime = performance.now();
  }

  function gameOver() {
    state = 'over';
    piece = null;
    hideOlePrompt();
    overlayMsg.textContent = `Final bow — score ${score}`;
    startBtn.textContent = 'Encore!';
    overlay.classList.remove('open');
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      overlayMsg.textContent = 'Intermission';
      startBtn.textContent = 'Resume';
      overlay.classList.remove('open');
    } else if (state === 'paused') {
      state = 'playing';
      overlay.classList.add('open');
      lastTime = performance.now();
    }
  }

  async function startOrResume() {
    if (mic.ctx) mic.ctx.resume();
    if (state === 'paused') return togglePause();
    if (state === 'playing') return;
    if (mic.status === 'idle') {
      overlayMsg.textContent = 'Allow the mic: you\'ll need to shout ¡OLÉ!';
      await initMic();
    }
    if (mic.status !== 'pending') newGame();
  }

  // ---------- Update loop ----------
  function update(dt) {
    updateEffects(dt);

    if (curtainCall) {
      curtainCall.t += dt;
      if (curtainCall.phase === 'bow') listenForOle(dt);
      else if ((curtainCall.exitT += dt) > CARTWHEEL_TIME + 300) finishCurtainCall();
      return;
    }
    if (!piece) return;

    // Horizontal auto-repeat (DAS / ARR)
    if (input.dir !== 0) {
      input.dasTimer += dt;
      if (input.dasTimer >= DAS) {
        input.arrTimer += dt;
        while (input.arrTimer >= ARR) {
          input.arrTimer -= ARR;
          if (!tryMove(input.dir, 0)) break;
        }
      }
    }

    // Soft drop
    if (input.soft) {
      input.softTimer += dt;
      while (input.softTimer >= SOFT_DROP_INTERVAL) {
        input.softTimer -= SOFT_DROP_INTERVAL;
        if (tryMove(0, 1)) { score += 1; dropTimer = 0; updateHud(); }
        else break;
      }
    }

    // Gravity
    dropTimer += dt;
    const interval = gravityInterval();
    while (dropTimer >= interval) {
      dropTimer -= interval;
      if (!tryMove(0, 1)) { dropTimer = 0; break; }
    }

    // Lock delay
    if (onGround()) {
      lockTimer += dt;
      if (lockTimer >= LOCK_DELAY) lock();
    } else {
      lockTimer = 0;
    }
  }

  // ---------- Rendering: performers ----------
  function shade(hex, amt) {
    // amt > 0 mixes toward white, amt < 0 toward black
    const n = parseInt(hex.slice(1), 16);
    const mix = (v) => Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt));
    return `rgb(${mix(n >> 16)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
  }
  const TILE_SHADES = Object.fromEntries(Object.entries(PALETTE).map(([t, p]) => [
    t, { light: shade(p.tile, 0.35), mid: p.tile, dark: shade(p.tile, -0.45) },
  ]));

  function roundRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function polyline(c, pts) {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  }

  function drawFigure(c, f, accent) {
    c.strokeStyle = SILHOUETTE;
    c.fillStyle = SILHOUETTE;
    c.lineCap = 'round';
    c.lineJoin = 'round';

    c.lineWidth = 0.12;
    for (const limb of f.limbs) { polyline(c, limb); c.stroke(); }

    c.lineWidth = f.torsoW || 0.2;
    polyline(c, f.torso); c.stroke();

    if (f.skirt) {
      polyline(c, f.skirt);
      c.closePath();
      c.fillStyle = accent;
      c.fill();
      c.lineWidth = 0.04;
      c.stroke();
    }

    const [hx, hy] = f.head;
    const r = f.headR || 0.16;
    c.fillStyle = SILHOUETTE;
    c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.fill();

    if (f.hat) {
      c.fillRect(hx - r * 1.6, hy - r * 0.95, r * 3.2, r * 0.35); // brim
      c.fillRect(hx - r * 0.9, hy - r * 1.75, r * 1.8, r * 0.9);  // crown
      c.fillStyle = accent;
      c.fillRect(hx - r * 0.9, hy - r * 1.05, r * 1.8, r * 0.2);  // band
    }
    if (f.dots) {
      for (const [dx, dy, dr] of f.dots) {
        c.fillStyle = accent;
        c.beginPath(); c.arc(dx, dy, dr, 0, Math.PI * 2); c.fill();
        c.lineWidth = 0.035;
        c.stroke();
      }
    }
    if (f.flower) {
      c.fillStyle = accent;
      c.beginPath(); c.arc(hx + f.flower[0], hy + f.flower[1], r * 0.45, 0, Math.PI * 2); c.fill();
    }
  }

  // Draws one block of a performer: a lit tile plus the slice of the dancer that falls inside it.
  function drawPerformerCell(c, x, y, size, cell, alpha = 1, flash = 0) {
    const { type, rot, lc, lr } = cell;
    const shades = TILE_SHADES[type];
    const n = SHAPES[type].length;
    const inset = size * 0.025;
    const r = size * 0.16;

    c.save();
    c.globalAlpha *= alpha;

    roundRectPath(c, x + inset, y + inset, size - inset * 2, size - inset * 2, r);
    const g = c.createLinearGradient(0, y, 0, y + size);
    g.addColorStop(0, shades.light);
    g.addColorStop(0.55, shades.mid);
    g.addColorStop(1, shades.dark);
    c.fillStyle = g;
    c.fill();

    c.save();
    c.clip();
    c.translate(x - lc * size, y - lr * size);
    c.translate(n * size / 2, n * size / 2);
    c.rotate(rot * Math.PI / 2);
    c.translate(-n * size / 2, -n * size / 2);
    c.scale(size, size);
    for (const f of POSES[type]) drawFigure(c, f, PALETTE[type].accent);
    c.restore();

    // Glossy rim light
    c.strokeStyle = 'rgba(255,255,255,0.35)';
    c.lineWidth = 1.5;
    roundRectPath(c, x + inset + 0.75, y + inset + 0.75, size - inset * 2 - 1.5, size - inset * 2 - 1.5, r);
    c.stroke();

    if (flash > 0) {
      c.fillStyle = `rgba(255,250,230,${flash})`;
      c.fillRect(x, y, size, size);
    }
    c.restore();
  }

  // ---------- Rendering: stage ----------
  const backdrop = (() => {
    const cv = document.createElement('canvas');
    cv.width = W * dpr;
    cv.height = H * dpr;
    const b = cv.getContext('2d');
    b.scale(dpr, dpr);
    const g = b.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#12040a');
    g.addColorStop(0.6, '#2a0a16');
    g.addColorStop(1, '#3a1016');
    b.fillStyle = g;
    b.fillRect(0, 0, W, H);
    // Soft backdrop folds
    for (let x = 0; x < W; x += 20) {
      const fg = b.createLinearGradient(x, 0, x + 20, 0);
      fg.addColorStop(0, 'rgba(0,0,0,0.18)');
      fg.addColorStop(0.5, 'rgba(255,80,110,0.05)');
      fg.addColorStop(1, 'rgba(0,0,0,0.18)');
      b.fillStyle = fg;
      b.fillRect(x, 0, 20, H);
    }
    // Stage floor glow along the bottom
    const floor = b.createLinearGradient(0, H - 70, 0, H);
    floor.addColorStop(0, 'rgba(255,170,90,0)');
    floor.addColorStop(1, 'rgba(255,170,90,0.22)');
    b.fillStyle = floor;
    b.fillRect(0, H - 70, W, 70);
    // Faint grid
    b.strokeStyle = 'rgba(255,220,200,0.04)';
    b.lineWidth = 1;
    for (let x = 1; x < COLS; x++) { b.beginPath(); b.moveTo(x * CELL + 0.5, 0); b.lineTo(x * CELL + 0.5, H); b.stroke(); }
    for (let y = 1; y < ROWS; y++) { b.beginPath(); b.moveTo(0, y * CELL + 0.5); b.lineTo(W, y * CELL + 0.5); b.stroke(); }
    return cv;
  })();

  function drawSpotlight(originX, angle, color) {
    const len = H * 1.15;
    const spread = 0.2;
    ctx.save();
    ctx.translate(originX, -10);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, 0, len);
    g.addColorStop(0, color.replace('A', '0.28'));
    g.addColorStop(1, color.replace('A', '0'));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.lineTo(Math.tan(spread) * len, len);
    ctx.lineTo(-Math.tan(spread) * len, len);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBoard() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(backdrop, 0, 0, W, H);

    // Sweeping spotlights
    ctx.globalCompositeOperation = 'lighter';
    const s = clock / 1000;
    drawSpotlight(W * 0.15, -0.35 + Math.sin(s * 0.7) * 0.3, 'rgba(255,90,160,A)');
    drawSpotlight(W * 0.85, 0.35 + Math.sin(s * 0.9 + 1.5) * 0.3, 'rgba(90,200,255,A)');
    ctx.globalCompositeOperation = 'source-over';

    if (grid) {
      // Warm follow-spot on the active performer
      if (piece) {
        const n = SHAPES[piece.type].length;
        const cx = (piece.x + n / 2) * CELL;
        const cy = (piece.y - HIDDEN + n / 2) * CELL;
        const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, CELL * 3);
        g.addColorStop(0, 'rgba(255,230,160,0.28)');
        g.addColorStop(1, 'rgba(255,230,160,0)');
        ctx.fillStyle = g;
        ctx.fillRect(cx - CELL * 3, cy - CELL * 3, CELL * 6, CELL * 6);
      }

      // Locked performers
      for (let y = HIDDEN; y < ROWS + HIDDEN; y++) {
        for (let x = 0; x < COLS; x++) {
          const cell = grid[y][x];
          if (cell) drawPerformerCell(ctx, x * CELL, (y - HIDDEN) * CELL, CELL, cell);
        }
      }

      if (curtainCall) drawCurtainCall();

      if (piece) {
        // Ghost: dashed outline showing the landing spot
        const gy = ghostY();
        ctx.save();
        ctx.strokeStyle = PALETTE[piece.type].tile;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        for (const [x, y] of cells(piece, piece.rot, piece.x, gy))
          if (y >= HIDDEN) {
            roundRectPath(ctx, x * CELL + 3, (y - HIDDEN) * CELL + 3, CELL - 6, CELL - 6, 5);
            ctx.stroke();
          }
        ctx.restore();

        // Active performer (fades slightly as the lock timer runs out)
        const alpha = onGround() ? 1 - (lockTimer / LOCK_DELAY) * 0.35 : 1;
        for (const [x, y, lc, lr] of cells())
          if (y >= HIDDEN)
            drawPerformerCell(ctx, x * CELL, (y - HIDDEN) * CELL, CELL, { type: piece.type, rot: piece.rot, lc, lr }, alpha);
      }
    }

    drawEffects();
  }

  const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  // Bowing dancers (waiting for ¡OLÉ!), then cartwheels off to the nearer wing.
  function drawCurtainCall() {
    const cc = curtainCall;

    // Spotlight wash over the rows taking their bow
    const top = (Math.min(...cc.rows) - HIDDEN) * CELL, bottom = (Math.max(...cc.rows) - HIDDEN + 1) * CELL;
    const g = ctx.createLinearGradient(0, top - CELL * 2, 0, bottom);
    g.addColorStop(0, 'rgba(255,230,160,0)');
    g.addColorStop(1, 'rgba(255,230,160,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(0, top - CELL * 2, W, bottom - top + CELL * 2);

    for (const grp of cc.groups) {
      ctx.save();
      if (cc.phase === 'bow') {
        // Bow toward centre stage, pivoting at the feet; repeat until the crowd shouts
        const cycle = ((cc.t + grp.delay * 3) % 1300) / 1300;
        const amt = cycle < 0.35 ? easeInOut(cycle / 0.35)
          : cycle < 0.6 ? 1
          : cycle < 0.95 ? 1 - easeInOut((cycle - 0.6) / 0.35) : 0;
        ctx.translate(grp.cx, grp.bottom);
        ctx.rotate(-grp.dir * 0.42 * amt);
        ctx.scale(1, 1 - 0.12 * amt);
        ctx.translate(-grp.cx, -grp.bottom);
      } else {
        // Cartwheel: two full turns while hopping sideways off stage
        const p = Math.max(0, Math.min(1, (cc.exitT - grp.delay) / CARTWHEEL_TIME));
        const hop = -Math.abs(Math.sin(p * Math.PI * 2)) * CELL * 0.9;
        ctx.globalAlpha = p > 0.85 ? (1 - p) / 0.15 : 1;
        ctx.translate(grp.cx + grp.dir * grp.dist * easeInOut(p), grp.cy + hop);
        ctx.rotate(grp.dir * p * Math.PI * 4);
        ctx.translate(-grp.cx, -grp.cy);
      }
      for (const { x, y, cell } of grp.parts)
        drawPerformerCell(ctx, x * CELL, (y - HIDDEN) * CELL, CELL, cell);
      ctx.restore();
    }
  }

  function drawEffects() {
    for (const e of effects) {
      const fade = 1 - e.t / e.life;
      if (e.kind === 'confetti') {
        ctx.save();
        ctx.globalAlpha = Math.min(1, fade * 2);
        ctx.translate(e.x, e.y);
        ctx.rotate(e.spin);
        ctx.fillStyle = e.color;
        ctx.fillRect(-3, -1.5, 6, 3);
        ctx.restore();
      } else {
        const pop = Math.min(1, e.t / 150);
        const scale = (e.big ? 1.5 : 1) * (0.6 + 0.4 * pop);
        ctx.save();
        ctx.globalAlpha = Math.min(1, fade * 2.5);
        ctx.translate(e.x, e.y - e.t * 0.03);
        ctx.rotate(-0.08);
        ctx.scale(scale, scale);
        ctx.font = '400 34px Pacifico, cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#4a0a14';
        ctx.strokeText(e.text, 0, 0);
        ctx.fillStyle = '#ffe29a';
        ctx.shadowColor = '#ff3d6e';
        ctx.shadowBlur = 16;
        ctx.fillText(e.text, 0, 0);
        ctx.restore();
      }
    }
  }

  function drawMini(c, type, oy, box, dim = false) {
    const m = SHAPES[type];
    const size = 22;
    let minX = 4, maxX = -1, minY = 4, maxY = -1;
    m.forEach((row, y) => row.forEach((v, x) => {
      if (v) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    }));
    const w = (maxX - minX + 1) * size;
    const h = (maxY - minY + 1) * size;
    const px = (box - w) / 2;
    const py = oy + (box - h) / 2;
    m.forEach((row, y) => row.forEach((v, x) => {
      if (v) drawPerformerCell(c, px + (x - minX) * size, py + (y - minY) * size, size,
        { type, rot: 0, lc: x, lr: y }, dim ? 0.35 : 1);
    }));
  }

  function drawSide() {
    holdCtx.clearRect(0, 0, 96, 96);
    if (holdType) drawMini(holdCtx, holdType, 0, 96, holdUsed);

    nextCtx.clearRect(0, 0, 96, 288);
    if (queue) queue.slice(0, 3).forEach((t, i) => drawMini(nextCtx, t, i * 96, 96));
  }

  function frame(now) {
    const dt = Math.min(now - (lastTime || now), 100);
    lastTime = now;
    clock += dt;
    sampleMic();
    if (state === 'playing') update(dt);
    else if (state === 'over') updateEffects(dt);
    drawBoard();
    drawSide();
    requestAnimationFrame(frame);
  }

  // ---------- Input ----------
  const canAct = () => state === 'playing' && piece && !curtainCall;

  function pressHorizontal(dir) {
    input.dir = dir;
    input.dasTimer = 0;
    input.arrTimer = 0;
    if (canAct()) tryMove(dir, 0);
  }

  function releaseHorizontal(dir) {
    if (dir === -1) input.left = false; else input.right = false;
    if (input.left) pressHorizontal(-1);
    else if (input.right) pressHorizontal(1);
    else input.dir = 0;
  }

  document.addEventListener('keydown', (e) => {
    const k = e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) e.preventDefault();

    // Tap fallback for ¡OLÉ! is keyboard-accessible too, once it's showing
    const oleTapShowing = curtainCall && curtainCall.phase === 'bow' && !oleTap.classList.contains('hidden');
    if (oleTapShowing && (k === 'Enter' || k === ' ') && state === 'playing') { oleHeard(); return; }
    if (k === 'Enter') { startOrResume(); return; }
    if (k === 'p' || k === 'P' || k === 'Escape') { togglePause(); return; }
    if (e.repeat) return;

    switch (k) {
      case 'ArrowLeft': input.left = true; pressHorizontal(-1); break;
      case 'ArrowRight': input.right = true; pressHorizontal(1); break;
      case 'ArrowDown': input.soft = true; input.softTimer = SOFT_DROP_INTERVAL; break;
    }
    if (!canAct()) return;
    switch (k) {
      case 'ArrowUp': case 'x': case 'X': tryRotate(1); break;
      case 'z': case 'Z': case 'Control': tryRotate(-1); break;
      case ' ': hardDrop(); break;
      case 'c': case 'C': case 'Shift': hold(); break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'ArrowLeft': releaseHorizontal(-1); break;
      case 'ArrowRight': releaseHorizontal(1); break;
      case 'ArrowDown': input.soft = false; break;
    }
  });

  // Intermission automatically when the tab loses focus
  window.addEventListener('blur', () => {
    input.left = input.right = input.soft = false;
    input.dir = 0;
    if (state === 'playing') togglePause();
  });

  startBtn.addEventListener('click', startOrResume);

  // Tap to olé: the fallback button always works; the whole card works when the mic is off
  oleTap.addEventListener('click', (e) => { e.stopPropagation(); oleHeard(); });
  olePrompt.addEventListener('click', () => { if (mic.status !== 'on') oleHeard(); });

  // Debug helper for testing curtain calls: open with ?debug, then run salsaDebug.clear(2)
  if (new URLSearchParams(location.search).has('debug')) {
    window.salsaDebug = {
      clear(n = 1) {
        if (state !== 'playing' || curtainCall) return;
        const types = Object.keys(SHAPES);
        const rows = [];
        for (let i = 0; i < n; i++) {
          const y = ROWS + HIDDEN - 1 - i;
          rows.unshift(y);
          for (let x = 0; x < COLS; x += 2) {
            const type = types[Math.floor(Math.random() * types.length)];
            const id = ++pieceId;
            const m = ROTATIONS[type][0];
            const filled = [];
            m.forEach((row, r) => row.forEach((v, c) => { if (v) filled.push([c, r]); }));
            grid[y][x] = { type, rot: 0, lc: filled[0][0], lr: filled[0][1], id };
            grid[y][x + 1] = { type, rot: 0, lc: filled[1][0], lr: filled[1][1], id };
          }
        }
        startCurtainCall(rows);
      },
      mic,
    };
  }

  // Touch buttons
  document.querySelectorAll('.touch-controls button').forEach((btn) => {
    const action = btn.dataset.action;
    const down = (e) => {
      e.preventDefault();
      if (state !== 'playing') { if (action !== 'hold') startOrResume(); return; }
      switch (action) {
        case 'left': input.left = true; pressHorizontal(-1); break;
        case 'right': input.right = true; pressHorizontal(1); break;
        case 'soft': input.soft = true; input.softTimer = SOFT_DROP_INTERVAL; break;
        case 'rotate': if (canAct()) tryRotate(1); break;
        case 'drop': if (canAct()) hardDrop(); break;
        case 'hold': if (canAct()) hold(); break;
      }
    };
    const up = (e) => {
      e.preventDefault();
      switch (action) {
        case 'left': releaseHorizontal(-1); break;
        case 'right': releaseHorizontal(1); break;
        case 'soft': input.soft = false; break;
      }
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  });

  requestAnimationFrame(frame);
})();
