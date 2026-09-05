// Seeds a fresh deployment with demo NZ businesses. Run once: npm run seed
// Safe: refuses to run if the board already has listings (unless FORCE=1).
const D = require('./db');

if (D.db.listings.length && process.env.FORCE !== '1') {
  console.log(`Board already has ${D.db.listings.length} listings — nothing to do. Use FORCE=1 to reseed.`);
  process.exit(0);
}
if (process.env.FORCE === '1') { D.db.listings = []; D.db.bids = []; D.db.leads = []; D.db.events = []; D.db.takeovers = []; }

const seed = [
  ['Kushal AI', 'kushal.ai', 'AI receptionists and voice agents that answer every call for NZ trades and clinics', 'ai-agents-automation', 'Auckland', 1250, '09 887 2200'],
  ['Southern Automation', 'southernautomation.co.nz', 'Workflow and CRM automation for Kiwi trades businesses', 'ai-agents-automation', 'Christchurch', 700, '03 421 8890'],
  ['Kiwi Neural', 'kiwineural.nz', 'Custom LLM apps, RAG and internal copilots', 'ai-agents-automation', 'Wellington', 420, ''],
  ['Harbour Digital', 'harbourdigital.co.nz', 'Performance marketing for New Zealand SaaS', 'marketing-advertising', 'Auckland', 300, '09 220 1188'],
  ['Ponsonby Plumbing', 'ponsonbyplumbing.co.nz', '24/7 emergency plumbing across central Auckland', 'trades-construction', 'Auckland', 180, '09 361 4420'],
  ['Lambton Legal', 'lambtonlegal.co.nz', 'Startup, commercial and IP law', 'legal-accounting', 'Wellington', 260, '04 499 3120'],
  ['Tron Web Co', 'tronweb.co.nz', 'Fast Shopify and Next.js builds for Waikato businesses', 'web-design-development', 'Hamilton', 95, ''],
  ['Mount Eats', 'mounteats.co.nz', 'Coastal dining in Mount Maunganui', 'hospitality-food', 'Tauranga', 60, '07 575 1010'],
  ['Otago Motors', 'otagomotors.co.nz', 'Servicing, WOF and EV diagnostics', 'automotive', 'Dunedin', 45, '03 477 2020'],
  ['Alpine Realty', 'alpinerealty.co.nz', 'Queenstown residential and lifestyle property', 'real-estate', 'Queenstown', 540, '03 442 7788']
];

for (const [name, url, tagline, category, city, amount, phone] of seed) {
  D.createListing({ name, url, tagline, category, city, phone, email: 'hello@' + url, amount });
}

const L = D.db.listings;
L[0].verified = true; L[0].editorPick = true; L[1].verified = true; L[5].verified = true;
L.forEach((l, i) => { const v = Math.round(l.total * 3 + 40); l.views = v; l.clicks = Math.round(v * (0.18 - i * 0.008)); });

// today's board
D.addBid(L[3].id, 70); D.addBid(L[6].id, 51); D.addBid(L[8].id, 27); D.addBid(L[0].id, 120);

D.addLead(L[0].id, { name: 'Priya S', email: 'priya@claritydental.co.nz', phone: '021 445 992', message: 'Need an AI receptionist for a 6-chair dental clinic, after-hours bookings.' });
D.addLead(L[0].id, { name: 'Mark T', email: 'mark@tepunabuilders.co.nz', phone: '', message: 'Missing calls on site. Can you quote call answering plus CRM follow-up?' });
D.addLead(L[4].id, { name: 'Jess W', email: 'jess@example.co.nz', phone: '022 118 4432', message: 'Burst pipe in Grey Lynn, urgent.' });

D.db.visitors = 18432;
D.saveNow();
console.log('Seeded:', D.stats());
console.log('Data file:', D.FILE);
