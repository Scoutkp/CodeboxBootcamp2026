const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET. Add it to your local .env file.');
}

function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : parseCookie(req.headers.cookie || '').auth_token;
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: Number(payload.sub) };
    if (!Number.isInteger(req.user.id) || req.user.id < 1) throw new Error('Invalid subject');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

function parseCookie(header) {
  return Object.fromEntries(header.split(';').filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }));
}

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '15m' });
}

function setAuthCookie(res, userId) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `auth_token=${encodeURIComponent(signToken(userId))}; HttpOnly; SameSite=Lax; Path=/; Max-Age=900${secure}`);
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', 'auth_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
}

module.exports = { authenticate, setAuthCookie, clearAuthCookie, signToken };
