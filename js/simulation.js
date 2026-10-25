/**
 * Core simulation engine — complete systems
 */
import { RNG } from './rng.js';
import {
  TIME_CONFIG, PROGRAMS, COMPETITIONS, DAYS_PT, MONTHS_PT, COURSES,
  SKILLS, EQUIPMENT, SPONSORS, CLASSES, JOBS, SKILL_POINT_INTERVAL
} from './data.js';
import { getTotal1RM, getWeightClass, getEquipmentBonus, getClassBonuses } from './character.js';

export class Simulation {
  constructor(character, options = {}) {
    this.char = character;
    this.rng = new RNG(character.seed);
    this.rng.setState(character.rngState || character.seed);
    this.gameDay = 0;
    this.gameHour = 8;
    this.gameMinute = 0;
    this.speed = options.speed || 1;
    this.paused = false;
    this.lastRealTime = Date.now();
    this.lastSaveTime = Date.now();
    this.realMsAccum = 0;
    this.currentActivity = 'idle';
    this.weeklyPlan = null;
    this.buildWeeklyPlan();
    this.pendingEvents = [];
    this.offlineLog = [];
  }

  getDayOfWeek() { return this.gameDay % 7; }

  getDisplayDate() {
    const start = new Date(2026, 0, 5);
    const d = new Date(start.getTime() + this.gameDay * 86400000);
    return `${DAYS_PT[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
  }

  getDisplayTime() {
    return `${String(this.gameHour).padStart(2, '0')}:${String(Math.floor(this.gameMinute)).padStart(2, '0')}`;
  }

  tick(realDeltaMs) {
    if (this.paused) return [];
    this.realMsAccum += realDeltaMs * this.speed;
    const events = [];
    const msPerGameHour = 2000;
    const msPerChunk = (msPerGameHour / 60) * TIME_CONFIG.gameMinutesPerTick;
    while (this.realMsAccum >= msPerChunk) {
      this.realMsAccum -= msPerChunk;
      events.push(...this.advanceMinutes(TIME_CONFIG.gameMinutesPerTick));
    }
    return events;
  }

  advanceMinutes(mins) {
    const events = [];
    this.gameMinute += mins;
    while (this.gameMinute >= 60) {
      this.gameMinute -= 60;
      this.gameHour++;
      if (this.gameHour >= 24) {
        this.gameHour = 0;
        this.gameDay++;
        events.push(...this.onNewDay());
      }
      events.push(...this.onNewHour());
    }
    this.updateBodyContinuous(mins);
    return events;
  }

  onNewHour() {
    const events = [];
    const dow = this.getDayOfWeek();
    const hour = this.gameHour;
    const planSlot = this.getActivityAt(dow, hour);
    this.currentActivity = planSlot;

    if (planSlot === 'work') this.applyWorkHour();
    else if (planSlot === 'train') {
      if (this.shouldStartTraining(dow, hour)) events.push(...this.executeTrainingSession());
    } else if (planSlot === 'sleep') this.applySleepHour();
    else if (planSlot === 'study') this.applyStudyHour();
    else if (planSlot === 'eat') this.applyEat();
    else if (planSlot === 'rest' || planSlot === 'leisure') this.applyRestHour();

    if (this.rng.chance(0.015)) events.push(...this.randomEvent());
    return events;
  }

  onNewDay() {
    const events = [];
    if (this.gameDay > 0 && this.gameDay % 365 === 0) {
      this.char.identity.age++;
      events.push({ type: 'birthday', text: `${this.char.identity.firstName} completou ${this.char.identity.age} anos!` });
      this.addDiary(`Completou ${this.char.identity.age} anos.`);
    }

    events.push(...this.processDailyFinances());
    events.push(...this.processSponsorships());
    events.push(...this.processRelationships());
    events.push(...this.checkPromotion());
    events.push(...this.checkNationalTeam());

    if (this.getDayOfWeek() === 0) this.char.training.sessionsThisWeek = 0;

    // Recovery with skill bonuses
    const recBonus = this.getSkillEffect('recoveryBonus') || 0;
    const sleepBonus = this.getSkillEffect('sleepBonus') || 0;
    this.char.body.systemicFatigue = Math.max(0, this.char.body.systemicFatigue - 5 * (1 + recBonus));
    this.char.body.mentalFatigue = Math.max(0, this.char.body.mentalFatigue - 3);
    const liftRec = 8 * (1 + recBonus);
    this.char.lifts.squat.fatigue = Math.max(0, this.char.lifts.squat.fatigue - liftRec);
    this.char.lifts.bench.fatigue = Math.max(0, this.char.lifts.bench.fatigue - liftRec);
    this.char.lifts.dead.fatigue = Math.max(0, this.char.lifts.dead.fatigue - liftRec);

    // Equipment durability tick
    this.tickEquipmentDurability();

    this.updateReadiness();
    return events;
  }

  // ---------- Skills helpers ----------
  getSkillEffect(key) {
    let total = 0;
    const skills = this.char.skills || {};
    for (const [id, level] of Object.entries(skills)) {
      if (level <= 0) continue;
      const def = SKILLS[id];
      if (!def) continue;
      const eff = def.effect(level);
      if (eff[key]) total += eff[key];
    }
    return total;
  }

  buySkill(skillId) {
    const def = SKILLS[skillId];
    if (!def) return { ok: false, msg: 'Habilidade inválida.' };
    const current = this.char.skills[skillId] || 0;
    if (current >= def.maxLevel) return { ok: false, msg: 'Nível máximo.' };
    const cost = def.cost[current];
    if ((this.char.skillPoints || 0) < cost) return { ok: false, msg: 'Pontos insuficientes.' };
    this.char.skillPoints -= cost;
    this.char.skills[skillId] = current + 1;
    this.addDiary(`Melhorou ${def.name} para nível ${current + 1}.`);
    return { ok: true, level: current + 1 };
  }

  chooseClass(classId) {
    if (this.char.flags.classChosen) return { ok: false, msg: 'Classe já escolhida.' };
    if (!CLASSES[classId]) return { ok: false, msg: 'Classe inválida.' };
    this.char.classId = classId;
    this.char.flags.classChosen = true;
    this.addDiary(`Escolheu a classe ${CLASSES[classId].name}.`);
    return { ok: true };
  }

  // ---------- Equipment ----------
  buyEquipment(equipId) {
    const def = EQUIPMENT.find(e => e.id === equipId);
    if (!def) return { ok: false, msg: 'Item inválido.' };
    if (this.char.finance.cash < def.cost) return { ok: false, msg: 'Dinheiro insuficiente.' };
    this.char.finance.cash -= def.cost;
    this.char.finance.history.unshift({ day: this.gameDay, type: 'expense', amount: def.cost, desc: `Comprou ${def.name}` });
    const item = { ...def, currentDurability: def.durability };
    // Unequip old in slot if any, move to inventory
    if (this.char.equipment[def.slot]) {
      this.char.inventory.push(this.char.equipment[def.slot]);
    }
    this.char.equipment[def.slot] = item;
    this.addDiary(`Adquiriu ${def.name}.`);
    return { ok: true };
  }

  equipFromInventory(index) {
    if (index < 0 || index >= this.char.inventory.length) return { ok: false };
    const item = this.char.inventory[index];
    if (this.char.equipment[item.slot]) {
      this.char.inventory.push(this.char.equipment[item.slot]);
    }
    this.char.equipment[item.slot] = item;
    this.char.inventory.splice(index, 1);
    return { ok: true };
  }

  tickEquipmentDurability() {
    for (const slot of Object.keys(this.char.equipment || {})) {
      const item = this.char.equipment[slot];
      if (!item) continue;
      if (item.currentDurability == null) item.currentDurability = item.durability;
      // Slow decay when training days
      if (this.char.training.lastSessionDay === this.gameDay - 1) {
        item.currentDurability = Math.max(0, item.currentDurability - 0.5);
      }
      if (item.currentDurability <= 0) {
        this.char.equipment[slot] = null;
        this.addDiary(`${item.name} quebrou e foi removido.`);
        this.pendingEvents.push({ type: 'equip_break', text: `${item.name} quebrou!` });
      }
    }
  }

  // ---------- Schedule ----------
  buildWeeklyPlan() {
    const plan = Array.from({ length: 7 }, () => Array(24).fill('rest'));
    const job = this.char.job;
    const pri = this.char.schedule.priorities;

    for (let d = 0; d < 7; d++) {
      for (let h = 23; h < 24; h++) plan[d][h] = 'sleep';
      for (let h = 0; h < 7; h++) plan[d][h] = 'sleep';

      const jobDay = d === 6 ? 0 : d + 1;
      if (job.schedule.days.includes(jobDay)) {
        const commuteH = Math.ceil(job.commute / 60);
        for (let h = job.schedule.start - commuteH; h < job.schedule.start; h++) {
          if (h >= 0 && h < 24) plan[d][h] = 'commute';
        }
        for (let h = job.schedule.start; h < job.schedule.end; h++) plan[d][h] = 'work';
        for (let h = job.schedule.end; h < job.schedule.end + commuteH; h++) {
          if (h < 24) plan[d][h] = 'commute';
        }
      }
      if (plan[d][7] === 'rest') plan[d][7] = 'eat';
      if (plan[d][12] === 'rest') plan[d][12] = 'eat';
      if (plan[d][19] === 'rest') plan[d][19] = 'eat';
    }

    const program = PROGRAMS[this.char.training.program] || PROGRAMS.linear;
    const trainHours = pri.powerlifting >= 50 ? 2 : 1;

    for (const session of program.days) {
      const d = (session.day - 1) % 7;
      let placed = false;
      for (let h = 17; h <= 21 && !placed; h++) {
        let free = true;
        for (let t = 0; t < trainHours; t++) {
          if (plan[d][h + t] !== 'rest' && plan[d][h + t] !== 'leisure') free = false;
        }
        if (free) {
          for (let t = 0; t < trainHours; t++) plan[d][h + t] = 'train';
          placed = true;
        }
      }
      if (!placed) {
        for (let h = 6; h <= 8 && !placed; h++) {
          if (plan[d][h] === 'rest' || plan[d][h] === 'sleep') {
            plan[d][h] = 'train';
            if (trainHours > 1 && h + 1 < 24) plan[d][h + 1] = 'train';
            placed = true;
          }
        }
      }
    }

    if (pri.studies >= 25 && this.char.education.currentCourse) {
      for (let d = 0; d < 5; d++) {
        for (let h = 20; h <= 21; h++) {
          if (plan[d][h] === 'rest') plan[d][h] = 'study';
        }
      }
    }
    this.weeklyPlan = plan;
  }

  getActivityAt(dow, hour) {
    if (!this.weeklyPlan) this.buildWeeklyPlan();
    return this.weeklyPlan[dow][hour] || 'rest';
  }

  shouldStartTraining(dow, hour) {
    if (this.getActivityAt(dow, hour) !== 'train') return false;
    if (hour > 0 && this.getActivityAt(dow, hour - 1) === 'train') return false;
    if (this.char.training.lastSessionDay === this.gameDay) return false;
    return true;
  }

  // ---------- Body ----------
  updateBodyContinuous(mins) {
    const factor = mins / 60;
    if (this.currentActivity !== 'sleep') {
      this.char.body.energy = Math.max(10, this.char.body.energy - 1.5 * factor);
    }
  }

  updateReadiness() {
    const b = this.char.body;
    const sleepPenalty = Math.min(30, b.sleepDebt * 2);
    const fatiguePenalty = (b.systemicFatigue + b.mentalFatigue) / 4;
    const energyBonus = (b.energy - 50) / 5;
    this.char.training.readiness = Math.max(20, Math.min(100,
      70 - sleepPenalty - fatiguePenalty + energyBonus + (b.nutrition - 50) / 5
    ));
  }

  applyWorkHour() {
    const job = this.char.job;
    const resist = this.getSkillEffect('workFatigue') || 0;
    this.char.body.energy = Math.max(5, this.char.body.energy - job.physical * 0.04 * (1 - resist));
    this.char.body.mentalFatigue = Math.min(100, this.char.body.mentalFatigue + job.mental * 0.03 * (1 - resist));
    this.char.body.systemicFatigue = Math.min(100, this.char.body.systemicFatigue + job.physical * 0.02 * (1 - resist));
  }

  applySleepHour() {
    const bonus = 1 + (this.getSkillEffect('sleepBonus') || 0);
    this.char.body.energy = Math.min(100, this.char.body.energy + 8 * bonus);
    this.char.body.systemicFatigue = Math.max(0, this.char.body.systemicFatigue - 6 * bonus);
    this.char.body.mentalFatigue = Math.max(0, this.char.body.mentalFatigue - 5 * bonus);
    this.char.body.sleepDebt = Math.max(0, this.char.body.sleepDebt - 1.5);
    this.char.body.mood = Math.min(100, this.char.body.mood + 1);
  }

  applyStudyHour() {
    if (!this.char.education.currentCourse) return;
    const course = COURSES.find(c => c.id === this.char.education.currentCourse);
    if (!course) return;
    const studySpeed = 1 + (this.getSkillEffect('studySpeed') || 0);
    const efficiency = (1 - this.char.body.mentalFatigue / 200 - this.char.body.sleepDebt / 50) * studySpeed;
    this.char.education.courseProgress += Math.max(0.2, efficiency);
    this.char.body.mentalFatigue = Math.min(100, this.char.body.mentalFatigue + 3);
    this.char.body.energy = Math.max(10, this.char.body.energy - 2);
    if (this.char.education.courseProgress >= course.hours) this.completeCourse(course);
  }

  completeCourse(course) {
    this.char.education.completed.push(course.id);
    this.char.education.currentCourse = null;
    this.char.education.courseProgress = 0;
    if (course.unlocks != null && course.unlocks > this.char.education.level) {
      this.char.education.level = course.unlocks;
      this.char.education.levelName = ['Ensino Médio Incompleto', 'Ensino Médio Completo', 'Curso Técnico', 'Graduação em Andamento', 'Graduação Concluída', 'Especialização'][course.unlocks] || 'Avançado';
    }
    if (course.benefit === 'program_unlock') {
      // Unlock advanced programs implicitly by having completed course
    }
    this.addDiary(`Concluiu o curso: ${course.name}`);
    this.pendingEvents.push({ type: 'course_complete', text: `Você concluiu ${course.name}!` });
  }

  startCourse(courseId) {
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return { ok: false, msg: 'Curso inválido.' };
    if (this.char.education.level < course.req) return { ok: false, msg: 'Escolaridade insuficiente.' };
    if (this.char.education.currentCourse) return { ok: false, msg: 'Já há um curso em andamento.' };
    if (this.char.education.completed.includes(courseId)) return { ok: false, msg: 'Curso já concluído.' };
    if (this.char.finance.cash < course.cost) return { ok: false, msg: 'Dinheiro insuficiente.' };
    this.char.finance.cash -= course.cost;
    this.char.finance.history.unshift({ day: this.gameDay, type: 'expense', amount: course.cost, desc: `Curso: ${course.name}` });
    this.char.education.currentCourse = courseId;
    this.char.education.courseProgress = 0;
    this.buildWeeklyPlan();
    this.addDiary(`Iniciou o curso: ${course.name}`);
    return { ok: true };
  }

  applyEat() {
    this.char.body.energy = Math.min(100, this.char.body.energy + 12);
    this.char.body.nutrition = Math.min(100, this.char.body.nutrition + 5);
  }

  applyRestHour() {
    this.char.body.energy = Math.min(100, this.char.body.energy + 2);
    this.char.body.systemicFatigue = Math.max(0, this.char.body.systemicFatigue - 1);
    this.char.body.mood = Math.min(100, this.char.body.mood + 0.5);
  }

  // ---------- Training ----------
  executeTrainingSession() {
    const events = [];
    const program = PROGRAMS[this.char.training.program] || PROGRAMS.linear;
    const readiness = this.char.training.readiness / 100;
    const fatigueMult = 1 + this.char.body.systemicFatigue / 150;
    const classBonuses = getClassBonuses(this.char);
    const fatRed = this.getSkillEffect('fatigueReduction') || 0;
    const techGainBonus = 1 + (this.getSkillEffect('techGain') || 0);

    const dow = this.getDayOfWeek();
    const sessionDef = program.days.find(s => (s.day - 1) % 7 === dow) || program.days[0];
    const focuses = sessionDef.focus === 'all' ? ['squat', 'bench', 'dead']
      : sessionDef.focus === 'upper' ? ['bench']
      : sessionDef.focus === 'lower' ? ['squat', 'dead']
      : sessionDef.focus === 'deadlift' ? ['dead']
      : [sessionDef.focus];

    const results = [];
    for (const lift of focuses) {
      const L = this.char.lifts[lift];
      if (!L) continue;

      const equipBonus = getEquipmentBonus(this.char, lift);
      const intensity = sessionDef.intensity * readiness / fatigueMult;
      const volume = sessionDef.sets * sessionDef.reps;
      const stimulus = intensity * Math.sqrt(volume) * (0.7 + L.technique / 200) * (1 + equipBonus);

      // Fatigue
      let fatCost = stimulus * 8 * (1 - fatRed);
      if (lift === 'squat' && classBonuses.fatigueSquat) fatCost *= classBonuses.fatigueSquat;
      if (lift === 'bench' && classBonuses.fatigueBench) fatCost *= classBonuses.fatigueBench;
      if (lift === 'dead' && classBonuses.fatigueDead) fatCost *= classBonuses.fatigueDead;
      L.fatigue = Math.min(100, L.fatigue + fatCost);
      this.char.body.systemicFatigue = Math.min(100, this.char.body.systemicFatigue + stimulus * 4 * (1 - fatRed));
      this.char.body.energy = Math.max(5, this.char.body.energy - 8);

      // Adaptation
      const pot = this.char.potential[lift] || 1.3;
      const softCap = this.char.body.weight * (lift === 'bench' ? 1.4 : lift === 'squat' ? 2.2 : 2.6) * pot;
      const room = Math.max(0, softCap - L.oneRM);
      let gainMult = 1;
      if (lift === 'squat' && classBonuses.squatGain) gainMult = classBonuses.squatGain;
      if (lift === 'bench' && classBonuses.benchGain) gainMult = classBonuses.benchGain;
      if (lift === 'dead' && classBonuses.deadGain) gainMult = classBonuses.deadGain;
      if (classBonuses.squatGain && classBonuses.benchGain) gainMult = classBonuses.squatGain; // powerbuilder

      const gain = room * 0.004 * stimulus * (0.5 + this.char.personality.discipline / 200) * (0.6 + readiness) * gainMult;

      if (gain > 0.05) {
        L.oneRM = Math.round((L.oneRM + gain) * 10) / 10;
        L.experience = Math.min(100, L.experience + 0.5);
        let techMult = techGainBonus;
        if (lift === 'squat' && classBonuses.squatTech) techMult *= classBonuses.squatTech;
        if (lift === 'bench' && classBonuses.benchTech) techMult *= classBonuses.benchTech;
        if (lift === 'dead' && classBonuses.deadTech) techMult *= classBonuses.deadTech;
        if (classBonuses.allTech) techMult *= classBonuses.allTech;
        L.technique = Math.min(100, L.technique + 0.15 * techMult);
      }
      results.push({ lift, oneRM: L.oneRM, gain: Math.round(gain * 10) / 10 });
    }

    this.char.training.sessionsThisWeek++;
    this.char.training.totalSessions++;
    this.char.training.lastSessionDay = this.gameDay;
    this.char.body.mood = Math.min(100, this.char.body.mood + 3);

    // Skill points
    if (this.char.training.totalSessions % SKILL_POINT_INTERVAL === 0) {
      this.char.skillPoints = (this.char.skillPoints || 0) + 1;
      events.push({ type: 'skill_point', text: 'Você ganhou 1 ponto de habilidade!' });
    }

    this.updateReadiness();

    if (!this.char.flags.firstTrainingDone) {
      this.char.flags.firstTrainingDone = true;
      this.addDiary('Realizou o primeiro treino de powerlifting.');
      events.push({ type: 'first_train', text: 'Primeiro treino concluído! A jornada começou.' });
    }

    const summary = results.map(r => `${r.lift}: ${r.oneRM.toFixed(1)}kg (+${r.gain})`).join(' | ');
    events.push({ type: 'training', text: `Treino concluído. ${summary}` });
    this.offlineLog.push(`Dia ${this.gameDay}: Treino — ${summary}`);
    return events;
  }

  // ---------- Finances ----------
  processDailyFinances() {
    const events = [];
    const c = this.char;
    const dayOfMonth = (this.gameDay % 30) + 1;
    const expRed = this.getSkillEffect('expenseReduction') || 0;

    if (dayOfMonth === 5 || dayOfMonth === 20) {
      const pay = Math.round(c.job.salary / 2);
      c.finance.cash += pay;
      c.finance.income += pay;
      c.finance.history.unshift({ day: this.gameDay, type: 'income', amount: pay, desc: 'Salário' });
      events.push({ type: 'salary', text: `Salário recebido: R$ ${pay}` });
      this.offlineLog.push(`Dia ${this.gameDay}: +R$ ${pay} (salário)`);
    }

    const dailyRent = Math.round(c.living.rent / 30);
    const dailyFood = 25 + Math.round(c.body.nutrition / 10);
    const dailyGym = c.flags.gymMember ? 8 : 0;
    const dailyTransport = Math.round(c.job.commute / 10);
    const kidsCost = (c.living.kids || 0) * 20;
    let totalDaily = dailyRent + dailyFood + dailyGym + dailyTransport + kidsCost;
    totalDaily = Math.round(totalDaily * (1 - expRed));

    if (c.finance.cash >= totalDaily) {
      c.finance.cash -= totalDaily;
      c.finance.expenses += totalDaily;
      c.finance.history.unshift({ day: this.gameDay, type: 'expense', amount: totalDaily, desc: 'Custos diários' });
    } else {
      c.finance.debt += totalDaily - c.finance.cash;
      c.finance.cash = 0;
      c.body.mood = Math.max(10, c.body.mood - 5);
      c.body.nutrition = Math.max(20, c.body.nutrition - 10);
      events.push({ type: 'money_warn', text: 'Dinheiro insuficiente. Dívida aumentando.' });
    }
    if (c.finance.history.length > 50) c.finance.history.length = 50;
    return events;
  }

  // ---------- Competitions ----------
  canEnterComp(compId) {
    const comp = COMPETITIONS.find(c => c.id === compId);
    if (!comp) return false;
    const total = getTotal1RM(this.char);
    if (total < (comp.minTotal || 0) * 0.85) return false;
    if (comp.minRep && this.char.reputation < comp.minRep) return false;
    if (this.char.finance.cash < comp.entryFee + comp.travelCost) return false;
    // Already done this specific one recently
    const recent = (this.char.competitions.results || []).find(r => r.id === compId && this.gameDay - r.day < 30);
    if (recent) return false;
    return true;
  }

  enterCompetition(compId) {
    const comp = COMPETITIONS.find(c => c.id === compId);
    if (!comp) return { ok: false, msg: 'Competição inválida.' };
    if (!this.canEnterComp(compId)) return { ok: false, msg: 'Requisitos não atendidos.' };

    this.char.finance.cash -= (comp.entryFee + comp.travelCost);
    this.char.finance.history.unshift({
      day: this.gameDay, type: 'expense',
      amount: comp.entryFee + comp.travelCost, desc: `Inscrição: ${comp.name}`
    });

    const readiness = this.char.training.readiness / 100;
    const focusBonus = this.getSkillEffect('compPressure') || 0;
    const pressure = 0.90 + this.rng.float(0, 0.08) + focusBonus;
    const results = {};
    let total = 0;

    for (const lift of ['squat', 'bench', 'dead']) {
      const oneRM = this.char.lifts[lift].oneRM;
      const tech = this.char.lifts[lift].technique / 100;
      const equipBonus = getEquipmentBonus(this.char, lift);
      const attempts = [];
      const targets = [0.90, 0.97, 1.02].map(m =>
        Math.round(oneRM * m * readiness * pressure * (0.9 + tech * 0.1) * (1 + equipBonus * 0.5))
      );
      let best = 0;
      for (const t of targets) {
        const successChance = Math.min(0.95, 0.5 + (oneRM * (1 + equipBonus) - t) / Math.max(1, oneRM) * 0.8 + tech * 0.2 + focusBonus);
        const ok = this.rng.chance(successChance);
        attempts.push({ weight: t, success: ok });
        if (ok && t > best) best = t;
      }
      results[lift] = { attempts, best };
      total += best;
    }

    // Ranking by level
    const fieldMult = { local: 1.0, regional: 1.15, national: 1.3, continental: 1.45, world: 1.6 }[comp.level] || 1;
    const fieldAvg = (comp.minTotal || 200) * fieldMult;
    let place = 1;
    if (total < fieldAvg * 0.85) place = this.rng.int(8, 15);
    else if (total < fieldAvg) place = this.rng.int(4, 8);
    else if (total < fieldAvg * 1.1) place = this.rng.int(2, 4);
    else place = this.rng.int(1, 2);

    let prize = 0;
    if (place === 1) prize = comp.prize1;
    else if (place === 2) prize = comp.prize2;
    else if (place === 3) prize = comp.prize3;

    if (prize > 0) {
      this.char.finance.cash += prize;
      this.char.finance.history.unshift({ day: this.gameDay, type: 'income', amount: prize, desc: `Prêmio ${place}º — ${comp.name}` });
    }

    const repGain = Math.max(5, comp.reputation - (place - 1) * Math.ceil(comp.reputation / 8));
    this.char.reputation += repGain;
    if (total > (this.char.competitions.bestTotal || 0)) this.char.competitions.bestTotal = total;

    this.char.competitions.results.push({ id: comp.id, day: this.gameDay, total, place, results, level: comp.level });
    if (comp.level === 'local') this.char.flags.firstCompDone = true;

    this.addDiary(`Disputou ${comp.name}. Total: ${total}kg — ${place}º lugar (+${repGain} rep).`);
    this.pendingEvents.push({
      type: 'comp_result',
      text: `${comp.name}\nTotal: ${total} kg\nColocação: ${place}º lugar${prize ? `\nPrêmio: R$ ${prize}` : ''}\nReputação +${repGain}`
    });

    return { ok: true, total, place, prize, results, reputation: repGain };
  }

  // ---------- Sponsorships ----------
  processSponsorships() {
    const events = [];
    const active = this.char.sponsorships || [];
    for (const s of active) {
      if (this.gameDay >= s.endDay) {
        s.active = false;
        events.push({ type: 'sponsor_end', text: `Contrato com ${s.name} encerrou.` });
        this.addDiary(`Contrato de patrocínio com ${s.name} terminou.`);
        continue;
      }
      // Monthly payment every 30 days
      if ((this.gameDay - s.startDay) % 30 === 0 && this.gameDay > s.startDay) {
        this.char.finance.cash += s.monthly;
        this.char.finance.income += s.monthly;
        this.char.finance.history.unshift({ day: this.gameDay, type: 'income', amount: s.monthly, desc: `Patrocínio: ${s.name}` });
        events.push({ type: 'sponsor_pay', text: `Patrocínio ${s.name}: +R$ ${s.monthly}` });
      }
    }
    this.char.sponsorships = active.filter(s => s.active !== false);
    return events;
  }

  availableSponsors() {
    const activeIds = (this.char.sponsorships || []).map(s => s.id);
    return SPONSORS.filter(s => this.char.reputation >= s.minRep && !activeIds.includes(s.id));
  }

  signSponsor(sponsorId) {
    const def = SPONSORS.find(s => s.id === sponsorId);
    if (!def) return { ok: false, msg: 'Patrocinador inválido.' };
    if (this.char.reputation < def.minRep) return { ok: false, msg: 'Reputação insuficiente.' };
    if ((this.char.sponsorships || []).some(s => s.id === sponsorId)) return { ok: false, msg: 'Já contratado.' };

    const neg = this.getSkillEffect('negotiation') || 0;
    const monthly = Math.round(def.monthly * (1 + neg));
    const contract = {
      id: def.id, name: def.name, monthly, startDay: this.gameDay,
      endDay: this.gameDay + def.duration, obligations: def.obligations, type: def.type, active: true
    };
    if (!this.char.sponsorships) this.char.sponsorships = [];
    this.char.sponsorships.push(contract);
    this.char.finance.cash += monthly; // first payment
    this.char.finance.history.unshift({ day: this.gameDay, type: 'income', amount: monthly, desc: `Patrocínio: ${def.name}` });
    this.addDiary(`Assinou patrocínio com ${def.name} (R$ ${monthly}/mês).`);
    return { ok: true, contract };
  }

  // ---------- National Team ----------
  checkNationalTeam() {
    const events = [];
    if (this.char.nationalTeam) return events;
    const best = this.char.competitions.bestTotal || 0;
    if (this.char.reputation >= 200 && best >= 450) {
      this.char.nationalTeam = true;
      this.addDiary('Convocado para a Seleção Nacional de Powerlifting!');
      events.push({ type: 'national_team', text: 'Você foi convocado para a Seleção Nacional!' });
      this.char.reputation += 50;
    }
    return events;
  }

  // ---------- Job promotion ----------
  checkPromotion() {
    const events = [];
    const job = this.char.job;
    if (!job.promoteTo) return events;
    if (job.tenure < 6) return events; // need some tenure in game days sense - use performance
    if (this.char.job.performance < 70) return events;
    if (this.rng.chance(0.02)) {
      const next = JOBS.find(j => j.id === job.promoteTo);
      if (next && this.char.education.level >= next.educationReq) {
        const neg = this.getSkillEffect('negotiation') || 0;
        this.char.job = { ...next, tenure: 0, performance: 60 + Math.round(neg * 50) };
        this.addDiary(`Promovido a ${next.name}!`);
        events.push({ type: 'promotion', text: `Promoção! Agora você é ${next.name}. Salário: R$ ${next.salary}` });
        this.buildWeeklyPlan();
      }
    }
    // Performance slowly rises with discipline
    this.char.job.performance = Math.min(95, this.char.job.performance + this.char.personality.discipline * 0.002);
    this.char.job.tenure = (this.char.job.tenure || 0) + 1 / 30;
    return events;
  }

  // ---------- Relationships ----------
  processRelationships() {
    const events = [];
    const socialBonus = this.getSkillEffect('socialBonus') || 0;
    const stressRes = this.getSkillEffect('stressResist') || 0;

    for (const npc of (this.char.npcs || [])) {
      // Bond drifts based on priorities and personality
      const personalPri = this.char.schedule.priorities.personal || 10;
      let delta = (personalPri - 15) * 0.05 + (npc.support - 40) * 0.01;
      delta += socialBonus * 2;
      if (this.char.body.mood < 40) delta -= 0.3;
      npc.bond = Math.max(0, Math.min(100, npc.bond + delta));

      // Random interaction
      if (this.rng.chance(0.03)) {
        if (npc.bond > 60 && this.rng.chance(0.5)) {
          this.char.body.mood = Math.min(100, this.char.body.mood + 5);
          events.push({ type: 'social', text: `${npc.name} (${npc.role}): conversa positiva. Humor +.` });
        } else if (npc.demand > 50 && personalPri < 20) {
          this.char.body.mood = Math.max(15, this.char.body.mood - 4 * (1 - stressRes));
          npc.bond = Math.max(0, npc.bond - 3);
          events.push({ type: 'social', text: `${npc.name} está insatisfeito(a) com sua ausência.` });
        }
      }
    }
    return events;
  }

  // ---------- Events ----------
  randomEvent() {
    const events = [];
    const roll = this.rng.next();
    if (roll < 0.25) {
      this.char.body.mood = Math.min(100, this.char.body.mood + 5);
      const texts = [
        'Um colega elogiou sua disciplina.',
        'Você dormiu especialmente bem.',
        'Encontrou um vídeo útil de técnica.',
        'A academia estava vazia e o treino rendeu.',
        'Recebeu uma mensagem de apoio de um amigo.'
      ];
      events.push({ type: 'flavor', text: this.rng.pick(texts) });
    } else if (roll < 0.4) {
      this.char.body.mood = Math.max(20, this.char.body.mood - 4);
      this.char.body.mentalFatigue = Math.min(100, this.char.body.mentalFatigue + 5);
      const texts = [
        'O trânsito atrasou o dia.',
        'Discussão leve em casa.',
        'Dormiu mal por causa de barulho.',
        'Sentiu-se um pouco desmotivado.',
        'Conta inesperada chegou.'
      ];
      events.push({ type: 'flavor', text: this.rng.pick(texts) });
    } else if (roll < 0.45 && this.char.reputation >= 20) {
      events.push({ type: 'opportunity', text: 'Um organizador de competição local mencionou seu nome.' });
    }
    return events;
  }

  addDiary(text) {
    this.char.diary.unshift({ day: this.gameDay, text, type: 'event' });
    if (this.char.diary.length > 100) this.char.diary.length = 100;
  }

  // ---------- Offline ----------
  simulateOffline(lastSaveTimestamp) {
    const now = Date.now();
    let elapsedMs = now - lastSaveTimestamp;
    const maxMs = TIME_CONFIG.maxOfflineHours * 3600 * 1000;
    if (elapsedMs > maxMs) elapsedMs = maxMs;
    if (elapsedMs < 1000) return { hours: 0, events: [], log: [] };

    this.offlineLog = [];
    this.pendingEvents = [];
    const realHours = elapsedMs / 3600000;
    const gameHours = (elapsedMs / 2000) * this.speed;
    const gameDays = gameHours / 24;
    const totalMinutes = Math.floor(gameHours * 60);

    let processed = 0;
    while (processed < totalMinutes) {
      const chunk = Math.min(60, totalMinutes - processed);
      this.advanceMinutes(chunk);
      processed += chunk;
    }

    return {
      hours: Math.round(realHours * 10) / 10,
      gameDays: Math.round(gameDays * 10) / 10,
      events: this.pendingEvents.slice(0, 20),
      log: this.offlineLog.slice(0, 30),
      cash: this.char.finance.cash,
      total1RM: Math.round(getTotal1RM(this.char)),
      reputation: this.char.reputation
    };
  }

  getSaveData() {
    return {
      version: 2,
      character: this.char,
      gameDay: this.gameDay,
      gameHour: this.gameHour,
      gameMinute: this.gameMinute,
      speed: this.speed,
      lastSaveTime: Date.now(),
      rngState: this.rng.getState()
    };
  }

  loadSaveData(data) {
    if (!data || !data.character) return false;
    this.char = data.character;
    // Migrate old saves
    if (!this.char.skills) this.char.skills = {};
    if (this.char.skillPoints == null) this.char.skillPoints = 0;
    if (!this.char.equipment) this.char.equipment = { belt: null, shoes: null, wrists: null, knees: null, singlet: null };
    if (!this.char.inventory) this.char.inventory = [];
    if (!this.char.sponsorships) this.char.sponsorships = [];
    if (!this.char.npcs) this.char.npcs = [];
    if (!this.char.competitions) this.char.competitions = { entered: [], results: [], bestTotal: 0 };
    if (this.char.nationalTeam == null) this.char.nationalTeam = false;
    if (!this.char.flags) this.char.flags = { firstTrainingDone: false, firstCompDone: false, gymMember: true, classChosen: false };

    this.gameDay = data.gameDay || 0;
    this.gameHour = data.gameHour ?? 8;
    this.gameMinute = data.gameMinute || 0;
    this.speed = data.speed || 1;
    this.lastSaveTime = data.lastSaveTime || Date.now();
    this.rng = new RNG(this.char.seed);
    if (data.rngState) this.rng.setState(data.rngState);
    this.buildWeeklyPlan();
    return true;
  }
}
