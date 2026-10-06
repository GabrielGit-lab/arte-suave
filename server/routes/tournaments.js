const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireProfessor } = require('../middleware/auth');

// GET /api/tournaments - List tournaments
router.get('/', authenticateToken, (req, res) => {
  const { gi_type, category_type, gender, belt } = req.query;

  let query = `
    SELECT 
      t.*,
      u.name as creator_name,
      (SELECT COUNT(*) FROM tournament_athletes a WHERE a.tournament_id = t.id) as athletes_count,
      (SELECT COUNT(*) FROM tournament_matches m WHERE m.tournament_id = t.id) as matches_count,
      (SELECT COUNT(*) FROM tournament_matches m WHERE m.tournament_id = t.id AND m.status = 'completed') as completed_matches
    FROM tournaments t
    LEFT JOIN users u ON t.created_by_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (gi_type && gi_type !== 'Todos') {
    query += ` AND t.gi_type = ?`;
    params.push(gi_type);
  }

  if (category_type && category_type !== 'Todos') {
    query += ` AND t.category_type = ?`;
    params.push(category_type);
  }

  if (gender && gender !== 'Todos') {
    query += ` AND t.gender = ?`;
    params.push(gender);
  }

  if (belt && belt !== 'Todas') {
    if (belt === 'Absoluto') {
      query += ` AND (t.belt_category LIKE '%Absoluto%' OR t.belt_category LIKE '%Open Class%' OR t.category_type = 'Absoluto')`;
    } else {
      query += ` AND t.belt_category LIKE ?`;
      params.push(`%${belt}%`);
    }
  }

  query += ` ORDER BY t.date DESC, t.id DESC`;

  const tournaments = db.prepare(query).all(...params);
  res.json(tournaments);
});

// GET /api/tournaments/federations - List major federation tournaments with live stats
router.get('/federations', authenticateToken, (req, res) => {
  const { federation, gi_type, status, search } = req.query;

  let query = `SELECT * FROM federation_tournaments WHERE 1=1`;
  const params = [];

  if (federation && federation !== 'Todas') {
    query += ` AND federation = ?`;
    params.push(federation);
  }

  if (gi_type && gi_type !== 'Todos') {
    query += ` AND (gi_type = ? OR gi_type = 'Ambos')`;
    params.push(gi_type);
  }

  if (status && status !== 'Todos') {
    query += ` AND status = ?`;
    params.push(status);
  }

  if (search) {
    query += ` AND (name LIKE ? OR city LIKE ? OR country LIKE ? OR venue LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY 
    CASE status
      WHEN 'live' THEN 1
      WHEN 'registration_open' THEN 2
      WHEN 'check_phase' THEN 3
      WHEN 'upcoming' THEN 4
      ELSE 5
    END,
    date ASC
  `;

  const tournaments = db.prepare(query).all(...params);

  // Compute live summary statistics
  const total = db.prepare('SELECT COUNT(*) as count FROM federation_tournaments').get().count;
  const liveCount = db.prepare("SELECT COUNT(*) as count FROM federation_tournaments WHERE status = 'live'").get().count;
  const openCount = db.prepare("SELECT COUNT(*) as count FROM federation_tournaments WHERE status = 'registration_open'").get().count;
  const checkCount = db.prepare("SELECT COUNT(*) as count FROM federation_tournaments WHERE status = 'check_phase'").get().count;

  res.json({
    tournaments,
    stats: {
      total,
      liveCount,
      openCount,
      checkCount
    }
  });
});

// GET /api/tournaments/:id - Single tournament details with athletes and matches
router.get('/:id', authenticateToken, (req, res) => {
  const tourId = parseInt(req.params.id, 10);
  const tournament = db.prepare(`
    SELECT t.*, u.name as creator_name
    FROM tournaments t
    LEFT JOIN users u ON t.created_by_id = u.id
    WHERE t.id = ?
  `).get(tourId);

  if (!tournament) {
    return res.status(404).json({ error: 'Campeonato não encontrado' });
  }

  const athletes = db.prepare(`
    SELECT * FROM tournament_athletes
    WHERE tournament_id = ?
    ORDER BY seed ASC, id ASC
  `).all(tourId);

  const matches = db.prepare(`
    SELECT * FROM tournament_matches
    WHERE tournament_id = ?
    ORDER BY round_number ASC, match_number ASC
  `).all(tourId);

  // Group matches by round
  const roundsMap = {};
  matches.forEach(m => {
    if (!roundsMap[m.round_number]) {
      roundsMap[m.round_number] = {
        round_number: m.round_number,
        round_name: m.round_name,
        matches: []
      };
    }
    roundsMap[m.round_number].matches.push(m);
  });

  const rounds = Object.values(roundsMap).sort((a, b) => a.round_number - b.round_number);

  // Check if final has a winner
  const finalMatch = matches.find(m => m.round_name.toLowerCase().includes('final') && m.round_number === Math.max(...matches.map(x => x.round_number)));
  const champion = finalMatch && finalMatch.status === 'completed' ? {
    id: finalMatch.winner_id,
    name: finalMatch.winner_name,
  } : null;

  res.json({
    tournament,
    athletes,
    matches,
    rounds,
    champion
  });
});

// POST /api/tournaments - Create new tournament (Professor only)
router.post('/', authenticateToken, requireProfessor, (req, res) => {
  const {
    title,
    date,
    location,
    gi_type, // 'Gi' or 'No-Gi'
    category_type, // 'Absoluto' or 'Peso'
    weight_division,
    gender, // 'Masculino', 'Feminino', 'Misto'
    belt_category, // 'Faixa Branca', 'Faixa Azul', 'Todas as Faixas (Absoluto)', etc.
    athletes = []
  } = req.body;

  if (!title || !date || !gi_type || !category_type || !gender || !belt_category) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }

  const result = db.prepare(`
    INSERT INTO tournaments (title, date, location, gi_type, category_type, weight_division, gender, belt_category, status, created_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)
  `).run(
    title,
    date,
    location || 'Tatame Principal',
    gi_type,
    category_type,
    weight_division || (category_type === 'Absoluto' ? 'Absoluto Livre' : 'Peso Médio'),
    gender,
    belt_category,
    req.user.id
  );

  const tourId = result.lastInsertRowid;

  // Insert athletes if provided
  if (athletes.length > 0) {
    const insertAth = db.prepare(`
      INSERT INTO tournament_athletes (tournament_id, user_id, athlete_name, belt, weight, team, seed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    athletes.forEach((ath, idx) => {
      insertAth.run(
        tourId,
        ath.user_id || null,
        ath.name || ath.athlete_name,
        ath.belt || 'Branca',
        ath.weight ? parseFloat(ath.weight) : null,
        ath.team || 'Arte Suave BJJ',
        idx + 1
      );
    });
  }

  const newTour = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tourId);
  res.status(201).json(newTour);
});

// POST /api/tournaments/:id/athletes - Add athlete
router.post('/:id/athletes', authenticateToken, requireProfessor, (req, res) => {
  const tourId = parseInt(req.params.id, 10);
  const { user_id, athlete_name, belt, weight, team } = req.body;

  if (!athlete_name || !belt) {
    return res.status(400).json({ error: 'Nome e faixa do atleta são obrigatórios' });
  }

  const currentCount = db.prepare('SELECT COUNT(*) as count FROM tournament_athletes WHERE tournament_id = ?').get(tourId).count;

  const result = db.prepare(`
    INSERT INTO tournament_athletes (tournament_id, user_id, athlete_name, belt, weight, team, seed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    tourId,
    user_id || null,
    athlete_name,
    belt,
    weight ? parseFloat(weight) : null,
    team || 'Arte Suave BJJ',
    currentCount + 1
  );

  res.status(201).json({ success: true, athlete_id: result.lastInsertRowid });
});

// DELETE /api/tournaments/:id/athletes/:athleteId
router.delete('/:id/athletes/:athleteId', authenticateToken, requireProfessor, (req, res) => {
  const tourId = parseInt(req.params.id, 10);
  const athId = parseInt(req.params.athleteId, 10);

  db.prepare('DELETE FROM tournament_athletes WHERE id = ? AND tournament_id = ?').run(athId, tourId);
  res.json({ success: true });
});

// POST /api/tournaments/:id/generate-bracket - Automatically generates single-elimination bracket
router.post('/:id/generate-bracket', authenticateToken, requireProfessor, (req, res) => {
  const tourId = parseInt(req.params.id, 10);
  const athletes = db.prepare('SELECT * FROM tournament_athletes WHERE tournament_id = ? ORDER BY seed ASC, id ASC').all(tourId);

  if (athletes.length < 2) {
    return res.status(400).json({ error: 'São necessários pelo menos 2 atletas para gerar a chave' });
  }

  // Clear existing matches
  db.prepare('DELETE FROM tournament_matches WHERE tournament_id = ?').run(tourId);

  let numAthletes = athletes.length;
  // If not power of 2, pad or take nearest bracket size (4, 8, or 16)
  let bracketSize = 4;
  if (numAthletes > 8) bracketSize = 16;
  else if (numAthletes > 4) bracketSize = 8;
  else bracketSize = 4;

  const paddedAthletes = [...athletes];
  while (paddedAthletes.length < bracketSize) {
    paddedAthletes.push(null); // BYE
  }

  const insertMatch = db.prepare(`
    INSERT INTO tournament_matches (
      tournament_id, round_name, round_number, match_number,
      athlete1_id, athlete2_id, athlete1_name, athlete2_name, athlete1_belt, athlete2_belt,
      next_match_id, next_match_slot, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Build bracket from final backwards:
  // For bracketSize 8:
  // Round 3 (Final): 1 match
  // Round 2 (Semifinals): 2 matches -> feeds to Final
  // Round 1 (Quarterfinals): 4 matches -> feeds to Semifinals
  const totalRounds = Math.log2(bracketSize); // 2 for 4, 3 for 8

  // We create matches top-down (Round totalRounds first, then connect previous rounds)
  // Store created match ids per round
  const roundMatches = {};

  // 1. Final
  const finalId = insertMatch.run(
    tourId, 'Grande Final', totalRounds, 1,
    null, null, 'Vencedor Semi 1', 'Vencedor Semi 2', null, null,
    null, null, 'pending'
  ).lastInsertRowid;
  roundMatches[totalRounds] = [finalId];

  // 2. Semifinals (if bracketSize >= 4)
  if (totalRounds >= 2) {
    const semiRound = totalRounds - 1;
    roundMatches[semiRound] = [];

    const semi1Id = insertMatch.run(
      tourId, 'Semifinal 1', semiRound, 1,
      bracketSize === 4 ? paddedAthletes[0]?.id || null : null,
      bracketSize === 4 ? paddedAthletes[1]?.id || null : null,
      bracketSize === 4 ? paddedAthletes[0]?.athlete_name || 'BYE' : 'A definir',
      bracketSize === 4 ? paddedAthletes[1]?.athlete_name || 'BYE' : 'A definir',
      bracketSize === 4 ? paddedAthletes[0]?.belt || null : null,
      bracketSize === 4 ? paddedAthletes[1]?.belt || null : null,
      finalId, 1, 'pending'
    ).lastInsertRowid;

    const semi2Id = insertMatch.run(
      tourId, 'Semifinal 2', semiRound, 2,
      bracketSize === 4 ? paddedAthletes[2]?.id || null : null,
      bracketSize === 4 ? paddedAthletes[3]?.id || null : null,
      bracketSize === 4 ? paddedAthletes[2]?.athlete_name || 'BYE' : 'A definir',
      bracketSize === 4 ? paddedAthletes[3]?.athlete_name || 'BYE' : 'A definir',
      bracketSize === 4 ? paddedAthletes[2]?.belt || null : null,
      bracketSize === 4 ? paddedAthletes[3]?.belt || null : null,
      finalId, 2, 'pending'
    ).lastInsertRowid;

    roundMatches[semiRound].push(semi1Id, semi2Id);
  }

  // 3. Quarterfinals (if bracketSize == 8)
  if (bracketSize === 8) {
    const quartersRound = 1;
    roundMatches[quartersRound] = [];

    const pairs = [
      [paddedAthletes[0], paddedAthletes[7], roundMatches[2][0], 1], // feeds semi 1 slot 1
      [paddedAthletes[3], paddedAthletes[4], roundMatches[2][0], 2], // feeds semi 1 slot 2
      [paddedAthletes[1], paddedAthletes[6], roundMatches[2][1], 1], // feeds semi 2 slot 1
      [paddedAthletes[2], paddedAthletes[5], roundMatches[2][1], 2], // feeds semi 2 slot 2
    ];

    pairs.forEach((p, idx) => {
      const ath1 = p[0];
      const ath2 = p[1];
      const nextId = p[2];
      const nextSlot = p[3];

      const mId = insertMatch.run(
        tourId, `Quartas de Final ${idx + 1}`, quartersRound, idx + 1,
        ath1?.id || null, ath2?.id || null,
        ath1?.athlete_name || 'A definir', ath2?.athlete_name || 'A definir',
        ath1?.belt || null, ath2?.belt || null,
        nextId, nextSlot, 'pending'
      ).lastInsertRowid;

      roundMatches[quartersRound].push(mId);
    });
  }

  // Update tournament status to ongoing
  db.prepare("UPDATE tournaments SET status = 'ongoing' WHERE id = ?").run(tourId);

  res.json({
    success: true,
    message: `Chave de ${bracketSize} atletas gerada com sucesso!`,
    bracket_size: bracketSize
  });
});

// POST /api/tournaments/:id/matches/:matchId/score - Record match outcome and advance winner
router.post('/:id/matches/:matchId/score', authenticateToken, requireProfessor, (req, res) => {
  const tourId = parseInt(req.params.id, 10);
  const matchId = parseInt(req.params.matchId, 10);
  const {
    winner_id,
    winner_name,
    score1 = 0,
    score2 = 0,
    adv1 = 0,
    adv2 = 0,
    pen1 = 0,
    pen2 = 0,
    win_type = 'Pontos',
    notes = ''
  } = req.body;

  if (!winner_name) {
    return res.status(400).json({ error: 'O vencedor da luta deve ser selecionado' });
  }

  const match = db.prepare('SELECT * FROM tournament_matches WHERE id = ? AND tournament_id = ?').get(matchId, tourId);
  if (!match) {
    return res.status(404).json({ error: 'Luta não encontrada' });
  }

  // Find winner belt
  let winnerBelt = match.athlete1_name === winner_name ? match.athlete1_belt : match.athlete2_belt;

  // Update current match
  db.prepare(`
    UPDATE tournament_matches
    SET winner_id = ?, winner_name = ?,
        score1 = ?, score2 = ?, adv1 = ?, adv2 = ?, pen1 = ?, pen2 = ?,
        win_type = ?, notes = ?, status = 'completed'
    WHERE id = ?
  `).run(
    winner_id || null,
    winner_name,
    parseInt(score1, 10),
    parseInt(score2, 10),
    parseInt(adv1, 10),
    parseInt(adv2, 10),
    parseInt(pen1, 10),
    parseInt(pen2, 10),
    win_type,
    notes,
    matchId
  );

  // Advance winner to next match if applicable
  if (match.next_match_id) {
    const nextMatch = db.prepare('SELECT * FROM tournament_matches WHERE id = ?').get(match.next_match_id);
    if (nextMatch) {
      if (match.next_match_slot === 1) {
        db.prepare(`
          UPDATE tournament_matches
          SET athlete1_id = ?, athlete1_name = ?, athlete1_belt = ?
          WHERE id = ?
        `).run(winner_id || null, winner_name, winnerBelt, match.next_match_id);
      } else {
        db.prepare(`
          UPDATE tournament_matches
          SET athlete2_id = ?, athlete2_name = ?, athlete2_belt = ?
          WHERE id = ?
        `).run(winner_id || null, winner_name, winnerBelt, match.next_match_id);
      }
    }
  } else {
    // This was the final! Check if tournament can be marked as finished
    db.prepare("UPDATE tournaments SET status = 'finished' WHERE id = ?").run(tourId);
  }

  res.json({
    success: true,
    message: `Vitória registrada para ${winner_name} (${win_type})!`,
    is_final: !match.next_match_id
  });
});

// DELETE /api/tournaments/:id - Delete tournament
router.delete('/:id', authenticateToken, requireProfessor, (req, res) => {
  const tourId = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM tournaments WHERE id = ?').run(tourId);
  res.json({ success: true, message: 'Campeonato excluído com sucesso' });
});

module.exports = router;
