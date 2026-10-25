const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Helper to generate a clean team code (e.g. "ARTE-4921")
function generateTeamCode(teamName) {
  let prefix = 'TEAM';
  if (teamName && typeof teamName === 'string') {
    const cleaned = teamName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleaned.length >= 3) {
      prefix = cleaned.substring(0, 4);
    }
  }
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  let code = `${prefix}-${randomDigits}`;

  // Ensure uniqueness
  let existing = db.prepare('SELECT id FROM teams WHERE code = ?').get(code);
  while (existing) {
    const nextRandom = Math.floor(1000 + Math.random() * 9000);
    code = `${prefix}-${nextRandom}`;
    existing = db.prepare('SELECT id FROM teams WHERE code = ?').get(code);
  }
  return code;
}

// GET /api/teams/my-team - Get authenticated user's current team with members and stats
router.get('/my-team', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, role, team_id, team_role FROM users WHERE id = ?').get(req.user.id);

    if (!user || !user.team_id) {
      return res.json({
        hasTeam: false,
        team: null,
        leader: null,
        members: [],
        stats: { totalMembers: 0, totalInstructors: 0, totalStudents: 0 }
      });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(user.team_id);
    if (!team) {
      return res.json({
        hasTeam: false,
        team: null,
        leader: null,
        members: [],
        stats: { totalMembers: 0, totalInstructors: 0, totalStudents: 0 }
      });
    }

    // Leader info
    const leader = team.leader_id 
      ? db.prepare('SELECT id, name, email, belt, degrees, avatar, phone FROM users WHERE id = ?').get(team.leader_id)
      : null;

    // Members affiliated to this team
    const members = db.prepare(`
      SELECT id, name, email, role, team_role, belt, degrees, avatar, phone, academy_join_date,
             game_style, favorite_submission, favorite_position
      FROM users
      WHERE team_id = ?
      ORDER BY 
        CASE 
          WHEN team_role = 'leader' THEN 1
          WHEN role = 'professor' OR team_role = 'instructor' THEN 2
          ELSE 3
        END,
        CASE belt
          WHEN 'Coral' THEN 1
          WHEN 'Vermelha' THEN 2
          WHEN 'Preta' THEN 3
          WHEN 'Marrom' THEN 4
          WHEN 'Roxa' THEN 5
          WHEN 'Azul' THEN 6
          ELSE 7
        END,
        degrees DESC,
        name ASC
    `).all(team.id);

    // Compute stats
    let totalInstructors = 0;
    let totalStudents = 0;
    members.forEach(m => {
      if (m.role === 'professor' || m.team_role === 'instructor' || m.team_role === 'leader') {
        totalInstructors++;
      } else {
        totalStudents++;
      }
    });

    res.json({
      hasTeam: true,
      team,
      leader,
      members,
      currentUserRole: user.team_role || (user.role === 'professor' ? 'instructor' : 'student'),
      isLeader: user.team_role === 'leader' || team.leader_id === user.id,
      stats: {
        totalMembers: members.length,
        totalInstructors,
        totalStudents
      }
    });
  } catch (err) {
    console.error('Erro ao buscar dados da equipe:', err);
    res.status(500).json({ error: 'Erro ao carregar equipe' });
  }
});

// POST /api/teams - Professor registers a new Team
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, city, state, lineage, logo, description, code: customCode } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'O nome da equipe é obrigatório' });
    }

    // Check if user is a professor
    const user = db.prepare('SELECT id, role, team_id FROM users WHERE id = ?').get(req.user.id);
    if (user.role !== 'professor') {
      return res.status(403).json({ error: 'Apenas professores e mestres podem registrar uma equipe' });
    }

    let code = customCode && customCode.trim() 
      ? customCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
      : generateTeamCode(name);

    // Check code collision
    const existingCode = db.prepare('SELECT id FROM teams WHERE code = ?').get(code);
    if (existingCode) {
      code = generateTeamCode(name);
    }

    const insert = db.prepare(`
      INSERT INTO teams (name, code, leader_id, logo, city, state, lineage, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name.trim(),
      code,
      user.id,
      logo ? logo.trim() : null,
      city ? city.trim() : '',
      state ? state.trim().toUpperCase() : '',
      lineage ? lineage.trim() : '',
      description ? description.trim() : ''
    );

    const teamId = result.lastInsertRowid;

    // Link professor as leader of this team
    db.prepare(`
      UPDATE users
      SET team_id = ?, team_role = 'leader'
      WHERE id = ?
    `).run(teamId, user.id);

    const createdTeam = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId);

    res.status(201).json({
      success: true,
      message: 'Equipe registrada com sucesso! Seu código de convite é ' + code,
      team: createdTeam
    });
  } catch (err) {
    console.error('Erro ao registrar equipe:', err);
    res.status(500).json({ error: 'Erro ao registrar equipe no servidor' });
  }
});

// PUT /api/teams/my-team - Update team details
router.put('/my-team', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, role, team_id, team_role FROM users WHERE id = ?').get(req.user.id);
    if (!user || !user.team_id) {
      return res.status(400).json({ error: 'Você não está vinculado a nenhuma equipe' });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(user.team_id);
    if (!team) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }

    // Only leader or professor can edit team info
    if (user.role !== 'professor' && user.team_role !== 'leader') {
      return res.status(403).json({ error: 'Você não tem permissão para editar os dados da equipe' });
    }

    const { name, city, state, lineage, logo, description } = req.body;

    db.prepare(`
      UPDATE teams
      SET name = COALESCE(?, name),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          lineage = COALESCE(?, lineage),
          logo = ?,
          description = COALESCE(?, description)
      WHERE id = ?
    `).run(
      name ? name.trim() : team.name,
      city !== undefined ? city.trim() : team.city,
      state !== undefined ? state.trim().toUpperCase() : team.state,
      lineage !== undefined ? lineage.trim() : team.lineage,
      logo !== undefined ? (logo ? logo.trim() : null) : team.logo,
      description !== undefined ? description.trim() : team.description,
      team.id
    );

    const updated = db.prepare('SELECT * FROM teams WHERE id = ?').get(team.id);

    res.json({
      success: true,
      message: 'Dados da equipe atualizados com sucesso!',
      team: updated
    });
  } catch (err) {
    console.error('Erro ao atualizar equipe:', err);
    res.status(500).json({ error: 'Erro ao atualizar dados da equipe' });
  }
});

// PUT /api/teams/my-team/logo - Direct fast upload/update for team logo/photo
router.put('/my-team/logo', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, role, team_id, team_role FROM users WHERE id = ?').get(req.user.id);
    if (!user || !user.team_id) {
      return res.status(400).json({ error: 'Você não está vinculado a nenhuma equipe' });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(user.team_id);
    if (!team) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }

    if (user.role !== 'professor' && user.team_role !== 'leader') {
      return res.status(403).json({ error: 'Apenas professores e líderes podem alterar a foto da equipe' });
    }

    const { logo } = req.body;
    const cleanLogo = logo && typeof logo === 'string' && logo.trim().length > 0 ? logo.trim() : null;

    db.prepare(`
      UPDATE teams
      SET logo = ?
      WHERE id = ?
    `).run(cleanLogo, team.id);

    const updated = db.prepare('SELECT * FROM teams WHERE id = ?').get(team.id);

    res.json({
      success: true,
      message: cleanLogo ? 'Foto da equipe atualizada com sucesso!' : 'Foto da equipe removida com sucesso!',
      team: updated
    });
  } catch (err) {
    console.error('Erro ao atualizar foto da equipe:', err);
    res.status(500).json({ error: 'Erro ao salvar foto da equipe' });
  }
});

// POST /api/teams/join - Join a team by invite code
router.post('/join', authenticateToken, (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Código da equipe é obrigatório' });
    }

    const cleanCode = code.trim().toUpperCase();
    const team = db.prepare('SELECT * FROM teams WHERE code = ?').get(cleanCode);

    if (!team) {
      return res.status(404).json({ error: 'Nenhuma equipe encontrada com o código ' + cleanCode });
    }

    const user = db.prepare('SELECT id, role, team_id, team_role FROM users WHERE id = ?').get(req.user.id);
    
    // Prevent leader from abandoning team without transferring
    if (user.team_id === team.id) {
      return res.status(400).json({ error: 'Você já faz parte desta equipe' });
    }

    const assignedRole = user.role === 'professor' ? 'instructor' : 'student';

    db.prepare(`
      UPDATE users
      SET team_id = ?, team_role = ?
      WHERE id = ?
    `).run(team.id, assignedRole, user.id);

    res.json({
      success: true,
      message: `Você ingressou na equipe ${team.name} com sucesso!`,
      team
    });
  } catch (err) {
    console.error('Erro ao ingressar na equipe:', err);
    res.status(500).json({ error: 'Erro ao ingressar na equipe' });
  }
});

// POST /api/teams/leave - Leave current team
router.post('/leave', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, role, team_id, team_role FROM users WHERE id = ?').get(req.user.id);
    if (!user || !user.team_id) {
      return res.status(400).json({ error: 'Você não está vinculado a nenhuma equipe' });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(user.team_id);
    if (team && team.leader_id === user.id) {
      return res.status(400).json({
        error: 'Você é o Mestre Líder fundador desta equipe. Para sair, você deve transferir a liderança primeiro.'
      });
    }

    db.prepare(`
      UPDATE users
      SET team_id = NULL, team_role = 'student'
      WHERE id = ?
    `).run(user.id);

    res.json({
      success: true,
      message: 'Você se desvinculou da equipe com sucesso.'
    });
  } catch (err) {
    console.error('Erro ao sair da equipe:', err);
    res.status(500).json({ error: 'Erro ao processar desvinculação' });
  }
});

// GET /api/teams/code/:code - Public preview of team by code
router.get('/code/:code', (req, res) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const team = db.prepare(`
      SELECT t.id, t.name, t.code, t.logo, t.city, t.state, t.lineage, t.description,
             u.name as leader_name, u.belt as leader_belt, u.degrees as leader_degrees, u.avatar as leader_avatar
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE t.code = ?
    `).get(cleanCode);

    if (!team) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }

    const count = db.prepare('SELECT COUNT(*) as count FROM users WHERE team_id = ?').get(team.id);

    res.json({
      ...team,
      total_members: count ? count.count : 0
    });
  } catch (err) {
    console.error('Erro ao buscar equipe por código:', err);
    res.status(500).json({ error: 'Erro ao buscar equipe' });
  }
});

module.exports = router;
