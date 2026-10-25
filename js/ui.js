/**
 * UI controller — complete systems
 */
import { DAYS_PT, PROGRAMS, COMPETITIONS, SKILLS, EQUIPMENT, CLASSES, COURSES, RARITY_COLORS, SPONSORS } from './data.js';
import { getTotal1RM, getWeightClass } from './character.js';

export class UI {
  constructor() { this.toastTimer = null; }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }
  showModal(id) { const el = document.getElementById(id); if (el) el.classList.add('active'); }
  hideModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('active'); }

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
    if (fill) fill.style.width = pct + '%';
    if (txt) txt.textContent = text || 'Carregando...';
  }

  renderCharGen(char, renderer) {
    const canvas = document.getElementById('char-canvas');
    if (renderer && canvas) renderer.drawPortrait(canvas, char.appearance);
    document.getElementById('char-info').innerHTML = '<p class="char-name">' + char.identity.fullName + '</p><p>' + char.identity.age + ' anos · ' + (char.identity.gender === 'M' ? 'Masculino' : 'Feminino') + '</p><p>' + char.identity.height + ' cm · ' + char.identity.weight + ' kg</p><p>' + char.identity.city + '</p>';
    document.getElementById('char-story').textContent = char.story;
    document.getElementById('char-stats').innerHTML = '<div class="stat-row"><span>Emprego</span><span>' + char.job.name + '</span></div><div class="stat-row"><span>Salário</span><span>R$ ' + char.job.salary + '</span></div><div class="stat-row"><span>Escolaridade</span><span>' + char.education.levelName + '</span></div><div class="stat-row"><span>Moradia</span><span>' + char.living.name + '</span></div><div class="stat-row"><span>Relacionamento</span><span>' + char.relationship.name + '</span></div><div class="stat-row"><span>Economia</span><span>R$ ' + char.finance.cash + '</span></div><div class="stat-row"><span>Agachamento</span><span>' + char.lifts.squat.oneRM + ' kg</span></div><div class="stat-row"><span>Supino</span><span>' + char.lifts.bench.oneRM + ' kg</span></div><div class="stat-row"><span>Terra</span><span>' + char.lifts.dead.oneRM + ' kg</span></div><div class="stat-row"><span>Disciplina</span><span>' + char.personality.discipline + '</span></div><div class="stat-row"><span>Ambição</span><span>' + char.personality.ambition + '</span></div><div class="stat-row"><span>Motivação</span><span>' + char.personality.sportMotivation + '</span></div>';
  }

  updateHUD(sim) {
    document.getElementById('game-date').textContent = sim.getDisplayDate();
    document.getElementById('game-time').textContent = sim.getDisplayTime();
    document.getElementById('money-display').textContent = 'R$ ' + Math.floor(sim.char.finance.cash);
    const repEl = document.getElementById('rep-display');
    if (repEl) repEl.textContent = '★ ' + sim.char.reputation;
    const actNames = { work: 'Trabalhando', train: 'Treinando', sleep: 'Dormindo', study: 'Estudando', eat: 'Alimentando-se', rest: 'Descansando', leisure: 'Lazer', commute: 'Deslocamento', idle: 'À toa' };
    document.getElementById('current-activity').textContent = actNames[sim.currentActivity] || sim.currentActivity;
    const b = sim.char.body;
    this.setBar('bar-energy', b.energy);
    this.setBar('bar-fatigue', b.systemicFatigue);
    this.setBar('bar-mood', b.mood);
    this.setBar('bar-sleep', Math.max(0, 100 - b.sleepDebt * 5));
  }

  setBar(id, value) {
    const el = document.getElementById(id);
    if (el) el.style.width = Math.max(0, Math.min(100, value)) + '%';
  }

  updateOverview(sim) {
    const c = sim.char;
    const className = c.classId && CLASSES[c.classId] ? CLASSES[c.classId].name : 'Nenhuma';
    document.getElementById('overview-summary').innerHTML = '<h4>' + c.identity.fullName + '</h4><p>' + c.identity.age + ' anos · ' + c.identity.city + '</p><p>' + c.job.name + '</p><p>Classe: <strong style="color:#FBBF24">' + className + '</strong></p><p>Peso: ' + c.body.weight + ' kg (' + getWeightClass(c.body.weight) + ')</p><p>Reputação: ' + c.reputation + (c.nationalTeam ? ' · <span style="color:#22C55E">Seleção</span>' : '') + '</p><p>Prontidão: ' + Math.round(c.training.readiness) + '% · SP: ' + (c.skillPoints || 0) + '</p>';
    document.getElementById('lifts-summary').innerHTML = '<h4>Levantamentos (1RM)</h4><div class="lift-row"><span class="lift-name">Agachamento</span><span class="lift-value">' + c.lifts.squat.oneRM.toFixed(1) + ' kg</span></div><div class="lift-row"><span class="lift-name">Supino</span><span class="lift-value">' + c.lifts.bench.oneRM.toFixed(1) + ' kg</span></div><div class="lift-row"><span class="lift-name">Terra</span><span class="lift-value">' + c.lifts.dead.oneRM.toFixed(1) + ' kg</span></div><div class="lift-row"><span class="lift-name">Total</span><span class="lift-value">' + getTotal1RM(c).toFixed(1) + ' kg</span></div>';
    document.getElementById('quick-stats').innerHTML = '<h4>Status</h4><p>Sessões: ' + c.training.totalSessions + ' (semana: ' + c.training.sessionsThisWeek + ')</p><p>Energia: ' + Math.round(c.body.energy) + ' · Fadiga: ' + Math.round(c.body.systemicFatigue) + '</p><p>Humor: ' + Math.round(c.body.mood) + ' · Nutrição: ' + Math.round(c.body.nutrition) + '</p>';
  }

  updateSchedule(sim) {
    const grid = document.getElementById('schedule-grid');
    if (!sim.weeklyPlan) sim.buildWeeklyPlan();
    const plan = sim.weeklyPlan;
    let html = '<div class="schedule-header"></div>';
    for (let d = 0; d < 7; d++) html += '<div class="schedule-header">' + DAYS_PT[(d + 1) % 7] + '</div>';
    for (let h = 6; h <= 22; h++) {
      html += '<div class="schedule-hour">' + h + 'h</div>';
      for (let d = 0; d < 7; d++) html += '<div class="schedule-cell ' + plan[d][h] + '" title="' + plan[d][h] + '"></div>';
    }
    grid.innerHTML = html;
    const sliders = document.getElementById('priority-sliders');
    const pri = sim.char.schedule.priorities;
    const labels = { powerlifting: 'Powerlifting', career: 'Carreira', studies: 'Estudos', personal: 'Pessoal', leisure: 'Lazer' };
    sliders.innerHTML = Object.keys(labels).map(function(k) {
      return '<div class="priority-row"><label>' + labels[k] + '</label><input type="range" min="0" max="100" value="' + pri[k] + '" data-pri="' + k + '"><span>' + pri[k] + '</span></div>';
    }).join('');
    const self = this;
    sliders.querySelectorAll('input').forEach(function(input) {
      input.addEventListener('input', function(e) {
        const key = e.target.dataset.pri;
        sim.char.schedule.priorities[key] = parseInt(e.target.value, 10);
        e.target.nextElementSibling.textContent = e.target.value;
        sim.buildWeeklyPlan();
        self.updateSchedule(sim);
      });
    });
  }

  updateTraining(sim) {
    const c = sim.char;
    const prog = PROGRAMS[c.training.program];
    document.getElementById('training-info').innerHTML = '<p><strong>Programa:</strong> ' + (prog ? prog.name : c.training.program) + '</p><p style="font-size:11px;color:#9CA3AF">' + (prog ? prog.description : '') + '</p><p>Prontidão: ' + Math.round(c.training.readiness) + '%</p><p>Sessões esta semana: ' + c.training.sessionsThisWeek + '</p>';
    const sel = document.getElementById('program-select');
    if (sel && sel.value !== c.training.program) sel.value = c.training.program;
    const names = { squat: 'Agachamento', bench: 'Supino', dead: 'Terra' };
    document.getElementById('lifts-detail').innerHTML = ['squat', 'bench', 'dead'].map(function(l) {
      const L = c.lifts[l];
      return '<div class="lift-row"><span class="lift-name">' + names[l] + '</span><span class="lift-value">' + L.oneRM.toFixed(1) + ' kg</span></div><p style="font-size:10px;color:#9CA3AF;margin-bottom:8px">Técnica ' + Math.round(L.technique) + ' · Exp ' + Math.round(L.experience) + ' · Fadiga ' + Math.round(L.fatigue) + '</p>';
    }).join('');
  }

  updateSkills(sim) {
    const panel = document.getElementById('skills-panel');
    const c = sim.char;
    const trees = { sport: 'Esportiva', pro: 'Profissional', personal: 'Pessoal' };
    let html = '<p>Pontos de Habilidade: <strong style="color:#FBBF24">' + (c.skillPoints || 0) + '</strong></p>';
    if (!c.flags.classChosen && c.training.totalSessions >= 3) {
      html += '<button class="btn btn-primary" id="btn-choose-class" style="margin:8px 0;width:100%">Escolher Classe</button>';
    } else if (c.classId && CLASSES[c.classId]) {
      html += '<p style="font-size:12px;margin:8px 0">Classe: <strong>' + CLASSES[c.classId].name + '</strong> — ' + CLASSES[c.classId].description + '</p>';
    }
    for (const treeId of Object.keys(trees)) {
      html += '<h4>' + trees[treeId] + '</h4>';
      for (const id of Object.keys(SKILLS)) {
        const def = SKILLS[id];
        if (def.tree !== treeId) continue;
        const lv = c.skills[id] || 0;
        const nextCost = lv < def.maxLevel ? def.cost[lv] : '—';
        const canBuy = lv < def.maxLevel && (c.skillPoints || 0) >= (def.cost[lv] || 99);
        html += '<div class="skill-row"><div><strong>' + def.name + '</strong> <span style="color:#9CA3AF">Lv ' + lv + '/' + def.maxLevel + '</span><p style="font-size:10px;color:#9CA3AF">' + def.desc + '</p></div><button class="btn btn-secondary btn-sm" data-skill="' + id + '" ' + (canBuy ? '' : 'disabled') + '>' + (lv >= def.maxLevel ? 'MAX' : '+ (' + nextCost + ')') + '</button></div>';
      }
    }
    panel.innerHTML = html;
    const self = this;
    panel.querySelectorAll('[data-skill]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const r = sim.buySkill(btn.dataset.skill);
        if (r.ok) { self.toast('Habilidade melhorada!'); self.updateSkills(sim); self.updateOverview(sim); }
        else self.toast(r.msg);
      });
    });
    const classBtn = document.getElementById('btn-choose-class');
    if (classBtn) classBtn.addEventListener('click', function() { self.showClassSelect(sim); });
  }

  showClassSelect(sim) {
    const box = document.getElementById('class-options');
    const self = this;
    box.innerHTML = Object.values(CLASSES).map(function(cl) {
      return '<button class="btn btn-secondary class-btn" data-class="' + cl.id + '" style="width:100%;margin-bottom:8px;text-align:left"><strong>' + cl.name + '</strong><br><span style="font-size:11px;color:#9CA3AF">' + cl.description + '</span></button>';
    }).join('');
    this.showModal('class-modal');
    box.querySelectorAll('[data-class]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const r = sim.chooseClass(btn.dataset.class);
        if (r.ok) {
          self.hideModal('class-modal');
          self.toast('Classe ' + CLASSES[btn.dataset.class].name + ' escolhida!');
          self.updateSkills(sim);
          self.updateOverview(sim);
        }
      });
    });
  }

  updateGear(sim) {
    const panel = document.getElementById('gear-panel');
    const c = sim.char;
    let html = '<h4>Equipado</h4>';
    const slots = ['belt', 'shoes', 'wrists', 'knees', 'singlet'];
    const slotNames = { belt: 'Cinturão', shoes: 'Calçado', wrists: 'Munhequeiras', knees: 'Joelheiras', singlet: 'Singlet' };
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const item = c.equipment[slot];
      if (item) {
        const color = RARITY_COLORS[item.rarity] || '#9CA3AF';
        html += '<div class="gear-item"><span style="color:' + color + '">' + item.name + '</span> <span style="font-size:10px">(' + Math.round(item.currentDurability || item.durability) + ' dur.)</span></div>';
      } else {
        html += '<div class="gear-item" style="color:#6B7280">' + slotNames[slot] + ': vazio</div>';
      }
    }
    html += '<h4 style="margin-top:12px">Loja de Equipamentos</h4>';
    for (let i = 0; i < EQUIPMENT.length; i++) {
      const eq = EQUIPMENT[i];
      const owned = (c.equipment[eq.slot] && c.equipment[eq.slot].id === eq.id) || c.inventory.some(function(it) { return it.id === eq.id; });
      const color = RARITY_COLORS[eq.rarity] || '#9CA3AF';
      html += '<div class="gear-shop-row"><div><span style="color:' + color + '">' + eq.name + '</span><p style="font-size:10px;color:#9CA3AF">' + eq.desc + ' · R$ ' + eq.cost + '</p></div><button class="btn btn-secondary btn-sm" data-buy="' + eq.id + '" ' + (owned || c.finance.cash < eq.cost ? 'disabled' : '') + '>' + (owned ? 'OK' : 'Comprar') + '</button></div>';
    }
    panel.innerHTML = html;
    const self = this;
    panel.querySelectorAll('[data-buy]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const r = sim.buyEquipment(btn.dataset.buy);
        if (r.ok) { self.toast('Equipamento adquirido!'); self.updateGear(sim); self.updateHUD(sim); }
        else self.toast(r.msg);
      });
    });
  }

  updateCareer(sim) {
    const c = sim.char;
    const self = this;
    document.getElementById('job-info').innerHTML = '<h4>Emprego</h4><p>' + c.job.name + '</p><p>Salário: R$ ' + c.job.salary + '/mês · Performance: ' + Math.round(c.job.performance) + '</p><p>Físico: ' + c.job.physical + ' · Mental: ' + c.job.mental + '</p>';
    document.getElementById('education-info').innerHTML = '<h4>Educação</h4><p>' + c.education.levelName + '</p>' + (c.education.currentCourse ? '<p>Curso: ' + c.education.currentCourse + ' (' + Math.round(c.education.courseProgress) + 'h)</p>' : '<p>Nenhum curso ativo</p>');

    let coursesHtml = '<h4>Cursos Disponíveis</h4>';
    for (let i = 0; i < COURSES.length; i++) {
      const course = COURSES[i];
      const done = c.education.completed.includes(course.id);
      const active = c.education.currentCourse === course.id;
      const blocked = done || active || c.education.currentCourse || c.finance.cash < course.cost || c.education.level < course.req;
      coursesHtml += '<div class="gear-shop-row"><div><strong>' + course.name + '</strong><p style="font-size:10px;color:#9CA3AF">R$ ' + course.cost + ' · ' + course.hours + 'h · Req ' + course.req + '</p></div><button class="btn btn-secondary btn-sm" data-course="' + course.id + '" ' + (blocked ? 'disabled' : '') + '>' + (done ? 'Feito' : active ? 'Ativo' : 'Iniciar') + '</button></div>';
    }
    document.getElementById('courses-panel').innerHTML = coursesHtml;
    document.querySelectorAll('[data-course]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const r = sim.startCourse(btn.dataset.course);
        if (r.ok) { self.toast('Curso iniciado!'); self.updateCareer(sim); self.updateHUD(sim); }
        else self.toast(r.msg);
      });
    });

    let compHtml = '<h4>Competições</h4>';
    for (let i = 0; i < COMPETITIONS.length; i++) {
      const comp = COMPETITIONS[i];
      const can = sim.canEnterComp(comp.id);
      const done = (c.competitions.results || []).filter(function(r) { return r.id === comp.id; });
      compHtml += '<div class="comp-card"><strong>' + comp.name + '</strong> <span style="font-size:10px;color:#9CA3AF">[' + comp.level + ']</span><p style="font-size:11px">Taxa R$ ' + (comp.entryFee + comp.travelCost) + ' · Min ~' + comp.minTotal + 'kg' + (comp.minRep ? ' · Rep ' + comp.minRep : '') + '</p><p style="font-size:11px">Prêmios: ' + comp.prize1 + '/' + comp.prize2 + '/' + comp.prize3 + '</p>';
      if (done.length) compHtml += '<p style="font-size:10px;color:#22C55E">Disputada ' + done.length + 'x</p>';
      compHtml += '<button class="btn btn-primary btn-sm" data-comp="' + comp.id + '" ' + (can ? '' : 'disabled') + ' style="margin-top:4px">' + (can ? 'Inscrever-se' : 'Bloqueado') + '</button></div>';
    }
    document.getElementById('comp-info').innerHTML = compHtml;
    document.querySelectorAll('[data-comp]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const r = sim.enterCompetition(btn.dataset.comp);
        if (r.ok) {
          self.showEvent('Resultado', COMPETITIONS.find(function(x) { return x.id === btn.dataset.comp; }).name + '\nTotal: ' + r.total + ' kg\n' + r.place + 'º lugar' + (r.prize ? '\nPrêmio: R$ ' + r.prize : '') + '\nRep +' + r.reputation).then(function() {
            self.updateAllPanels(sim);
          });
        } else self.toast(r.msg);
      });
    });

    let spHtml = '<h4>Patrocínios</h4>';
    const active = c.sponsorships || [];
    for (let i = 0; i < active.length; i++) {
      const s = active[i];
      spHtml += '<div class="gear-item"><strong>' + s.name + '</strong> — R$ ' + s.monthly + '/mês (até dia ' + s.endDay + ')</div>';
    }
    const avail = sim.availableSponsors();
    if (!avail.length && !active.length) spHtml += '<p style="font-size:11px;color:#9CA3AF">Aumente a reputação para atrair patrocínios.</p>';
    for (let i = 0; i < avail.length; i++) {
      const s = avail[i];
      spHtml += '<div class="gear-shop-row"><div><strong>' + s.name + '</strong><p style="font-size:10px;color:#9CA3AF">R$ ' + s.monthly + '/mês · Rep mín. ' + s.minRep + '</p></div><button class="btn btn-secondary btn-sm" data-sponsor="' + s.id + '">Assinar</button></div>';
    }
    document.getElementById('sponsor-panel').innerHTML = spHtml;
    document.querySelectorAll('[data-sponsor]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const r = sim.signSponsor(btn.dataset.sponsor);
        if (r.ok) { self.toast('Patrocínio ' + r.contract.name + ' assinado!'); self.updateCareer(sim); self.updateHUD(sim); }
        else self.toast(r.msg);
      });
    });
  }

  updateSocial(sim) {
    const panel = document.getElementById('social-panel');
    const npcs = sim.char.npcs || [];
    if (!npcs.length) { panel.innerHTML = '<p>Nenhum relacionamento ativo.</p>'; return; }
    let html = '<h4>Relacionamentos</h4>';
    for (let i = 0; i < npcs.length; i++) {
      const npc = npcs[i];
      const bondColor = npc.bond > 70 ? '#22C55E' : npc.bond > 40 ? '#FBBF24' : '#EF4444';
      html += '<div class="npc-card"><strong>' + npc.name + '</strong> <span style="font-size:10px;color:#9CA3AF">(' + npc.role + ' · ' + npc.personality + ')</span><div class="bar" style="margin:4px 0"><div class="bar-fill" style="width:' + npc.bond + '%;background:' + bondColor + '"></div></div><p style="font-size:10px;color:#9CA3AF">Vínculo ' + Math.round(npc.bond) + ' · Apoio ' + npc.support + ' · Demanda ' + npc.demand + '</p></div>';
    }
    panel.innerHTML = html;
  }

  updateFinance(sim) {
    const f = sim.char.finance;
    document.getElementById('finance-summary').innerHTML = '<h4>Finanças</h4><p>Saldo: <strong style="color:#22C55E">R$ ' + Math.floor(f.cash) + '</strong></p><p>Dívida: R$ ' + Math.floor(f.debt) + '</p><p>Recebido: R$ ' + Math.floor(f.income) + ' · Gasto: R$ ' + Math.floor(f.expenses) + '</p>';
    document.getElementById('finance-log').innerHTML = f.history.slice(0, 15).map(function(h) {
      return '<div class="finance-item ' + h.type + '"><span>Dia ' + h.day + ': ' + h.desc + '</span><span>' + (h.type === 'income' ? '+' : '-') + 'R$ ' + h.amount + '</span></div>';
    }).join('') || '<p>Sem transações.</p>';
  }

  updateDiary(sim) {
    document.getElementById('diary-list').innerHTML = sim.char.diary.slice(0, 30).map(function(e) {
      return '<div class="diary-entry"><div class="diary-date">Dia ' + e.day + '</div><div>' + e.text + '</div></div>';
    }).join('') || '<p>Nenhum registro.</p>';
  }

  updateAllPanels(sim) {
    this.updateHUD(sim);
    this.updateOverview(sim);
    this.updateTraining(sim);
    this.updateCareer(sim);
    this.updateFinance(sim);
    this.updateDiary(sim);
    this.updateSkills(sim);
    this.updateGear(sim);
    this.updateSocial(sim);
  }

  showOfflineSummary(summary) {
    const el = document.getElementById('offline-summary');
    let html = '<p>Tempo real: <strong>' + summary.hours + 'h</strong> · Dias no jogo: <strong>' + summary.gameDays + '</strong></p><p>Saldo: R$ ' + Math.floor(summary.cash) + ' · Total 1RM: ' + summary.total1RM + ' kg · Rep: ' + (summary.reputation || 0) + '</p><h4 style="margin-top:12px">Acontecimentos</h4>';
    if (!summary.events.length && !summary.log.length) html += '<p>Nada de especial.</p>';
    else {
      html += '<ul style="font-size:12px;padding-left:16px">';
      summary.events.forEach(function(e) { html += '<li>' + e.text + '</li>'; });
      summary.log.slice(0, 8).forEach(function(l) { html += '<li>' + l + '</li>'; });
      html += '</ul>';
    }
    el.innerHTML = html;
    this.showModal('offline-modal');
  }

  showEvent(title, text, choices) {
    choices = choices || [];
    document.getElementById('event-title').textContent = title;
    document.getElementById('event-text').textContent = text;
    const box = document.getElementById('event-choices');
    if (!choices.length) box.innerHTML = '<button class="btn btn-primary" id="event-ok">OK</button>';
    else box.innerHTML = choices.map(function(c, i) { return '<button class="btn btn-secondary" data-choice="' + i + '">' + c.label + '</button>'; }).join('');
    this.showModal('event-modal');
    const self = this;
    return new Promise(function(resolve) {
      const handler = function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        box.removeEventListener('click', handler);
        self.hideModal('event-modal');
        resolve(btn.dataset.choice !== undefined ? parseInt(btn.dataset.choice, 10) : 0);
      };
      box.addEventListener('click', handler);
    });
  }
}
