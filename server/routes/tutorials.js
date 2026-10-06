const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireProfessor } = require('../middleware/auth');

// GET /api/tutorials - List tutorials with filters and user bookmarks
router.get('/', authenticateToken, (req, res) => {
  const { category, difficulty, gi_type, search, bookmark } = req.query;

  let query = `
    SELECT 
      t.*,
      (SELECT status FROM tutorial_bookmarks b WHERE b.tutorial_id = t.id AND b.user_id = ? AND b.status = 'favorite') as is_favorite,
      (SELECT status FROM tutorial_bookmarks b WHERE b.tutorial_id = t.id AND b.user_id = ? AND b.status = 'practiced') as is_practiced,
      (SELECT status FROM tutorial_bookmarks b WHERE b.tutorial_id = t.id AND b.user_id = ? AND b.status = 'to_master') as is_to_master
    FROM tutorials t
    WHERE 1=1
  `;
  const params = [req.user.id, req.user.id, req.user.id];

  if (category && category !== 'Todas') {
    query += ` AND t.category = ?`;
    params.push(category);
  }

  if (difficulty && difficulty !== 'Todos') {
    query += ` AND t.difficulty = ?`;
    params.push(difficulty);
  }

  if (gi_type && gi_type !== 'Todos') {
    query += ` AND (t.gi_type = ? OR t.gi_type = 'Ambos')`;
    params.push(gi_type);
  }

  if (search) {
    query += ` AND (t.title LIKE ? OR t.description LIKE ? OR t.category LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY t.id DESC`;

  let tutorials = db.prepare(query).all(...params);

  // If filtering by bookmark (e.g. 'favorite', 'practiced')
  if (bookmark === 'favorite') {
    tutorials = tutorials.filter(t => t.is_favorite);
  } else if (bookmark === 'practiced') {
    tutorials = tutorials.filter(t => t.is_practiced);
  } else if (bookmark === 'to_master') {
    tutorials = tutorials.filter(t => t.is_to_master);
  }

  const parsed = tutorials.map(t => {
    let steps = [];
    let keyPoints = [];
    try {
      steps = t.steps ? JSON.parse(t.steps) : [];
    } catch (e) {
      steps = [];
    }
    try {
      keyPoints = t.key_points ? JSON.parse(t.key_points) : [];
    } catch (e) {
      keyPoints = [];
    }
    return {
      ...t,
      steps,
      key_points: keyPoints,
      is_favorite: !!t.is_favorite,
      is_practiced: !!t.is_practiced,
      is_to_master: !!t.is_to_master,
    };
  });

  res.json(parsed);
});

// GET /api/tutorials/:id - Tutorial details
router.get('/:id', authenticateToken, (req, res) => {
  const tutId = parseInt(req.params.id, 10);
  const t = db.prepare(`
    SELECT 
      t.*,
      (SELECT status FROM tutorial_bookmarks b WHERE b.tutorial_id = t.id AND b.user_id = ? AND b.status = 'favorite') as is_favorite,
      (SELECT status FROM tutorial_bookmarks b WHERE b.tutorial_id = t.id AND b.user_id = ? AND b.status = 'practiced') as is_practiced,
      (SELECT status FROM tutorial_bookmarks b WHERE b.tutorial_id = t.id AND b.user_id = ? AND b.status = 'to_master') as is_to_master
    FROM tutorials t
    WHERE t.id = ?
  `).get(req.user.id, req.user.id, req.user.id, tutId);

  if (!t) {
    return res.status(404).json({ error: 'Tutorial não encontrado' });
  }

  let steps = [];
  let keyPoints = [];
  try {
    steps = t.steps ? JSON.parse(t.steps) : [];
  } catch (e) {
    steps = [];
  }
  try {
    keyPoints = t.key_points ? JSON.parse(t.key_points) : [];
  } catch (e) {
    keyPoints = [];
  }

  res.json({
    ...t,
    steps,
    key_points: keyPoints,
    is_favorite: !!t.is_favorite,
    is_practiced: !!t.is_practiced,
    is_to_master: !!t.is_to_master,
  });
});

// POST /api/tutorials - Professor creates new tutorial
router.post('/', authenticateToken, requireProfessor, (req, res) => {
  const {
    title,
    category,
    difficulty,
    gi_type = 'Ambos',
    video_url,
    image_url,
    description,
    steps = [],
    key_points = [],
    counter_attacks = '',
    instructor_name
  } = req.body;

  if (!title || !category || !difficulty) {
    return res.status(400).json({ error: 'Título, categoria e dificuldade são obrigatórios' });
  }

  const stepsJson = typeof steps === 'string' ? steps : JSON.stringify(steps);
  const keysJson = typeof key_points === 'string' ? key_points : JSON.stringify(key_points);

  const result = db.prepare(`
    INSERT INTO tutorials (title, category, difficulty, gi_type, video_url, image_url, description, steps, key_points, counter_attacks, instructor_name, created_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    category,
    difficulty,
    gi_type,
    video_url || '',
    image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    description || '',
    stepsJson,
    keysJson,
    counter_attacks || '',
    instructor_name || req.user.name,
    req.user.id
  );

  const newTut = db.prepare('SELECT * FROM tutorials WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTut);
});

// PUT /api/tutorials/:id - Professor edits tutorial
router.put('/:id', authenticateToken, requireProfessor, (req, res) => {
  const tutId = parseInt(req.params.id, 10);
  const {
    title,
    category,
    difficulty,
    gi_type,
    video_url,
    image_url,
    description,
    steps,
    key_points,
    counter_attacks,
    instructor_name
  } = req.body;

  const stepsJson = steps ? (typeof steps === 'string' ? steps : JSON.stringify(steps)) : null;
  const keysJson = key_points ? (typeof key_points === 'string' ? key_points : JSON.stringify(key_points)) : null;

  db.prepare(`
    UPDATE tutorials
    SET title = COALESCE(?, title),
        category = COALESCE(?, category),
        difficulty = COALESCE(?, difficulty),
        gi_type = COALESCE(?, gi_type),
        video_url = COALESCE(?, video_url),
        image_url = COALESCE(?, image_url),
        description = COALESCE(?, description),
        steps = COALESCE(?, steps),
        key_points = COALESCE(?, key_points),
        counter_attacks = COALESCE(?, counter_attacks),
        instructor_name = COALESCE(?, instructor_name)
    WHERE id = ?
  `).run(
    title,
    category,
    difficulty,
    gi_type,
    video_url,
    image_url,
    description,
    stepsJson,
    keysJson,
    counter_attacks,
    instructor_name,
    tutId
  );

  const updated = db.prepare('SELECT * FROM tutorials WHERE id = ?').get(tutId);
  res.json(updated);
});

// DELETE /api/tutorials/:id - Professor deletes tutorial
router.delete('/:id', authenticateToken, requireProfessor, (req, res) => {
  const tutId = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM tutorials WHERE id = ?').run(tutId);
  res.json({ success: true, message: 'Tutorial excluído com sucesso' });
});

// POST /api/tutorials/:id/bookmark - Toggle bookmark status (favorite, practiced, to_master)
router.post('/:id/bookmark', authenticateToken, (req, res) => {
  const tutId = parseInt(req.params.id, 10);
  const { status } = req.body; // 'favorite', 'practiced', 'to_master'

  if (!['favorite', 'practiced', 'to_master'].includes(status)) {
    return res.status(400).json({ error: 'Status de bookmark inválido' });
  }

  const existing = db.prepare('SELECT id FROM tutorial_bookmarks WHERE user_id = ? AND tutorial_id = ? AND status = ?').get(req.user.id, tutId, status);

  if (existing) {
    db.prepare('DELETE FROM tutorial_bookmarks WHERE id = ?').run(existing.id);
    return res.json({ active: false, status, message: 'Removido com sucesso' });
  } else {
    db.prepare(`
      INSERT INTO tutorial_bookmarks (user_id, tutorial_id, status)
      VALUES (?, ?, ?)
    `).run(req.user.id, tutId, status);
    return res.json({ active: true, status, message: 'Adicionado com sucesso' });
  }
});

module.exports = router;
