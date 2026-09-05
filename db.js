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
  // Mirrors the outbid.lol industry set, adapted for New Zealand trades and services.
  { slug: 'ai-agents-infrastructure',   name: 'AI Agents & Infrastructure' },
  { slug: 'seo-ai-visibility',          name: 'SEO & AI Visibility' },
  { slug: 'marketing-advertising',      name: 'Marketing & Advertising' },
  { slug: 'developer-tools',            name: 'Developer Tools' },
  { slug: 'business-finance-legal',     name: 'Business, Finance & Legal' },
  { slug: 'security-privacy-compliance',name: 'Security, Privacy & Compliance' },
  { slug: 'health-fitness-wellness',    name: 'Health, Fitness & Wellness' },
  { slug: 'social-media-creator-tools', name: 'Social Media & Creator Tools' },
  { slug: 'hiring-jobs-careers',        name: 'Hiring, Jobs & Careers' },
  { slug: 'education-learning',         name: 'Education & Learning' },
  { slug: 'agencies-studios-services',  name: 'Agencies, Studios & Services' },
  { slug: 'ecommerce-retail',           name: 'Ecommerce & Retail' },
  { slug: 'games-entertainment',        name: 'Games & Entertainment' },
  { slug: 'productivity-personal-tools',name: 'Productivity & Personal Tools' },
  { slug: 'design-creative',            name: 'Design & Creative' },
  { slug: 'writing-content',            name: 'Writing & Content' },
  { slug: 'ai-media-generation',        name: 'AI Media Generation' },
  { slug: 'audio-voice-podcasting',     name: 'Audio, Voice & Podcasting' },
  { slug: 'sales-lead-generation',      name: 'Sales & Lead Generation' },
  { slug: 'travel-local-lifestyle',     name: 'Travel, Local & Lifestyle' },
  { slug: 'real-estate-property',       name: 'Real Estate & Property' },
  { slug: 'media-news',                 name: 'Media & News' },
  { slug: 'directories-launch',         name: 'Directories, Launch & Discovery' },
  { slug: 'domains-web-assets',         name: 'Domains & Web Assets' },
  { slug: 'people-profiles',            name: 'People & Profiles' },
  // New Zealand additions \u2014 the trades and services that make up most NZ business.
  { slug: 'trades-construction',        name: 'Trades & Construction' },
  { slug: 'hospitality-food',           name: 'Hospitality & Food' },
  { slug: 'automotive',                 name: 'Automotive' },
  { slug: 'primary-industries',         name: 'Farming & Primary Industries' },
  { slug: 'tourism-accommodation',      name: 'Tourism & Accommodation' },
  { slug: 'transport-logistics',        name: 'Transport & Logistics' },
  { slug: 'other',                      name: 'Other' }
];

const CITIES = ['New Zealand', 'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin', 'Queenstown'];

const catName = s => (CATEGORIES.find(c => c.slug === s) || { name: 'Other' }).name;

// ---------- boards ----------
// MODEL: every category is an INDEPENDENT auction with its own highest bid,
// history, ranking and price-to-top. Bids in one category never affect another.
// The national board is a READ-ONLY aggregate: it compares each category's
// current leader and surfaces the single highest. It never sets a bid price.
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const active = () => db.listings.filter(l => l.active);
const catOf = slug => CATEGORIES.some(c => c.slug === slug) ? slug : null;

// Deterministic ordering inside one auction:
//   amount desc -> earlier reachedAt -> listing id (never random)
function cmp(a, b) {
  return (b.total - a.total)
      || ((a.reachedAt || a.createdAt) - (b.reachedAt || b.createdAt))
      || String(a.id).localeCompare(String(b.id));
}

// ---- 1. INDEPENDENT CATEGORY AUCTION ----
function categoryBoard(slug) {
  const c = catOf(slug); if (!c) return [];
  return active().filter(l => l.category === c).sort(cmp);
}
function categoryLeader(slug) { return categoryBoard(slug)[0] || null; }
function categoryTop(slug) { const l = categoryLeader(slug); return l ? l.total : 0; }
// Price to take #1 in THIS category only. Never references any other category.
function minToTopCategory(slug) {
  const t = categoryTop(slug);
  return t ? t + RULES.TOP_STEP : RULES.MIN_BID;
}
function rankInCategory(id) {
  const l = db.listings.find(x => x.id === id); if (!l) return 0;
  return categoryBoard(l.category).findIndex(x => x.id === id) + 1;
}
function categoryHistory(slug, n = 20) {
  const ids = new Set(categoryBoard(slug).map(l => l.id));
  return db.bids.filter(b => ids.has(b.listingId)).sort((a, b) => b.ts - a.ts).slice(0, n)
    .map(b => ({ ...b, listing: db.listings.find(l => l.id === b.listingId) }));
}
// Every category with its own independent price and leader.
function categoryPrices() {
  return CATEGORIES.map(c => {
    const board = categoryBoard(c.slug), leader = board[0] || null;
    return { ...c, leader, top: leader ? leader.total : 0,
      priceToTop: leader ? leader.total + RULES.TOP_STEP : RULES.MIN_BID,
      count: board.length, reachedAt: leader ? (leader.reachedAt || leader.createdAt) : null };
  });
}

// ---- 3. OVERALL NEW ZEALAND RANKING (read-only aggregate) ----
// Takes each category's current leader, compares them, returns them ordered.
// Tie-break: equal amount -> earlier reachedAt -> listing id.
function categoryLeaders() {
  return CATEGORIES.map(c => {
    const l = categoryLeader(c.slug);
    return l ? { ...l, categoryName: c.name, categorySlug: c.slug,
      reachedAt: l.reachedAt || l.createdAt } : null;
  }).filter(Boolean).sort(cmp);
}
function overallNo1() { return categoryLeaders()[0] || null; }

// ---- Today: a time window over one category's auction (never a price source) ----
function windowBoard(hours, f = {}) {
  const cut = Date.now() - hours * 3600e3, sums = {};
  db.bids.forEach(b => { if (b.ts >= cut) sums[b.listingId] = (sums[b.listingId] || 0) + b.amount; });
  return active().filter(l => sums[l.id] && (!f.category || l.category === f.category))
    .map(l => ({ ...l, windowTotal: sums[l.id] }))
    .sort((a, b) => (b.windowTotal - a.windowTotal)
      || ((a.reachedAt || a.createdAt) - (b.reachedAt || b.createdAt))
      || String(a.id).localeCompare(String(b.id)));
}
const todayBoard = f => windowBoard(24, f);
function minToTopToday(f = {}) { const t = todayBoard(f)[0]; return t ? t.windowTotal + RULES.TOP_STEP : RULES.MIN_BID; }
// Back-compat alias: pricing is always category-scoped now.
function minToTop(f = {}) { return f.category ? minToTopCategory(f.category) : RULES.MIN_BID; }

// Legacy helper: a flat list, used only for directory/search surfaces (not for pricing).
function allTime(f = {}) {
  return active().filter(l => !f.category || l.category === f.category).sort(cmp);
}
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
    category: CATEGORIES.some(c => c.slug === d.category) ? d.category : 'other',
    city: CITIES.includes(d.city) ? d.city : 'New Zealand',
    phone: String(d.phone || '').replace(/[^0-9+()\s-]/g, '').slice(0, 24),
    email: /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(String(d.email || '')) ? String(d.email).slice(0, 120) : '',
    verified: false, editorPick: false,                   // FIX: never settable by submitter
    total: 0, raises: 0, clicks: 0, views: 0, active: true,
    createdAt: Date.now(), lastRaise: Date.now(), reachedAt: Date.now()
  };
  db.listings.push(l); addBid(l.id, amount); return l;
}
function addBid(listingId, amount) {
  amount = S.validAmount(amount, { min: RULES.RAISE_STEP, max: RULES.MAX_BID });
  const l = db.listings.find(x => x.id === listingId);
  if (!l) throw new Error('Listing not found.');
  if (l.total + amount > RULES.MAX_BID) throw new Error('That would exceed the maximum total.');
  db.bids.push({ id: uid(), listingId, amount, ts: Date.now(), day: dayKey() });
  l.total += amount; l.raises++;
  l.lastRaise = l.reachedAt = Date.now();   // timestamp the moment this total was reached
  save(); return l;
}
function buyTakeover(listingId, amount) {
  const l0 = db.listings.find(x => x.id === listingId);
  const base = l0 ? categoryTop(l0.category) : 0;
  const need = Math.max(RULES.MIN_BID, base * RULES.TAKEOVER_MULTIPLE);
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
  categoryBoard, categoryLeader, categoryTop, minToTopCategory, rankInCategory, categoryHistory,
  categoryPrices, categoryLeaders, overallNo1, cmp,
  minToTop, minToTopToday, rankOf, createListing, addBid, buyTakeover, currentTakeover, track,
  addLead, leadsFor, recentActivity, visibilityScore, scoreBreakdown, aiSearch, stats, findByUrl, dayKey };
