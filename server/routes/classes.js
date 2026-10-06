const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireProfessor } = require('../middleware/auth');

// GET /api/classes - List classes
router.get('/', authenticateToken, (req, res) => {
  const { date, startDate, endDate, limit = 50 } = req.query;

  let query = `
    SELECT 
      c.id, c.title, c.date, c.time, c.class_type, c.notes, c.created_at,
      u.name as instructor_name,
      (SELECT COUNT(*) FROM attendances a WHERE a.class_id = c.id AND a.status = 'present') as present_count
    FROM classes c
    LEFT JOIN users u ON c.instructor_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (date) {
    query += ` AND c.date = ?`;
    params.push(date);
  } else if (startDate && endDate) {
    query += ` AND c.date BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  query += ` ORDER BY c.date DESC, c.time DESC LIMIT ?`;
  params.push(parseInt(limit, 10));

  const classes = db.prepare(query).all(...params);
  res.json(classes);
});

// GET /api/classes/:id - Single class details
router.get('/:id', authenticateToken, (req, res) => {
  const classId = parseInt(req.params.id, 10);
  const classItem = db.prepare(`
    SELECT c.*, u.name as instructor_name
    FROM classes c
    LEFT JOIN users u ON c.instructor_id = u.id
    WHERE c.id = ?
  `).get(classId);

  if (!classItem) {
    return res.status(404).json({ error: 'Aula não encontrada' });
  }

  res.json(classItem);
});

// POST /api/classes - Create new class (Professor only)
router.post('/', authenticateToken, requireProfessor, (req, res) => {
  const { title, date, time, class_type, notes } = req.body;

  if (!title || !date || !time || !class_type) {
    return res.status(400).json({ error: 'Título, data, horário e tipo de aula são obrigatórios' });
  }

  const result = db.prepare(`
    INSERT INTO classes (title, date, time, class_type, instructor_id, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, date, time, class_type, req.user.id, notes || '');

  const newClass = db.prepare(`
    SELECT c.*, u.name as instructor_name, 0 as present_count
    FROM classes c
    LEFT JOIN users u ON c.instructor_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(newClass);
});

// PUT /api/classes/:id - Update class (Professor only)
router.put('/:id', authenticateToken, requireProfessor, (req, res) => {
  const classId = parseInt(req.params.id, 10);
  const { title, date, time, class_type, notes } = req.body;

  db.prepare(`
    UPDATE classes
    SET title = COALESCE(?, title),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        class_type = COALESCE(?, class_type),
        notes = COALESCE(?, notes)
    WHERE id = ?
  `).run(title, date, time, class_type, notes, classId);

  const updated = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
  res.json(updated);
});

// DELETE /api/classes/:id - Delete class (Professor only)
router.delete('/:id', authenticateToken, requireProfessor, (req, res) => {
  const classId = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM classes WHERE id = ?').run(classId);
  res.json({ success: true, message: 'Aula excluída com sucesso' });
});

module.exports = router;
