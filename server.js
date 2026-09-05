const express = require('express');
const D = require('./db');
const V = require('./views');
const S = require('./security');

const app = express();
// --- security middleware (all pentest remediations) ---
app.disable('x-powered-by');
app.set('trust proxy', 1);                    // behind Render/Railway/Fly proxy
app.get('/healthz', (_, res) => res.type('text/plain').send('ok'));
app.use(S.headers);
app.use((req, res, next) => { V.setNonce(res.locals && res.locals.nonce); next(); });
app.use(S.rateLimit({ windowMs: 60000, max: 300, key: 'all' }));           // global flood guard
app.use(express.urlencoded({ extended: false, limit: '32kb' }));            // FIX: oversized payloads
app.use(express.json({ limit: '32kb' }));
app.use(S.csrf([process.env.PUBLIC_HOST || '', 'e2b.app'].filter(Boolean)));// FIX: cross-origin POST
const writeLimit = S.rateLimit({ windowMs: 60000, max: 8, key: 'write' });  // FIX: bid/lead spam

// brand assets (logo, favicons, og image, manifest)
app.use(express.static(require('path').join(__dirname, 'public'), {
  maxAge: '7d', etag: true, index: false, dotfiles: 'ignore'
}));
app.use((req, res, next) => { if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/go')) { D.db.visitors++; } next(); });

const f = q => ({ category: q.category || '' });   // city is not a ranking dimension
const bySlug = s => D.db.listings.find(x => x.slug === s);
const byId = i => D.db.listings.find(x => x.id === i);
const notFound = res => res.status(404).send(V.layout('Not found', '<div class="wrap"><h1>Not found</h1><p class="sub"><a href="/">Back to the leaderboard</a></p></div>'));

// boards
app.get('/', (req, res) => res.send(V.board('all', f(req.query))));
app.get('/today', (req, res) => res.send(V.board('today', f(req.query))));
app.get('/daily', (_, res) => res.redirect(301, '/today'));      // board retired
app.get('/momentum', (_, res) => res.redirect(301, '/'));        // board retired

app.get('/category/:slug', (req, res) => {
  const cat = D.CATEGORIES.find(c => c.slug === req.params.slug);
  if (!cat) return notFound(res);
  res.send(V.categoryPage(cat, f(req.query)));
});

// static pages
app.get('/rules', (_, res) => res.send(V.rules()));
app.get('/about', (_, res) => res.send(V.about()));
app.get('/ask', (req, res) => res.send(V.ask(req.query.q || '', req.query.q ? D.aiSearch(req.query.q) : [])));

// listing
app.get('/business/:slug', (req, res) => {
  const l = bySlug(req.params.slug); if (!l) return notFound(res);
  D.track('view', l.id); res.send(V.profile(l));
});
app.get('/go/:id', S.rateLimit({ windowMs: 60000, max: 120, key: 'go' }), (req, res) => {
  const l = byId(req.params.id); if (!l) return res.redirect('/');
  const target = S.safeRedirect(l.url);                    // FIX: re-validated at click time
  if (!target) return res.redirect('/');
  D.track('click', l.id);
  res.redirect(302, target);
});

// submit / raise / takeover  === PAYMENT HOOKS ===
app.get('/submit', (_, res) => res.send(V.submit(null, {})));
app.post('/submit', writeLimit, (req, res) => {
  try {
    const l = D.createListing(S.pick(req.body, ['name', 'url', 'tagline', 'category', 'city', 'phone', 'email', 'amount']));
    S.grantOwnership(req, res, l.id);                      // FIX: submitter owns the dashboard
    const rank = D.rankOf(l.id, { category: l.category });
    res.redirect('/business/' + l.slug + '?flash=' + encodeURIComponent(`You are #${rank} in ${D.catName(l.category)}, #${D.rankOf(l.id)} in New Zealand`)
      + '&flashDesc=' + encodeURIComponent('Your listing is live. Analytics are in your dashboard.'));
  }
  catch (e) { res.status(400).send(V.submit(e.message, req.body)); }
});
app.get('/raise/:id', (req, res) => { const l = byId(req.params.id); if (!l) return notFound(res); res.send(V.raise(l, null)); });
app.post('/raise/:id', writeLimit, (req, res) => {
  const l = byId(req.params.id); if (!l) return notFound(res);
  try {
    D.addBid(l.id, req.body.amount); S.grantOwnership(req, res, l.id);
    const rank = D.rankOf(l.id, { category: l.category });
    res.redirect('/business/' + l.slug + '?flash=' + encodeURIComponent(`Raised \u2014 now #${rank} in ${D.catName(l.category)}, #${D.rankOf(l.id)} nationally`)
      + '&flashDesc=' + encodeURIComponent('Rank updates instantly. Anyone can outbid you.'));
  }
  catch (e) { res.status(400).send(V.raise(l, e.message)); }
});
app.get('/takeover', (_, res) => res.send(V.takeover(null)));
app.post('/takeover', writeLimit, (req, res) => {
  try { D.buyTakeover(req.body.listingId, req.body.amount);
    res.redirect('/?flash=' + encodeURIComponent(`Takeover live for ${D.RULES.TAKEOVER_HOURS} hours`)
      + '&flashDesc=' + encodeURIComponent('Your business owns the banner on every page.')); }
  catch (e) { res.status(400).send(V.takeover(e.message)); }
});

// leads
app.post('/lead/:id', writeLimit, (req, res) => {
  const l = byId(req.params.id); if (!l) return notFound(res);
  try { D.addLead(l.id, req.body); } catch (e) { return res.status(400).send(V.layout('Error', `<div class="wrap"><h1>Could not send</h1><p class="sub">${V.esc(e.message)}</p><p><a class="btn" href="/business/${l.slug}">Back</a></p></div>`)); }
  D.track('lead', l.id);
  res.redirect('/business/' + l.slug + '?flash=' + encodeURIComponent('Enquiry sent to ' + l.name)
    + '&flashDesc=' + encodeURIComponent('They have your details and will be in touch.'));
});

// FIX (CRITICAL): dashboard shows customer enquiries — owner-only
// SEO / AI-citation surface
app.get('/robots.txt', (_, res) => res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n'));
app.get('/llms.txt', (_, res) => res.type('text/plain').send(
`# BIDTOBE1\nNew Zealand's public business leaderboard. Rank is determined by what a business pays; paid placement is disclosed.\nThe AI Visibility Score (0-100) blends spend (capped at 35), click-through, profile completeness, enquiries and verification.\n\n## Machine-readable data\n- /api/board?board=all|today&category=\n- /api/ask?q=<plain english question>\n- /api/stats\n\n## Boards\n${D.CATEGORIES.map(c => '- /category/' + c.slug + ' (' + c.name + ')').join('\\n')}\n`));
app.get('/sitemap.xml', (_, res) => {
  const base = (req => '')(0) || (process.env.PUBLIC_URL || '');
  const urls = ['/', '/today', '/rules', '/about', '/ask', '/submit']
    .concat(D.CATEGORIES.map(c => '/category/' + c.slug))
    .concat(D.allTime().map(l => '/business/' + l.slug));
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`);
});

app.get('/dashboard', (req, res) => {
  const owned = S.ownedIds(req).map(byId).filter(Boolean);
  if (!req.query.id) return res.send(V.dashboard(null, owned));
  const l = byId(req.query.id);
  if (!l) return notFound(res);
  if (!owned.some(o => o.id === l.id)) {
    return res.status(403).send(V.layout('Not your listing', `<div class="wrap"><h1>403 — not your listing</h1>
      <p class="sub">Enquiries and analytics are private to the business that owns the listing. Claim or raise <b>${V.esc(l.name)}</b> from this browser to unlock its dashboard.</p>
      <p><a class="btn" href="/raise/${l.id}">Claim this listing</a> <a class="btn ghost" href="/dashboard">My listings</a></p></div>`));
  }
  res.send(V.dashboard(l, owned));
});

// JSON API for a future Next.js frontend / AI agents
app.get('/api/board', (req, res) => {
  const kind = req.query.board || 'all';
  const list = kind === 'today' ? D.todayBoard(f(req.query)) : D.allTime(f(req.query));
  res.json(list.map((l, i) => ({ rank: i + 1, name: l.name, url: l.url, category: D.catName(l.category), city: l.city,
    total: l.total, windowTotal: l.windowTotal, clicks: l.clicks, score: D.visibilityScore(l), slug: l.slug })));
});
app.get('/api/min-to-top', (req, res) => res.json({ allTime: D.minToTop(f(req.query)), today: D.minToTopToday(f(req.query)) }));
app.get('/api/ask', (req, res) => res.json(D.aiSearch(req.query.q).map(l => ({ name: l.name, url: l.url, city: l.city, category: D.catName(l.category), score: D.visibilityScore(l) }))));
app.get('/api/stats', (_, res) => res.json(D.stats()));

// FIX (LOW): never leak stack traces
app.use((err, req, res, _next) => {
  const code = err.status || err.statusCode || 500;
  if (code >= 500) console.error('[error]', err.message);
  res.status(code).send(V.layout('Error', `<div class="wrap"><h1>${code === 413 ? 'Payload too large' : 'Something went wrong'}</h1>
    <p class="sub">${code === 413 ? 'That submission was too big.' : 'The request could not be completed.'}</p>
    <p><a class="btn" href="/">Back to the leaderboard</a></p></div>`));
});

const PORT = process.env.PORT || 3000;
if (!process.env.BIDTOBE1_SECRET) console.warn('[warn] BIDTOBE1_SECRET not set — owner cookies reset on restart.');
const server = app.listen(PORT, '0.0.0.0', () => console.log('BIDTOBE1 listening on ' + PORT));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => {
  console.log('shutting down, flushing data...');
  D.saveNow();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
});
