/**
 * Static game data: names, jobs, education, programs, etc.
 */

export const FIRST_NAMES_M = [
  'Rafael', 'Lucas', 'Pedro', 'Gabriel', 'Mateus', 'Bruno', 'Felipe', 'André',
  'Thiago', 'Carlos', 'Diego', 'Leonardo', 'Ricardo', 'Eduardo', 'Marcos',
  'João', 'Paulo', 'Fernando', 'Rodrigo', 'Gustavo', 'Henrique', 'Alexandre'
];

export const FIRST_NAMES_F = [
  'Ana', 'Maria', 'Julia', 'Beatriz', 'Larissa', 'Camila', 'Fernanda', 'Patricia',
  'Amanda', 'Carolina', 'Mariana', 'Isabela', 'Letícia', 'Bruna', 'Gabriela',
  'Renata', 'Vanessa', 'Priscila', 'Tatiane', 'Aline', 'Daniela', 'Carla'
];

export const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso',
  'Teixeira', 'Dias', 'Castro', 'Campos', 'Moreira', 'Nunes', 'Mendes'
];

export const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
  'Brasília', 'Salvador', 'Recife', 'Fortaleza', 'Campinas', 'Florianópolis',
  'Goiânia', 'Vitória', 'Joinville', 'Londrina'
];

export const JOBS = [
  {
    id: 'repositor',
    name: 'Repositor de Supermercado',
    salary: 1600,
    hoursPerWeek: 44,
    schedule: { start: 8, end: 17, days: [1, 2, 3, 4, 5, 6] },
    physical: 70,
    mental: 30,
    stability: 60,
    educationReq: 0,
    commute: 40
  },
  {
    id: 'atendente',
    name: 'Atendente de Loja',
    salary: 1500,
    hoursPerWeek: 40,
    schedule: { start: 9, end: 18, days: [1, 2, 3, 4, 5, 6] },
    physical: 40,
    mental: 50,
    stability: 50,
    educationReq: 0,
    commute: 35
  },
  {
    id: 'auxiliar_adm',
    name: 'Auxiliar Administrativo',
    salary: 1900,
    hoursPerWeek: 40,
    schedule: { start: 8, end: 17, days: [1, 2, 3, 4, 5] },
    physical: 15,
    mental: 60,
    stability: 70,
    educationReq: 1,
    commute: 45
  },
  {
    id: 'operador_log',
    name: 'Operador de Logística',
    salary: 2100,
    hoursPerWeek: 44,
    schedule: { start: 6, end: 15, days: [1, 2, 3, 4, 5, 6] },
    physical: 75,
    mental: 35,
    stability: 65,
    educationReq: 0,
    commute: 50
  },
  {
    id: 'motorista',
    name: 'Motorista de App',
    salary: 2200,
    hoursPerWeek: 48,
    schedule: { start: 7, end: 19, days: [1, 2, 3, 4, 5, 6] },
    physical: 30,
    mental: 55,
    stability: 40,
    educationReq: 0,
    commute: 10
  },
  {
    id: 'tecnico',
    name: 'Técnico de Informática',
    salary: 2800,
    hoursPerWeek: 40,
    schedule: { start: 9, end: 18, days: [1, 2, 3, 4, 5] },
    physical: 20,
    mental: 70,
    stability: 75,
    educationReq: 2,
    commute: 40
  },
  {
    id: 'analista',
    name: 'Analista de Dados Jr.',
    salary: 3500,
    hoursPerWeek: 40,
    schedule: { start: 9, end: 18, days: [1, 2, 3, 4, 5] },
    physical: 10,
    mental: 80,
    stability: 70,
    educationReq: 3,
    commute: 35
  },
  {
    id: 'professor',
    name: 'Professor Particular',
    salary: 2500,
    hoursPerWeek: 30,
    schedule: { start: 14, end: 20, days: [1, 2, 3, 4, 5] },
    physical: 15,
    mental: 65,
    stability: 45,
    educationReq: 3,
    commute: 25
  },
  {
    id: 'autonomo',
    name: 'Freelancer / Autônomo',
    salary: 2000,
    hoursPerWeek: 35,
    schedule: { start: 10, end: 18, days: [1, 2, 3, 4, 5] },
    physical: 20,
    mental: 60,
    stability: 30,
    educationReq: 1,
    commute: 0
  },
  {
    id: 'estudante_meio',
    name: 'Estudante com Trabalho Parcial',
    salary: 900,
    hoursPerWeek: 20,
    schedule: { start: 14, end: 18, days: [1, 2, 3, 4, 5] },
    physical: 25,
    mental: 40,
    stability: 50,
    educationReq: 0,
    commute: 30
  }
];

export const EDUCATION_LEVELS = [
  { id: 0, name: 'Ensino Médio Incompleto' },
  { id: 1, name: 'Ensino Médio Completo' },
  { id: 2, name: 'Curso Técnico / Profissionalizante' },
  { id: 3, name: 'Graduação em Andamento' },
  { id: 4, name: 'Graduação Concluída' },
  { id: 5, name: 'Especialização / Pós' }
];

export const COURSES = [
  {
    id: 'informatica',
    name: 'Informática Básica',
    hours: 40,
    cost: 300,
    req: 1,
    unlocks: 2,
    benefit: 'job_tech'
  },
  {
    id: 'ingles',
    name: 'Inglês Intermediário',
    hours: 60,
    cost: 500,
    req: 1,
    unlocks: null,
    benefit: 'language'
  },
  {
    id: 'gestao',
    name: 'Gestão de Negócios',
    hours: 80,
    cost: 800,
    req: 2,
    unlocks: 3,
    benefit: 'job_office'
  },
  {
    id: 'nutricao',
    name: 'Nutrição Esportiva Básica',
    hours: 30,
    cost: 400,
    req: 1,
    unlocks: null,
    benefit: 'training_eff'
  }
];

export const LIVING_SITUATIONS = [
  { id: 'parents', name: 'Mora com os pais', rent: 0, social: 20 },
  { id: 'alone', name: 'Mora sozinho', rent: 900, social: -10 },
  { id: 'shared', name: 'Divide residência', rent: 450, social: 10 },
  { id: 'partner', name: 'Mora com parceiro(a)', rent: 600, social: 30 },
  { id: 'family', name: 'Mora com família própria', rent: 1100, social: 15 }
];

export const RELATIONSHIP_STATUS = [
  { id: 'single', name: 'Solteiro(a)' },
  { id: 'dating', name: 'Namorando' },
  { id: 'married', name: 'Casado(a) / União Estável' },
  { id: 'separated', name: 'Separado(a)' }
];

export const PROGRAMS = {
  linear: {
    name: 'Linear Básico',
    description: 'Progressão linear simples. Ideal para iniciantes.',
    days: [
      { day: 1, focus: 'squat', sets: 3, reps: 5, intensity: 0.75 },
      { day: 3, focus: 'bench', sets: 3, reps: 5, intensity: 0.75 },
      { day: 5, focus: 'deadlift', sets: 3, reps: 5, intensity: 0.75 }
    ]
  },
  fullbody: {
    name: 'Full Body',
    description: 'Treino completo 3x por semana.',
    days: [
      { day: 1, focus: 'all', sets: 3, reps: 8, intensity: 0.70 },
      { day: 3, focus: 'all', sets: 3, reps: 8, intensity: 0.70 },
      { day: 5, focus: 'all', sets: 3, reps: 8, intensity: 0.70 }
    ]
  },
  upperlower: {
    name: 'Upper / Lower',
    description: 'Divisão superior/inferior.',
    days: [
      { day: 1, focus: 'upper', sets: 4, reps: 6, intensity: 0.75 },
      { day: 2, focus: 'lower', sets: 4, reps: 6, intensity: 0.75 },
      { day: 4, focus: 'upper', sets: 4, reps: 6, intensity: 0.75 },
      { day: 5, focus: 'lower', sets: 4, reps: 6, intensity: 0.75 }
    ]
  }
};

export const COMPETITIONS = [
  {
    id: 'local_1',
    name: 'Campeonato Local de Powerlifting',
    level: 'local',
    entryFee: 80,
    travelCost: 50,
    prize1: 300,
    prize2: 150,
    prize3: 80,
    reputation: 15,
    minSquat: 60,
    minBench: 40,
    minDead: 80,
    weightClasses: ['59', '66', '74', '83', '93', '105', '120', '120+']
  }
];

export const HAIR_COLORS = ['#1a1a1a', '#3d2314', '#8B4513', '#D2691E', '#FFD700', '#C0C0C0', '#4a0000'];
export const SKIN_TONES = ['#FFDBAC', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5C3317'];
export const SHIRT_COLORS = ['#1E3A5F', '#2D5A27', '#5C1A1A', '#3D3D3D', '#4A3728', '#1A3A4A'];

export const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Time config: 1 real hour = 7 game days by default */
export const TIME_CONFIG = {
  realMsPerGameDay: (60 * 60 * 1000) / 7, // ~8.57 min real = 1 game day
  maxOfflineHours: 24,
  tickIntervalMs: 1000, // UI tick
  gameMinutesPerTick: 30 // at 1x speed, each real second advances 30 game minutes
};
