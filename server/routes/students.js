const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireProfessor } = require('../middleware/auth');

// GET /api/students - List all students (Professors can see all, students can see basic list or teammates)
router.get('/', authenticateToken, (req, res) => {
  const { search, belt } = req.query;

  let query = `
    SELECT 
      u.id, u.name, u.email, u.phone, u.birthdate, u.belt, u.degrees, u.academy_join_date, u.avatar, u.emergency_contact,
      (SELECT COUNT(*) FROM attendances a WHERE a.student_id = u.id AND a.status = 'present') as total_attendances,
      (SELECT p.weight FROM physical_records p WHERE p.student_id = u.id ORDER BY p.recorded_at DESC, p.id DESC LIMIT 1) as current_weight,
      (SELECT p.height FROM physical_records p WHERE p.student_id = u.id ORDER BY p.recorded_at DESC, p.id DESC LIMIT 1) as current_height,
      (SELECT MAX(g.awarded_date) FROM graduations g WHERE g.student_id = u.id) as last_graduation_date
    FROM users u
    WHERE u.role = 'student'
  `;
  const params = [];

  if (search) {
    query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (belt) {
    query += ` AND u.belt = ?`;
    params.push(belt);
  }

  query += ` ORDER BY u.belt DESC, u.degrees DESC, u.name ASC`;

  const students = db.prepare(query).all(...params);

  // Compute graduation eligibility score
  const enriched = students.map(s => {
    // CBJJ approx requirements per belt:
    // Branca -> 30-40 treinos por grau (total ~120-150 para Azul)
    // Azul -> min 2 anos (ou ~100 treinos por grau)
    let requiredForNext = 35;
    if (s.belt === 'Azul') requiredForNext = 60;
    if (s.belt === 'Roxa') requiredForNext = 80;
    if (s.belt === 'Marrom') requiredForNext = 100;

    const attendancesInCurrentBelt = s.total_attendances || 0;
    const isEligible = attendancesInCurrentBelt >= (s.degrees + 1) * requiredForNext;

    return {
      ...s,
      is_eligible_for_promotion: isEligible,
      next_goal_attendances: (s.degrees + 1) * requiredForNext,
    };
  });

  res.json(enriched);
});

// GET /api/students/:id - Detailed student profile
router.get('/:id', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.id, 10);

  // Only professor or the student themselves can see full private details
  if (req.user.role !== 'professor' && req.user.id !== studentId) {
    return res.status(403).json({ error: 'Acesso não autorizado a este perfil' });
  }

  const student = db.prepare(`
    SELECT id, name, email, role, phone, birthdate, belt, degrees, academy_join_date, avatar, emergency_contact, created_at
    FROM users WHERE id = ?
  `).get(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Aluno não encontrado' });
  }

  // Physical history
  const physicalHistory = db.prepare(`
    SELECT id, weight, height, wingspan, body_fat, notes, recorded_at
    FROM physical_records
    WHERE student_id = ?
    ORDER BY recorded_at ASC, id ASC
  `).all(studentId);

  // Graduation history
  const graduationHistory = db.prepare(`
    SELECT g.id, g.belt, g.degrees, g.awarded_date, g.notes, u.name as awarded_by_name
    FROM graduations g
    LEFT JOIN users u ON g.awarded_by_id = u.id
    WHERE g.student_id = ?
    ORDER BY g.awarded_date ASC, g.id ASC
  `).all(studentId);

  // Recent attendances (last 20)
  const recentAttendances = db.prepare(`
    SELECT a.id, a.signed_at, a.status, a.notes, c.title as class_title, c.date as class_date, c.time as class_time, c.class_type,
           inst.name as instructor_name
    FROM attendances a
    JOIN classes c ON a.class_id = c.id
    LEFT JOIN users inst ON a.signed_by_instructor_id = inst.id
    WHERE a.student_id = ?
    ORDER BY c.date DESC, c.time DESC
    LIMIT 20
  `).all(studentId);

  const totalAttendances = db.prepare(`
    SELECT COUNT(*) as count FROM attendances WHERE student_id = ? AND status = 'present'
  `).get(studentId).count;

  res.json({
    ...student,
    physical_history: physicalHistory,
    graduation_history: graduationHistory,
    recent_attendances: recentAttendances,
    total_attendances: totalAttendances
  });
});

// PUT /api/students/:id - Update student info
router.put('/:id', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.id, 10);

  if (req.user.role !== 'professor' && req.user.id !== studentId) {
    return res.status(403).json({ error: 'Permissão negada' });
  }

  const { name, phone, birthdate, avatar, emergency_contact, belt, degrees } = req.body;

  // Only professors can alter belt and degrees directly here (or through graduations route)
  const isProf = req.user.role === 'professor';

  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(studentId);
  if (!current) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const newBelt = (isProf && belt !== undefined) ? belt : current.belt;
  const newDegrees = (isProf && degrees !== undefined) ? parseInt(degrees, 10) : current.degrees;

  db.prepare(`
    UPDATE users
    SET name = ?, phone = ?, birthdate = ?, avatar = ?, emergency_contact = ?, belt = ?, degrees = ?
    WHERE id = ?
  `).run(
    name || current.name,
    phone !== undefined ? phone : current.phone,
    birthdate !== undefined ? birthdate : current.birthdate,
    avatar !== undefined ? avatar : current.avatar,
    emergency_contact !== undefined ? emergency_contact : current.emergency_contact,
    newBelt,
    newDegrees,
    studentId
  );

  const updated = db.prepare('SELECT id, name, email, role, phone, birthdate, belt, degrees, avatar, emergency_contact FROM users WHERE id = ?').get(studentId);
  res.json(updated);
});

// DELETE /api/students/:id - Delete student (Professor only)
router.delete('/:id', authenticateToken, requireProfessor, (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  db.prepare("DELETE FROM users WHERE id = ? AND role = 'student'").run(studentId);
  res.json({ success: true, message: 'Aluno removido com sucesso' });
});

module.exports = router;
