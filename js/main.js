/**
 * Barbell Legends: Iron Empire - Main entry
 * Vanilla JS Idle RPG / Life Simulator
 */
import { generateCharacter } from './character.js';
import { Simulation } from './simulation.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { saveGame, loadGame, deleteGame, hasSave, exportSave, importSaveFile } from './save.js';
import { PROGRAMS } from './data.js';

const ui = new UI();
let sim = null;
let renderer = null;
let menuRenderer = null;
let currentGenChar = null;
let currentGenSeed = Date.now();
let animId = null;
let lastTs = 0;
let autoSaveTimer = 0;

// ---------- Boot ----------
async function boot() {
  ui.setLoading(10, 'Inicializando...');
  await delay(100);

  // Canvas setup
  const gameCanvas = document.getElementById('game-canvas');
  const menuCanvas = document.getElementById('menu-canvas');
  renderer = new Renderer(gameCanvas);
  menuRenderer = new Renderer(menuCanvas);

  ui.setLoading(40, 'Verificando save...');
  const exists = await hasSave();
  document.getElementById('btn-continue').disabled = !exists;

  ui.setLoading(70, 'Preparando interface...');
  bindEvents();
  await delay(200);

  ui.setLoading(100, 'Pronto!');
  await delay(300);
  ui.showScreen('main-menu');
  startMenuLoop();
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ---------- Menu animation ----------
function startMenuLoop() {
  cancelAnimationFrame(animId);
  const loop = () => {
    if (!document.getElementById('main-menu').classList.contains('active')) return;
    menuRenderer.render({ scene: 'menu', char: null, activity: 'idle' });
    animId = requestAnimationFrame(loop);
  };
  loop();
}

// ---------- Events ----------
function bindEvents() {
  document.getElementById('btn-new-career').addEventListener('click', onNewCareer);
  document.getElementById('btn-continue').addEventListener('click', onContinue);
  document.getElementById('btn-settings').addEventListener('click', () => ui.showModal('settings-modal'));
  document.getElementById('btn-close-settings').addEventListener('click', () => ui.hideModal('settings-modal'));
  document.getElementById('btn-reroll').addEventListener('click', rerollCharacter);
  document.getElementById('btn-accept').addEventListener('click', acceptCharacter);
  document.getElementById('btn-pause').addEventListener('click', togglePause);
  document.getElementById('btn-close-offline').addEventListener('click', () => ui.hideModal('offline-modal'));
  document.getElementById('btn-enter-comp').addEventListener('click', onEnterComp);
  document.getElementById('btn-delete-save').addEventListener('click', onDeleteSave);
  document.getElementById('btn-export-save').addEventListener('click', onExportSave);
  document.getElementById('btn-import-save').addEventListener('click', () => document.getElementById('import-file').click());
  document.getElementById('import-file').addEventListener('change', onImportSave);

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const pane = document.getElementById('tab-' + tab.dataset.tab);
      if (pane) pane.classList.add('active');
      if (tab.dataset.tab === 'schedule' && sim) ui.updateSchedule(sim);
    });
  });

  // Program select
  document.getElementById('program-select').addEventListener('change', (e) => {
    if (!sim) return;
    sim.char.training.program = e.target.value;
    sim.buildWeeklyPlan();
    ui.updateTraining(sim);
    ui.toast('Programa alterado: ' + (PROGRAMS[e.target.value]?.name || e.target.value));
  });

  // Time speed
  document.getElementById('time-speed').addEventListener('change', (e) => {
    if (sim) sim.speed = parseFloat(e.target.value);
  });

  // Mobile nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.querySelector('.side-panel');
      if (btn.dataset.view === 'stats') {
        panel.classList.add('open');
      } else if (btn.dataset.view === 'scene') {
        panel.classList.remove('open');
      } else if (btn.dataset.view === 'menu') {
        // Soft pause + settings
        if (sim) sim.paused = true;
        ui.showModal('settings-modal');
      }
    });
  });

  // Visibility change → save
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && sim) {
      doSave();
    }
  });

  window.addEventListener('beforeunload', () => {
    if (sim) {
      // Sync save best-effort
      const data = sim.getSaveData();
      try {
        localStorage.setItem('barbell_legends_save', JSON.stringify({ id: 'main', ...data, savedAt: Date.now() }));
      } catch (_) {}
    }
  });
}

// ---------- Career flow ----------
function onNewCareer() {
  currentGenSeed = Date.now() ^ (Math.random() * 0xffffffff);
  currentGenChar = generateCharacter(currentGenSeed);
  ui.renderCharGen(currentGenChar, renderer);
  ui.showScreen('char-gen');
}

function rerollCharacter() {
  currentGenSeed = (currentGenSeed + 1) ^ Date.now();
  currentGenChar = generateCharacter(currentGenSeed);
  ui.renderCharGen(currentGenChar, renderer);
}

async function acceptCharacter() {
  if (!currentGenChar) return;
  sim = new Simulation(currentGenChar);
  await doSave();
  document.getElementById('btn-continue').disabled = false;
  startGame();
}

async function onContinue() {
  const data = await loadGame();
  if (!data) {
    ui.toast('Nenhum save encontrado.');
    return;
  }
  sim = new Simulation(data.character);
  sim.loadSaveData(data);

  // Offline progress
  if (data.lastSaveTime) {
    const summary = sim.simulateOffline(data.lastSaveTime);
    if (summary.hours >= 0.05) {
      ui.showOfflineSummary(summary);
    }
  }

  startGame();
}

function startGame() {
  ui.showScreen('game-screen');
  ui.updateAllPanels(sim);
  lastTs = performance.now();
  autoSaveTimer = 0;
  cancelAnimationFrame(animId);
  gameLoop(lastTs);
}

function togglePause() {
  if (!sim) return;
  sim.paused = !sim.paused;
  document.getElementById('btn-pause').textContent = sim.paused ? '▶' : '⏸';
  ui.toast(sim.paused ? 'Jogo pausado' : 'Jogo retomado');
}

// ---------- Game Loop ----------
function gameLoop(ts) {
  if (!document.getElementById('game-screen').classList.contains('active')) return;

  const dt = Math.min(100, ts - lastTs);
  lastTs = ts;

  if (sim && !sim.paused) {
    const events = sim.tick(dt);
    for (const ev of events) {
      if (ev.type === 'training' || ev.type === 'salary' || ev.type === 'first_train' || ev.type === 'course_complete') {
        ui.toast(ev.text);
      }
      if (ev.type === 'comp_result') {
        ui.showEvent('Resultado da Competição', ev.text);
      }
    }
  }

  // Render
  if (sim) {
    const scene = activityToScene(sim.currentActivity);
    renderer.render({
      char: sim.char,
      activity: sim.currentActivity,
      scene
    });
    ui.updateHUD(sim);

    // Periodic panel refresh
    autoSaveTimer += dt;
    if (autoSaveTimer > 2000) {
      ui.updateOverview(sim);
      ui.updateTraining(sim);
      autoSaveTimer = 0;
    }
    if (autoSaveTimer === 0) {
      // also refresh finance occasionally
      ui.updateFinance(sim);
      ui.updateCareer(sim);
      ui.updateDiary(sim);
    }
  }

  // Auto-save every ~30s real
  if (sim && !sim.paused) {
    if (!gameLoop._saveAcc) gameLoop._saveAcc = 0;
    gameLoop._saveAcc += dt;
    if (gameLoop._saveAcc > 30000) {
      gameLoop._saveAcc = 0;
      doSave();
    }
  }

  animId = requestAnimationFrame(gameLoop);
}

function activityToScene(act) {
  if (act === 'train') return 'gym';
  if (act === 'work' || act === 'commute') return 'work';
  return 'home';
}

async function doSave() {
  if (!sim) return;
  const data = sim.getSaveData();
  await saveGame(data);
}

// ---------- Competition ----------
async function onEnterComp() {
  if (!sim) return;
  const result = sim.enterLocalCompetition();
  if (!result.ok) {
    ui.toast(result.msg || 'Não foi possível se inscrever.');
    return;
  }
  await ui.showEvent(
    'Campeonato Local',
    `Total: ${result.total} kg\nColocação: ${result.place}º lugar${result.prize ? `\nPrêmio: R$ ${result.prize}` : ''}`
  );
  ui.updateAllPanels(sim);
  await doSave();
}

// ---------- Settings helpers ----------
async function onDeleteSave() {
  if (!confirm('Apagar o save atual? Esta ação não pode ser desfeita.')) return;
  await deleteGame();
  sim = null;
  document.getElementById('btn-continue').disabled = true;
  ui.hideModal('settings-modal');
  ui.showScreen('main-menu');
  startMenuLoop();
  ui.toast('Save apagado.');
}

function onExportSave() {
  if (!sim) {
    loadGame().then(data => {
      if (data) exportSave(data);
      else ui.toast('Nenhum save para exportar.');
    });
    return;
  }
  exportSave(sim.getSaveData());
}

async function onImportSave(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const data = await importSaveFile(file);
    await saveGame(data);
    document.getElementById('btn-continue').disabled = false;
    ui.toast('Save importado! Clique em Continuar.');
    ui.hideModal('settings-modal');
  } catch (err) {
    ui.toast('Erro ao importar save.');
    console.error(err);
  }
  e.target.value = '';
}

// Start
boot().catch(err => {
  console.error('Boot error', err);
  document.getElementById('loading-text').textContent = 'Erro ao carregar. Recarregue a página.';
});
