const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'artesuave.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Arquivo do banco de dados não encontrado em:', dbPath);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

console.log('========================================================');
console.log('🥋 GERENCIADOR DO BANCO DE DADOS — ARTE SUAVE BJJ');
console.log('========================================================');
console.log('📁 Localização do Arquivo:', dbPath);
console.log(`📦 Tamanho do Arquivo: ${(fs.statSync(dbPath).size / 1024).toFixed(2)} KB\n`);

// 1. List Tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();

console.log('📋 TABELAS EXISTENTES NO BANCO:');
tables.forEach((t, i) => {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get().count;
  console.log(`  [${i + 1}] ${t.name.padEnd(20)} -> ${count} registro(s)`);
});

console.log('\n--------------------------------------------------------');
console.log('📊 RESUMO DETALHADO DOS DADOS:');
console.log('--------------------------------------------------------');

// Users
console.log('\n👤 USUÁRIOS & ATLETAS (users):');
const users = db.prepare('SELECT id, name, email, role, belt, degrees FROM users').all();
console.table(users);

// Classes
console.log('\n🥋 AULAS REGISTRADAS (classes):');
const classes = db.prepare('SELECT id, title, date, time, class_type FROM classes LIMIT 6').all();
console.table(classes);

// Physical Records
console.log('\n⚖️ PESAGENS RECENTES (physical_records):');
const phys = db.prepare(`
  SELECT p.id, u.name as atleta, p.weight || ' kg' as peso, p.height || ' cm' as altura, p.recorded_at as data
  FROM physical_records p
  JOIN users u ON p.student_id = u.id
  ORDER BY p.id DESC LIMIT 6
`).all();
console.table(phys);

// Graduations
console.log('\n🎓 ÚLTIMAS GRADUAÇÕES (graduations):');
const grads = db.prepare(`
  SELECT g.id, u.name as atleta, g.belt as faixa, g.degrees || 'º' as graus, g.awarded_date as data, g.notes as observacao
  FROM graduations g
  JOIN users u ON g.student_id = u.id
  ORDER BY g.id DESC LIMIT 6
`).all();
console.table(grads);

// Tutorials
console.log('\n📚 TUTORIAIS DE TÉCNICAS (tutorials):');
const tuts = db.prepare('SELECT id, title, category, difficulty, gi_type FROM tutorials LIMIT 6').all();
console.table(tuts);

console.log('========================================================');
console.log('💡 DICA DE ACESSO VISUAL:');
console.log('Você pode abrir este arquivo "artesuave.db" com:');
console.log('1. DB Browser for SQLite (https://sqlitebrowser.org)');
console.log('2. DBeaver ou TablePlus');
console.log('3. Extensão "SQLite Viewer" no VS Code');
console.log('========================================================\n');
