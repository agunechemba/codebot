/* =========================================================
   SOUND ENGINE
   ========================================================= */
const Sound = (() => {
  let ctx = null, muted = false;
  function ac(){
    if (!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type='sine', vol=0.14, when=0, slideTo=null){
    if (muted) return;
    const c = ac(); if (!c) return;
    try{
      const t0 = c.currentTime + when;
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(c.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.03);
    }catch(_){}
  }
  return {
    step(){ tone(560, 0.06, 'square', 0.05); },
    turn(){ tone(340, 0.08, 'triangle', 0.06); },
    bump(){ tone(150, 0.28, 'sawtooth', 0.17, 0, 65); tone(90, 0.3, 'square', 0.08, 0.02, 50); },
    pickup(){ [880, 1046, 1318].forEach((f,i)=>tone(f, 0.1, 'sine', 0.12, i*0.08)); },
    success(){ [523,659,784,1047].forEach((f,i)=>tone(f, 0.24, 'sine', 0.16, i*0.10)); },
    fail(){ tone(300,0.16,'square',0.13); tone(220,0.16,'square',0.13,0.15); tone(140,0.42,'square',0.13,0.30,80); },
    denied(){ tone(180,0.18,'square',0.14,0,120); },
    fanfare(){ [523,659,784,1047,1319,1568].forEach((f,i)=>tone(f, 0.32, 'triangle', 0.14, i*0.12)); },
    toggle(){ muted = !muted; if (!muted) tone(660, 0.1, 'sine', 0.1); return muted; },
    get muted(){ return muted; }
  };
})();

/* =========================================================
   LEVELS  (0=E, 1=S, 2=W, 3=N)
   ========================================================= */
const LEVELS = [
  /* ---------- 1–13 Original ---------- */
  { name:"1 · First Steps", dir:0, budget:3,
    hint:"Only 3 blocks allowed — but you need 4 steps! Wrap Move Forward in a Repeat block.",
    map:["S...G"] },

  { name:"2 · Two Runs", dir:0, budget:6,
    hint:"6 blocks max. East then south — one Repeat block per straight run.",
    map:["S.....","......",".....G"] },

  { name:"3 · Serpentine", dir:0, budget:16,
    hint:"16 blocks. Without loops this zig-zag takes 20 — use Repeat for each straight section.",
    map:["S....","####.",".....",".####","....G"] },

  { name:"4 · Watch Out!", dir:0, budget:8,
    hint:"8 blocks. East, then a long run south, then one more step east.",
    map:["S....","....#","....#","....#","....G"] },

  { name:"5 · Shortest Path", dir:0, budget:8,
    hint:"8 blocks. Find the shortest way through the pillars — it's only two straight runs.",
    map:["S....",".#.#.",".#.#.",".....","..G.."] },

  { name:"6 · Long Way", dir:0, budget:6,
    hint:"6 blocks for a long diagonal. Two Repeat blocks are all you need.",
    map:["S.....","......","......","......",".....G"] },

  { name:"7 · Around the Walls", dir:0, budget:17,
    hint:"17 blocks. Loop around the inner walls with Repeat blocks.",
    map:["S.....",".####.",".#..#.",".#..#.",".#..G.",".####."] },

  { name:"8 · Down and Across", dir:0, budget:6,
    hint:"6 blocks. Go all the way down first, then all the way across.",
    map:["S.....",".#.#..",".#.#..",".#....",".#.##.","...G.."] },

  { name:"9 · Long Corridors", dir:0, budget:9,
    hint:"9 blocks. Three long runs with two turns — three Repeat blocks.",
    map:["S...#..","###.#..","..#.#..","..#.#..","..#...G"] },

  { name:"10 · The Long Way", dir:0, budget:8,
    hint:"8 blocks. East, south, then a single step west.",
    map:["S......",".#####.",".#...G.",".#.###.",".#.....",".######"] },

  { name:"11 · Spiral", dir:0, budget:16,
    hint:"16 blocks. Five straight segments — plan the spiral, then use five Repeat blocks.",
    map:["S....","####.","..G#.",".###.","....."] },

  { name:"12 · Snake Maze", dir:0, budget:22,
    hint:"22 blocks. Seven runs in a snake pattern. Repeat blocks keep it under the limit.",
    map:["S....","####.",".....",".####",".....","####.","..G.."] },

  { name:"13 · Grand Finale", dir:0, budget:19,
    hint:"19 blocks. Six long runs across the board. Plan your route, then loop it.",
    map:["S......","######.",".......",".######",".......","######.","......G"] },

  /* ---------- 14–29 Extended ---------- */
  { name:"14 · Corner", dir:0, budget:5,
    hint:"Only 5 blocks. East then south — two Repeat blocks do the trick.",
    map:["S....",".....",".....",".....","....G"] },

  { name:"15 · Long L", dir:0, budget:5,
    hint:"5 blocks. A long run east, then a long run south.",
    map:["S.....","......","......","......","......",".....G"] },

  { name:"16 · Zigzag", dir:1, budget:8,
    hint:"8 blocks. Start facing south — then across, down, and across again.",
    map:["S.....",".....#","......","#.....",".....G"] },

  { name:"17 · Spiral", dir:0, budget:14,
    hint:"14 blocks. A long spiral — use Repeat blocks for each straight section.",
    map:["S....","####.","#..G.","#.#..","#...."] },

  { name:"18 · Around", dir:0, budget:11,
    hint:"11 blocks. Around the outside walls and into the centre.",
    map:["S....",".###.",".#G..",".###.","....."] },

  { name:"19 · Wide L", dir:0, budget:5,
    hint:"5 blocks. A long eastward run, then south.",
    map:["S......",".......",".......",".......","......G"] },

  { name:"20 · Snake", dir:0, budget:14,
    hint:"14 blocks. Follow the snake — many turns, but Repeat blocks save the day.",
    map:["S.....","#####.","......",".#####","......",".....G"] },

  { name:"21 · Comb", dir:0, budget:5,
    hint:"5 blocks. Down the left, then all the way east.",
    map:["S.....",".#.#.#",".#.#.#",".#.#.#",".....G"] },

  { name:"22 · Two Bends", dir:0, budget:11,
    hint:"11 blocks. Down, across, down, and one final step.",
    map:["S.....",".....#","......","#.....","#...G."] },

  { name:"23 · Spiral 2", dir:0, budget:17,
    hint:"17 blocks. Follow the right edge down, then cut across.",
    map:["S.....",".####.",".#....",".#G...",".####.","......"] },

  { name:"24 · Tight", dir:0, budget:5,
    hint:"5 blocks. Simple L-shape with a tight budget.",
    map:["S.....","......","......","......","....G."] },

  { name:"25 · Maze 1", dir:0, budget:26,
    hint:"26 blocks. Find the gap to enter the interior maze.",
    map:["S.....",".####.",".#....",".#.#.#",".#G#.#",".#####"] },

  { name:"26 · Maze 2", dir:0, budget:11,
    hint:"11 blocks. The goal is in the centre — find the way in.",
    map:["S....",".###.",".#G#.",".#.#.","....."] },

  { name:"27 · Maze 3", dir:0, budget:17,
    hint:"17 blocks. Similar challenge, different walls.",
    map:["S.....",".####.","......",".#.##.",".#G.#.",".#####"] },

  { name:"28 · Winding", dir:0, budget:20,
    hint:"20 blocks. This maze requires careful planning. Loop through the corridors.",
    map:["S.....","####..","#....#","#.##.#","#.G#.#","#....#","######"] },

  { name:"29 · Grand Finale", dir:0, budget:20,
    hint:"20 blocks. The final challenge — a bigger maze. Find the efficient path.",
    map:["S......","#####..","#.....#","#.###.#","#.#G#.#","#.....#","#######"] },

  /* ---------- 30–31 Variables ---------- */
  { name:"30 · Variables", dir:0, budget:10,
    hint:"Introducing Variables! Pick up the key 🔑 to unlock the door 🚪. Use 'If has key' to check your state.",
    map:["S.K..",
         "####.",
         "...D.",
         "...G."] },

  { name:"31 · Two Keys", dir:0, budget:22,
    hint:"You need two keys for two doors. Use loops and conditionals to get to the goal.",
    map:["S.K..",
         "####.",
         "...K.",
         ".D###",
         "...DG"] }
];

const DIRS = [[1,0],[0,1],[-1,0],[0,-1]];
const LABELS = { move:"Move Forward", left:"Turn Left", right:"Turn Right", repeat:"Repeat", ifelse:"If", until:"Repeat Until Goal" };
const SPEED = 250;
const MAX_STEPS = 700;

/* =========================================================
   STATE
   ========================================================= */
let program = [];
let uid = 1;
let dragData = null;
let indicatorEl = null;
let currentDrop = null;
let running = false;
let stopRequested = false;
let won = false;
let totalSteps = 0;
let robot = { x:0, y:0, dir:0, hasKey:false };
let startPos = { x:0, y:0 };
let goalPos  = { x:0, y:0 };
let cellSize = 56;
let cols = 5, rows = 3;
let currentLevel = 0;
let paletteClickGuard = false;
let currentMap = [];

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* =========================================================
   PROGRAM MODEL
   ========================================================= */
function getList(listPath){
  let cur = program;
  for (let i = 0; i < listPath.length; i += 2){
    cur = cur[listPath[i]][listPath[i + 1]];
  }
  return cur;
}
function samePath(a, b){ return a.length === b.length && a.every((v,i)=>v===b[i]); }
function isPrefix(prefix, full){
  return full.length >= prefix.length && prefix.every((v,i)=>v===full[i]);
}
function createBlock(type){
  const b = { id: uid++, type };
  if (type === "repeat"){ b.times = 3; b.body = []; }
  if (type === "ifelse"){ b.cond = "wall"; b.then = []; b.else = []; }
  if (type === "until"){ b.body = []; }
  return b;
}
function countBlocks(list){
  let n = 0;
  for (const b of list){
    n++;
    if (b.body) n += countBlocks(b.body);
    if (b.then) n += countBlocks(b.then);
    if (b.else) n += countBlocks(b.else);
  }
  return n;
}

/* =========================================================
   BUDGET
   ========================================================= */
function currentBudget(){ return LEVELS[currentLevel].budget; }
function usedBlocks(){ return countBlocks(program); }
function canAddBlock(){ return usedBlocks() < currentBudget(); }

function updateBudgetUI(){
  const used = usedBlocks(), max = currentBudget();
  const label = $("budgetLabel");
  if (!label) return;

  label.textContent = `Blocks ${used} / ${max}`;
  const fill = $("budgetFill");
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0;
  fill.style.width = pct + "%";

  const full = used >= max;
  const warn = !full && used >= max - 1;

  label.classList.toggle("full", full);
  label.classList.toggle("warn", warn);
  fill.classList.toggle("full", full);
  fill.classList.toggle("warn", warn);

  document.querySelectorAll(".palette-item").forEach(el => {
    el.classList.toggle("disabled", full);
  });
}

function flashBudget(){
  const label = $("budgetLabel");
  if (label){
    label.classList.remove("shake");
    void label.offsetWidth;
    label.classList.add("shake");
  }
  flash("Block limit reached! Use a Repeat block to do more with fewer blocks.");
  Sound.denied();
  updateBudgetUI();
}

/* =========================================================
   WORKSPACE RENDER
   ========================================================= */
function renderWorkspace(){
  const ws = $("workspace");
  ws.innerHTML = "";
  const root = renderList(program, []);
  root.classList.add("root-list");
  ws.appendChild(root);
  updateBudgetUI();
}

function renderList(list, listPath){
  const el = document.createElement("div");
  el.className = "block-list";
  if (list.length === 0){
    el.classList.add("empty");
    const ph = document.createElement("div");
    ph.className = "placeholder";
    ph.textContent = "drop blocks here";
    el.appendChild(ph);
  }
  list.forEach((b, i) => el.appendChild(renderBlock(b, listPath, i)));
  attachListDrop(el, listPath);
  return el;
}

function renderBlock(b, listPath, index){
  const wrap = document.createElement("div");
  wrap.className = "block block-" + b.type;
  wrap.dataset.id = b.id;

  const header = document.createElement("div");
  header.className = "block-header";
  header.draggable = true;

  const label = document.createElement("span");
  label.className = "block-label";
  label.textContent = LABELS[b.type];
  header.appendChild(label);

  if (b.type === "repeat"){
    const input = document.createElement("input");
    input.type = "number";
    input.className = "times";
    input.min = 1; input.max = 30; input.value = b.times;
    input.draggable = false;
    input.addEventListener("mousedown", e => e.stopPropagation());
    input.addEventListener("click", e => e.stopPropagation());
    input.addEventListener("change", () => {
      let v = parseInt(input.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      if (v > 30) v = 30;
      b.times = v; input.value = v;
    });
    header.appendChild(input);
    const t = document.createElement("span");
    t.className = "block-label";
    t.textContent = "times";
    header.appendChild(t);
  }

  if (b.type === "ifelse"){
    const sel = document.createElement("select");
    sel.className = "cond";
    sel.draggable = false;
    [["wall","wall ahead"],["clear","path is clear"],["goal","at the goal"],["key","has key"]].forEach(([val,txt])=>{
      const o = document.createElement("option");
      o.value = val; o.textContent = txt;
      if (b.cond === val) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("mousedown", e => e.stopPropagation());
    sel.addEventListener("click", e => e.stopPropagation());
    sel.addEventListener("change", () => { b.cond = sel.value; });
    header.appendChild(sel);

    const thenLabel = document.createElement("span");
    thenLabel.className = "block-label";
    thenLabel.textContent = "then";
    header.appendChild(thenLabel);
  }

  const del = document.createElement("button");
  del.className = "del";
  del.textContent = "✕";
  del.title = "Delete block";
  del.draggable = false;
  del.addEventListener("mousedown", e => e.stopPropagation());
  del.addEventListener("click", e => {
    e.stopPropagation();
    if (running) return;
    getList(listPath).splice(index, 1);
    renderWorkspace();
  });
  header.appendChild(del);

  header.addEventListener("dragstart", e => {
    if (running){ e.preventDefault(); return; }
    e.stopPropagation();
    dragData = { fromPalette: false, path: [...listPath, index] };
    try {
      e.dataTransfer.setData("text/plain", "block");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setDragImage(wrap, 24, 18);
    } catch(_) {}
    wrap.classList.add("dragging");
  });
  header.addEventListener("dragend", () => {
    wrap.classList.remove("dragging");
    dragData = null;
    clearIndicator();
    document.querySelectorAll(".drop-target").forEach(n => n.classList.remove("drop-target"));
  });

  header.addEventListener("dragover", e => {
    if (!dragData) return;
    e.preventDefault();
    e.stopPropagation();
    const r = header.getBoundingClientRect();
    const before = e.clientY < r.top + r.height / 2;
    setIndicator(header, before);
    currentDrop = { listPath, index, pos: before ? "before" : "after" };
  });
  header.addEventListener("dragleave", e => {
    if (!header.contains(e.relatedTarget)) clearIndicator();
  });
  header.addEventListener("drop", e => {
    if (!dragData) return;
    e.preventDefault();
    e.stopPropagation();
    performDrop();
  });

  wrap.appendChild(header);

  if (b.type === "repeat" || b.type === "until"){
    const body = document.createElement("div");
    body.className = "block-body";
    body.appendChild(renderList(b.body, [...listPath, index, "body"]));
    wrap.appendChild(body);
  }
  if (b.type === "ifelse"){
    const body = document.createElement("div");
    body.className = "block-body";
    body.appendChild(renderList(b.then, [...listPath, index, "then"]));
    wrap.appendChild(body);

    const div = document.createElement("div");
    div.className = "else-divider";
    div.textContent = "else";
    wrap.appendChild(div);

    const body2 = document.createElement("div");
    body2.className = "block-body";
    body2.appendChild(renderList(b.else, [...listPath, index, "else"]));
    wrap.appendChild(body2);
  }

  return wrap;
}

function attachListDrop(el, listPath){
  el.addEventListener("dragover", e => {
    if (!dragData) return;
    e.preventDefault();
    e.stopPropagation();
    clearIndicator();
    el.classList.add("drop-target");
    currentDrop = { listPath, index: getList(listPath).length, pos: "before" };
  });
  el.addEventListener("dragleave", e => {
    if (!el.contains(e.relatedTarget)) el.classList.remove("drop-target");
  });
  el.addEventListener("drop", e => {
    if (!dragData) return;
    e.preventDefault();
    e.stopPropagation();
    el.classList.remove("drop-target");
    performDrop();
  });
}

function setIndicator(el, before){
  const cls = before ? "drop-before" : "drop-after";
  if (indicatorEl === el && el.classList.contains(cls)) return;
  clearIndicator();
  el.classList.add(cls);
  indicatorEl = el;
}
function clearIndicator(){
  if (indicatorEl){
    indicatorEl.classList.remove("drop-before", "drop-after");
    indicatorEl = null;
  }
}

function performDrop(){
  if (!dragData || !currentDrop) return;

  const { listPath, index, pos } = currentDrop;
  const insertIndex = index + (pos === "after" ? 1 : 0);

  if (dragData.fromPalette){
    if (!canAddBlock()){
      dragData = null; currentDrop = null;
      clearIndicator();
      document.querySelectorAll(".drop-target").forEach(n => n.classList.remove("drop-target"));
      flashBudget();
      return;
    }
    getList(listPath).splice(insertIndex, 0, createBlock(dragData.type));
  } else {
    const srcPath = dragData.path;
    if (isPrefix(srcPath, listPath)){
      dragData = null; currentDrop = null; return;
    }
    const srcListPath = srcPath.slice(0, -1);
    const srcIndex = srcPath[srcPath.length - 1];
    const srcList = getList(srcListPath);
    const moved = srcList[srcIndex];
    if (!moved){ dragData = null; currentDrop = null; return; }

    srcList.splice(srcIndex, 1);

    let idx = insertIndex;
    if (samePath(srcListPath, listPath) && srcIndex < insertIndex) idx--;

    getList(listPath).splice(idx, 0, moved);
  }

  dragData = null;
  currentDrop = null;
  clearIndicator();
  document.querySelectorAll(".drop-target").forEach(n => n.classList.remove("drop-target"));
  renderWorkspace();
}

/* =========================================================
   STAGE RENDER
   ========================================================= */
const ROBOT_SVG = `
<svg viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="36" fill="rgba(56,189,248,.16)"/>
  <rect x="20" y="25" width="50" height="50" rx="15" fill="url(#rg)" stroke="#0369a1" stroke-width="2.5"/>
  <circle cx="37" cy="43" r="6.5" fill="#0b1220"/>
  <circle cx="55" cy="43" r="6.5" fill="#0b1220"/>
  <circle cx="37" cy="43" r="2.4" fill="#7dd3fc"/>
  <circle cx="55" cy="43" r="2.4" fill="#7dd3fc"/>
  <rect x="32" y="60" width="26" height="5" rx="2.5" fill="rgba(11,18,32,.55)"/>
  <path d="M72 50 L94 38 L94 62 Z" fill="#fbbf24" stroke="#b45309" stroke-width="2.5" stroke-linejoin="round"/>
</svg>`;

function renderStage(){
  const level = LEVELS[currentLevel];
  rows = level.map.length;
  cols = level.map[0].length;
  cellSize = Math.min(64, Math.floor(390 / Math.max(cols, rows)));

  currentMap = level.map.map(row => row.split(''));

  const grid = $("grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  grid.style.width  = (cols * cellSize) + "px";
  grid.style.height = (rows * cellSize) + "px";

  for (let y = 0; y < rows; y++){
    for (let x = 0; x < cols; x++){
      const ch = currentMap[y][x];
      const c = document.createElement("div");
      c.className = "cell";
      if (ch === "#") c.classList.add("wall");
      if (ch === "G"){
        c.classList.add("goal");
        c.innerHTML = '<span class="goal-icon">🎯</span>';
        goalPos = { x, y };
      }
      if (ch === "S"){
        c.classList.add("start");
        startPos = { x, y };
      }
      if (ch === "K"){
        c.classList.add("key");
        c.innerHTML = '🔑';
      }
      if (ch === "D"){
        c.classList.add("door");
        c.innerHTML = '🚪';
      }
      grid.appendChild(c);
    }
  }

  const rEl = document.createElement("div");
  rEl.id = "robot";
  rEl.style.width  = cellSize + "px";
  rEl.style.height = cellSize + "px";
  rEl.innerHTML = `<div class="robot-inner">${ROBOT_SVG}</div>`;
  grid.appendChild(rEl);

  $("levelName").textContent = level.name;
  $("hint").textContent = level.hint;
  $("hint").style.color = "";
  $("prevBtn").disabled = currentLevel === 0;
  $("nextBtn").disabled = currentLevel === LEVELS.length - 1;

  resetRobot();
  updateBudgetUI();
}

function updateRobot(animate = true){
  const el = $("robot");
  if (!el) return;
  el.style.transition = animate ? "transform .26s ease" : "none";
  el.style.transform  = `translate(${robot.x * cellSize}px, ${robot.y * cellSize}px)`;
  const inner = el.querySelector(".robot-inner");
  inner.style.transition = animate ? "transform .26s ease" : "none";
  inner.style.transform  = `rotate(${robot.dir * 90}deg)`;
  if (!animate) void el.offsetWidth;
}

function resetRobot(){
  robot = { x: startPos.x, y: startPos.y, dir: LEVELS[currentLevel].dir || 0, hasKey: false };
  document.querySelectorAll(".cell.visited").forEach(c => c.classList.remove("visited"));
  const el = $("robot");
  if (el) el.classList.remove("bump");
  updateRobot(false);
}

function markVisited(x, y){
  const idx = y * cols + x;
  const cell = $("grid").children[idx];
  if (cell && !cell.classList.contains("goal")) cell.classList.add("visited");
}

function isWalkable(x, y){
  if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
  const ch = currentMap[y][x];
  if (ch === "#") return false;
  if (ch === "D" && !robot.hasKey) return false;
  return true;
}
function atGoal(){ return robot.x === goalPos.x && robot.y === goalPos.y; }

/* =========================================================
   INTERPRETER
   ========================================================= */
async function runProgram(){
  if (running) return;

  const total = countBlocks(program);
  if (total === 0){ flash("Add some blocks to your program first."); Sound.fail(); return; }

  running = true;
  stopRequested = false;
  won = false;
  totalSteps = 0;
  setControls();
  resetRobot();
  await sleep(200);

  try {
    await execList(program);
  } catch(err){
    console.error(err);
    flash("Something went wrong while running your program.");
  }

  clearHighlight();
  running = false;
  setControls();

  if (won){
    if (currentLevel === LEVELS.length - 1) Sound.fanfare();
    else Sound.success();
    await sleep(350);
    showWin();
  } else if (!stopRequested){
    Sound.fail();
    if (totalSteps >= MAX_STEPS) flash("The robot ran too many steps — check for an infinite loop!");
    else flash("The robot didn't reach the goal. Adjust your program and try again!");
  }
}

async function execList(list){
  for (const b of list){
    if (stopRequested || won) return;
    highlight(b.id);
    await sleep(SPEED / 2);
    await execBlock(b);
    if (stopRequested || won) return;
    await sleep(SPEED / 2);
  }
}

async function execBlock(b){
  switch(b.type){
    case "move": {
      totalSteps++;
      if (totalSteps > MAX_STEPS){ stopRequested = true; return; }
      const [dx, dy] = DIRS[robot.dir];
      const nx = robot.x + dx, ny = robot.y + dy;
      if (!isWalkable(nx, ny)){
        bumpRobot();
        Sound.bump();
        await sleep(420);
        stopRequested = true;
        return;
      }
      markVisited(robot.x, robot.y);
      robot.x = nx; robot.y = ny;

      const target = currentMap[robot.y][robot.x];
      if (target === "K" && !robot.hasKey) {
        robot.hasKey = true;
        currentMap[robot.y][robot.x] = ".";
        const idx = robot.y * cols + robot.x;
        const cell = $("grid").children[idx];
        if (cell) { cell.className = "cell"; cell.innerHTML = ""; }
        Sound.pickup();
      }
      if (target === "D") {
        currentMap[robot.y][robot.x] = ".";
        const idx = robot.y * cols + robot.x;
        const cell = $("grid").children[idx];
        if (cell) { cell.className = "cell"; cell.innerHTML = ""; }
        Sound.step();
      }

      updateRobot();
      Sound.step();
      if (atGoal()) won = true;
      break;
    }
    case "left": {
      totalSteps++;
      if (totalSteps > MAX_STEPS){ stopRequested = true; return; }
      robot.dir = (robot.dir + 3) % 4;
      updateRobot();
      Sound.turn();
      break;
    }
    case "right": {
      totalSteps++;
      if (totalSteps > MAX_STEPS){ stopRequested = true; return; }
      robot.dir = (robot.dir + 1) % 4;
      updateRobot();
      Sound.turn();
      break;
    }
    case "repeat": {
      const n = Math.max(1, Math.min(30, b.times | 0));
      for (let i = 0; i < n; i++){
        if (stopRequested || won) return;
        await execList(b.body);
      }
      break;
    }
    case "ifelse": {
      const ok = checkCond(b.cond);
      await execList(ok ? b.then : b.else);
      break;
    }
    case "until": {
      let guard = 0;
      while (!stopRequested && !won && guard++ < 300){
        const before = `${robot.x},${robot.y},${robot.dir}`;
        await execList(b.body);
        const after = `${robot.x},${robot.y},${robot.dir}`;
        if (before === after) break;
      }
      break;
    }
  }
}

function checkCond(cond){
  const [dx, dy] = DIRS[robot.dir];
  const ahead = isWalkable(robot.x + dx, robot.y + dy);
  switch(cond){
    case "wall":  return !ahead;
    case "clear": return ahead;
    case "goal":  return atGoal();
    case "key":   return robot.hasKey;
    default:      return false;
  }
}

function highlight(id){
  document.querySelectorAll(".block.running").forEach(n => n.classList.remove("running"));
  if (id == null) return;
  const el = document.querySelector(`.block[data-id="${id}"]`);
  if (el){
    el.classList.add("running");
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}
function clearHighlight(){
  document.querySelectorAll(".block.running").forEach(n => n.classList.remove("running"));
}

function bumpRobot(){
  const el = $("robot");
  if (!el) return;
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 480);
}

function setControls(){
  $("runBtn").disabled = running;
  $("stopBtn").disabled = !running;
}

function flash(msg){
  const h = $("hint");
  h.textContent = msg;
  h.style.color = "#fca5a5";
  clearTimeout(flash._t);
  flash._t = setTimeout(() => {
    h.textContent = LEVELS[currentLevel].hint;
    h.style.color = "";
  }, 3200);
}

/* =========================================================
   WIN OVERLAY
   ========================================================= */
function showWin(){
  const last = currentLevel === LEVELS.length - 1;
  $("ovIcon").textContent = last ? "🏆" : "🎉";
  $("ovTitle").textContent = last ? "You Beat Every Level!" : "Level Complete!";
  $("ovText").textContent = last
    ? "You solved all 31 mazes while staying under budget — that's real programming!"
    : `You solved “${LEVELS[currentLevel].name}”. Ready for the next one?`;
  $("ovBtn").textContent = last ? "Play Again ↺" : "Next Level →";
  $("ovBtn").onclick = () => {
    $("overlay").classList.add("hidden");
    if (last){
      currentLevel = 0;
      program = [];
      renderWorkspace();
      renderStage();
    } else {
      gotoLevel(currentLevel + 1);
    }
  };
  $("overlay").classList.remove("hidden");
}

function gotoLevel(i){
  currentLevel = Math.max(0, Math.min(LEVELS.length - 1, i));
  program = [];
  renderWorkspace();
  renderStage();
}

/* =========================================================
   INIT / EVENTS
   ========================================================= */
function init(){
  document.querySelectorAll(".palette-item").forEach(el => {
    el.addEventListener("dragstart", e => {
      if (running){ e.preventDefault(); return; }
      if (!canAddBlock()){ e.preventDefault(); flashBudget(); return; }
      paletteClickGuard = true;
      setTimeout(() => paletteClickGuard = false, 150);
      dragData = { fromPalette: true, type: el.dataset.type };
      try {
        e.dataTransfer.setData("text/plain", el.dataset.type);
        e.dataTransfer.effectAllowed = "copy";
      } catch(_) {}
    });
    el.addEventListener("dragend", () => {
      dragData = null;
      clearIndicator();
      document.querySelectorAll(".drop-target").forEach(n => n.classList.remove("drop-target"));
    });
    el.addEventListener("click", () => {
      if (running || paletteClickGuard) return;
      if (!canAddBlock()){ flashBudget(); return; }
      program.push(createBlock(el.dataset.type));
      renderWorkspace();
      Sound.turn();
    });
  });

  document.addEventListener("dragend", () => {
    dragData = null;
    currentDrop = null;
    clearIndicator();
    document.querySelectorAll(".drop-target").forEach(n => n.classList.remove("drop-target"));
  });
  document.addEventListener("dragover", e => { if (dragData) e.preventDefault(); });

  $("runBtn").addEventListener("click", runProgram);
  $("stopBtn").addEventListener("click", () => { stopRequested = true; });
  $("resetBtn").addEventListener("click", () => { if (!running) resetRobot(); });
  $("clearBtn").addEventListener("click", () => {
    if (running) return;
    program = [];
    renderWorkspace();
    resetRobot();
  });
  $("prevBtn").addEventListener("click", () => { if (!running) gotoLevel(currentLevel - 1); });
  $("nextBtn").addEventListener("click", () => { if (!running) gotoLevel(currentLevel + 1); });

  $("muteBtn").addEventListener("click", () => {
    const muted = Sound.toggle();
    $("muteBtn").textContent = muted ? "🔇 Sound Off" : "🔊 Sound On";
  });

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (!running) renderStage(); }, 180);
  });

  renderWorkspace();
  renderStage();
  setControls();
}

init();