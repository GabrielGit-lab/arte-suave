const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireProfessor } = require('../middleware/auth');

// GET /api/attendance/class/:classId - Get attendance sheet for a class
// Returns all students and their attendance status for this specific class
router.get('/class/:classId', authenticateToken, (req, res) => {
  const classId = parseInt(req.params.classId, 10);

  const classData = db.prepare(`
    SELECT c.*, u.name as instructor_name
    FROM classes c
    LEFT JOIN users u ON c.instructor_id = u.id
    WHERE c.id = ?
  `).get(classId);

  if (!classData) {
    return res.status(404).json({ error: 'Aula não encontrada' });
  }

  // Fetch all registered students
  const students = db.prepare(`
    SELECT 
      u.id as student_id,
      u.name,
      u.belt,
      u.degrees,
      u.avatar,
      a.id as attendance_id,
      COALESCE(a.status, 'absent') as status,
      a.signed_at,
      a.notes,
      prof.name as signed_by_name
    FROM users u
    LEFT JOIN attendances a ON a.student_id = u.id AND a.class_id = ?
    LEFT JOIN users prof ON a.signed_by_instructor_id = prof.id
    WHERE u.role = 'student'
    ORDER BY u.name ASC
  `).all(classId);

  res.json({
    class: classData,
    students,
  });
});

// POST /api/attendance/sign - Professor toggles/signs attendance for one student
router.post('/sign', authenticateToken, requireProfessor, (req, res) => {
  const { class_id, student_id, status, notes } = req.body;

  if (!class_id || !student_id) {
    return res.status(400).json({ error: 'class_id e student_id são obrigatórios' });
  }

  const existing = db.prepare('SELECT id FROM attendances WHERE class_id = ? AND student_id = ?').get(class_id, student_id);

  if (existing) {
    if (status === 'absent' || status === null) {
      // Remove or mark absent
      db.prepare('DELETE FROM attendances WHERE id = ?').run(existing.id);
      return res.json({ success: true, status: 'absent', message: 'Presença desmarcada' });
    } else {
      db.prepare(`
        UPDATE attendances 
        SET status = ?, signed_by_instructor_id = ?, signed_at = datetime('now'), notes = ?
        WHERE id = ?
      `).run(status || 'present', req.user.id, notes || '', existing.id);
      return res.json({ success: true, status: status || 'present', message: 'Presença atualizada' });
    }
  } else {
    if (status !== 'absent') {
      db.prepare(`
        INSERT INTO attendances (class_id, student_id, signed_by_instructor_id, status, notes)
        VALUES (?, ?, ?, ?, ?)
      `).run(class_id, student_id, req.user.id, status || 'present', notes || '');
      return res.json({ success: true, status: status || 'present', message: 'Presença confirmada' });
    }
    return res.json({ success: true, status: 'absent' });
  }
});

// POST /api/attendance/batch - Sign or unsign multiple students in one batch
router.post('/batch', authenticateToken, requireProfessor, (req, res) => {
  const { class_id, present_student_ids = [] } = req.body;

  if (!class_id) {
    return res.status(400).json({ error: 'class_id é obrigatório' });
  }

  // Delete all existing attendance for this class
  db.prepare('DELETE FROM attendances WHERE class_id = ?').run(class_id);

  // Insert all checked students
  const insert = db.prepare(`
    INSERT INTO attendances (class_id, student_id, signed_by_instructor_id, status, notes)
    VALUES (?, ?, ?, 'present', 'Chamada assinada pelo professor')
  `);

  present_student_ids.forEach(studentId => {
    insert.run(class_id, studentId, req.user.id);
  });

  res.json({
    success: true,
    message: `Chamada realizada com sucesso! ${present_student_ids.length} aluno(s) presente(s).`,
    count: present_student_ids.length
  });
});

// GET /api/attendance/my-history - Current student's attendance history
router.get('/my-history', authenticateToken, (req, res) => {
  const attendances = db.prepare(`
    SELECT a.id, a.signed_at, a.status, a.notes, c.title, c.date, c.time, c.class_type, prof.name as instructor_name
    FROM attendances a
    JOIN classes c ON a.class_id = c.id
    LEFT JOIN users prof ON a.signed_by_instructor_id = prof.id
    WHERE a.student_id = ? AND a.status = 'present'
    ORDER BY c.date DESC, c.time DESC
  `).all(req.user.id);

  res.json(attendances);
});

module.exports = router;
