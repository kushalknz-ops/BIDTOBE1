// NZRank security layer — remediations for every pentest finding.
const crypto = require('crypto');

const SECRET = process.env.NZRANK_SECRET || crypto.randomBytes(32).toString('hex');

// --- FIX (HIGH): URL sanitisation — blocks javascript:, data:, protocol-relative open redirects ---
const BAD_SCHEME = /^\s*(javascript|data|vbscript|file|blob|about):/i;
function sanitiseUrl(raw) {
  let s = String(raw || '').trim();
  if (!s) throw new Error('Website is required.');
  if (BAD_SCHEME.test(s)) throw new Error('That URL scheme is not allowed.');
  s = s.replace(/^\/+/, '');                       // kill //evil.com protocol-relative
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u;
  try { u = new URL(s); } catch { throw new Error('That does not look like a valid website.'); }
  if (!/^https?:$/.test(u.protocol)) throw new Error('Only http and https websites can be listed.');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname)) throw new Error('Enter a real domain, e.g. yourbusiness.co.nz');
  if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(u.hostname))
    throw new Error('Internal addresses cannot be listed.');   // also blocks SSRF later
  u.search = ''; u.hash = '';                                   // strip tracking params
  return u.toString().replace(/\/$/, '');
}
// Safe redirect target for /go/:id — re-validated at click time, never trusts stored data.
function safeRedirect(stored) { try { return sanitiseUrl(stored); } catch { return null; } }

// --- FIX (MEDIUM): field whitelisting, stops mass assignment ---
const pick = (obj, keys) => keys.reduce((o, k) => (obj && obj[k] !== undefined && (o[k] = String(obj[k]).slice(0, 500)), o), {});

// --- FIX (CRITICAL): owner auth via signed tokens ---
const sign = id => id + '.' + crypto.createHmac('sha256', SECRET).update(id).digest('hex').slice(0, 32);
function verify(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [id] = token.split('.');
  return crypto.timingSafeEqual(Buffer.from(sign(id)), Buffer.from(token)) ? id : null;
}
function ownedIds(req) {
  const raw = (req.headers.cookie || '').split(';').map(c => c.trim()).filter(c => c.startsWith('own='));
  return raw.flatMap(c => decodeURIComponent(c.slice(4)).split('~')).map(verify).filter(Boolean);
}
function grantOwnership(req, res, id) {
  const set = new Set([...ownedIds(req), id]);
  res.setHeader('Set-Cookie', `own=${encodeURIComponent([...set].map(sign).join('~'))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
}

// --- FIX (MEDIUM): in-memory rate limiter ---
const buckets = new Map();
function rateLimit({ windowMs, max, key = 'g' }) {
  return (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const k = key + ':' + ip, now = Date.now();
    const b = buckets.get(k) || { n: 0, reset: now + windowMs };
    if (now > b.reset) { b.n = 0; b.reset = now + windowMs; }
    b.n++; buckets.set(k, b);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - b.n));
    if (b.n > max) return res.status(429).send('Too many requests. Slow down and try again shortly.');
    next();
  };
}
setInterval(() => { const now = Date.now(); for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k); }, 60000).unref();

// --- FIX (MEDIUM): CSRF — strict origin check on state-changing requests ---
function csrf(allowedHosts) {
  return (req, res, next) => {
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) return next();
    const origin = req.headers.origin || req.headers.referer;
    if (!origin) return next();                              // curl / server-to-server
    let host; try { host = new URL(origin).host; } catch { return res.status(403).send('Bad origin.'); }
    const ok = host === req.headers.host || allowedHosts.some(h => host === h || host.endsWith('.' + h));
    return ok ? next() : res.status(403).send('Cross-origin request blocked.');
  };
}

// --- FIX (MEDIUM/LOW): security headers ---
function headers(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.locals = res.locals || {};
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader('Content-Security-Policy',
    `default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; ` +
    `script-src 'self' 'nonce-${nonce}'; form-action 'self'; frame-ancestors 'self' https://*.e2b.app; ` +
    `base-uri 'none'; object-src 'none'`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

// --- money validation, one place ---
function validAmount(v, { min, max }) {
  const s = String(v).trim();
  if (!/^\d{1,7}$/.test(s)) throw new Error('Enter a whole dollar amount.');
  const n = parseInt(s, 10);
  if (!Number.isSafeInteger(n) || n < min) throw new Error(`Minimum is $${min}.`);
  if (n > max) throw new Error(`Maximum is $${max.toLocaleString('en-NZ')}.`);
  return n;
}

// --- content moderation: keeps the board listable ---
const BANNED = /\b(porn|xxx|escort|casino|onlyfans|bit\.ly|tinyurl|t\.me|discord\.gg|viagra|crypto\s*doubl)/i;
function moderate(text) { if (BANNED.test(text)) throw new Error('That content is not allowed on the board.'); return text; }

module.exports = { sanitiseUrl, safeRedirect, pick, sign, verify, ownedIds, grantOwnership,
  rateLimit, csrf, headers, validAmount, moderate };
