/**
 * Procedural character generation — complete systems
 */
import { RNG } from './rng.js';
import {
  FIRST_NAMES_M, FIRST_NAMES_F, LAST_NAMES, CITIES, JOBS,
  EDUCATION_LEVELS, LIVING_SITUATIONS, RELATIONSHIP_STATUS,
  HAIR_COLORS, SKIN_TONES, SHIRT_COLORS, NPC_TEMPLATES, CLASSES
} from './data.js';

export function generateCharacter(seed) {
  const rng = new RNG(seed);
  const gender = rng.chance(0.55) ? 'M' : 'F';
  const firstName = rng.pick(gender === 'M' ? FIRST_NAMES_M : FIRST_NAMES_F);
  const lastName = rng.pick(LAST_NAMES);
  const age = rng.int(18, 38);
  const city = rng.pick(CITIES);
  const height = gender === 'M' ? rng.int(165, 195) : rng.int(155, 180);
  const baseWeight = gender === 'M' ? 70 + (height - 175) * 0.6 : 58 + (height - 162) * 0.5;
  const weight = Math.round(baseWeight + rng.float(-8, 12));

  const appearance = {
    skin: rng.pick(SKIN_TONES),
    hair: rng.pick(HAIR_COLORS),
    hairStyle: rng.int(0, 3),
    shirt: rng.pick(SHIRT_COLORS),
    gender
  };

  let eduLevel = 0;
  if (age <= 19) eduLevel = rng.chance(0.6) ? 0 : 1;
  else if (age <= 22) eduLevel = rng.int(0, 3);
  else if (age <= 28) eduLevel = rng.int(1, 4);
  else eduLevel = rng.int(1, 5);

  const eligibleJobs = JOBS.filter(j => j.educationReq <= eduLevel && !j.id.includes('pleno') && !j.id.includes('supervisor'));
  const job = rng.pick(eligibleJobs.length ? eligibleJobs : JOBS.slice(0, 5));

  let living, relationship;
  if (age < 22) {
    living = rng.chance(0.55) ? LIVING_SITUATIONS[0] : rng.pick(LIVING_SITUATIONS.slice(0, 3));
    relationship = rng.chance(0.6) ? RELATIONSHIP_STATUS[0] : rng.pick(RELATIONSHIP_STATUS.slice(0, 2));
  } else if (age < 30) {
    living = rng.pick(LIVING_SITUATIONS);
    relationship = rng.pick(RELATIONSHIP_STATUS);
  } else {
    living = rng.pick(LIVING_SITUATIONS.slice(1));
    relationship = rng.pick(RELATIONSHIP_STATUS);
  }

  const hasKids = (relationship.id === 'married' || relationship.id === 'separated') && age > 25 && rng.chance(0.25);
  const kids = hasKids ? rng.int(1, 2) : 0;

  const personality = {
    discipline: rng.int(20, 85),
    ambition: rng.int(25, 90),
    sociability: rng.int(15, 90),
    organization: rng.int(20, 85),
    resilience: rng.int(25, 90),
    impulsivity: rng.int(10, 80),
    stressTolerance: rng.int(20, 85),
    academicInterest: rng.int(10, 80),
    sportMotivation: rng.int(30, 95)
  };

  const trainHistory = rng.chance(0.4) ? 'gym' : (rng.chance(0.3) ? 'none' : 'casual');
  let squat1rm, bench1rm, dead1rm;
  if (trainHistory === 'none') {
    squat1rm = gender === 'M' ? rng.int(40, 70) : rng.int(25, 50);
    bench1rm = gender === 'M' ? rng.int(30, 55) : rng.int(15, 35);
    dead1rm = gender === 'M' ? rng.int(50, 90) : rng.int(30, 60);
  } else if (trainHistory === 'casual') {
    squat1rm = gender === 'M' ? rng.int(60, 100) : rng.int(40, 70);
    bench1rm = gender === 'M' ? rng.int(45, 80) : rng.int(25, 50);
    dead1rm = gender === 'M' ? rng.int(80, 130) : rng.int(50, 90);
  } else {
    squat1rm = gender === 'M' ? rng.int(80, 130) : rng.int(50, 90);
    bench1rm = gender === 'M' ? rng.int(60, 100) : rng.int(30, 65);
    dead1rm = gender === 'M' ? rng.int(100, 160) : rng.int(60, 110);
  }

  const potential = {
    squat: 1.0 + rng.float(0.15, 0.55),
    bench: 1.0 + rng.float(0.10, 0.50),
    dead: 1.0 + rng.float(0.20, 0.60)
  };

  const savings = Math.max(0, Math.round(job.salary * rng.float(0.2, 1.8) - living.rent));
  const debt = rng.chance(0.15) ? rng.int(500, 3000) : 0;

  const story = buildStory({ firstName, age, job, living, relationship, trainHistory, city, gender, kids });

  // Generate initial NPCs based on life situation
  const npcs = generateNPCs(rng, relationship, living, personality);

  const char = {
    seed,
    rngState: rng.getState(),
    identity: {
      firstName, lastName,
      fullName: `${firstName} ${lastName}`,
      gender, age, city, height, weight,
      birthday: { month: rng.int(1, 12), day: rng.int(1, 28) }
    },
    appearance,
    education: {
      level: eduLevel,
      levelName: EDUCATION_LEVELS[eduLevel].name,
      currentCourse: null,
      courseProgress: 0,
      completed: []
    },
    job: { ...job, tenure: rng.int(1, Math.min(age - 16, 10)), performance: rng.int(40, 80) },
    living: { ...living, kids },
    relationship: { ...relationship },
    personality,
    body: {
      weight,
      bodyFat: gender === 'M' ? rng.int(12, 28) : rng.int(18, 35),
      energy: 80, fatigue: 20,
      muscleFatigue: { squat: 0, bench: 0, dead: 0 },
      systemicFatigue: 15, mentalFatigue: 10,
      sleepDebt: 0, nutrition: 60, mood: 65
    },
    lifts: {
      squat: { oneRM: squat1rm, technique: rng.int(20, 50), experience: trainHistory === 'none' ? 0 : rng.int(10, 40), fatigue: 0 },
      bench: { oneRM: bench1rm, technique: rng.int(20, 50), experience: trainHistory === 'none' ? 0 : rng.int(10, 40), fatigue: 0 },
      dead: { oneRM: dead1rm, technique: rng.int(20, 50), experience: trainHistory === 'none' ? 0 : rng.int(10, 40), fatigue: 0 }
    },
    potential,
    training: {
      program: 'linear',
      sessionsThisWeek: 0,
      lastSessionDay: -1,
      totalSessions: trainHistory === 'none' ? 0 : rng.int(5, 40),
      readiness: 75,
      phase: 'accumulation' // accumulation | intensification | peak | deload
    },
    finance: {
      cash: savings, debt, income: 0, expenses: 0,
      history: [], lastPayDay: 0
    },
    reputation: 0,
    competitions: { entered: [], results: [], bestTotal: 0 },
    schedule: {
      priorities: { powerlifting: 40, career: 30, studies: 15, personal: 10, leisure: 5 }
    },
    diary: [],
    // NEW SYSTEMS
    classId: null,
    skillPoints: 1,
    skills: {},
    equipment: { belt: null, shoes: null, wrists: null, knees: null, singlet: null },
    inventory: [],
    sponsorships: [],
    nationalTeam: false,
    npcs,
    flags: {
      firstTrainingDone: false,
      firstCompDone: false,
      gymMember: true,
      classChosen: false
    },
    story
  };

  char.diary.push({
    day: 0,
    text: `${char.identity.fullName} decidiu começar uma jornada no powerlifting.`,
    type: 'start'
  });

  return char;
}

function generateNPCs(rng, relationship, living, personality) {
  const npcs = [];
  // Partner
  if (relationship.id === 'dating' || relationship.id === 'married') {
    const t = NPC_TEMPLATES.find(x => x.role === 'partner');
    npcs.push({
      id: 'partner',
      name: rng.pick(t.names),
      role: 'partner',
      personality: rng.pick(t.personalities),
      bond: relationship.id === 'married' ? rng.int(50, 85) : rng.int(40, 70),
      support: rng.int(30, 80),
      demand: rng.int(20, 60)
    });
  }
  // Family if living with parents
  if (living.id === 'parents') {
    const t = NPC_TEMPLATES.find(x => x.role === 'family');
    npcs.push({
      id: 'family1',
      name: rng.pick(['Mãe', 'Pai']),
      role: 'family',
      personality: rng.pick(t.personalities),
      bond: rng.int(50, 90),
      support: rng.int(40, 85),
      demand: rng.int(15, 50)
    });
  }
  // Friend
  const ft = NPC_TEMPLATES.find(x => x.role === 'friend');
  npcs.push({
    id: 'friend1',
    name: rng.pick(ft.names),
    role: 'friend',
    personality: rng.pick(ft.personalities),
    bond: rng.int(30, 70),
    support: rng.int(25, 70),
    demand: rng.int(10, 40)
  });
  // Colleague
  const ct = NPC_TEMPLATES.find(x => x.role === 'colleague');
  npcs.push({
    id: 'colleague1',
    name: rng.pick(ct.names),
    role: 'colleague',
    personality: rng.pick(ct.personalities),
    bond: rng.int(15, 50),
    support: rng.int(10, 40),
    demand: rng.int(5, 30)
  });
  return npcs;
}

function buildStory(d) {
  const g = d.gender === 'M' ? '' : 'a';
  const pronoun = d.gender === 'M' ? 'Ele' : 'Ela';
  const parts = [];
  parts.push(`${d.firstName}, ${d.age} anos, trabalha como ${d.job.name.toLowerCase()} em ${d.city}.`);
  if (d.living.id === 'parents') parts.push(`${pronoun} ainda mora com os pais.`);
  else if (d.living.id === 'partner') parts.push(`${pronoun} mora com o(a) parceiro(a).`);
  else if (d.living.id === 'shared') parts.push(`${pronoun} divide o aluguel com colegas.`);
  else if (d.living.id === 'alone') parts.push(`${pronoun} mora sozinho${g}.`);
  if (d.relationship.id === 'dating') parts.push('Está em um relacionamento.');
  else if (d.relationship.id === 'married') parts.push('É casado' + g + (d.kids ? ` e tem ${d.kids} filho(s)` : '') + '.');
  else if (d.relationship.id === 'single') parts.push('Está solteiro' + g + '.');
  if (d.trainHistory === 'none') parts.push('Nunca treinou com pesos de forma séria, mas sempre teve curiosidade.');
  else if (d.trainHistory === 'casual') parts.push('Já frequentou a academia de forma casual e gosta de se sentir forte.');
  else parts.push('Já treina há algum tempo e descobriu o powerlifting como próximo passo.');
  parts.push('Agora decidiu tentar se tornar um atleta de verdade.');
  return parts.join(' ');
}

export function getTotal1RM(char) {
  return char.lifts.squat.oneRM + char.lifts.bench.oneRM + char.lifts.dead.oneRM;
}

export function getWeightClass(weight) {
  if (weight <= 59) return '59';
  if (weight <= 66) return '66';
  if (weight <= 74) return '74';
  if (weight <= 83) return '83';
  if (weight <= 93) return '93';
  if (weight <= 105) return '105';
  if (weight <= 120) return '120';
  return '120+';
}

export function getEquipmentBonus(char, lift) {
  let bonus = 0;
  const eq = char.equipment || {};
  for (const slot of Object.keys(eq)) {
    const item = eq[slot];
    if (!item || !item.bonuses) continue;
    if (item.bonuses[lift]) bonus += item.bonuses[lift];
    if (item.bonuses.all) bonus += item.bonuses.all;
  }
  return bonus;
}

export function getSkillEffects(char) {
  const effects = {};
  const skills = char.skills || {};
  // Import SKILLS dynamically via effects stored at level-up time is simpler —
  // recompute from data when needed by caller
  return effects;
}

export function getClassBonuses(char) {
  if (!char.classId || !CLASSES[char.classId]) return {};
  return CLASSES[char.classId].bonuses || {};
}
