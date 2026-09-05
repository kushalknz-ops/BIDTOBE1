// BIDTOBE1 datastore. JSON file now; swap for Supabase/Postgres later (same function names).
const fs = require('fs');
const S = require('./security');
const path = require('path');
const DATA_DIR = process.env.DATA_DIR || __dirname;
const FILE = path.join(DATA_DIR, 'data.json');
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}

const DEFAULT = { listings: [], bids: [], events: [], leads: [], takeovers: [], visitors: 0 };
function load() { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return JSON.parse(JSON.stringify(DEFAULT)); } }
let db = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), load());
let saveTimer = null;
function save() {
  if (saveTimer) return;                       // coalesce bursts
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      const tmp = FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
      fs.renameSync(tmp, FILE);                // atomic
    } catch (e) { console.error('[save]', e.message); }
  }, 50);
}
function saveNow() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  try { const tmp = FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db, null, 2)); fs.renameSync(tmp, FILE); } catch (e) { console.error(e.message); } }

const uid = () => Math.random().toString(36).slice(2, 10);
const slugify = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

// ---------- RULES (mirrors the mechanic, our own numbers) ----------
const RULES = {
  MIN_BID: 10,          // NZD, new listing
  TOP_STEP: 5,          // beat current #1 by this to take #1
  RAISE_STEP: 1,        // minimum raise on your own listing
  MAX_BID: 999999,
  TAKEOVER_MULTIPLE: 5, // pay 5x current #1 to own the hero banner for 3h
  TAKEOVER_HOURS: 3
};

const CATEGORIES = [
  { slug: 'ai-agents-automation', name: 'AI Agents & Automation' },
  { slug: 'software-saas', name: 'Software & SaaS' },
  { slug: 'marketing-advertising', name: 'Marketing & Advertising' },
  { slug: 'web-design-development', name: 'Web Design & Development' },
  { slug: 'trades-construction', name: 'Trades & Construction' },
  { slug: 'legal-accounting', name: 'Legal & Accounting' },
  { slug: 'real-estate', name: 'Real Estate' },
  { slug: 'hospitality-food', name: 'Hospitality & Food' },
  { slug: 'health-wellness', name: 'Health & Wellness' },
  { slug: 'automotive', name: 'Automotive' }
];
const CITIES = ['New Zealand', 'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin', 'Queenstown'];

const catName = s => (CATEGORIES.find(c => c.slug === s) || { name: 'Other' }).name;

// ---------- boards ----------
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const active = () => db.listings.filter(l => l.active);
// Ranking dimensions: overall (all of New Zealand) and category. City is profile info only.
const match = (l, f) => (!f.category || l.category === f.category);

function allTime(f = {}) {
  return active().filter(l => match(l, f)).sort((a, b) => b.total - a.total || a.createdAt - b.createdAt);
}
function windowBoard(hours, f = {}) {
  const cut = Date.now() - hours * 3600e3, sums = {};
  db.bids.forEach(b => { if (b.ts >= cut) sums[b.listingId] = (sums[b.listingId] || 0) + b.amount; });
  return active().filter(l => sums[l.id] && match(l, f))
    .map(l => ({ ...l, windowTotal: sums[l.id] }))
    .sort((a, b) => b.windowTotal - a.windowTotal || a.createdAt - b.createdAt);
}
const todayBoard = f => windowBoard(24, f);

function minToTop(f = {}) { const t = allTime(f)[0]; return t ? t.total + RULES.TOP_STEP : RULES.MIN_BID; }
function minToTopToday(f = {}) { const t = todayBoard(f)[0]; return t ? t.windowTotal + RULES.TOP_STEP : RULES.MIN_BID; }
function rankOf(id, f = {}) { return allTime(f).findIndex(l => l.id === id) + 1; }

// ---------- writes ----------
function findByUrl(url) {
  const key = slugify(String(url).replace(/^https?:\/\//, '').replace(/^www\./, '').split('?')[0].replace(/\/$/, ''));
  return db.listings.find(l => l.urlKey === key);
}
function createListing(d) {
  const url = S.sanitiseUrl(d.url);                       // FIX: scheme + open-redirect + SSRF
  const amount = S.validAmount(d.amount, { min: RULES.MIN_BID, max: RULES.MAX_BID });
  const name = S.moderate(String(d.name || '').trim()).slice(0, 80);
  const tagline = S.moderate(String(d.tagline || '').trim()).slice(0, 160);
  if (!name) throw new Error('Business name is required.');
  const urlKey = slugify(url.replace(/^https?:\/\//, '').replace(/^www\./, ''));
  const existing = db.listings.find(l => l.urlKey === urlKey);
  if (existing) { addBid(existing.id, amount); return existing; }
  let slug = slugify(name) || 'listing', i = 1;
  while (db.listings.some(l => l.slug === slug)) slug = (slugify(name) || 'listing') + '-' + (++i);
  const l = {                                             // FIX: explicit fields only, no mass assignment
    id: uid(), slug, urlKey, name, url, tagline,
    category: CATEGORIES.some(c => c.slug === d.category) ? d.category : 'ai-agents-automation',
    city: CITIES.includes(d.city) ? d.city : 'New Zealand',
    phone: String(d.phone || '').replace(/[^0-9+()\s-]/g, '').slice(0, 24),
    email: /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(String(d.email || '')) ? String(d.email).slice(0, 120) : '',
    verified: false, editorPick: false,                   // FIX: never settable by submitter
    total: 0, raises: 0, clicks: 0, views: 0, active: true, createdAt: Date.now(), lastRaise: Date.now()
  };
  db.listings.push(l); addBid(l.id, amount); return l;
}
function addBid(listingId, amount) {
  amount = S.validAmount(amount, { min: RULES.RAISE_STEP, max: RULES.MAX_BID });
  const l = db.listings.find(x => x.id === listingId);
  if (!l) throw new Error('Listing not found.');
  if (l.total + amount > RULES.MAX_BID) throw new Error('That would exceed the maximum total.');
  db.bids.push({ id: uid(), listingId, amount, ts: Date.now(), day: dayKey() });
  l.total += amount; l.raises++; l.lastRaise = Date.now(); save(); return l;
}
function buyTakeover(listingId, amount) {
  const need = Math.max(RULES.MIN_BID, (allTime()[0]?.total || 0) * RULES.TAKEOVER_MULTIPLE);
  const amt = S.validAmount(amount, { min: RULES.MIN_BID, max: RULES.MAX_BID });
  if (amt < need) throw new Error(`A takeover costs at least $${need.toLocaleString('en-NZ')} (${RULES.TAKEOVER_MULTIPLE}× the current #1).`);
  addBid(listingId, amt);
  db.takeovers.push({ id: uid(), listingId, until: Date.now() + RULES.TAKEOVER_HOURS * 3600e3 });
  save();
}
function currentTakeover() {
  const t = db.takeovers.filter(x => x.until > Date.now()).sort((a, b) => b.until - a.until)[0];
  return t ? { ...t, listing: db.listings.find(l => l.id === t.listingId) } : null;
}
function track(type, listingId) {
  const l = db.listings.find(x => x.id === listingId); if (!l) return;
  if (type === 'click') l.clicks++; if (type === 'view') l.views++;
  db.events.push({ type, listingId, ts: Date.now() }); save();
}
function addLead(listingId, d) {                          // FIX: whitelist, no mass assignment
  const c = S.pick(d, ['name', 'email', 'phone', 'message']);
  if (!c.name || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(c.email || '')) throw new Error('Name and a valid email are required.');
  const lead = { id: uid(), listingId, name: c.name.slice(0, 80), email: c.email.slice(0, 120),
    phone: (c.phone || '').replace(/[^0-9+()\s-]/g, '').slice(0, 24), message: S.moderate(c.message || '').slice(0, 1000), ts: Date.now() };
  db.leads.push(lead); save(); return lead;
}
const leadsFor = id => db.leads.filter(x => x.listingId === id);

function recentActivity(n = 8) {
  return db.bids.slice().sort((a, b) => b.ts - a.ts).slice(0, n).map(b => {
    const l = db.listings.find(x => x.id === b.listingId);
    return l && { listing: l, amount: b.amount, ts: b.ts, rank: rankOf(l.id) };
  }).filter(Boolean);
}

// AI Visibility Score — our differentiator vs pure pay-to-rank.
function visibilityScore(l) {
  const spend = Math.min(35, Math.log10(1 + l.total) * 17);
  const ctr = l.views ? l.clicks / l.views : 0;
  const ctrPts = Math.min(25, ctr * 100);
  const profile = [l.tagline, l.phone, l.email, l.url].filter(Boolean).length * 5; // 20
  const leads = Math.min(12, leadsFor(l.id).length * 3);
  const trust = (l.verified ? 5 : 0) + (l.editorPick ? 3 : 0);
  return Math.min(100, Math.round(spend + ctrPts + profile + leads + trust));
}
function scoreBreakdown(l) {
  const ctr = l.views ? l.clicks / l.views : 0;
  return [
    ['Rank investment', Math.round(Math.min(35, Math.log10(1 + l.total) * 17)), 35],
    ['Click-through', Math.round(Math.min(25, ctr * 100)), 25],
    ['Profile completeness', [l.tagline, l.phone, l.email, l.url].filter(Boolean).length * 5, 20],
    ['Customer enquiries', Math.min(12, leadsFor(l.id).length * 3), 12],
    ['Verification', (l.verified ? 5 : 0) + (l.editorPick ? 3 : 0), 8]
  ];
}
// Plain-language AI matcher over our own data (deterministic; swap for an LLM later).
function aiSearch(q) {
  const s = String(q || '').toLowerCase();
  const city = CITIES.find(c => c !== 'New Zealand' && s.includes(c.toLowerCase()));
  const cat = CATEGORIES.find(c => c.name.toLowerCase().split(/[^a-z]+/).some(w => w.length > 3 && s.includes(w)));
  const words = s.split(/[^a-z0-9]+/).filter(w => w.length > 3);
  return active().map(l => {
    let sc = visibilityScore(l);
    if (city && l.city === city) sc += 12;   // soft relevance hint, not a ranking axis
    if (cat && l.category === cat.slug) sc += 30;
    words.forEach(w => { if ((l.name + ' ' + l.tagline).toLowerCase().includes(w)) sc += 8; });
    return { l, sc };
  }).sort((a, b) => b.sc - a.sc).slice(0, 5).map(x => x.l);
}

const stats = () => ({
  visitors: db.visitors,
  revenue: db.bids.reduce((s, b) => s + b.amount, 0),
  listings: active().length,
  top: allTime()[0]?.total || 0,
  clicks: db.listings.reduce((s, l) => s + l.clicks, 0),
  leads: db.leads.length
});

module.exports = { db, save, saveNow, FILE, RULES, CATEGORIES, CITIES, catName, allTime, todayBoard,
  minToTop, minToTopToday, rankOf, createListing, addBid, buyTakeover, currentTakeover, track,
  addLead, leadsFor, recentActivity, visibilityScore, scoreBreakdown, aiSearch, stats, findByUrl, dayKey };
