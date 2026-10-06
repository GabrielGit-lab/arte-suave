// In-memory rate limiter to prevent brute force and DDoS attacks on sensitive routes
const loginAttempts = new Map();

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.firstAttempt > 15 * 60 * 1000) {
      loginAttempts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

function rateLimitLogin(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxAttempts = 15; // max 15 login attempts per 15 min per IP

  const record = loginAttempts.get(ip);

  if (!record) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (now - record.firstAttempt > windowMs) {
    // Window expired, reset
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  record.count += 1;

  if (record.count > maxAttempts) {
    const minutesLeft = Math.ceil((windowMs - (now - record.firstAttempt)) / 60000);
    return res.status(429).json({
      error: `Muitas tentativas de login consecutivas. Por segurança, tente novamente em ${minutesLeft} minutos.`
    });
  }

  next();
}

module.exports = { rateLimitLogin };
