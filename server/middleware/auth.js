const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'arte_suave_bjj_secret_key_2026_super_secure';
const DEMO_EMAILS = ['professor@artesuave.com', 'aluno@artesuave.com'];

function isDemoAccount(email) {
  if (!email) return false;
  return DEMO_EMAILS.includes(email.toLowerCase().trim());
}

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

    // Flag demo account
    if (isDemoAccount(user.email)) {
      user.is_demo = true;
    }

    req.user = user;

    // Block any mutation operations (POST, PUT, PATCH, DELETE) for demo accounts
    if (user.is_demo && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
      return res.status(403).json({
        error: '⚠️ Modo Demonstração: você pode explorar todas as telas da plataforma, mas alterações de dados estão bloqueadas para proteger a academia.',
        isDemoBlocked: true
      });
    }

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
  DEMO_EMAILS,
  isDemoAccount,
  authenticateToken,
  requireProfessor,
};

