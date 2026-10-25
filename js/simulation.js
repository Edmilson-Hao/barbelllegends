/**
 * Core simulation engine: time, daily routine, training, fatigue, finances, offline.
 */
import { RNG } from './rng.js';
import { TIME_CONFIG, PROGRAMS, COMPETITIONS, DAYS_PT, MONTHS_PT, COURSES } from './data.js';
import { getTotal1RM, getWeightClass } from './character.js';

export class Simulation {
  constructor(character, options = {}) {
    this.char = character;
    this.rng = new RNG(character.seed);
    this.rng.setState(character.rngState || character.seed);

    // Game calendar starts at day 0 = Monday of a fictional week
    this.gameDay = 0; // absolute day counter
    this.gameHour = 8; // 0-23
    this.gameMinute = 0;
    this.speed = options.speed || 1;
    this.paused = false;
    this.lastRealTime = Date.now();
    this.lastSaveTime = Date.now();

    // Accumulated real ms for time advancement
    this.realMsAccum = 0;

    // Activity currently performing
    this.currentActivity = 'idle';
    this.activityProgress = 0;

    // Weekly schedule cache (rebuilt when priorities change)
    this.weeklyPlan = null;
    this.buildWeeklyPlan();

    // Event queue for offline summary
    this.pendingEvents = [];
    this.offlineLog = [];
  }

  // ---------- Time ----------
  getDayOfWeek() {
    return this.gameDay % 7; // 0 = Mon ... 6 = Sun (we treat 0 as Monday)
  }

  getDisplayDate() {
    // Approximate calendar starting from a fixed epoch
    const start = new Date(2026, 0, 5); // Monday
    const d = new Date(start.getTime() + this.gameDay * 86400000);
    const dayName = DAYS_PT[d.getDay()];
    return `${dayName}, ${String(d.getDate()).padStart(2, '0')} ${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
  }

  getDisplayTime() {
    return `${String(this.gameHour).padStart(2, '0')}:${String(Math.floor(this.gameMinute)).padStart(2, '0')}`;
  }

  /**
   * Advance simulation by real milliseconds.
   * Called from the main loop.
   */
  tick(realDeltaMs) {
    if (this.paused) return [];

    this.realMsAccum += realDeltaMs * this.speed;
    const events = [];

    // MVP feel: ~2 real seconds = 1 game hour at 1x speed
    // (still consistent; offline uses the same advanceMinutes path)
    const msPerGameHour = 2000;
    const msPerChunk = (msPerGameHour / 60) * TIME_CONFIG.gameMinutesPerTick;

    while (this.realMsAccum >= msPerChunk) {
      this.realMsAccum -= msPerChunk;
      const chunkEvents = this.advanceMinutes(TIME_CONFIG.gameMinutesPerTick);
      events.push(...chunkEvents);
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
    // Continuous recovery/drain
    this.updateBodyContinuous(mins);
    return events;
  }

  onNewHour() {
    const events = [];
    const dow = this.getDayOfWeek();
    const hour = this.gameHour;

    // Determine activity from plan
    const planSlot = this.getActivityAt(dow, hour);
    this.currentActivity = planSlot;

    // Execute activity effects
    if (planSlot === 'work') {
      this.applyWorkHour();
    } else if (planSlot === 'train') {
      // Training happens as a block; we trigger session start
      if (this.shouldStartTraining(dow, hour)) {
        events.push(...this.executeTrainingSession());
      }
    } else if (planSlot === 'sleep') {
      this.applySleepHour();
    } else if (planSlot === 'study') {
      this.applyStudyHour();
    } else if (planSlot === 'eat') {
      this.applyEat();
    } else if (planSlot === 'rest' || planSlot === 'leisure') {
      this.applyRestHour();
    }

    // Random micro-events
    if (this.rng.chance(0.02)) {
      events.push(...this.randomEvent());
    }

    return events;
  }

  onNewDay() {
    const events = [];
    // Age check (every 365 days)
    if (this.gameDay > 0 && this.gameDay % 365 === 0) {
      this.char.identity.age++;
      events.push({ type: 'birthday', text: `${this.char.identity.firstName} completou ${this.char.identity.age} anos!` });
      this.addDiary(`Completou ${this.char.identity.age} anos.`);
    }

    // Daily finance
    events.push(...this.processDailyFinances());

    // Reset weekly training counter on Monday
    if (this.getDayOfWeek() === 0) {
      this.char.training.sessionsThisWeek = 0;
    }

    // Natural recovery overnight already handled in sleep
    // Decay some fatigue
    this.char.body.systemicFatigue = Math.max(0, this.char.body.systemicFatigue - 5);
    this.char.body.mentalFatigue = Math.max(0, this.char.body.mentalFatigue - 3);
    this.char.lifts.squat.fatigue = Math.max(0, this.char.lifts.squat.fatigue - 8);
    this.char.lifts.bench.fatigue = Math.max(0, this.char.lifts.bench.fatigue - 8);
    this.char.lifts.dead.fatigue = Math.max(0, this.char.lifts.dead.fatigue - 8);

    // Update readiness
    this.updateReadiness();

    return events;
  }

  // ---------- Schedule ----------
  buildWeeklyPlan() {
    // 7 days × 24 hours
    const plan = Array.from({ length: 7 }, () => Array(24).fill('rest'));
    const job = this.char.job;
    const pri = this.char.schedule.priorities;

    for (let d = 0; d < 7; d++) {
      // Sleep 23-7 by default (adjustable later)
      for (let h = 23; h < 24; h++) plan[d][h] = 'sleep';
      for (let h = 0; h < 7; h++) plan[d][h] = 'sleep';

      // Work days
      if (job.schedule.days.includes(d + 1) || (d === 6 && job.schedule.days.includes(0))) {
        // Our dow: 0=Mon ... 5=Sat, 6=Sun. Job days: 1=Mon ... 6=Sat, 0=Sun
        const jobDay = d === 6 ? 0 : d + 1;
        if (job.schedule.days.includes(jobDay)) {
          const commuteH = Math.ceil(job.commute / 60);
          for (let h = job.schedule.start - commuteH; h < job.schedule.start; h++) {
            if (h >= 0 && h < 24) plan[d][h] = 'commute';
          }
          for (let h = job.schedule.start; h < job.schedule.end; h++) {
            plan[d][h] = 'work';
          }
          for (let h = job.schedule.end; h < job.schedule.end + commuteH; h++) {
            if (h < 24) plan[d][h] = 'commute';
          }
        }
      }

      // Meals
      if (plan[d][7] === 'rest') plan[d][7] = 'eat';
      if (plan[d][12] === 'rest') plan[d][12] = 'eat';
      if (plan[d][19] === 'rest') plan[d][19] = 'eat';
    }

    // Training slots based on program and priority
    const program = PROGRAMS[this.char.training.program] || PROGRAMS.linear;
    const trainHours = pri.powerlifting >= 50 ? 2 : 1;

    for (const session of program.days) {
      // session.day: 1=Mon ... 7=Sun → index 0-6
      const d = (session.day - 1) % 7;
      // Find free evening slot after work
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
      // Morning alternative
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

    // Study if priority high and has course
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
    // Only trigger once per continuous train block
    if (this.getActivityAt(dow, hour) !== 'train') return false;
    if (hour > 0 && this.getActivityAt(dow, hour - 1) === 'train') return false;
    // Avoid double sessions same day
    if (this.char.training.lastSessionDay === this.gameDay) return false;
    return true;
  }

  // ---------- Body / Fatigue ----------
  updateBodyContinuous(mins) {
    const factor = mins / 60;
    // Energy slowly drains when awake
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
    this.char.body.energy = Math.max(5, this.char.body.energy - job.physical * 0.04);
    this.char.body.mentalFatigue = Math.min(100, this.char.body.mentalFatigue + job.mental * 0.03);
    this.char.body.systemicFatigue = Math.min(100, this.char.body.systemicFatigue + job.physical * 0.02);
  }

  applySleepHour() {
    this.char.body.energy = Math.min(100, this.char.body.energy + 8);
    this.char.body.systemicFatigue = Math.max(0, this.char.body.systemicFatigue - 6);
    this.char.body.mentalFatigue = Math.max(0, this.char.body.mentalFatigue - 5);
    this.char.body.sleepDebt = Math.max(0, this.char.body.sleepDebt - 1.5);
    this.char.body.mood = Math.min(100, this.char.body.mood + 1);
  }

  applyStudyHour() {
    if (!this.char.education.currentCourse) return;
    const course = COURSES.find(c => c.id === this.char.education.currentCourse);
    if (!course) return;
    const efficiency = 1 - this.char.body.mentalFatigue / 200 - this.char.body.sleepDebt / 50;
    this.char.education.courseProgress += Math.max(0.2, efficiency);
    this.char.body.mentalFatigue = Math.min(100, this.char.body.mentalFatigue + 3);
    this.char.body.energy = Math.max(10, this.char.body.energy - 2);

    if (this.char.education.courseProgress >= course.hours) {
      this.completeCourse(course);
    }
  }

  completeCourse(course) {
    this.char.education.completed.push(course.id);
    this.char.education.currentCourse = null;
    this.char.education.courseProgress = 0;
    if (course.unlocks != null && course.unlocks > this.char.education.level) {
      this.char.education.level = course.unlocks;
      this.char.education.levelName = ['Ensino Médio Incompleto', 'Ensino Médio Completo', 'Curso Técnico', 'Graduação em Andamento', 'Graduação Concluída', 'Especialização'][course.unlocks] || 'Avançado';
    }
    this.addDiary(`Concluiu o curso: ${course.name}`);
    this.pendingEvents.push({ type: 'course_complete', text: `Você concluiu ${course.name}!` });
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

    // Determine which lifts today
    const dow = this.getDayOfWeek();
    const sessionDef = program.days.find(s => (s.day - 1) % 7 === dow) || program.days[0];
    const focuses = sessionDef.focus === 'all' ? ['squat', 'bench', 'dead']
      : sessionDef.focus === 'upper' ? ['bench']
      : sessionDef.focus === 'lower' ? ['squat', 'dead']
      : [sessionDef.focus];

    let anyGain = false;
    const results = [];

    for (const lift of focuses) {
      const L = this.char.lifts[lift];
      if (!L) continue;

      const intensity = sessionDef.intensity * readiness / fatigueMult;
      const volume = sessionDef.sets * sessionDef.reps;
      const stimulus = intensity * Math.sqrt(volume) * (0.7 + L.technique / 200);

      // Fatigue cost
      L.fatigue = Math.min(100, L.fatigue + stimulus * 8);
      this.char.body.systemicFatigue = Math.min(100, this.char.body.systemicFatigue + stimulus * 4);
      this.char.body.energy = Math.max(5, this.char.body.energy - 8);

      // Adaptation (diminishing returns)
      const current = L.oneRM;
      const pot = this.char.potential[lift] || 1.3;
      // Soft ceiling based on potential and bodyweight
      const softCap = this.char.body.weight * (lift === 'bench' ? 1.4 : lift === 'squat' ? 2.2 : 2.6) * pot;
      const room = Math.max(0, softCap - current);
      const gain = room * 0.004 * stimulus * (0.5 + this.char.personality.discipline / 200) * (0.6 + readiness);

      if (gain > 0.05) {
        L.oneRM = Math.round((L.oneRM + gain) * 10) / 10;
        L.experience = Math.min(100, L.experience + 0.5);
        L.technique = Math.min(100, L.technique + 0.15);
        anyGain = true;
      }

      results.push({ lift, oneRM: L.oneRM, gain: Math.round(gain * 10) / 10 });
    }

    this.char.training.sessionsThisWeek++;
    this.char.training.totalSessions++;
    this.char.training.lastSessionDay = this.gameDay;
    this.char.body.mood = Math.min(100, this.char.body.mood + 3);
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

    // Salary on day 5 and 20 (bi-weekly approximation)
    if (dayOfMonth === 5 || dayOfMonth === 20) {
      const pay = Math.round(c.job.salary / 2);
      c.finance.cash += pay;
      c.finance.income += pay;
      c.finance.history.unshift({ day: this.gameDay, type: 'income', amount: pay, desc: 'Salário' });
      events.push({ type: 'salary', text: `Salário recebido: R$ ${pay}` });
      this.offlineLog.push(`Dia ${this.gameDay}: +R$ ${pay} (salário)`);
    }

    // Daily living costs
    const dailyRent = Math.round(c.living.rent / 30);
    const dailyFood = 25 + Math.round(c.body.nutrition / 10);
    const dailyGym = c.flags.gymMember ? 8 : 0;
    const dailyTransport = Math.round(c.job.commute / 10);
    const kidsCost = (c.living.kids || 0) * 20;
    const totalDaily = dailyRent + dailyFood + dailyGym + dailyTransport + kidsCost;

    if (c.finance.cash >= totalDaily) {
      c.finance.cash -= totalDaily;
      c.finance.expenses += totalDaily;
      c.finance.history.unshift({ day: this.gameDay, type: 'expense', amount: totalDaily, desc: 'Custos diários' });
    } else {
      // Debt grows slowly
      c.finance.debt += totalDaily - c.finance.cash;
      c.finance.cash = 0;
      c.body.mood = Math.max(10, c.body.mood - 5);
      c.body.nutrition = Math.max(20, c.body.nutrition - 10);
      events.push({ type: 'money_warn', text: 'Dinheiro insuficiente. Dívida aumentando.' });
    }

    // Keep history short
    if (c.finance.history.length > 50) c.finance.history.length = 50;

    return events;
  }

  // ---------- Competition ----------
  canEnterLocalComp() {
    const total = getTotal1RM(this.char);
    const comp = COMPETITIONS[0];
    return total >= (comp.minSquat + comp.minBench + comp.minDead) * 0.85
      && this.char.finance.cash >= comp.entryFee + comp.travelCost
      && !this.char.flags.firstCompDone;
  }

  enterLocalCompetition() {
    const comp = COMPETITIONS[0];
    if (!this.canEnterLocalComp()) return { ok: false, msg: 'Requisitos não atendidos.' };

    this.char.finance.cash -= (comp.entryFee + comp.travelCost);
    this.char.finance.history.unshift({
      day: this.gameDay, type: 'expense',
      amount: comp.entryFee + comp.travelCost, desc: 'Inscrição + viagem competição'
    });

    // Simulate attempts
    const readiness = this.char.training.readiness / 100;
    const pressure = 0.92 + this.rng.float(0, 0.08);
    const results = {};
    let total = 0;

    for (const lift of ['squat', 'bench', 'dead']) {
      const oneRM = this.char.lifts[lift].oneRM;
      const tech = this.char.lifts[lift].technique / 100;
      const attempts = [];
      // Attempt selection: 90%, 97%, 102% of current 1RM adjusted
      const targets = [0.90, 0.97, 1.02].map(m => Math.round(oneRM * m * readiness * pressure * (0.9 + tech * 0.1)));
      let best = 0;
      for (const t of targets) {
        const successChance = Math.min(0.95, 0.5 + (oneRM - t) / oneRM * 0.8 + tech * 0.2);
        const ok = this.rng.chance(successChance);
        attempts.push({ weight: t, success: ok });
        if (ok && t > best) best = t;
      }
      results[lift] = { attempts, best };
      total += best;
    }

    // Ranking simplified (local field of ~12)
    const fieldAvg = (comp.minSquat + comp.minBench + comp.minDead) * 1.1;
    let place = 1;
    if (total < fieldAvg * 0.9) place = this.rng.int(6, 12);
    else if (total < fieldAvg) place = this.rng.int(3, 6);
    else if (total < fieldAvg * 1.15) place = this.rng.int(1, 3);
    else place = 1;

    let prize = 0;
    if (place === 1) prize = comp.prize1;
    else if (place === 2) prize = comp.prize2;
    else if (place === 3) prize = comp.prize3;

    if (prize > 0) {
      this.char.finance.cash += prize;
      this.char.finance.history.unshift({ day: this.gameDay, type: 'income', amount: prize, desc: `Prêmio ${place}º lugar` });
    }

    this.char.reputation += Math.max(5, comp.reputation - (place - 1) * 2);
    this.char.flags.firstCompDone = true;
    this.char.competitions.results.push({
      id: comp.id, day: this.gameDay, total, place, results
    });

    this.addDiary(`Disputou ${comp.name}. Total: ${total}kg — ${place}º lugar.`);
    this.pendingEvents.push({
      type: 'comp_result',
      text: `${comp.name}\nTotal: ${total} kg\nColocação: ${place}º lugar${prize ? `\nPrêmio: R$ ${prize}` : ''}`
    });

    return { ok: true, total, place, prize, results };
  }

  // ---------- Events ----------
  randomEvent() {
    const events = [];
    const roll = this.rng.next();
    if (roll < 0.3) {
      // Positive
      this.char.body.mood = Math.min(100, this.char.body.mood + 5);
      const texts = [
        'Um colega de trabalho elogiou sua disciplina.',
        'Você dormiu especialmente bem.',
        'Encontrou um vídeo útil de técnica de agachamento.',
        'A academia estava vazia e o treino rendeu.'
      ];
      const t = this.rng.pick(texts);
      events.push({ type: 'flavor', text: t });
    } else if (roll < 0.5) {
      // Mild negative
      this.char.body.mood = Math.max(20, this.char.body.mood - 4);
      this.char.body.mentalFatigue = Math.min(100, this.char.body.mentalFatigue + 5);
      const texts = [
        'O trânsito atrasou o dia.',
        'Discussão leve em casa.',
        'Dormiu mal por causa de barulho.',
        'Sentiu-se um pouco desmotivado.'
      ];
      events.push({ type: 'flavor', text: this.rng.pick(texts) });
    }
    return events;
  }

  addDiary(text) {
    this.char.diary.unshift({ day: this.gameDay, text, type: 'event' });
    if (this.char.diary.length > 100) this.char.diary.length = 100;
  }

  // ---------- Offline Simulation ----------
  /**
   * Simulate offline progress up to maxOfflineHours real time.
   * Returns summary events.
   */
  simulateOffline(lastSaveTimestamp) {
    const now = Date.now();
    let elapsedMs = now - lastSaveTimestamp;
    const maxMs = TIME_CONFIG.maxOfflineHours * 3600 * 1000;
    if (elapsedMs > maxMs) elapsedMs = maxMs;
    if (elapsedMs < 1000) return { hours: 0, events: [], log: [] };

    this.offlineLog = [];
    this.pendingEvents = [];
    const realHours = elapsedMs / 3600000;

    // Convert to game days
    const gameDays = (elapsedMs / TIME_CONFIG.realMsPerGameDay) * this.speed;
    const totalMinutes = Math.floor(gameDays * 24 * 60);

    // Process in larger chunks for performance (1 game hour at a time)
    let processed = 0;
    while (processed < totalMinutes) {
      const chunk = Math.min(60, totalMinutes - processed);
      this.advanceMinutes(chunk);
      processed += chunk;
    }

    // Collect summary
    const summary = {
      hours: Math.round(realHours * 10) / 10,
      gameDays: Math.round(gameDays * 10) / 10,
      events: this.pendingEvents.slice(0, 20),
      log: this.offlineLog.slice(0, 30),
      cash: this.char.finance.cash,
      total1RM: Math.round(getTotal1RM(this.char))
    };

    this.lastSaveTime = now;
    return summary;
  }

  // ---------- Serialization ----------
  getSaveData() {
    return {
      version: 1,
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
