const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const databaseDir = path.join(__dirname, '../database');
if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}
const dbPath = path.join(databaseDir, 'artesuave.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('professor', 'student')),
      phone TEXT,
      birthdate TEXT,
      belt TEXT DEFAULT 'Branca',
      degrees INTEGER DEFAULT 0,
      academy_join_date TEXT,
      avatar TEXT,
      emergency_contact TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS physical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      weight REAL NOT NULL,
      height REAL,
      wingspan REAL,
      body_fat REAL,
      notes TEXT,
      recorded_at TEXT DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS graduations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      belt TEXT NOT NULL,
      degrees INTEGER NOT NULL,
      awarded_by_id INTEGER REFERENCES users(id),
      awarded_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      class_type TEXT NOT NULL,
      instructor_id INTEGER REFERENCES users(id),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      signed_by_instructor_id INTEGER REFERENCES users(id),
      status TEXT DEFAULT 'present',
      signed_at TEXT DEFAULT (datetime('now')),
      notes TEXT,
      UNIQUE(class_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS tutorials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      gi_type TEXT NOT NULL,
      video_url TEXT,
      image_url TEXT,
      description TEXT,
      steps TEXT,
      key_points TEXT,
      counter_attacks TEXT,
      instructor_name TEXT,
      created_by_id INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tutorial_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tutorial_id INTEGER NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, tutorial_id, status)
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      gi_type TEXT NOT NULL CHECK(gi_type IN ('Gi', 'No-Gi')),
      category_type TEXT NOT NULL CHECK(category_type IN ('Absoluto', 'Peso')),
      weight_division TEXT DEFAULT 'Absoluto Livre',
      gender TEXT NOT NULL CHECK(gender IN ('Masculino', 'Feminino', 'Misto')),
      belt_category TEXT NOT NULL,
      status TEXT DEFAULT 'ongoing' CHECK(status IN ('draft', 'ongoing', 'finished')),
      created_by_id INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tournament_athletes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      athlete_name TEXT NOT NULL,
      belt TEXT NOT NULL,
      weight REAL,
      team TEXT DEFAULT 'Arte Suave BJJ',
      seed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tournament_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      round_name TEXT NOT NULL,
      round_number INTEGER NOT NULL,
      match_number INTEGER NOT NULL,
      athlete1_id INTEGER REFERENCES tournament_athletes(id) ON DELETE SET NULL,
      athlete2_id INTEGER REFERENCES tournament_athletes(id) ON DELETE SET NULL,
      athlete1_name TEXT,
      athlete2_name TEXT,
      athlete1_belt TEXT,
      athlete2_belt TEXT,
      winner_id INTEGER REFERENCES tournament_athletes(id) ON DELETE SET NULL,
      winner_name TEXT,
      score1 INTEGER DEFAULT 0,
      score2 INTEGER DEFAULT 0,
      adv1 INTEGER DEFAULT 0,
      adv2 INTEGER DEFAULT 0,
      pen1 INTEGER DEFAULT 0,
      pen2 INTEGER DEFAULT 0,
      win_type TEXT,
      notes TEXT,
      next_match_id INTEGER,
      next_match_slot INTEGER,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed'))
    );
  `);

  seedData();
  seedTournaments();
}

function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    return; // Already seeded
  }

  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync('senha123', salt);

  // 1. Insert Professors
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, phone, birthdate, belt, degrees, academy_join_date, avatar, emergency_contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const profId = insertUser.run(
    'Mestre Carlos Gracie Silva',
    'professor@artesuave.com',
    defaultHash,
    'professor',
    '(11) 98765-4321',
    '1985-04-12',
    'Preta',
    3,
    '2015-01-10',
    'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=300&auto=format&fit=crop&q=80',
    'Esposa: Fabiana (11) 97777-1111'
  ).lastInsertRowid;

  insertUser.run(
    'Lucas "Pitbull" Mendes',
    'lucas@artesuave.com',
    defaultHash,
    'professor',
    '(11) 98111-2233',
    '1992-08-23',
    'Marrom',
    2,
    '2018-03-15',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'Irmão: Marcos (11) 96666-2222'
  );

  // 2. Insert Students
  const s1Id = insertUser.run(
    'Gabriel Rocha',
    'aluno@artesuave.com',
    defaultHash,
    'student',
    '(11) 99123-4567',
    '1998-05-14',
    'Branca',
    3,
    '2025-02-01',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'Mãe: Sandra (11) 98888-0001'
  ).lastInsertRowid;

  const s2Id = insertUser.run(
    'Mariana Costa',
    'mariana@artesuave.com',
    defaultHash,
    'student',
    '(11) 97234-5678',
    '2000-11-20',
    'Azul',
    2,
    '2023-06-10',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    'Pai: Roberto (11) 98888-0002'
  ).lastInsertRowid;

  const s3Id = insertUser.run(
    'Rodrigo "Tanque" Souza',
    'rodrigo@artesuave.com',
    defaultHash,
    'student',
    '(11) 96345-6789',
    '1993-02-18',
    'Roxa',
    1,
    '2021-09-01',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    'Esposa: Juliana (11) 98888-0003'
  ).lastInsertRowid;

  const s4Id = insertUser.run(
    'Felipe Lima',
    'felipe@artesuave.com',
    defaultHash,
    'student',
    '(11) 95456-7890',
    '2003-09-08',
    'Branca',
    1,
    '2025-08-15',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    'Tio: Cláudio (11) 98888-0004'
  ).lastInsertRowid;

  const s5Id = insertUser.run(
    'Camila Santos',
    'camila@artesuave.com',
    defaultHash,
    'student',
    '(11) 94567-8901',
    '1997-01-30',
    'Azul',
    4,
    '2023-01-10',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'Mãe: Angela (11) 98888-0005'
  ).lastInsertRowid;

  // 3. Physical records
  const insertPhys = db.prepare(`
    INSERT INTO physical_records (student_id, weight, height, wingspan, body_fat, notes, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Gabriel Rocha evolution
  insertPhys.run(s1Id, 82.0, 178.0, 182.0, 19.5, 'Início dos treinos. Foco em condicionamento e perda de peso.', '2025-02-05');
  insertPhys.run(s1Id, 80.2, 178.0, 182.0, 17.8, 'Ótima perda de gordura e mais gás no rola.', '2025-05-10');
  insertPhys.run(s1Id, 78.5, 178.0, 182.0, 16.0, 'Dentro da categoria Peso Médio CBJJ com folga.', '2025-09-20');
  insertPhys.run(s1Id, 77.8, 178.0, 182.0, 15.2, 'Peso atualizado, excelente ritmo e resistência.', '2026-03-01');

  // Mariana Costa
  insertPhys.run(s2Id, 63.5, 165.0, 166.0, 22.0, 'Pesagem para início do ciclo de campeonato.', '2024-03-10');
  insertPhys.run(s2Id, 61.2, 165.0, 166.0, 20.4, 'Enquadrada na categoria Pena feminino CBJJ.', '2025-10-15');

  // Rodrigo
  insertPhys.run(s3Id, 95.0, 185.0, 190.0, 18.0, 'Pesagem pesada.', '2023-01-15');
  insertPhys.run(s3Id, 91.5, 185.0, 190.0, 15.5, 'Categoria Pesado IBJJF c/ kimono batida.', '2025-11-04');

  // Felipe
  insertPhys.run(s4Id, 73.0, 175.0, 176.0, 14.0, 'Iniciou na categoria Leve.', '2025-08-20');

  // Camila
  insertPhys.run(s5Id, 56.0, 162.0, 163.0, 19.0, 'Categoria Pena feminina.', '2024-02-01');

  // 4. Graduations
  const insertGrad = db.prepare(`
    INSERT INTO graduations (student_id, belt, degrees, awarded_by_id, awarded_date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertGrad.run(s1Id, 'Branca', 0, profId, '2025-02-01', 'Matrícula na Arte Suave Academy');
  insertGrad.run(s1Id, 'Branca', 1, profId, '2025-04-15', '1º Grau - Domínio das defesas básicas e disciplina');
  insertGrad.run(s1Id, 'Branca', 2, profId, '2025-08-10', '2º Grau - Fuga de montada e passagem toureada');
  insertGrad.run(s1Id, 'Branca', 3, profId, '2025-12-05', '3º Grau - Excelente evolução no rola e assiduidade');

  insertGrad.run(s2Id, 'Branca', 4, profId, '2023-06-10', 'Último grau de branca');
  insertGrad.run(s2Id, 'Azul', 0, profId, '2023-11-20', 'Graduada para Faixa Azul pelo Mestre Carlos');
  insertGrad.run(s2Id, 'Azul', 1, profId, '2024-06-15', '1º Grau Faixa Azul');
  insertGrad.run(s2Id, 'Azul', 2, profId, '2025-03-10', '2º Grau Faixa Azul');

  insertGrad.run(s3Id, 'Roxa', 0, profId, '2024-05-10', 'Promoção à Faixa Roxa');
  insertGrad.run(s3Id, 'Roxa', 1, profId, '2025-08-20', '1º Grau Faixa Roxa');

  insertGrad.run(s4Id, 'Branca', 1, profId, '2025-11-10', '1º Grau Faixa Branca');

  insertGrad.run(s5Id, 'Azul', 4, profId, '2025-10-18', '4º Grau Faixa Azul - Pronta para a Faixa Roxa');

  // 5. Classes & Attendance
  const insertClass = db.prepare(`
    INSERT INTO classes (title, date, time, class_type, instructor_id, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAtt = db.prepare(`
    INSERT INTO attendances (class_id, student_id, signed_by_instructor_id, status, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Classes over the last 14 days and today
  const sampleClasses = [
    { title: 'Fundamentos - Passagem de Guarda', date: '2026-09-22', time: '19:30', type: 'Fundamentos' },
    { title: 'Treino de Competição Gi', date: '2026-09-24', time: '20:30', type: 'Gi' },
    { title: 'Treino No-Gi - Quedas e Chaves de Perna', date: '2026-09-26', time: '19:30', type: 'No-Gi' },
    { title: 'Open Mat de Sábado', date: '2026-09-27', time: '10:00', type: 'Open Mat' },
    { title: 'Fundamentos - Guarda Fechada e Raspagens', date: '2026-09-29', time: '19:30', type: 'Fundamentos' },
    { title: 'Avançado Gi - Guarda De La Riva e Berimbolo', date: '2026-10-01', time: '20:30', type: 'Avançado' },
    { title: 'No-Gi Submission Wrestling', date: '2026-10-03', time: '19:30', type: 'No-Gi' },
    { title: 'Treino Especial de Graduação e Rola', date: '2026-10-05', time: '19:30', type: 'Gi' },
    { title: 'Fundamentos - Defesa Pessoal e Quedas', date: '2026-10-06', time: '19:30', type: 'Fundamentos' },
    { title: 'Treino Avançado - Ataques das Costas', date: '2026-10-07', time: '20:30', type: 'Avançado' }
  ];

  sampleClasses.forEach((c, index) => {
    const classId = insertClass.run(c.title, c.date, c.time, c.type, profId, 'Tatame 1').lastInsertRowid;
    // Mark attendances for past and today's classes
    if (index < 8) {
      // Gabriel attends almost all
      insertAtt.run(classId, s1Id, profId, 'present', 'Excelente foco técnico');
      // Mariana attends
      if (index % 2 === 0 || index === 7) {
        insertAtt.run(classId, s2Id, profId, 'present', 'Treino forte');
      }
      // Rodrigo attends
      if (index % 2 !== 0 || index === 7) {
        insertAtt.run(classId, s3Id, profId, 'present', 'Bom rendimento');
      }
      // Camila
      insertAtt.run(classId, s5Id, profId, 'present', 'Técnica impecável');
    }
  });

  // 6. Rich Tutorials with Step-by-Step, Images & Videos
  const insertTutorial = db.prepare(`
    INSERT INTO tutorials (title, category, difficulty, gi_type, video_url, image_url, description, steps, key_points, counter_attacks, instructor_name, created_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tut1Steps = JSON.stringify([
    { step: 1, title: 'Domínio de braço e postura', desc: 'Na guarda fechada, cruze o braço do oponente trazendo-o em direção ao seu peito oposto. Segure o tríceps com firmeza e quebre a postura puxando a nuca com a mão livre.' },
    { step: 2, title: 'Abertura de quadril e pé no quadril', desc: 'Coloque o pé do mesmo lado do braço preso no quadril do adversário. Use esse pé como alavanca para girar seu corpo 90 graus.' },
    { step: 3, title: 'Subida da perna na axila', desc: 'Suba a perna livre bem alta nas costas, encaixando na axila oposta para impedir que ele volte a posturar.' },
    { step: 4, title: 'Passagem da perna sobre a cabeça', desc: 'Empurre a cabeça do oponente levemente e passe a outra perna por cima da cabeça, fechando os calcanhares apontados para baixo.' },
    { step: 5, title: 'Ajuste do polegar e finalização', desc: 'Mantenha os joelhos bem aduzidos (espremidos), alinhe o polegar do adversário voltado para cima (em direção ao seu queixo) e eleve a pelve vagarosamente.' }
  ]);

  const tut1Keys = JSON.stringify([
    'Nunca cruze os pés sobre o rosto do oponente, mantenha os calcanhares cravados para baixo.',
    'Mantenha os joelhos juntos e apertados como uma prensa durante todo o movimento.',
    'O polegar do oponente sempre aponta na direção contrária da flexão da articulação (para cima).'
  ]);

  insertTutorial.run(
    'Armlock Clássico da Guarda Fechada',
    'Finalizações',
    'Iniciante',
    'Ambos',
    'https://www.youtube.com/embed/Pj15b6N-tO4',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    'A finalização mais icônica e fundamental do Jiu-Jitsu brasileiro. Aprenda a quebrar a postura, criar o ângulo correto de alavanca com o quadril e finalizar com precisão cirúrgica.',
    tut1Steps,
    tut1Keys,
    'Fuga do cotovelo girando com o ombro (Hitchhiker escape) ou esmagamento na pilha (Stack defense).',
    'Mestre Carlos Gracie Silva',
    profId
  );

  const tut2Steps = JSON.stringify([
    { step: 1, title: 'Isolamento de um braço (Regra Um Braço Dentro, Um Fora)', desc: 'Identifique quando o adversário tenta apoiar uma mão no seu peito ou tatame. Empurre o pulso dele para dentro enquanto puxa o outro braço para fora.' },
    { step: 2, title: 'Disparo das pernas no pescoço', desc: 'Lance suas pernas subindo o quadril explosivamente, laçando a nuca com uma panturrilha e deixando o braço dele isolado dentro do triângulo.' },
    { step: 3, title: 'Cruzamento do braço defensivo', desc: 'Levante o quadril no ar para desviar o braço do oponente atravessando o peito até a sua crista ilíaca oposta.' },
    { step: 4, title: 'Pegada na canela e ajuste de ângulo', desc: 'Segure a sua própria canela (nunca os dedos do pé) com a mão oposta. Apoie o pé no quadril para girar 90 graus e olhar na orelha dele.' },
    { step: 5, title: 'Travamento da fechadura (figura quatro)', desc: 'Passe o joelho por cima do tornozelo, formando o quatro perfeito. Abaixe a cabeça dele e comprima as coxas.' }
  ]);

  const tut2Keys = JSON.stringify([
    'A pressão do estrangulamento vem da artéria carótida sendo pressionada pelo próprio ombro do adversário de um lado e pela sua coxa do outro.',
    'Nunca feche o triângulo de frente; o ângulo em 90 graus é o segredo dos faixas pretas.'
  ]);

  insertTutorial.run(
    'Triângulo Perfeito da Guarda Fechada',
    'Finalizações',
    'Iniciante',
    'Ambos',
    'https://www.youtube.com/embed/5U7zB1qZ4Vw',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    'O estrangulamento mais versátil da guarda. Cria uma armadilha fatal utilizando a força das pernas contra o pescoço e a artéria carótida do adversário.',
    tut2Steps,
    tut2Keys,
    'Posturar imediatamente e passar o braço para trás da cintura antes do fechamento.',
    'Mestre Carlos Gracie Silva',
    profId
  );

  const tut3Steps = JSON.stringify([
    { step: 1, title: 'Pegadas de gola e manga', desc: 'Da guarda fechada, estabeleça pegada firme de quatro dedos na manga direita e pegada alta na gola esquerda cruzada.' },
    { step: 2, title: 'Fuga de quadril (Shrimp)', desc: 'Abra a guarda, coloque o pé direito no tatame e dê uma fugida de quadril para fora, criando espaço de ação.' },
    { step: 3, title: 'Escudo de canela transversal', desc: 'Posicione a canela esquerda atravessada no peito do oponente, funcionando como uma mola e mantenedor de distância.' },
    { step: 4, title: 'Chute tesoura simultâneo', desc: 'A perna superior chuta na direção da axila enquanto a perna inferior rasteira a canela dele rente ao tatame, puxando a manga.' },
    { step: 5, title: 'Subida e montada técnica', desc: 'Aproveite a inércia da queda para montar imediatamente mantendo o controle das pegadas.' }
  ]);

  const tut3Keys = JSON.stringify([
    'O pé de baixo deve raspar rente ao chão, como uma tesoura que corta na raiz.',
    'A pegada na manga é o que impede o oponente de apoiar a mão e defender a queda.'
  ]);

  insertTutorial.run(
    'Raspagem Tesourinha (Scissor Sweep)',
    'Raspagens',
    'Iniciante',
    'Gi',
    'https://www.youtube.com/embed/3eC98yLpU1I',
    'https://images.unsplash.com/photo-1564415051543-cb73a7468103?w=600&auto=format&fit=crop&q=80',
    'Uma das raspagens mais antigas e eficazes do Jiu-Jitsu tradicional com kimono. Converte a defesa da guarda fechada em 2 pontos e montada dominante.',
    tut3Steps,
    tut3Keys,
    'Passar por cima da canela esmagando com o joelho ou recuar a perna base.',
    'Lucas "Pitbull" Mendes',
    profId
  );

  const tut4Steps = JSON.stringify([
    { step: 1, title: 'Pegadas nas calças perto dos joelhos', desc: 'Em pé ou semi-flexionado, faça a pegada de concha do lado de fora do joelho das calças do guardeiro.' },
    { step: 2, title: 'Pressão nos pés e projeção lateral', desc: 'Empurre os joelhos dele em direção ao peito dele para dobrar as pernas e lance ambas as pernas dele em um arco rápido para o lado.' },
    { step: 3, title: 'Mudança de nível e cabeça no plexo', desc: 'Jogue seu quadril e peito na direção oposta das pernas jogadas, cravando o joelho no chão e a cabeça no esterno dele.' },
    { step: 4, title: 'Abraço da cabeça e estabilização nos 100kg', desc: 'Passe a mão livre por trás do pescoço, bloqueie o quadril dele com o joelho e conquiste os 3 pontos dos 100kg.' }
  ]);

  const tut4Keys = JSON.stringify([
    'Mantenha os cotovelos colados às suas costelas para não tomar armlock ou triângulo voador.',
    'A velocidade no primeiro passo dita o sucesso da manobra.'
  ]);

  insertTutorial.run(
    'Passagem de Guarda Toureada (Toreando Pass)',
    'Passagens de Guarda',
    'Intermediário',
    'Ambos',
    'https://www.youtube.com/embed/9g_8zL0pQ_s',
    'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&auto=format&fit=crop&q=80',
    'A passagem de guarda mais utilizada em competições mundiais de alto nível. Combina velocidade, desarme de ganchos e imposição de ritmo.',
    tut4Steps,
    tut4Keys,
    'Giro em quatro apoios (Granby roll) ou recolhimento dos joelhos como escudo.',
    'Mestre Carlos Gracie Silva',
    profId
  );

  const tut5Steps = JSON.stringify([
    { step: 1, title: 'Identificação do braço isolado', desc: 'Quando o oponente apoia a mão no tatame ou tenta abraçar sua cintura, laçe o pulso dele por cima com a mão do mesmo lado.' },
    { step: 2, title: 'Passagem em quatro (Figure 4 grip)', desc: 'Passe seu outro braço por baixo da axila dele e feche a pegada com seu polegar escondido no seu próprio punho.' },
    { step: 3, title: 'Abertura de guarda e fuga de quadril', desc: 'Saia o quadril para o lado do braço preso para criar o espaço necessário para a rotação.' },
    { step: 4, title: 'Fixação das costas e torção no ombro', desc: 'Passe a perna por cima das costelas do adversário para prender a postura e gire a mão dele em direção à nuca em ângulo de 90 graus.' }
  ]);

  const tut5Keys = JSON.stringify([
    'Mantenha o braço dele dobrado em 90 graus durante toda a alavanca; se o braço esticar ele escapa.',
    'A força não vem dos braços, vem da rotação do seu próprio tronco e quadril.'
  ]);

  insertTutorial.run(
    'Kimura Clássica da Meia Guarda / Guarda Fechada',
    'Finalizações',
    'Intermediário',
    'Ambos',
    'https://www.youtube.com/embed/9Y9m_Q2JcK8',
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80',
    'Chave de ombro de rotação hiper-eficiente batizada em homenagem ao lendário judoca Masahiko Kimura. Uma das melhores ferramentas de finalização e raspagem.',
    tut5Steps,
    tut5Keys,
    'Travar as mãos na faixa ou coxa interna e rolar de frente para aliviar a rotação.',
    'Lucas "Pitbull" Mendes',
    profId
  );

  const tut6Steps = JSON.stringify([
    { step: 1, title: 'Enquadramento e pegadas', desc: 'Com o adversário em pé, estabeleça pegada no calcanhar ou boca de calça dele e pegada na gola oposta.' },
    { step: 2, title: 'Inserção do gancho De La Riva', desc: 'Passe sua perna de fora por trás do joelho dele, apontando o dedão do pé para a virilha para travar a base.' },
    { step: 3, title: 'Uso do pé no quadril ou bíceps', desc: 'O outro pé controla a distância pressionando a coxa oposta ou o quadril, desequilibrando o passador constantemente.' },
    { step: 4, title: 'Desequilíbrio para trás e raspagem de giro', desc: 'Empurre a gola enquanto puxa o calcanhar, desestabilizando a base para derrubá-lo de costas ou girar para as costas (Berimbolo).' }
  ]);

  const tut6Keys = JSON.stringify([
    'O gancho deve estar ativo o tempo todo, colado na parte interna da coxa.',
    'Nunca solte a pegada do calcanhar, pois ela é a âncora que impede o recuo do oponente.'
  ]);

  insertTutorial.run(
    'Guarda De La Riva: Estrutura Fundamental',
    'Guardas',
    'Intermediário',
    'Gi',
    'https://www.youtube.com/embed/Z0oI04F_Kx8',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    'Criada pelo mestre Ricardo De La Riva, esta guarda revolucionou o Jiu-Jitsu moderno, fornecendo ataques contínuos para as costas e raspagens fluidas.',
    tut6Steps,
    tut6Keys,
    'Estourar o gancho empurrando a canela com a mão livre e passar com esgrima baixa.',
    'Mestre Carlos Gracie Silva',
    profId
  );

  const tut7Steps = JSON.stringify([
    { step: 1, title: 'Enquadramento das molduras (Frames)', desc: 'Não deixe o adversário colar peito com peito. Coloque o antebraço cruzado no pescoço dele e a outra mão no quadril oposto.' },
    { step: 2, title: 'Ponte explosiva (Upa)', desc: 'Traga os calcanhares o mais perto possível das nádegas e dê uma ponte explosiva para cima e na diagonal, abrindo espaço.' },
    { step: 3, title: 'Fuga de quadril (Camarão)', desc: 'No pico da ponte, empurre o oponente com os antebraços e jogue seu quadril para longe dele.' },
    { step: 4, title: 'Inserção do joelho de resgate', desc: 'Insira o joelho de baixo como uma cunha no espaço aberto entre o seu peito e a barriga dele.' },
    { step: 5, title: 'Recuperação total da guarda', desc: 'Gire de frente e feche a guarda fechada ou guarda aberta.' }
  ]);

  const tut7Keys = JSON.stringify([
    'Nunca tente empurrar o oponente com as mãos esticadas ou sofrerá armlock.',
    'A ponte e a fuga de quadril devem ser fluidas e contínuas.'
  ]);

  insertTutorial.run(
    'Saída e Escape do Cem Quilos (100kg)',
    'Defesas e Saídas',
    'Iniciante',
    'Ambos',
    'https://www.youtube.com/embed/5_VnJ4_wRQI',
    'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&auto=format&fit=crop&q=80',
    'A sobrevivência básica sob o controle lateral dos 100kg. Aprenda a criar estruturas rígidas de ossos para recuperar a guarda sem cansar os músculos.',
    tut7Steps,
    tut7Keys,
    'O passador deve afundar o ombro no queixo (crossface) e espalhar o quadril rente ao tatame.',
    'Mestre Carlos Gracie Silva',
    profId
  );

  const tut8Steps = JSON.stringify([
    { step: 1, title: 'Controle de cinto de segurança (Seatbelt grip)', desc: 'Com os ganchos nas costas do oponente, passe um braço por cima do ombro e o outro por baixo da axila, fechando as mãos peito a peito.' },
    { step: 2, title: 'Queda para o lado do braço de estrangulamento', desc: 'Incline o corpo para o lado onde seu braço está por cima do ombro para que o oponente não escape da cabeça.' },
    { step: 3, title: 'Deslizamento do antebraço na carótida', desc: 'A mão dominante desliza sob o queixo como uma faca até o pomo de adão do adversário.' },
    { step: 4, title: 'Mão no bíceps e mão atrás da nuca', desc: 'Feche a mão dominante segurando seu próprio bíceps oposto e esconda a outra mão atrás da cabeça dele.' },
    { step: 5, title: 'Expansão torácica e finalização', desc: 'Mantenha a cabeça colada na dele, expanda o peito e aperte suavemente as axilas.' }
  ]);

  const tut8Keys = JSON.stringify([
    'Nunca cruze os pés na frente do quadril do oponente, para evitar a chave de tornozelo surpresa.',
    'O queixo do adversário não é barreira: o estrangulamento pode passar até quebrando a resistência.'
  ]);

  insertTutorial.run(
    'Mata-Leão (Rear Naked Choke)',
    'Finalizações',
    'Iniciante',
    'Ambos',
    'https://www.youtube.com/embed/wV9bJ5b8f6o',
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80',
    'O golpe definitivo das artes marciais. Quando executado corretamente a partir do domínio das costas, possui taxa de sucesso próxima de 100%.',
    tut8Steps,
    tut8Keys,
    'Defesa dois em um na mão de estrangulamento antes que ela feche a fechadura.',
    'Mestre Carlos Gracie Silva',
    profId
  );

  // Bookmarks for Gabriel
  const insertBookmark = db.prepare(`
    INSERT INTO tutorial_bookmarks (user_id, tutorial_id, status)
    VALUES (?, ?, ?)
  `);
  insertBookmark.run(s1Id, 1, 'favorite');
  insertBookmark.run(s1Id, 1, 'practiced');
  insertBookmark.run(s1Id, 2, 'practiced');
  insertBookmark.run(s1Id, 3, 'to_master');
  insertBookmark.run(s1Id, 7, 'practiced');
}

function seedTournaments() {
  const count = db.prepare('SELECT COUNT(*) as count FROM tournaments').get().count;
  if (count > 0) return;

  const prof = db.prepare("SELECT id FROM users WHERE role = 'professor' LIMIT 1").get();
  const profId = prof ? prof.id : 1;

  // Tournament 1: Grand Prix Absoluto Gi (Misto e Todas as Faixas)
  const t1Result = db.prepare(`
    INSERT INTO tournaments (title, date, location, gi_type, category_type, weight_division, gender, belt_category, status, created_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Grand Prix Absoluto Gi — Copa Arte Suave 2026',
    '2026-10-10',
    'Tatame Central Arte Suave Arena',
    'Gi',
    'Absoluto',
    'Absoluto Aberto (Livre)',
    'Misto',
    'Todas as Faixas (Open Class)',
    'ongoing',
    profId
  );
  const t1Id = t1Result.lastInsertRowid;

  // Insert 8 Athletes
  const insertAth = db.prepare(`
    INSERT INTO tournament_athletes (tournament_id, athlete_name, belt, weight, team, seed)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const a1 = insertAth.run(t1Id, 'Gabriel Rocha', 'Branca', 77.8, 'Arte Suave BJJ', 1).lastInsertRowid;
  const a2 = insertAth.run(t1Id, 'Felipe Lima', 'Branca', 73.0, 'Arte Suave BJJ', 8).lastInsertRowid;
  const a3 = insertAth.run(t1Id, 'Mariana Costa', 'Azul', 61.2, 'Arte Suave BJJ', 4).lastInsertRowid;
  const a4 = insertAth.run(t1Id, 'Camila Santos', 'Azul', 56.0, 'Arte Suave BJJ', 5).lastInsertRowid;
  const a5 = insertAth.run(t1Id, 'Rodrigo "Tanque"', 'Roxa', 91.5, 'Gracie Barra', 2).lastInsertRowid;
  const a6 = insertAth.run(t1Id, 'Bruno "Trator" Alencar', 'Roxa', 98.0, 'Alliance BJJ', 7).lastInsertRowid;
  const a7 = insertAth.run(t1Id, 'Lucas "Pitbull" Mendes', 'Marrom', 84.0, 'Arte Suave BJJ', 3).lastInsertRowid;
  const a8 = insertAth.run(t1Id, 'Leonardo Barbosa', 'Azul', 80.0, 'Checkmat', 6).lastInsertRowid;

  // Create Bracket Matches (Single Elimination: 4 Quarterfinals, 2 Semifinals, 1 Final)
  const insertMatch = db.prepare(`
    INSERT INTO tournament_matches (
      tournament_id, round_name, round_number, match_number,
      athlete1_id, athlete2_id, athlete1_name, athlete2_name, athlete1_belt, athlete2_belt,
      winner_id, winner_name, score1, score2, adv1, adv2, pen1, pen2, win_type, notes,
      next_match_id, next_match_slot, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Final Match (Round 3)
  const finalMatch = insertMatch.run(
    t1Id, 'Grande Final Absoluto', 3, 7,
    a1, a7, 'Gabriel Rocha', 'Lucas "Pitbull" Mendes', 'Branca', 'Marrom',
    null, null, 0, 0, 0, 0, 0, 0, null, 'Disputa pelo Troféu e Cinturão Absoluto',
    null, null, 'pending'
  ).lastInsertRowid;

  // Semifinal 1 (Round 2) -> advances to final slot 1
  const semi1 = insertMatch.run(
    t1Id, 'Semifinal 1', 2, 5,
    a1, a3, 'Gabriel Rocha', 'Mariana Costa', 'Branca', 'Azul',
    a1, 'Gabriel Rocha', 4, 2, 1, 0, 0, 0, 'Pontos (4 x 2)', 'Raspagem nos últimos segundos',
    finalMatch, 1, 'completed'
  ).lastInsertRowid;

  // Semifinal 2 (Round 2) -> advances to final slot 2
  const semi2 = insertMatch.run(
    t1Id, 'Semifinal 2', 2, 6,
    a5, a7, 'Rodrigo "Tanque"', 'Lucas "Pitbull" Mendes', 'Roxa', 'Marrom',
    a7, 'Lucas "Pitbull" Mendes', 0, 2, 0, 1, 0, 0, 'Finalização (Triângulo)', 'Ataque fulminante da guarda fechada',
    finalMatch, 2, 'completed'
  ).lastInsertRowid;

  // Quarterfinals (Round 1)
  insertMatch.run(
    t1Id, 'Quartas de Final 1', 1, 1,
    a1, a2, 'Gabriel Rocha', 'Felipe Lima', 'Branca', 'Branca',
    a1, 'Gabriel Rocha', 4, 0, 2, 0, 0, 0, 'Finalização (Armlock)', 'Armlock clássico no minuto 3:20',
    semi1, 1, 'completed'
  );

  insertMatch.run(
    t1Id, 'Quartas de Final 2', 1, 2,
    a3, a4, 'Mariana Costa', 'Camila Santos', 'Azul', 'Azul',
    a3, 'Mariana Costa', 2, 2, 2, 1, 0, 0, 'Vantagens (2 x 1)', 'Luta muito técnica e parelha',
    semi1, 2, 'completed'
  );

  insertMatch.run(
    t1Id, 'Quartas de Final 3', 1, 3,
    a5, a6, 'Rodrigo "Tanque"', 'Bruno "Trator" Alencar', 'Roxa', 'Roxa',
    a5, 'Rodrigo "Tanque"', 6, 2, 1, 0, 0, 0, 'Pontos (6 x 2)', 'Duas quedas potentes',
    semi2, 1, 'completed'
  );

  insertMatch.run(
    t1Id, 'Quartas de Final 4', 1, 4,
    a7, a8, 'Lucas "Pitbull" Mendes', 'Leonardo Barbosa', 'Marrom', 'Azul',
    a7, 'Lucas "Pitbull" Mendes', 7, 0, 0, 0, 0, 0, 'Finalização (Kimura)', 'Kimura da meia guarda',
    semi2, 2, 'completed'
  );

  // Tournament 2: No-Gi Submission Only Absoluto
  const t2Result = db.prepare(`
    INSERT INTO tournaments (title, date, location, gi_type, category_type, weight_division, gender, belt_category, status, created_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'No-Gi Submission Challenge 2026 — Absoluto Marrom & Preta',
    '2026-10-18',
    'Tatame 2 - Cage & Mat',
    'No-Gi',
    'Absoluto',
    'Absoluto Sem Kimono',
    'Masculino',
    'Faixa Marrom & Preta',
    'draft',
    profId
  );
  const t2Id = t2Result.lastInsertRowid;

  const b1 = insertAth.run(t2Id, 'Lucas "Pitbull" Mendes', 'Marrom', 84.0, 'Arte Suave BJJ', 1).lastInsertRowid;
  const b2 = insertAth.run(t2Id, 'Mestre Carlos Gracie', 'Preta', 82.0, 'Arte Suave BJJ', 2).lastInsertRowid;
  const b3 = insertAth.run(t2Id, 'Thiago "Monstro" Silva', 'Preta', 94.0, 'Fight Zone', 3).lastInsertRowid;
  const b4 = insertAth.run(t2Id, 'Renato "Alemão" Krause', 'Marrom', 77.0, 'Nova União', 4).lastInsertRowid;

  // Bracket for Tournament 2: 4 athletes (Semifinals and Final)
  const finalT2 = insertMatch.run(
    t2Id, 'Final No-Gi Absoluto', 2, 3,
    null, null, 'Vencedor Semi 1', 'Vencedor Semi 2', 'Preta', 'Marrom',
    null, null, 0, 0, 0, 0, 0, 0, null, 'Disputa de Cinturão No-Gi',
    null, null, 'pending'
  ).lastInsertRowid;

  insertMatch.run(
    t2Id, 'Semifinal 1 No-Gi', 1, 1,
    b1, b4, 'Lucas "Pitbull" Mendes', 'Renato "Alemão" Krause', 'Marrom', 'Marrom',
    null, null, 0, 0, 0, 0, 0, 0, null, 'Regra IBJJF No-Gi com Heel Hook liberado',
    finalT2, 1, 'pending'
  );

  insertMatch.run(
    t2Id, 'Semifinal 2 No-Gi', 1, 2,
    b2, b3, 'Mestre Carlos Gracie', 'Thiago "Monstro" Silva', 'Preta', 'Preta',
    null, null, 0, 0, 0, 0, 0, 0, null, 'Regra IBJJF No-Gi com Heel Hook liberado',
    finalT2, 2, 'pending'
  );
}

module.exports = {
  db,
  initDatabase,
  seedTournaments,
};

