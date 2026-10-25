/**
 * UI controller - updates panels, handles tabs, toasts, modals.
 */
import { DAYS_PT } from './data.js';
import { getTotal1RM, getWeightClass } from './character.js';
import { PROGRAMS, COMPETITIONS } from './data.js';

export class UI {
  constructor() {
    this.toastTimer = null;
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  showModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  hideModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  toast(msg, duration = 3000) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), duration);
  }

  setLoading(pct, text) {
    const fill = document.getElementById('loading-fill');
    const txt = document.getElementById('loading-text');
    if (fill) fill.style.width = `${pct}%`;
    if (txt) txt.textContent = text || 'Carregando...';
  }

  // Character generation view
  renderCharGen(char, renderer) {
    const canvas = document.getElementById('char-canvas');
    if (renderer && canvas) renderer.drawPortrait(canvas, char.appearance);

    const info = document.getElementById('char-info');
    info.innerHTML = `
      <p class="char-name">${char.identity.fullName}</p>
      <p>${char.identity.age} anos · ${char.identity.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
      <p>${char.identity.height} cm · ${char.identity.weight} kg</p>
      <p>${char.identity.city}</p>
    `;

    document.getElementById('char-story').textContent = char.story;

    const stats = document.getElementById('char-stats');
    stats.innerHTML = `
      <div class="stat-row"><span>Emprego</span><span>${char.job.name}</span></div>
      <div class="stat-row"><span>Salário</span><span>R$ ${char.job.salary}</span></div>
      <div class="stat-row"><span>Escolaridade</span><span>${char.education.levelName}</span></div>
      <div class="stat-row"><span>Moradia</span><span>${char.living.name}</span></div>
      <div class="stat-row"><span>Relacionamento</span><span>${char.relationship.name}</span></div>
      <div class="stat-row"><span>Economia</span><span>R$ ${char.finance.cash}</span></div>
      <div class="stat-row"><span>Agachamento</span><span>${char.lifts.squat.oneRM} kg</span></div>
      <div class="stat-row"><span>Supino</span><span>${char.lifts.bench.oneRM} kg</span></div>
      <div class="stat-row"><span>Terra</span><span>${char.lifts.dead.oneRM} kg</span></div>
      <div class="stat-row"><span>Disciplina</span><span>${char.personality.discipline}</span></div>
      <div class="stat-row"><span>Ambição</span><span>${char.personality.ambition}</span></div>
      <div class="stat-row"><span>Motivação</span><span>${char.personality.sportMotivation}</span></div>
    `;
  }

  // Game HUD
  updateHUD(sim) {
    document.getElementById('game-date').textContent = sim.getDisplayDate();
    document.getElementById('game-time').textContent = sim.getDisplayTime();
    document.getElementById('money-display').textContent = `R$ ${Math.floor(sim.char.finance.cash)}`;

    const actNames = {
      work: 'Trabalhando',
      train: 'Treinando',
      sleep: 'Dormindo',
      study: 'Estudando',
      eat: 'Alimentando-se',
      rest: 'Descansando',
      leisure: 'Lazer',
      commute: 'Deslocamento',
      idle: 'À toa'
    };
    document.getElementById('current-activity').textContent = actNames[sim.currentActivity] || sim.currentActivity;

    // Bars
    const b = sim.char.body;
    this.setBar('bar-energy', b.energy);
    this.setBar('bar-fatigue', b.systemicFatigue);
    this.setBar('bar-mood', b.mood);
    this.setBar('bar-sleep', Math.max(0, 100 - b.sleepDebt * 5));
  }

  setBar(id, value) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.max(0, Math.min(100, value))}%`;
  }

  // Tabs content
  updateOverview(sim) {
    const c = sim.char;
    const el = document.getElementById('overview-summary');
    el.innerHTML = `
      <h4>${c.identity.fullName}</h4>
      <p>${c.identity.age} anos · ${c.identity.city}</p>
      <p>${c.job.name}</p>
      <p>Classe de peso: ${getWeightClass(c.body.weight)} kg</p>
      <p>Reputação: ${c.reputation}</p>
      <p>Prontidão: ${Math.round(c.training.readiness)}%</p>
    `;

    const lifts = document.getElementById('lifts-summary');
    lifts.innerHTML = `
      <h4>Levantamentos (1RM)</h4>
      <div class="lift-row"><span class="lift-name">Agachamento</span><span class="lift-value">${c.lifts.squat.oneRM.toFixed(1)} kg</span></div>
      <div class="lift-row"><span class="lift-name">Supino</span><span class="lift-value">${c.lifts.bench.oneRM.toFixed(1)} kg</span></div>
      <div class="lift-row"><span class="lift-name">Terra</span><span class="lift-value">${c.lifts.dead.oneRM.toFixed(1)} kg</span></div>
      <div class="lift-row"><span class="lift-name">Total</span><span class="lift-value">${getTotal1RM(c).toFixed(1)} kg</span></div>
    `;

    const qs = document.getElementById('quick-stats');
    qs.innerHTML = `
      <h4>Status</h4>
      <p>Sessões totais: ${c.training.totalSessions}</p>
      <p>Esta semana: ${c.training.sessionsThisWeek}</p>
      <p>Energia: ${Math.round(c.body.energy)} · Fadiga: ${Math.round(c.body.systemicFatigue)}</p>
      <p>Humor: ${Math.round(c.body.mood)} · Nutrição: ${Math.round(c.body.nutrition)}</p>
    `;
  }

  updateSchedule(sim) {
    const grid = document.getElementById('schedule-grid');
    if (!sim.weeklyPlan) sim.buildWeeklyPlan();
    const plan = sim.weeklyPlan;

    let html = '<div class="schedule-header"></div>';
    for (let d = 0; d < 7; d++) {
      html += `<div class="schedule-header">${DAYS_PT[(d + 1) % 7]}</div>`;
    }

    // Show key hours only to keep compact: 6-22
    for (let h = 6; h <= 22; h++) {
      html += `<div class="schedule-hour">${h}h</div>`;
      for (let d = 0; d < 7; d++) {
        const act = plan[d][h];
        html += `<div class="schedule-cell ${act}" title="${act}"></div>`;
      }
    }
    grid.innerHTML = html;

    // Priorities
    const sliders = document.getElementById('priority-sliders');
    const pri = sim.char.schedule.priorities;
    const labels = {
      powerlifting: 'Powerlifting',
      career: 'Carreira',
      studies: 'Estudos',
      personal: 'Pessoal',
      leisure: 'Lazer'
    };
    sliders.innerHTML = Object.keys(labels).map(k => `
      <div class="priority-row">
        <label>${labels[k]}</label>
        <input type="range" min="0" max="100" value="${pri[k]}" data-pri="${k}">
        <span>${pri[k]}</span>
      </div>
    `).join('');

    sliders.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.pri;
        sim.char.schedule.priorities[key] = parseInt(e.target.value, 10);
        e.target.nextElementSibling.textContent = e.target.value;
        sim.buildWeeklyPlan();
        this.updateSchedule(sim);
      });
    });
  }

  updateTraining(sim) {
    const c = sim.char;
    const info = document.getElementById('training-info');
    const prog = PROGRAMS[c.training.program];
    info.innerHTML = `
      <p><strong>Programa:</strong> ${prog?.name || c.training.program}</p>
      <p>${prog?.description || ''}</p>
      <p>Prontidão: ${Math.round(c.training.readiness)}%</p>
      <p>Sessões esta semana: ${c.training.sessionsThisWeek}</p>
    `;

    const sel = document.getElementById('program-select');
    if (sel && sel.value !== c.training.program) {
      sel.value = c.training.program;
    }

    const detail = document.getElementById('lifts-detail');
    detail.innerHTML = ['squat', 'bench', 'dead'].map(l => {
      const L = c.lifts[l];
      const names = { squat: 'Agachamento', bench: 'Supino', dead: 'Terra' };
      return `
        <div class="lift-row">
          <span class="lift-name">${names[l]}</span>
          <span class="lift-value">${L.oneRM.toFixed(1)} kg</span>
        </div>
        <p style="font-size:10px;color:#9CA3AF;margin-bottom:8px">
          Técnica ${Math.round(L.technique)} · Exp ${Math.round(L.experience)} · Fadiga ${Math.round(L.fatigue)}
        </p>
      `;
    }).join('');
  }

  updateCareer(sim) {
    const c = sim.char;
    document.getElementById('job-info').innerHTML = `
      <h4>Emprego</h4>
      <p>${c.job.name}</p>
      <p>Salário: R$ ${c.job.salary}/mês</p>
      <p>Jornada: ${c.job.hoursPerWeek}h/semana</p>
      <p>Exigência física: ${c.job.physical} · Mental: ${c.job.mental}</p>
    `;

    document.getElementById('education-info').innerHTML = `
      <h4>Educação</h4>
      <p>${c.education.levelName}</p>
      ${c.education.currentCourse ? `<p>Curso em andamento: ${c.education.currentCourse} (${Math.round(c.education.courseProgress)}h)</p>` : '<p>Nenhum curso ativo</p>'}
    `;

    const comp = COMPETITIONS[0];
    const can = sim.canEnterLocalComp();
    document.getElementById('comp-info').innerHTML = `
      <h4>Competições</h4>
      <p>${comp.name}</p>
      <p>Inscrição: R$ ${comp.entryFee} + viagem R$ ${comp.travelCost}</p>
      <p>Requisitos aprox.: Total ~${comp.minSquat + comp.minBench + comp.minDead} kg</p>
      <p>Seu total: ${getTotal1RM(c).toFixed(0)} kg</p>
      ${c.flags.firstCompDone ? '<p style="color:#22C55E">Já disputada!</p>' : ''}
    `;

    const btn = document.getElementById('btn-enter-comp');
    if (c.flags.firstCompDone) {
      btn.style.display = 'none';
    } else {
      btn.style.display = 'block';
      btn.disabled = !can;
      btn.textContent = can ? 'Inscrever-se na Competição Local' : 'Requisitos não atendidos';
    }
  }

  updateFinance(sim) {
    const f = sim.char.finance;
    document.getElementById('finance-summary').innerHTML = `
      <h4>Finanças</h4>
      <p>Saldo: <strong style="color:#22C55E">R$ ${Math.floor(f.cash)}</strong></p>
      <p>Dívida: R$ ${Math.floor(f.debt)}</p>
      <p>Recebido (total): R$ ${Math.floor(f.income)}</p>
      <p>Gasto (total): R$ ${Math.floor(f.expenses)}</p>
    `;

    const log = document.getElementById('finance-log');
    log.innerHTML = f.history.slice(0, 15).map(h => `
      <div class="finance-item ${h.type}">
        <span>Dia ${h.day}: ${h.desc}</span>
        <span>${h.type === 'income' ? '+' : '-'}R$ ${h.amount}</span>
      </div>
    `).join('') || '<p>Sem transações ainda.</p>';
  }

  updateDiary(sim) {
    const list = document.getElementById('diary-list');
    list.innerHTML = sim.char.diary.slice(0, 30).map(e => `
      <div class="diary-entry">
        <div class="diary-date">Dia ${e.day}</div>
        <div>${e.text}</div>
      </div>
    `).join('') || '<p>Nenhum registro ainda.</p>';
  }

  updateAllPanels(sim) {
    this.updateHUD(sim);
    this.updateOverview(sim);
    this.updateTraining(sim);
    this.updateCareer(sim);
    this.updateFinance(sim);
    this.updateDiary(sim);
    // Schedule only when tab is open to avoid rebuilding constantly
  }

  showOfflineSummary(summary) {
    const el = document.getElementById('offline-summary');
    let html = `
      <p>Tempo real ausente: <strong>${summary.hours}h</strong></p>
      <p>Dias no jogo: <strong>${summary.gameDays}</strong></p>
      <p>Saldo atual: R$ ${Math.floor(summary.cash)}</p>
      <p>Total 1RM: ${summary.total1RM} kg</p>
      <h4 style="margin-top:12px">Acontecimentos</h4>
    `;
    if (summary.events.length === 0 && summary.log.length === 0) {
      html += '<p>Nada de especial aconteceu.</p>';
    } else {
      html += '<ul style="font-size:12px;padding-left:16px">';
      summary.events.forEach(e => { html += `<li>${e.text}</li>`; });
      summary.log.slice(0, 10).forEach(l => { html += `<li>${l}</li>`; });
      html += '</ul>';
    }
    el.innerHTML = html;
    this.showModal('offline-modal');
  }

  showEvent(title, text, choices = []) {
    document.getElementById('event-title').textContent = title;
    document.getElementById('event-text').textContent = text;
    const box = document.getElementById('event-choices');
    if (choices.length === 0) {
      box.innerHTML = `<button class="btn btn-primary" id="event-ok">OK</button>`;
    } else {
      box.innerHTML = choices.map((c, i) =>
        `<button class="btn btn-secondary" data-choice="${i}">${c.label}</button>`
      ).join('');
    }
    this.showModal('event-modal');
    return new Promise(resolve => {
      const handler = (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        box.removeEventListener('click', handler);
        this.hideModal('event-modal');
        const idx = btn.dataset.choice;
        resolve(idx !== undefined ? parseInt(idx, 10) : 0);
      };
      box.addEventListener('click', handler);
    });
  }
}
