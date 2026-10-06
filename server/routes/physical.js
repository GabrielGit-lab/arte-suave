const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Helper to calculate IBJJF Weight Category (Male Adult Gi)
function getIBJJFCategory(weightKg, gender = 'M') {
  if (!weightKg) return 'Não informado';
  const w = parseFloat(weightKg);

  if (gender === 'F') {
    if (w <= 48.5) return 'Galo (até 48.5kg)';
    if (w <= 53.5) return 'Pluma (até 53.5kg)';
    if (w <= 58.5) return 'Pena (até 58.5kg)';
    if (w <= 64.0) return 'Leve (até 64.0kg)';
    if (w <= 69.0) return 'Médio (até 69.0kg)';
    if (w <= 74.0) return 'Meio-Pesado (até 74.0kg)';
    if (w <= 79.3) return 'Pesado (até 79.3kg)';
    return 'Super Pesado (+79.3kg)';
  } else {
    if (w <= 57.5) return 'Galo (até 57.5kg)';
    if (w <= 64.0) return 'Pluma (até 64.0kg)';
    if (w <= 70.0) return 'Pena (até 70.0kg)';
    if (w <= 76.0) return 'Leve (até 76.0kg)';
    if (w <= 82.3) return 'Médio (até 82.3kg)';
    if (w <= 88.3) return 'Meio-Pesado (até 88.3kg)';
    if (w <= 94.3) return 'Pesado (até 94.3kg)';
    if (w <= 100.5) return 'Super Pesado (até 100.5kg)';
    return 'Pesadíssimo (+100.5kg)';
  }
}

// Calculate BMI and status
function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = +(weightKg / (heightM * heightM)).toFixed(1);
  let status = 'Normal';
  if (bmi < 18.5) status = 'Abaixo do peso';
  else if (bmi < 24.9) status = 'Peso saudável';
  else if (bmi < 29.9) status = 'Sobrepeso';
  else status = 'Obesidade';
  return { bmi, status };
}

// GET /api/physical/student/:id - Physical records for a student
router.get('/student/:id', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.id, 10);

  if (req.user.role !== 'professor' && req.user.id !== studentId) {
    return res.status(403).json({ error: 'Permissão negada' });
  }

  const records = db.prepare(`
    SELECT * FROM physical_records
    WHERE student_id = ?
    ORDER BY recorded_at ASC, id ASC
  `).all(studentId);

  const enriched = records.map(r => ({
    ...r,
    category_ibjjf: getIBJJFCategory(r.weight),
    bmi_info: calculateBMI(r.weight, r.height)
  }));

  const latest = enriched.length > 0 ? enriched[enriched.length - 1] : null;

  res.json({
    latest,
    history: enriched
  });
});

// POST /api/physical - Create new physical record
router.post('/', authenticateToken, (req, res) => {
  const { student_id, weight, height, wingspan, body_fat, notes, recorded_at } = req.body;

  const targetStudentId = req.user.role === 'professor' ? (student_id || req.user.id) : req.user.id;

  if (!weight) {
    return res.status(400).json({ error: 'O peso é obrigatório' });
  }

  const dateToUse = recorded_at || new Date().toISOString().split('T')[0];

  const result = db.prepare(`
    INSERT INTO physical_records (student_id, weight, height, wingspan, body_fat, notes, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    targetStudentId,
    parseFloat(weight),
    height ? parseFloat(height) : null,
    wingspan ? parseFloat(wingspan) : null,
    body_fat ? parseFloat(body_fat) : null,
    notes || '',
    dateToUse
  );

  const inserted = db.prepare('SELECT * FROM physical_records WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    ...inserted,
    category_ibjjf: getIBJJFCategory(inserted.weight),
    bmi_info: calculateBMI(inserted.weight, inserted.height)
  });
});

// DELETE /api/physical/:id - Delete a record
router.delete('/:id', authenticateToken, (req, res) => {
  const recordId = parseInt(req.params.id, 10);
  const record = db.prepare('SELECT * FROM physical_records WHERE id = ?').get(recordId);

  if (!record) {
    return res.status(404).json({ error: 'Registro não encontrado' });
  }

  if (req.user.role !== 'professor' && req.user.id !== record.student_id) {
    return res.status(403).json({ error: 'Permissão negada' });
  }

  db.prepare('DELETE FROM physical_records WHERE id = ?').run(recordId);
  res.json({ success: true, message: 'Registro de peso excluído com sucesso' });
});

module.exports = router;
