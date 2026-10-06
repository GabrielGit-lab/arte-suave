const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { rateLimitLogin } = require('../middleware/rateLimiter');

// POST /api/auth/login
router.post('/login', rateLimitLogin, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password_hash, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const {
    name,
    email,
    password,
    role = 'student',
    belt = 'Branca',
    degrees = 0,
    phone = '',
    birthdate = '',
    weight = null,
    height = null,
    wingspan = null,
    emergency_contact = ''
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Já existe um cadastro com este e-mail' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  const insert = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, belt, degrees, phone, birthdate, academy_join_date, emergency_contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, date('now'), ?)
  `);

  try {
    const result = insert.run(
      name.trim(),
      email.trim().toLowerCase(),
      password_hash,
      role === 'professor' ? 'professor' : 'student',
      belt,
      parseInt(degrees, 10) || 0,
      phone,
      birthdate,
      emergency_contact
    );

    const newUserId = result.lastInsertRowid;

    // Record initial graduation
    db.prepare(`
      INSERT INTO graduations (student_id, belt, degrees, awarded_date, notes)
      VALUES (?, ?, ?, date('now'), 'Início na academia')
    `).run(newUserId, belt, parseInt(degrees, 10) || 0);

    // Record initial physical data if provided
    if (weight) {
      db.prepare(`
        INSERT INTO physical_records (student_id, weight, height, wingspan, notes, recorded_at)
        VALUES (?, ?, ?, ?, 'Cadastro inicial', date('now'))
      `).run(newUserId, parseFloat(weight), height ? parseFloat(height) : null, wingspan ? parseFloat(wingspan) : null);
    }

    const newUser = db.prepare('SELECT id, name, email, role, belt, degrees, phone, birthdate, emergency_contact, created_at FROM users WHERE id = ?').get(newUserId);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    res.status(500).json({ error: 'Erro ao criar conta no servidor' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare(`
    SELECT id, name, email, role, phone, birthdate, belt, degrees, academy_join_date, avatar, emergency_contact,
           game_style, favorite_position, favorite_submission, idol, bjj_motto, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  // Get current physical stats
  const latestPhysical = db.prepare(`
    SELECT weight, height, wingspan, body_fat, recorded_at
    FROM physical_records
    WHERE student_id = ?
    ORDER BY recorded_at DESC, id DESC LIMIT 1
  `).get(user.id);

  // Get total attendances
  const attendanceCount = db.prepare(`
    SELECT COUNT(*) as count FROM attendances
    WHERE student_id = ? AND status = 'present'
  `).get(user.id);

  res.json({
    ...user,
    physical: latestPhysical || null,
    total_attendances: attendanceCount ? attendanceCount.count : 0
  });
});

// PUT /api/auth/profile-curiosities - Update curiosity info (guardeiro/passador, posições favoritas, ídolo, lema)
router.put('/profile-curiosities', authenticateToken, (req, res) => {
  const { game_style, favorite_position, favorite_submission, idol, bjj_motto } = req.body;

  db.prepare(`
    UPDATE users
    SET game_style = ?, favorite_position = ?, favorite_submission = ?, idol = ?, bjj_motto = ?
    WHERE id = ?
  `).run(
    game_style !== undefined ? game_style : 'Equilibrado',
    favorite_position !== undefined ? favorite_position : '',
    favorite_submission !== undefined ? favorite_submission : '',
    idol !== undefined ? idol : '',
    bjj_motto !== undefined ? bjj_motto : '',
    req.user.id
  );

  const updatedUser = db.prepare(`
    SELECT id, name, email, role, phone, birthdate, belt, degrees, academy_join_date, avatar, emergency_contact,
           game_style, favorite_position, favorite_submission, idol, bjj_motto, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);

  res.json({
    success: true,
    message: 'Curiosidades de Jiu-Jitsu salvas com sucesso!',
    user: updatedUser
  });
});

// PUT /api/auth/avatar - Update avatar (base64 or URL)
router.put('/avatar', authenticateToken, (req, res) => {
  const { avatar } = req.body;

  if (avatar === undefined) {
    return res.status(400).json({ error: 'Nenhuma foto fornecida' });
  }

  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar || null, req.user.id);

  const updatedUser = db.prepare(`
    SELECT id, name, email, role, phone, birthdate, belt, degrees, academy_join_date, avatar, emergency_contact,
           game_style, favorite_position, favorite_submission, idol, bjj_motto, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);

  res.json({
    success: true,
    message: avatar ? 'Foto de perfil atualizada com sucesso!' : 'Foto de perfil removida!',
    user: updatedUser
  });
});

// DELETE /api/auth/avatar - Remove avatar
router.delete('/avatar', authenticateToken, (req, res) => {
  db.prepare('UPDATE users SET avatar = NULL WHERE id = ?').run(req.user.id);

  const updatedUser = db.prepare(`
    SELECT id, name, email, role, phone, birthdate, belt, degrees, academy_join_date, avatar, emergency_contact,
           game_style, favorite_position, favorite_submission, idol, bjj_motto, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);

  res.json({
    success: true,
    message: 'Foto de perfil removida com sucesso!',
    user: updatedUser
  });
});

// In-memory store for reset codes: email -> { code, expires }
const resetTokens = new Map();

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Informe o e-mail cadastrado' });
  }

  const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'Nenhum atleta ou professor encontrado com este e-mail' });
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetTokens.set(user.email, {
    code,
    expires: Date.now() + 15 * 60 * 1000 // 15 minutes
  });

  res.json({
    success: true,
    message: `Código de verificação gerado para ${user.name}!`,
    code, // Returned for instant recovery and demonstration
    email: user.email,
    userName: user.name
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const stored = resetTokens.get(normalizedEmail);

  if (!stored) {
    return res.status(400).json({ error: 'Nenhuma solicitação de recuperação encontrada para este e-mail' });
  }

  if (Date.now() > stored.expires) {
    resetTokens.delete(normalizedEmail);
    return res.status(400).json({ error: 'O código de verificação expirou. Solicite um novo' });
  }

  if (stored.code !== code.trim()) {
    return res.status(400).json({ error: 'Código de verificação inválido' });
  }

  // Hash new password
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(newPassword, salt);

  db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(password_hash, normalizedEmail);
  resetTokens.delete(normalizedEmail);

  res.json({
    success: true,
    message: 'Senha alterada com sucesso! Você já pode fazer login no tatame com a nova senha.'
  });
});

module.exports = router;
