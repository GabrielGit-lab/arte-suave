const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'arte_suave_bjj_secret_key_2026_super_secure';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Sessão expirada ou token inválido' });
    }
    req.user = user;
    next();
  });
}

function requireProfessor(req, res, next) {
  if (!req.user || req.user.role !== 'professor') {
    return res.status(403).json({ error: 'Acesso restrito a professores e mestres' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireProfessor,
};
