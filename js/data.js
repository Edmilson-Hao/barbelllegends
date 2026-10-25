/**
 * Static game data — complete systems
 */
export const FIRST_NAMES_M = [
  'Rafael', 'Lucas', 'Pedro', 'Gabriel', 'Mateus', 'Bruno', 'Felipe', 'André',
  'Thiago', 'Carlos', 'Diego', 'Leonardo', 'Ricardo', 'Eduardo', 'Marcos',
  'João', 'Paulo', 'Fernando', 'Rodrigo', 'Gustavo', 'Henrique', 'Alexandre',
  'Vinicius', 'Caio', 'Renato', 'Marcelo', 'Fábio', 'Igor', 'Daniel', 'Samuel'
];

export const FIRST_NAMES_F = [
  'Ana', 'Maria', 'Julia', 'Beatriz', 'Larissa', 'Camila', 'Fernanda', 'Patricia',
  'Amanda', 'Carolina', 'Mariana', 'Isabela', 'Letícia', 'Bruna', 'Gabriela',
  'Renata', 'Vanessa', 'Priscila', 'Tatiane', 'Aline', 'Daniela', 'Carla',
  'Bianca', 'Juliana', 'Natália', 'Raquel', 'Simone', 'Cristina', 'Paula', 'Helena'
];

export const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso',
  'Teixeira', 'Dias', 'Castro', 'Campos', 'Moreira', 'Nunes', 'Mendes',
  'Freitas', 'Azevedo', 'Pinto', 'Correia', 'Monteiro', 'Cunha', 'Reis'
];

export const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
  'Brasília', 'Salvador', 'Recife', 'Fortaleza', 'Campinas', 'Florianópolis',
  'Goiânia', 'Vitória', 'Joinville', 'Londrina', 'Ribeirão Preto', 'Santos'
];

export const JOBS = [
  { id: 'repositor', name: 'Repositor de Supermercado', salary: 1600, hoursPerWeek: 44, schedule: { start: 8, end: 17, days: [1, 2, 3, 4, 5, 6] }, physical: 70, mental: 30, stability: 60, educationReq: 0, commute: 40, promoteTo: 'supervisor_loja' },
  { id: 'atendente', name: 'Atendente de Loja', salary: 1500, hoursPerWeek: 40, schedule: { start: 9, end: 18, days: [1, 2, 3, 4, 5, 6] }, physical: 40, mental: 50, stability: 50, educationReq: 0, commute: 35, promoteTo: 'supervisor_loja' },
  { id: 'auxiliar_adm', name: 'Auxiliar Administrativo', salary: 1900, hoursPerWeek: 40, schedule: { start: 8, end: 17, days: [1, 2, 3, 4, 5] }, physical: 15, mental: 60, stability: 70, educationReq: 1, commute: 45, promoteTo: 'analista' },
  { id: 'operador_log', name: 'Operador de Logística', salary: 2100, hoursPerWeek: 44, schedule: { start: 6, end: 15, days: [1, 2, 3, 4, 5, 6] }, physical: 75, mental: 35, stability: 65, educationReq: 0, commute: 50, promoteTo: 'supervisor_log' },
  { id: 'motorista', name: 'Motorista de App', salary: 2200, hoursPerWeek: 48, schedule: { start: 7, end: 19, days: [1, 2, 3, 4, 5, 6] }, physical: 30, mental: 55, stability: 40, educationReq: 0, commute: 10 },
  { id: 'tecnico', name: 'Técnico de Informática', salary: 2800, hoursPerWeek: 40, schedule: { start: 9, end: 18, days: [1, 2, 3, 4, 5] }, physical: 20, mental: 70, stability: 75, educationReq: 2, commute: 40, promoteTo: 'analista' },
  { id: 'analista', name: 'Analista de Dados Jr.', salary: 3500, hoursPerWeek: 40, schedule: { start: 9, end: 18, days: [1, 2, 3, 4, 5] }, physical: 10, mental: 80, stability: 70, educationReq: 3, commute: 35, promoteTo: 'analista_pleno' },
  { id: 'analista_pleno', name: 'Analista Pleno', salary: 5200, hoursPerWeek: 40, schedule: { start: 9, end: 18, days: [1, 2, 3, 4, 5] }, physical: 10, mental: 85, stability: 75, educationReq: 4, commute: 30 },
  { id: 'professor', name: 'Professor Particular', salary: 2500, hoursPerWeek: 30, schedule: { start: 14, end: 20, days: [1, 2, 3, 4, 5] }, physical: 15, mental: 65, stability: 45, educationReq: 3, commute: 25 },
  { id: 'autonomo', name: 'Freelancer / Autônomo', salary: 2000, hoursPerWeek: 35, schedule: { start: 10, end: 18, days: [1, 2, 3, 4, 5] }, physical: 20, mental: 60, stability: 30, educationReq: 1, commute: 0 },
  { id: 'estudante_meio', name: 'Estudante com Trabalho Parcial', salary: 900, hoursPerWeek: 20, schedule: { start: 14, end: 18, days: [1, 2, 3, 4, 5] }, physical: 25, mental: 40, stability: 50, educationReq: 0, commute: 30 },
  { id: 'supervisor_loja', name: 'Supervisor de Loja', salary: 2800, hoursPerWeek: 44, schedule: { start: 8, end: 17, days: [1, 2, 3, 4, 5, 6] }, physical: 45, mental: 55, stability: 70, educationReq: 1, commute: 35 },
  { id: 'supervisor_log', name: 'Supervisor de Logística', salary: 3200, hoursPerWeek: 44, schedule: { start: 6, end: 15, days: [1, 2, 3, 4, 5] }, physical: 50, mental: 55, stability: 75, educationReq: 1, commute: 45 },
  { id: 'personal', name: 'Personal Trainer', salary: 3000, hoursPerWeek: 35, schedule: { start: 7, end: 14, days: [1, 2, 3, 4, 5] }, physical: 50, mental: 40, stability: 40, educationReq: 2, commute: 20 }
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
  { id: 'informatica', name: 'Informática Básica', hours: 40, cost: 300, req: 1, unlocks: 2, benefit: 'job_tech' },
  { id: 'ingles', name: 'Inglês Intermediário', hours: 60, cost: 500, req: 1, unlocks: null, benefit: 'language' },
  { id: 'gestao', name: 'Gestão de Negócios', hours: 80, cost: 800, req: 2, unlocks: 3, benefit: 'job_office' },
  { id: 'nutricao', name: 'Nutrição Esportiva Básica', hours: 30, cost: 400, req: 1, unlocks: null, benefit: 'training_eff' },
  { id: 'periodizacao', name: 'Periodização Avançada', hours: 50, cost: 600, req: 2, unlocks: null, benefit: 'program_unlock' },
  { id: 'educacao_fisica', name: 'Fundamentos de Ed. Física', hours: 100, cost: 1200, req: 2, unlocks: 3, benefit: 'job_personal' },
  { id: 'financas', name: 'Finanças Pessoais', hours: 25, cost: 250, req: 1, unlocks: null, benefit: 'finance_skill' }
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

export const CLASSES = {
  titan: { id: 'titan', name: 'Titan', focus: 'squat', description: 'Especialista em agachamento. Maior eficiência no squat.', bonuses: { squatGain: 1.15, squatTech: 1.1, fatigueSquat: 0.9 } },
  ironpress: { id: 'ironpress', name: 'Iron Press', focus: 'bench', description: 'Especialista em supino.', bonuses: { benchGain: 1.15, benchTech: 1.1, fatigueBench: 0.9 } },
  earthbreaker: { id: 'earthbreaker', name: 'Earthbreaker', focus: 'dead', description: 'Especialista em levantamento terra.', bonuses: { deadGain: 1.15, deadTech: 1.1, fatigueDead: 0.9 } },
  powerbuilder: { id: 'powerbuilder', name: 'Powerbuilder', focus: 'all', description: 'Desenvolvimento equilibrado.', bonuses: { squatGain: 1.06, benchGain: 1.06, deadGain: 1.06, allTech: 1.05 } }
};

export const SKILLS = {
  fatigue_mgmt: { id: 'fatigue_mgmt', tree: 'sport', name: 'Gerenciamento de Fadiga', maxLevel: 5, cost: [1, 2, 3, 4, 5], desc: 'Reduz fadiga sistêmica gerada por treino.', effect: (lv) => ({ fatigueReduction: 0.05 * lv }) },
  tech_efficiency: { id: 'tech_efficiency', tree: 'sport', name: 'Eficiência Técnica', maxLevel: 5, cost: [1, 2, 3, 4, 5], desc: 'Aumenta ganho de técnica por sessão.', effect: (lv) => ({ techGain: 0.08 * lv }) },
  recovery: { id: 'recovery', tree: 'sport', name: 'Recuperação Ativa', maxLevel: 5, cost: [1, 2, 3, 4, 5], desc: 'Melhora recuperação diária de fadiga muscular.', effect: (lv) => ({ recoveryBonus: 0.1 * lv }) },
  mental_focus: { id: 'mental_focus', tree: 'sport', name: 'Foco Competitivo', maxLevel: 3, cost: [2, 3, 5], desc: 'Melhora desempenho sob pressão.', effect: (lv) => ({ compPressure: 0.03 * lv }) },
  organization: { id: 'organization', tree: 'pro', name: 'Organização Semanal', maxLevel: 5, cost: [1, 2, 3, 4, 5], desc: 'Mais eficiência na agenda.', effect: (lv) => ({ scheduleEfficiency: 0.04 * lv }) },
  study_eff: { id: 'study_eff', tree: 'pro', name: 'Eficiência de Estudo', maxLevel: 5, cost: [1, 2, 3, 4, 5], desc: 'Aprende cursos mais rápido.', effect: (lv) => ({ studySpeed: 0.1 * lv }) },
  negotiation: { id: 'negotiation', tree: 'pro', name: 'Negociação', maxLevel: 4, cost: [2, 3, 4, 5], desc: 'Melhores contratos e promoções.', effect: (lv) => ({ negotiation: 0.08 * lv }) },
  work_stamina: { id: 'work_stamina', tree: 'pro', name: 'Resistência Laboral', maxLevel: 4, cost: [1, 2, 3, 4], desc: 'Trabalho causa menos fadiga.', effect: (lv) => ({ workFatigue: 0.08 * lv }) },
  finance_plan: { id: 'finance_plan', tree: 'personal', name: 'Planejamento Financeiro', maxLevel: 4, cost: [1, 2, 3, 4], desc: 'Reduz gastos diários.', effect: (lv) => ({ expenseReduction: 0.05 * lv }) },
  social_bond: { id: 'social_bond', tree: 'personal', name: 'Vínculos Sociais', maxLevel: 4, cost: [1, 2, 3, 4], desc: 'Relacionamentos evoluem mais rápido.', effect: (lv) => ({ socialBonus: 0.1 * lv }) },
  stress_control: { id: 'stress_control', tree: 'personal', name: 'Controle de Estresse', maxLevel: 5, cost: [1, 2, 3, 4, 5], desc: 'Humor e fadiga mental mais estáveis.', effect: (lv) => ({ stressResist: 0.08 * lv }) },
  sleep_quality: { id: 'sleep_quality', tree: 'personal', name: 'Qualidade do Sono', maxLevel: 4, cost: [1, 2, 3, 4], desc: 'Sono recupera mais.', effect: (lv) => ({ sleepBonus: 0.1 * lv }) }
};

export const EQUIPMENT = [
  { id: 'belt_basic', name: 'Cinturão Básico', slot: 'belt', rarity: 'common', cost: 80, durability: 100, bonuses: { squat: 0.02, dead: 0.02 }, desc: 'Suporte simples para coluna.' },
  { id: 'belt_leather', name: 'Cinturão de Couro 10mm', slot: 'belt', rarity: 'uncommon', cost: 220, durability: 120, bonuses: { squat: 0.04, dead: 0.035 }, desc: 'Cinturão rígido de powerlifting.' },
  { id: 'belt_pro', name: 'Cinturão Pro 13mm', slot: 'belt', rarity: 'rare', cost: 450, durability: 150, bonuses: { squat: 0.06, dead: 0.05 }, desc: 'Usado por atletas de elite.' },
  { id: 'belt_legend', name: 'Cinturão Iron Empire', slot: 'belt', rarity: 'legendary', cost: 1200, durability: 200, bonuses: { squat: 0.08, dead: 0.07 }, desc: 'Peça lendária da federação.' },
  { id: 'shoes_flat', name: 'Tênis Flat', slot: 'shoes', rarity: 'common', cost: 60, durability: 80, bonuses: { dead: 0.02 }, desc: 'Sola plana para terra.' },
  { id: 'shoes_heel', name: 'Sapato de Agachamento', slot: 'shoes', rarity: 'uncommon', cost: 180, durability: 100, bonuses: { squat: 0.04 }, desc: 'Salto elevado para profundidade.' },
  { id: 'shoes_dead', name: 'Sapatilha de Terra', slot: 'shoes', rarity: 'rare', cost: 280, durability: 110, bonuses: { dead: 0.05 }, desc: 'Grip máximo no chão.' },
  { id: 'wrist_basic', name: 'Munhequeira Básica', slot: 'wrists', rarity: 'common', cost: 40, durability: 60, bonuses: { bench: 0.015 }, desc: 'Suporte leve para punhos.' },
  { id: 'wrist_pro', name: 'Munhequeira Rígida', slot: 'wrists', rarity: 'uncommon', cost: 90, durability: 90, bonuses: { bench: 0.03 }, desc: 'Estabilidade no supino.' },
  { id: 'knee_sleeve', name: 'Joelheira de Neoprene', slot: 'knees', rarity: 'common', cost: 70, durability: 70, bonuses: { squat: 0.02 }, desc: 'Calor e suporte leve.' },
  { id: 'knee_wrap', name: 'Joelheira Elástica', slot: 'knees', rarity: 'rare', cost: 150, durability: 80, bonuses: { squat: 0.045 }, desc: 'Rebote extra no squat.' },
  { id: 'singlet_basic', name: 'Singlet de Competição', slot: 'singlet', rarity: 'uncommon', cost: 120, durability: 100, bonuses: { all: 0.01 }, desc: 'Obrigatório em muitas federações.' },
  { id: 'singlet_pro', name: 'Singlet Pro', slot: 'singlet', rarity: 'epic', cost: 350, durability: 130, bonuses: { all: 0.025 }, desc: 'Tecido de alta compressão.' }
];

export const RARITY_COLORS = { common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6', epic: '#A855F7', legendary: '#FBBF24' };

export const PROGRAMS = {
  linear: { name: 'Linear Básico', description: 'Progressão linear simples. Ideal para iniciantes.', days: [
    { day: 1, focus: 'squat', sets: 3, reps: 5, intensity: 0.75 },
    { day: 3, focus: 'bench', sets: 3, reps: 5, intensity: 0.75 },
    { day: 5, focus: 'deadlift', sets: 3, reps: 5, intensity: 0.75 }
  ]},
  fullbody: { name: 'Full Body', description: 'Treino completo 3x por semana.', days: [
    { day: 1, focus: 'all', sets: 3, reps: 8, intensity: 0.70 },
    { day: 3, focus: 'all', sets: 3, reps: 8, intensity: 0.70 },
    { day: 5, focus: 'all', sets: 3, reps: 8, intensity: 0.70 }
  ]},
  upperlower: { name: 'Upper / Lower', description: 'Divisão superior/inferior.', days: [
    { day: 1, focus: 'upper', sets: 4, reps: 6, intensity: 0.75 },
    { day: 2, focus: 'lower', sets: 4, reps: 6, intensity: 0.75 },
    { day: 4, focus: 'upper', sets: 4, reps: 6, intensity: 0.75 },
    { day: 5, focus: 'lower', sets: 4, reps: 6, intensity: 0.75 }
  ]},
  five_three_one: { name: '5/3/1 Ondulatório', description: 'Intensidade ondulatória.', days: [
    { day: 1, focus: 'squat', sets: 3, reps: 5, intensity: 0.75 },
    { day: 2, focus: 'bench', sets: 3, reps: 5, intensity: 0.75 },
    { day: 4, focus: 'deadlift', sets: 3, reps: 5, intensity: 0.75 },
    { day: 5, focus: 'bench', sets: 3, reps: 8, intensity: 0.65 }
  ]},
  block: { name: 'Periodização em Blocos', description: 'Volume → Intensidade → Pico.', days: [
    { day: 1, focus: 'squat', sets: 5, reps: 5, intensity: 0.70 },
    { day: 2, focus: 'bench', sets: 5, reps: 5, intensity: 0.70 },
    { day: 4, focus: 'deadlift', sets: 4, reps: 4, intensity: 0.75 },
    { day: 5, focus: 'bench', sets: 4, reps: 6, intensity: 0.70 },
    { day: 6, focus: 'squat', sets: 3, reps: 3, intensity: 0.80 }
  ]}
};

export const COMPETITIONS = [
  { id: 'local_1', name: 'Campeonato Local de Powerlifting', level: 'local', entryFee: 80, travelCost: 50, prize1: 300, prize2: 150, prize3: 80, reputation: 20, minTotal: 150, weightClasses: ['59', '66', '74', '83', '93', '105', '120', '120+'] },
  { id: 'regional_1', name: 'Campeonato Regional', level: 'regional', entryFee: 150, travelCost: 200, prize1: 800, prize2: 400, prize3: 200, reputation: 50, minTotal: 280, minRep: 30, weightClasses: ['59', '66', '74', '83', '93', '105', '120', '120+'] },
  { id: 'national_1', name: 'Campeonato Nacional', level: 'national', entryFee: 250, travelCost: 500, prize1: 2500, prize2: 1200, prize3: 600, reputation: 120, minTotal: 400, minRep: 80, weightClasses: ['59', '66', '74', '83', '93', '105', '120', '120+'] },
  { id: 'continental_1', name: 'Campeonato Sul-Americano', level: 'continental', entryFee: 400, travelCost: 1500, prize1: 5000, prize2: 2500, prize3: 1200, reputation: 250, minTotal: 520, minRep: 180, weightClasses: ['59', '66', '74', '83', '93', '105', '120', '120+'] },
  { id: 'world_1', name: 'Campeonato Mundial', level: 'world', entryFee: 600, travelCost: 3500, prize1: 15000, prize2: 8000, prize3: 4000, reputation: 500, minTotal: 650, minRep: 350, weightClasses: ['59', '66', '74', '83', '93', '105', '120', '120+'] }
];

export const SPONSORS = [
  { id: 'local_gym', name: 'Academia Local', minRep: 25, monthly: 150, duration: 90, obligations: 'Treinar na academia e postar resultados', type: 'equipment' },
  { id: 'supp_brand', name: 'Marca de Suplementos', minRep: 60, monthly: 400, duration: 120, obligations: 'Usar produtos e mencionar em competições', type: 'monthly' },
  { id: 'gear_co', name: 'Iron Gear Co.', minRep: 100, monthly: 600, duration: 180, obligations: 'Usar equipamentos da marca em competições', type: 'equipment' },
  { id: 'national_brand', name: 'Marca Nacional de Esportes', minRep: 200, monthly: 1500, duration: 365, obligations: 'Exclusividade e aparições em eventos', type: 'monthly' },
  { id: 'elite_sponsor', name: 'Patrocínio Elite Internacional', minRep: 400, monthly: 4000, duration: 365, obligations: 'Resultados de alto nível e exclusividade total', type: 'full' }
];

export const NPC_TEMPLATES = [
  { role: 'partner', names: ['Ana', 'Carlos', 'Marina', 'Pedro', 'Julia', 'Lucas'], personalities: ['apoiador', 'exigente', 'independente', 'carinhoso'] },
  { role: 'friend', names: ['Bruno', 'Camila', 'Diego', 'Fernanda', 'Gustavo', 'Helena'], personalities: ['motivador', 'competitivo', 'relaxado', 'sério'] },
  { role: 'coach', names: ['Professor Marcos', 'Treinadora Rita', 'Coach André'], personalities: ['técnico', 'motivacional', 'rigoroso'] },
  { role: 'family', names: ['Mãe', 'Pai', 'Irmão', 'Irmã'], personalities: ['protetor', 'orgulhoso', 'preocupado'] },
  { role: 'colleague', names: ['João', 'Patricia', 'Roberto', 'Sandra'], personalities: ['amigável', 'neutro', 'invejoso'] }
];

export const HAIR_COLORS = ['#1a1a1a', '#3d2314', '#8B4513', '#D2691E', '#FFD700', '#C0C0C0', '#4a0000'];
export const SKIN_TONES = ['#FFDBAC', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5C3317'];
export const SHIRT_COLORS = ['#1E3A5F', '#2D5A27', '#5C1A1A', '#3D3D3D', '#4A3728', '#1A3A4A'];
export const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const TIME_CONFIG = { realMsPerGameDay: (60 * 60 * 1000) / 7, maxOfflineHours: 24, tickIntervalMs: 1000, gameMinutesPerTick: 60 };
export const SKILL_POINT_INTERVAL = 8;
