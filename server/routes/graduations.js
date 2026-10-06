const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireProfessor } = require('../middleware/auth');

// Belts order
const BELT_ORDER = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta', 'Coral', 'Vermelha'];

// GET /api/graduations/overview - Overview of all students, belts, degrees, and eligibility
router.get('/overview', authenticateToken, (req, res) => {
  const students = db.prepare(`
    SELECT 
      u.id, u.name, u.email, u.belt, u.degrees, u.avatar, u.academy_join_date,
      (SELECT COUNT(*) FROM attendances a WHERE a.student_id = u.id AND a.status = 'present') as total_attendances,
      (SELECT MAX(awarded_date) FROM graduations g WHERE g.student_id = u.id) as last_promotion_date
    FROM users u
    WHERE u.role = 'student'
    ORDER BY u.belt DESC, u.degrees DESC, u.name ASC
  `).all();

  const enriched = students.map(s => {
    let requiredPerDegree = 30; // default white belt
    let maxDegrees = 4;
    if (s.belt === 'Azul') requiredPerDegree = 60;
    if (s.belt === 'Roxa') requiredPerDegree = 80;
    if (s.belt === 'Marrom') requiredPerDegree = 100;
    if (s.belt === 'Preta') {
      requiredPerDegree = 150;
      maxDegrees = 6;
    }

    const currentDeg = s.degrees || 0;
    const targetAttendancesForNextDegree = (currentDeg + 1) * requiredPerDegree;
    const isReadyForNext = s.total_attendances >= targetAttendancesForNextDegree;

    // Progress percentage towards next degree/belt
    const previousTarget = currentDeg * requiredPerDegree;
    const attendancesInCurrentDegree = Math.max(0, s.total_attendances - previousTarget);
    const progressPercent = Math.min(100, Math.round((attendancesInCurrentDegree / requiredPerDegree) * 100));

    return {
      ...s,
      max_degrees: maxDegrees,
      required_per_degree: requiredPerDegree,
      target_attendances: targetAttendancesForNextDegree,
      is_ready: isReadyForNext,
      progress_percent: progressPercent,
      is_max_degree: currentDeg >= maxDegrees
    };
  });

  res.json(enriched);
});

// GET /api/graduations/student/:id - Student's graduation timeline
router.get('/student/:id', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  const graduations = db.prepare(`
    SELECT g.*, prof.name as awarded_by_name
    FROM graduations g
    LEFT JOIN users prof ON g.awarded_by_id = prof.id
    WHERE g.student_id = ?
    ORDER BY g.awarded_date DESC, g.id DESC
  `).all(studentId);

  res.json(graduations);
});

// POST /api/graduations/promote - Professor awards a degree or new belt
router.post('/promote', authenticateToken, requireProfessor, (req, res) => {
  const { student_id, belt, degrees, notes, awarded_date } = req.body;

  if (!student_id || !belt || degrees === undefined) {
    return res.status(400).json({ error: 'student_id, belt e degrees são obrigatórios' });
  }

  const student = db.prepare('SELECT id, name, belt, degrees FROM users WHERE id = ?').get(student_id);
  if (!student) {
    return res.status(404).json({ error: 'Aluno não encontrado' });
  }

  const dateToUse = awarded_date || new Date().toISOString().split('T')[0];

  // Update student table
  db.prepare(`
    UPDATE users
    SET belt = ?, degrees = ?
    WHERE id = ?
  `).run(belt, parseInt(degrees, 10), student_id);

  // Insert graduation record
  const result = db.prepare(`
    INSERT INTO graduations (student_id, belt, degrees, awarded_by_id, awarded_date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(student_id, belt, parseInt(degrees, 10), req.user.id, dateToUse, notes || `Graduação conferida por ${req.user.name}`);

  res.status(201).json({
    success: true,
    message: `${student.name} promovido para ${belt} (${degrees}º Grau) com sucesso!`,
    graduation_id: result.lastInsertRowid,
    new_belt: belt,
    new_degrees: parseInt(degrees, 10),
  });
});

module.exports = router;
