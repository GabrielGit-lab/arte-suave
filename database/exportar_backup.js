const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'artesuave.db');
const backupDir = path.join(__dirname, 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

console.log('📦 Iniciando exportação de backup do banco de dados...\n');

const tables = ['users', 'classes', 'attendances', 'graduations', 'physical_records', 'tutorials', 'tutorial_bookmarks'];
const fullBackup = {};

tables.forEach(table => {
  const data = db.prepare(`SELECT * FROM ${table}`).all();
  fullBackup[table] = data;

  const tableFilePath = path.join(backupDir, `${table}_${timestamp}.json`);
  fs.writeFileSync(tableFilePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Tabela [${table}]: ${data.length} registros salvos em ${path.basename(tableFilePath)}`);
});

const fullBackupPath = path.join(backupDir, `backup_completo_${timestamp}.json`);
fs.writeFileSync(fullBackupPath, JSON.stringify(fullBackup, null, 2), 'utf-8');

console.log(`\n🎉 Backup completo gerado com sucesso!`);
console.log(`📁 Arquivo consolidado: ${fullBackupPath}`);
