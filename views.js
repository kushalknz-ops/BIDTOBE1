const D = require('./db');
const THEME = require('./theme');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = n => '$' + Math.round(Number(n)).toLocaleString('en-NZ');
const ago = ts => { const m = (Date.now() - ts) / 60000; if (m < 60) return Math.max(1, Math.round(m)) + ' min ago';
  const h = m / 60; if (h < 24) return Math.round(h) + ' hr ago'; const d = h / 24; return d < 14 ? Math.round(d) + ' days ago' : Math.round(d / 7) + ' wks ago'; };
const fav = url => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(String(url).replace(/^https?:\/\//, '').split('/')[0])}&sz=64`;
const roman = n => ['00','I','II','III','IV','V','VI','VII','VIII','IX','X'][n] || String(n);
const jsonld = o => `<script${NONCE ? ` nonce="${NONCE}"` : ''} type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
// word-by-word reveal, Kage-style
const words = (t, cls = '') => `<span class="${cls}">` + String(t).split(' ')
  .map((w, i) => `<span data-rv="up" data-d="${i}" style="display:inline-block">${esc(w)}</span>`).join(' ') + '</span>';

let NONCE = '';
const setNonce = n => { NONCE = n || ''; };
const ARROW = '<svg viewBox="0 0 13 13" fill="none"><path d="M2 11L11 2M11 2H4M11 2V9" stroke="#dfe7e0" stroke-width="1.2"/></svg>';

function layout(title, body, active = '', head = '') {
  const s = D.stats(), t = D.currentTakeover();
  const nav = [['/', 'Board', 'all'], ['/today', 'Today', 'today'], ['/daily', 'Daily', 'daily'],
    ['/momentum', 'Momentum', 'momentum'], ['/ask', 'Ask', 'ask'], ['/rules', 'Rules', 'rules'],
    ['/about', 'About', 'about'], ['/dashboard', 'Dashboard', 'dash']];
  return `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="BIDTOBE1 — New Zealand's public business leaderboard. Rank is what you pay.">
<meta property="og:title" content="${esc(title)}"><meta property="og:type" content="website">
<meta property="og:description" content="New Zealand's public business leaderboard. Rank is what you pay.">
<meta name="twitter:card" content="summary_large_image"><meta name="robots" content="index,follow">
<meta property="og:image" content="/og.png"><meta name="twitter:image" content="/og.png">
<meta property="og:site_name" content="BIDTOBE1"><meta name="theme-color" content="#05070a">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png">
<link rel="apple-touch-icon" href="/icon-180.png">
<link rel="manifest" href="/site.webmanifest">
${head}<style>${THEME.CSS}</style></head><body>
<a class="skip" href="#main">Skip to content</a>
<div class="ticker">
  <span class="live"><span class="pip"></span>${s.listings} listed</span>
  <span>${money(s.revenue)} committed</span>
  <span>${s.clicks.toLocaleString()} clicks sent</span>
  <span>${s.leads} enquiries</span>
  ${t ? `<span class="vermilion">Takeover — ${esc(t.listing.name)}</span>` : ''}
</div>
<header><nav class="nav">
  <a class="logo" href="/">NZ<i>·</i>Rank</a>
  ${nav.map(([h, l, k]) => `<a class="link ${active === k ? 'on' : ''}" href="${h}">${l}</a>`).join('')}
  <span class="navspace"></span>
  <a class="btn sm verm" href="/submit">Claim a rank</a>
</nav></header>
<div class="page">${body}</div>
<footer>
  <img src="/logo-mark.png" alt="BIDTOBE1" width="46" height="46" style="opacity:.9;margin-bottom:18px">
  <div class="eyebrow" style="justify-content:center;margin-bottom:18px"><span class="dot"></span> One more bid. Be #1.</div>
  <div class="fl"><a href="/rules">Rules</a><a href="/about">About</a><a href="/ask">AI Search</a><a href="/submit">Claim</a></div>
  <div class="fl" style="margin-top:20px;color:#4a534d">Paid placement · listings are advertisements, not editorial rankings · demo payments</div>
</footer>
<script${NONCE ? ` nonce="${NONCE}"` : ''}>${THEME.JS}</script></body></html>`;
}

const badges = l => (l.verified ? '<span class="badge v">Verified</span>' : '')
  + (l.editorPick ? '<span class="badge e">Editor\u2019s pick</span>' : '')
  + `<span class="badge s">AI ${D.visibilityScore(l)}</span>`;

function row(l, i, amount, claimFor, d = 0) {
  return `<div class="row" data-rv="up" data-d="${Math.min(d, 8)}" id="r-${l.id}">
    <div class="rk">${String(i + 1).padStart(2, '0')}</div>
    <img class="ico" src="${fav(l.url)}" alt="" loading="lazy">
    <a class="grow" href="/business/${l.slug}">
      <div class="rname">${esc(l.name)}${badges(l)}</div>
      <div class="rtag">${esc(l.tagline || l.url)}</div>
      <div class="rmeta">${esc(D.catName(l.category))} · ${esc(l.city)} · ${l.clicks.toLocaleString()} clicks · ${ago(l.createdAt)}</div>
    </a>
    <div class="ramt"><b>${money(amount)}</b><span>committed</span></div>
    ${claimFor ? `<a class="claim" href="/raise/${l.id}">Claim → ${money(claimFor)}</a>` : ''}
  </div>`;
}

function podium(list, amountOf) {
  return `<div class="podium">${list.slice(0, 3).map((l, i) => `<div class="pod ${i === 0 ? 'p1' : ''}" data-rv="up" data-d="${i * 2}">
    <div class="pnum">${String(i + 1).padStart(2, '0')}</div>
    <a href="/business/${l.slug}"><div class="pname">${esc(l.name)}</div></a>
    <div class="body" style="min-height:3em">${esc(l.tagline)}</div>
    <div class="pamt">${money(amountOf(l))}</div>
    <div class="pfoot">
      <div class="rmeta">${esc(D.catName(l.category))} · ${esc(l.city)} · ${l.clicks.toLocaleString()} clicks</div>
      <a class="claim" style="display:inline-block;margin-top:14px" href="/raise/${l.id}">Claim this rank → ${money(amountOf(l) + D.RULES.TOP_STEP)}</a>
    </div></div>`).join('')}</div>`;
}

function secHead(n, title, jp) {
  return `<div class="sec-head" data-rv="fade"><span class="k"><b>${roman(n)}</b> — ${esc(title)}</span><span class="rule"></span><span class="k">${esc(jp)}</span></div>`;
}

function filterBar(base, f) {
  const q = extra => { const p = new URLSearchParams({ ...(f.category ? { category: f.category } : {}), ...(f.city ? { city: f.city } : {}), ...extra });
    [...p.entries()].forEach(([k, v]) => { if (!v) p.delete(k); }); const s = p.toString(); return base + (s ? '?' + s : ''); };
  return `<div class="chips" data-rv="fade">${D.CITIES.map(c => `<a class="chip ${f.city === c ? 'on' : ''}" href="${q({ city: f.city === c ? '' : c })}">${esc(c)}</a>`).join('')}</div>
  <div class="chips" data-rv="fade">${D.CATEGORIES.map(c => `<a class="chip ${f.category === c.slug ? 'on' : ''}" href="${q({ category: f.category === c.slug ? '' : c.slug })}">${esc(c.name)}</a>`).join('')}</div>`;
}

function claimBox(f) {
  const need = D.minToTop(f);
  return `<div class="claimbox" data-rv="up" data-d="3">
    <div class="eyebrow"><span class="dot"></span> Claim #1${f.city ? ' · ' + esc(f.city) : ''}${f.category ? ' · ' + esc(D.catName(f.category)) : ''}</div>
    <div class="price">${money(need)}</div>
    <div class="k" style="color:var(--muted)">Minimum to take the top spot</div>
    <form class="claimform" method="post" action="/submit">
      <input name="url" placeholder="yourbusiness.co.nz" required>
      <input name="name" placeholder="Business name" required>
      <div class="two">
        <select name="category">${D.CATEGORIES.map(c => `<option value="${c.slug}" ${f.category === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
        <select name="city">${D.CITIES.map(c => `<option ${f.city === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      </div>
      <div class="two">
        <input name="amount" type="number" min="${D.RULES.MIN_BID}" value="${need}" aria-label="Amount in NZD">
        <button class="btn verm" style="justify-content:center">Claim rank</button>
      </div>
    </form>
    <div class="note">New listings from ${money(D.RULES.MIN_BID)}. Already listed? Enter the same website to raise — you pay only the difference.</div>
  </div>`;
}

function activityFeed() {
  const a = D.recentActivity(7);
  return `<div class="panel feed" data-rv="up"><div class="eyebrow" style="margin-bottom:16px"><span class="dot"></span> Latest activity</div>
  ${a.map(x => `<a href="/business/${x.listing.slug}">
    <img class="ico" style="width:24px;height:24px" src="${fav(x.listing.url)}" alt="" loading="lazy">
    <span class="grow"><span class="fn">${esc(x.listing.name)}</span>
    <span class="fm" style="display:block">#${String(x.rank).padStart(2, '0')} · +${money(x.amount)} · ${ago(x.ts)}</span></span></a>`).join('')
    || '<div class="body">No bids yet.</div>'}</div>`;
}

// ---------------- board ----------------
function board(kind, f, extra = {}) {
  const cfg = {
    all: { list: D.allTime(f), amt: l => l.total, title: 'All-time', jp: '通算', n: 1,
      blurb: 'Everything a business has ever committed. It never expires.' },
    today: { list: D.todayBoard(f), amt: l => l.windowTotal, title: 'Today', jp: '本日', n: 2,
      blurb: 'A rolling twenty-four hours. Each payment counts from the moment you pay, then drops away a day later.' },
    daily: { list: D.dailyBoard(extra.day || D.dayKey(), f), amt: l => l.windowTotal, title: 'Daily · ' + (extra.day || D.dayKey()), jp: '日次', n: 3,
      blurb: 'A calendar day, New Zealand time. The current day stays live; past days freeze as a permanent archive.' },
    momentum: { list: D.momentumBoard(f), amt: l => l.windowTotal, title: 'Momentum', jp: '勢い', n: 4,
      blurb: `Only the last ${D.RULES.DECAY_DAYS} days count. Old spend decays, so the board can never go stale.` }
  }[kind];
  const rest = cfg.list.slice(3);
  return layout(cfg.title + ' · BIDTOBE1', `
  <section class="hero"><div class="wrap" id="main" style="padding-bottom:0">
    <div class="eyebrow" data-rv="fade"><span class="dot"></span> Chapter 00 — New Zealand's public board</div>
    <img class="hero-mark" src="/logo-mark.png" alt="" width="104" height="104" data-rv="fade">
    <h1 class="display h-hero">${words('One more bid.')} <span class="vermilion">${words('Be #1.')}</span></h1>
    <div class="hero-grid">
      <div><p class="body-lg" data-rv="up" data-d="2" style="max-width:46ch">Every business here has paid to stand where it stands.
        Nothing is editorial, nothing is an algorithm. Bid to sit above your competitors in your city and your trade —
        and know that anyone can take it back from you at any moment. That is the whole idea.</p>
        <div style="display:flex;gap:14px;margin-top:32px;flex-wrap:wrap" data-rv="up" data-d="4">
          <a class="btn" href="/submit">Claim a rank ${ARROW}</a>
          <a class="arrowlink" href="/rules">Read the rules <span class="ar">${ARROW}</span></a>
        </div></div>
      ${claimBox(f)}
    </div>
  </div></section>

  <div class="wrap">
    <div class="tabs" data-rv="fade">
      <a class="tab ${kind === 'all' ? 'on' : ''}" href="/">All-time</a>
      <a class="tab ${kind === 'today' ? 'on' : ''}" href="/today">Today</a>
      <a class="tab ${kind === 'daily' ? 'on' : ''}" href="/daily">Daily</a>
      <a class="tab ${kind === 'momentum' ? 'on' : ''}" href="/momentum">Momentum</a>
    </div>
    ${filterBar(kind === 'all' ? '/' : '/' + kind, f)}
    ${secHead(cfg.n, cfg.title + ' — ' + cfg.list.length + ' listed', cfg.jp)}
    <p class="body-lg" data-rv="fade" style="max-width:52ch;margin:-16px 0 0">${esc(cfg.blurb)}</p>
    ${cfg.list.length ? podium(cfg.list, cfg.amt) : ''}
    <div class="split" style="margin-top:clamp(30px,5vh,54px)">
      <div>
        ${cfg.list.length
          ? (rest.length ? `<div class="rows">${rest.map((l, i) => row(l, i + 3, cfg.amt(l), cfg.amt(l) + D.RULES.TOP_STEP, i)).join('')}</div>`
            : '<div class="panel body">Only the top three so far. The rest of the board is open.</div>')
          : `<div class="panel"><div class="rname">The board is empty</div>
             <p class="body" style="margin-top:10px">Nobody has claimed a rank here yet. First listing takes #1 for ${money(D.RULES.MIN_BID)}.</p>
             <a class="btn verm sm" style="margin-top:18px" href="/submit">Take #1</a></div>`}
        ${kind === 'daily' ? `${secHead(5, 'Archive', '記録')}<div class="chips">${D.dailyArchive().map(d =>
          `<a class="chip ${d === (extra.day || D.dayKey()) ? 'on' : ''}" href="/daily?day=${d}">${d}</a>`).join('') || '<span class="body">No archived days yet.</span>'}</div>` : ''}
      </div>
      <div>
        ${activityFeed()}
        <div class="panel catlist" style="margin-top:18px" data-rv="up"><div class="eyebrow" style="margin-bottom:14px"><span class="dot"></span> Category boards</div>
          ${D.CATEGORIES.map(c => `<a href="/category/${c.slug}">${esc(c.name)} <i>${D.allTime({ category: c.slug }).length}</i></a>`).join('')}</div>
        <div class="panel" style="margin-top:18px" data-rv="up"><div class="eyebrow" style="margin-bottom:14px"><span class="dot"></span> Homepage takeover</div>
          <p class="body">Pay ${D.RULES.TAKEOVER_MULTIPLE}× the current #1 and own the banner across every page for ${D.RULES.TAKEOVER_HOURS} hours — whatever the board says.</p>
          <a class="claim" style="display:inline-block;margin-top:14px" href="/takeover">From ${money(Math.max(D.RULES.MIN_BID, (D.allTime()[0]?.total || 0) * D.RULES.TAKEOVER_MULTIPLE))} →</a></div>
      </div>
    </div>
  </div>`, kind, jsonld({
    '@context': 'https://schema.org', '@type': 'ItemList', name: cfg.title, description: cfg.blurb,
    numberOfItems: cfg.list.length,
    itemListElement: cfg.list.slice(0, 20).map((l, i) => ({ '@type': 'ListItem', position: i + 1,
      item: { '@type': 'LocalBusiness', name: l.name, url: l.url, description: l.tagline,
        address: { '@type': 'PostalAddress', addressLocality: l.city, addressCountry: 'NZ' } } }))
  }));
}

function categoryPage(cat, f) {
  const fl = { category: cat.slug, ...(f.city ? { city: f.city } : {}) };
  const list = D.allTime(fl);
  return layout(cat.name + ' · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:clamp(40px,8vh,90px)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> Category board</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:16ch">${words('Best ' + cat.name + (f.city ? ' in ' + f.city : ' in New Zealand'))}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:50ch;margin-top:22px">
        ${list.length} listed, ranked by what each business has committed. To take #1 on this board: <span class="vermilion">${money(D.minToTop(fl))}</span>.</p>
      <div class="chips" data-rv="fade" style="margin-top:26px">${D.CITIES.map(c =>
        `<a class="chip ${f.city === c ? 'on' : ''}" href="/category/${cat.slug}${f.city === c ? '' : '?city=' + encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div>
    </div>
    ${secHead(1, cat.name, '部門')}
    ${list.length ? `<div class="rows">${list.map((l, i) => row(l, i, l.total, l.total + D.RULES.TOP_STEP, i)).join('')}</div>`
      : `<div class="panel"><div class="rname">Unclaimed</div><p class="body" style="margin-top:10px">Nobody holds this category yet.</p>
         <a class="btn verm sm" style="margin-top:18px" href="/submit">Take #1 for ${money(D.RULES.MIN_BID)}</a></div>`}
  </div>`);
}

function profile(l) {
  const overall = D.rankOf(l.id), inCat = D.rankOf(l.id, { category: l.category });
  const catCount = D.allTime({ category: l.category }).length, total = D.allTime().length;
  const also = D.allTime({ category: l.category }).filter(x => x.id !== l.id).slice(0, 5);
  const onToday = D.todayBoard().some(x => x.id === l.id);
  return layout(`${l.name} · #${overall} on BIDTOBE1`, `<div class="wrap" id="main">
    <div style="padding-top:clamp(36px,7vh,80px)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> <a href="/">Board</a> · <a href="/category/${l.category}">${esc(D.catName(l.category))}</a></div>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-top:24px">
        <img class="ico" style="width:56px;height:56px" src="${fav(l.url)}" alt="" data-rv="fade">
        <div><h1 class="display h-page" style="max-width:18ch">${words(l.name)}</h1>
          <div class="rmeta" data-rv="fade" style="margin-top:14px">${esc(D.catName(l.category))} · ${esc(l.city)} · ${l.clicks.toLocaleString()} clicks · ${ago(l.createdAt)} ${badges(l)}</div></div>
      </div>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:52ch;margin-top:26px">${esc(l.tagline)}</p>
      <div style="display:flex;gap:14px;margin-top:30px;flex-wrap:wrap" data-rv="up" data-d="3">
        <a class="btn" href="/go/${l.id}" target="_blank" rel="nofollow noopener">Visit website ${ARROW}</a>
        <a class="btn ghost" href="/raise/${l.id}">Outbid / raise</a>
        <a class="btn ghost" href="#enquiry">Request a quote</a>
      </div>
    </div>
    <div class="stats" data-rv="up">
      <div class="stat"><span>Category rank</span><b>#${String(inCat).padStart(2, '0')}</b><span style="margin-top:6px">of ${catCount} in ${esc(D.catName(l.category))}</span></div>
      <div class="stat"><span>Overall</span><b>#${String(overall).padStart(2, '0')}</b><span style="margin-top:6px">of ${total} on the board</span></div>
      <div class="stat"><span>Committed</span><b>${money(l.total)}</b><span style="margin-top:6px">raised ${l.raises} time${l.raises === 1 ? '' : 's'}</span></div>
      <div class="stat"><span>AI visibility</span><b>${D.visibilityScore(l)}</b><span style="margin-top:6px">out of 100</span></div>
    </div>
    <div class="split">
      <div>
        ${secHead(1, 'About this ranking', '順位')}
        <div class="q"><h3>What rank does ${esc(l.name)} hold?</h3>
          <p class="body">${esc(l.name)} has committed ${money(l.total)} to rank #${inCat} of ${catCount} in ${esc(D.catName(l.category))}, and #${overall} of ${total} overall.</p></div>
        <div class="q"><h3>Have they ranked today?</h3>
          <p class="body">${onToday ? 'Yes — they have added spend in the last twenty-four hours and appear on <a class="vermilion" href="/today">today\'s board</a>.' : 'No spend in the last twenty-four hours, so they are not on today\'s board.'}</p></div>
        <div class="q"><h3>How do I outrank them?</h3>
          <p class="body">Anyone can take this rank for <span class="vermilion">${money(l.total + D.RULES.TOP_STEP)}</span> on the ${esc(D.catName(l.category))} board. <a class="claim" href="/raise/${l.id}">Do it →</a></p></div>
        <div class="q"><h3>Is this an editorial recommendation?</h3>
          <p class="body">No. Rank is paid placement. The AI Visibility Score and the Verified badge are the parts that are never for sale.</p></div>

        ${secHead(2, 'AI visibility score', '評価')}
        <div class="panel" data-rv="up">
          ${D.scoreBreakdown(l).map(([k, v, m]) => `<div style="margin:16px 0">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <span class="k" style="color:var(--bone-dim)">${k}</span><span class="num" style="font-size:15px">${v}/${m}</span></div>
            <div class="bar"><i style="width:${(v / m) * 100}%"></i></div></div>`).join('')}
          <div class="note">Unlike rank, this score cannot be bought outright — committed spend is capped at 35 of 100.</div>
        </div>

        ${secHead(3, 'Request a quote', '問合')}
        <form class="panel" method="post" action="/lead/${l.id}" id="enquiry" data-rv="up">
          <label>Your name<input name="name" required></label>
          <label>Email<input name="email" type="email" required></label>
          <label>Phone<input name="phone"></label>
          <label>What do you need?<textarea name="message" rows="3" placeholder="e.g. AI receptionist for a six-person clinic in Auckland"></textarea></label>
          <button class="btn verm" style="margin-top:24px">Send enquiry ${ARROW}</button>
          <div class="note">Goes straight to the business. BIDTOBE1 never sells your details.</div>
        </form>
      </div>
      <div style="padding-top:clamp(56px,9vh,110px)">
        <div class="panel" data-rv="up"><div class="eyebrow" style="margin-bottom:16px"><span class="dot"></span> Contact</div>
          <div class="k" style="color:var(--muted)">Website</div><a class="body" style="color:var(--bone);display:block;margin-bottom:14px" href="/go/${l.id}">${esc(l.url)}</a>
          ${l.phone ? `<div class="k" style="color:var(--muted)">Phone</div><div class="body" style="color:var(--bone);margin-bottom:14px">${esc(l.phone)}</div>` : ''}
          ${l.email ? `<div class="k" style="color:var(--muted)">Email</div><div class="body" style="color:var(--bone);margin-bottom:14px">${esc(l.email)}</div>` : ''}
          <div class="k" style="color:var(--muted)">Serving</div><div class="body" style="color:var(--bone)">${esc(l.city)}</div></div>
        <div class="panel catlist" style="margin-top:18px" data-rv="up"><div class="eyebrow" style="margin-bottom:14px"><span class="dot"></span> Also in ${esc(D.catName(l.category))}</div>
          ${also.map(x => `<a href="/business/${x.slug}">${String(D.rankOf(x.id, { category: x.category })).padStart(2, '0')} · ${esc(x.name)} <i>${money(x.total)}</i></a>`).join('') || '<div class="body">Nobody else yet.</div>'}</div>
      </div>
    </div>
  </div>`, '', jsonld([
    { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: l.name, url: l.url, description: l.tagline,
      telephone: l.phone || undefined, email: l.email || undefined,
      address: { '@type': 'PostalAddress', addressLocality: l.city, addressCountry: 'NZ' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What rank does ${l.name} hold on BIDTOBE1?`, acceptedAnswer: { '@type': 'Answer',
        text: `${l.name} has committed $${l.total} to rank #${inCat} of ${catCount} in ${D.catName(l.category)} and #${overall} of ${total} overall.` } },
      { '@type': 'Question', name: `How do I outrank ${l.name}?`, acceptedAnswer: { '@type': 'Answer',
        text: `Anyone can take this rank for $${l.total + D.RULES.TOP_STEP} on the ${D.catName(l.category)} board.` } },
      { '@type': 'Question', name: 'Is this an editorial recommendation?', acceptedAnswer: { '@type': 'Answer',
        text: 'No. Rank is paid placement. The AI Visibility Score and Verified badge are not for sale.' } }] }
  ]));
}

function submit(err, v = {}) {
  return layout('Claim a rank · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:clamp(40px,8vh,90px)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> Chapter 01 — The claim</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:14ch">${words('Take your place on the board.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:52ch;margin-top:22px">
        New listings start at ${money(D.RULES.MIN_BID)}. Taking #1 overall currently costs ${money(D.minToTop())}.
        Paying less still puts you on the board, at whatever rank that amount can hold.</p>
    </div>
    ${err ? `<div class="err" data-rv="fade">${esc(err)}</div>` : ''}
    <div class="split" style="margin-top:clamp(32px,5vh,56px)">
      <form class="panel" method="post" action="/submit" data-rv="up">
        <label>Website<input name="url" placeholder="yourbusiness.co.nz" required value="${esc(v.url)}"></label>
        <label>Business name<input name="name" required value="${esc(v.name)}"></label>
        <label>One-line pitch<input name="tagline" maxlength="140" value="${esc(v.tagline)}"></label>
        <label>Category<select name="category">${D.CATEGORIES.map(c => `<option value="${c.slug}" ${v.category === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
        <label>City / region<select name="city">${D.CITIES.map(c => `<option ${v.city === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
        <label>Phone<input name="phone" value="${esc(v.phone)}"></label>
        <label>Email<input name="email" value="${esc(v.email)}"></label>
        <label>Amount in NZD<input name="amount" type="number" min="${D.RULES.MIN_BID}" value="${esc(v.amount || D.RULES.MIN_BID)}"></label>
        <button class="btn verm" style="margin-top:26px">Pay and claim my rank ${ARROW}</button>
        <div class="note">Demo mode — no card is charged. The Stripe hook is marked in server.js.</div>
      </form>
      <div style="padding-top:6px">
        <div class="panel" data-rv="up"><div class="eyebrow" style="margin-bottom:16px"><span class="dot"></span> What you get</div>
          <ul class="list">
            <li>A ranked position on the all-time, today, daily and momentum boards</li>
            <li>Your own profile page with a working lead form</li>
            <li>Tracked outbound clicks and a private analytics dashboard</li>
            <li>An AI Visibility Score, and inclusion in AI search answers</li>
          </ul></div>
        <div class="note" style="margin-top:20px">Payments are final. Your rank is not guaranteed — anyone can outbid you at any time.</div>
      </div>
    </div>
  </div>`);
}

function raise(l, err) {
  const needTop = D.minToTop(), needCat = D.minToTop({ category: l.category });
  return layout('Raise ' + l.name, `<div class="wrap" id="main">
    <div style="padding-top:clamp(40px,8vh,90px)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> Raise a listing</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:16ch">${words(l.name)}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="margin-top:20px">Currently ${money(l.total)}, sitting at #${D.rankOf(l.id)}. You pay only the difference.</p>
    </div>
    ${err ? `<div class="err">${esc(err)}</div>` : ''}
    <form class="panel" method="post" action="/raise/${l.id}" style="margin-top:34px;max-width:520px" data-rv="up">
      <label>Add amount in NZD<input name="amount" type="number" min="${D.RULES.RAISE_STEP}" value="${Math.max(D.RULES.RAISE_STEP, needCat - l.total)}"></label>
      <ul class="list" style="margin-top:22px">
        <li>+${money(Math.max(1, needCat - l.total))} takes #1 in ${esc(D.catName(l.category))}</li>
        <li>+${money(Math.max(1, needTop - l.total))} takes #1 overall</li>
      </ul>
      <button class="btn verm" style="margin-top:26px">Pay and climb ${ARROW}</button>
    </form>
  </div>`);
}

function takeover(err) {
  const list = D.allTime(), need = Math.max(D.RULES.MIN_BID, (list[0]?.total || 0) * D.RULES.TAKEOVER_MULTIPLE);
  return layout('Homepage takeover · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:clamp(40px,8vh,90px)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> Chapter 02 — The takeover</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:14ch">${words('Skip the queue entirely.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:52ch;margin-top:22px">
        Pay ${D.RULES.TAKEOVER_MULTIPLE}× the current #1 — ${money(need)} — and your business owns the banner across every page
        for ${D.RULES.TAKEOVER_HOURS} hours, regardless of what the board says. The spend still counts toward your normal rank.</p>
    </div>
    ${err ? `<div class="err">${esc(err)}</div>` : ''}
    <form class="panel" method="post" action="/takeover" style="margin-top:34px;max-width:520px" data-rv="up">
      <label>Listing<select name="listingId">${list.map(l => `<option value="${l.id}">${esc(l.name)} — ${money(l.total)}</option>`).join('')}</select></label>
      <label>Amount in NZD<input name="amount" type="number" min="${need}" value="${need}"></label>
      <button class="btn verm" style="margin-top:26px">Buy the takeover ${ARROW}</button>
    </form>
  </div>`);
}

function rules() {
  const R = D.RULES;
  return layout('Rules · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:clamp(40px,8vh,90px)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> The manifesto</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:12ch">${words('One rule runs every board.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:54ch;margin-top:24px">
        BIDTOBE1 is a public leaderboard for New Zealand businesses. No ads, no algorithm, no editorial score deciding position.
        You pay to stand above everyone else. Rank is what you pay — nothing else.</p>
    </div>
    ${secHead(1, 'The boards', '盤面')}
    <p class="body-lg" data-rv="fade" style="max-width:54ch;margin-top:-14px">One payment ranks you on every board that includes that spend. The boards simply look at different windows of time.</p>
    <ul class="list" data-rv="up" style="margin-top:26px">
      <li><span><b style="color:var(--bone);font-weight:400">All-time</b> — the main board. Rank is everything you have ever paid for that listing. It does not expire.</span></li>
      <li><span><b style="color:var(--bone);font-weight:400">Today</b> — a rolling twenty-four hours. Each payment counts from the moment you pay, then drops off a day later.</span></li>
      <li><span><b style="color:var(--bone);font-weight:400">Daily</b> — a calendar day in New Zealand time. The current day stays live; past days freeze as an archive.</span></li>
      <li><span><b style="color:var(--bone);font-weight:400">Momentum</b> — only the last ${R.DECAY_DAYS} days count. Old spend decays out, so an early whale cannot own the board forever.</span></li>
      <li><span><b style="color:var(--bone);font-weight:400">Category and city</b> — every listing also competes inside its trade and its city, so ${money(50)} can still buy #1 in Hamilton plumbing.</span></li>
    </ul>
    ${secHead(2, 'How ranking works', '規則')}
    <ul class="list" data-rv="up">
      <li>New listings are whole New Zealand dollars — ${money(R.MIN_BID)} minimum, ${money(R.MAX_BID)} maximum.</li>
      <li>Taking #1 costs at least ${money(R.TOP_STEP)} more than the current #1. Paying less still puts you on the board at whatever rank that amount can take.</li>
      <li>Equal amounts stay in the order they were placed — the older listing keeps the higher rank.</li>
      <li>Already on the board? Enter the same website again to raise. The new amount must be at least ${money(R.RAISE_STEP)} above your current total, and checkout charges only the difference. Someone else cannot take your rank by paying that difference.</li>
      <li>Listings are keyed by website, with tracking query strings ignored, so one business cannot occupy two ranks.</li>
      <li>A homepage takeover costs ${R.TAKEOVER_MULTIPLE}× the current #1 and lasts ${R.TAKEOVER_HOURS} hours.</li>
    </ul>
    ${secHead(3, 'What you can list', '掲載')}
    <ul class="list" data-rv="up">
      <li>A real business website, or an X / LinkedIn profile. Products and profiles only — no chat invites, no link shorteners, no adult content, no scams or unlicensed financial services.</li>
      <li>Listed businesses must show valid company details. We may ask for an NZBN.</li>
      <li>Regulated trades — electrical, gas, building, legal, financial advice — must hold current New Zealand licensing.</li>
    </ul>
    ${secHead(4, 'Badges are never for sale', '認証')}
    <p class="body-lg" data-rv="fade" style="max-width:54ch;margin-top:-14px">
      A <span class="badge v">Verified</span> badge means we checked the NZBN and the licensing. An
      <span class="badge e">Editor's pick</span> means a human looked and liked it. Neither can be bought — only position can.
      This is the line that keeps the board worth reading.</p>
    ${secHead(5, 'After you pay', '決済')}
    <ul class="list" data-rv="up">
      <li>Your listing is public. Clicks go to the URL you submitted, with query parameters stripped.</li>
      <li>A completed payment is what claims the rank. Payments are not refundable and rank is not guaranteed.</li>
      <li>Paid placement is disclosed on every board, as required by the Fair Trading Act.</li>
    </ul>
  </div>`, 'rules');
}

function about() {
  const s = D.stats();
  return layout('About · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:clamp(40px,8vh,90px)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> About</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:13ch">${words('A public board, honestly priced.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:54ch;margin-top:24px">
        BIDTOBE1 is a leaderboard for New Zealand businesses: no ads, no API keys, no revenue sharing. Claim #1 in your city
        and your trade — that is it. Then we add the part a pure bid board does not have: real profiles, tracked enquiries,
        and an AI Visibility Score that money cannot fully buy.</p>
    </div>
    ${secHead(1, 'The board so far', '実績')}
    <div class="stats" data-rv="up">
      <div class="stat"><span>Visitors</span><b>${s.visitors.toLocaleString()}</b></div>
      <div class="stat"><span>Committed</span><b>${money(s.revenue)}</b></div>
      <div class="stat"><span>Listed</span><b>${s.listings}</b></div>
      <div class="stat"><span>Highest rank</span><b>${money(s.top)}</b></div>
      <div class="stat"><span>Clicks sent</span><b>${s.clicks.toLocaleString()}</b></div>
      <div class="stat"><span>Enquiries</span><b>${s.leads.toLocaleString()}</b></div>
    </div>
    ${secHead(2, 'From those who took #1', '声')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px" data-rv="up">
      <div class="tw"><b>Auckland AI agency</b>Spent $850 to hold #1 in AI &amp; Automation Auckland. Fourteen enquiries in nine days, two became retainers.</div>
      <div class="tw"><b>Christchurch plumber</b>$120 for #1 in my city board. Cheaper than one week of Google Ads, and I can actually see the clicks.</div>
      <div class="tw"><b>Wellington law firm</b>The visibility score told us our profile was incomplete. We fixed it and the click-through doubled.</div>
    </div>
    <div class="note" style="margin-top:24px">These are illustrative placeholders for the MVP. Never publish customer results you cannot evidence —
      under the Fair Trading Act, unverified testimonials are a real risk.</div>
    ${secHead(3, 'The rule', '原則')}
    <p class="display h-sec" data-rv="up" style="max-width:16ch">${words('Rank is what you pay.')}</p>
    <p class="body-lg" data-rv="fade" style="max-width:48ch;margin-top:22px">The board is here. Same rules for everyone. Nothing else decides it.</p>
  </div>`, 'about');
}

function ask(q, results) {
  return layout('Ask · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:clamp(40px,8vh,90px)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> AI search</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:14ch">${words('Ask for a business.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:52ch;margin-top:22px">
        Plain English. The matcher reads the whole board — trade, city, visibility score, click-through and enquiry history —
        not simply who paid the most.</p>
      <form method="get" action="/ask" style="margin-top:30px;max-width:640px;display:flex;gap:10px;flex-wrap:wrap" data-rv="up" data-d="3">
        <input name="q" value="${esc(q)}" placeholder="Best AI receptionist in Auckland for a small law firm" style="flex:1;min-width:240px">
        <button class="btn verm">Ask ${ARROW}</button>
      </form>
    </div>
    ${q ? `${secHead(1, 'Top matches', '結果')}
      ${results.length ? `<div class="rows">${results.map((l, i) => row(l, i, l.total, null, i)).join('')}</div>`
        : '<div class="panel body">No matches yet — the board is still small.</div>'}
      <div class="note" style="margin-top:24px">Ranking here blends paid position with performance signals, and paid placement is always disclosed.
        Swap this deterministic matcher for an LLM over the same data when you are ready.</div>` : ''}
  </div>`, 'ask');
}

function dashboard(l, owned = []) {
  if (!l) {
    return layout('Dashboard · BIDTOBE1', `<div class="wrap" id="main">
      <div style="padding-top:clamp(40px,8vh,90px)">
        <div class="eyebrow" data-rv="fade"><span class="dot"></span> Private</div>
        <h1 class="display h-page" style="margin-top:20px;max-width:14ch">${words('Your listings.')}</h1>
        <p class="body-lg" data-rv="up" data-d="2" style="max-width:52ch;margin-top:22px">
          Enquiries and analytics are private to the business that owns the listing. Claim or raise one from this browser to unlock it.</p>
      </div>
      ${secHead(1, 'Owned by you', '管理')}
      ${owned.length ? `<div class="rows">${owned.map((x, i) => `<div class="row" data-rv="up" data-d="${i}">
        <div class="rk">${String(D.rankOf(x.id)).padStart(2, '0')}</div>
        <img class="ico" src="${fav(x.url)}" alt="">
        <a class="grow" href="/dashboard?id=${x.id}"><div class="rname">${esc(x.name)}</div>
          <div class="rmeta">${esc(D.catName(x.category))} · ${esc(x.city)}</div></a>
        <div class="ramt"><b>${money(x.total)}</b><span>committed</span></div></div>`).join('')}</div>`
        : `<div class="panel"><div class="rname">Nothing here yet</div>
           <p class="body" style="margin-top:10px">You do not own a listing in this browser.</p>
           <a class="btn verm sm" style="margin-top:18px" href="/submit">Claim a rank</a></div>`}
    </div>`, 'dash');
  }
  const catCity = { category: l.category, city: l.city };
  const rank = D.rankOf(l.id, catCity), boardList = D.allTime(catCity);
  const above = boardList[rank - 2];
  const leads = D.leadsFor(l.id).slice().reverse();
  const ctr = l.views ? (l.clicks / l.views * 100).toFixed(1) : '0.0';
  return layout('Dashboard · ' + l.name, `<div class="wrap" id="main">
    <div style="padding-top:clamp(40px,8vh,90px)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> Private dashboard</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:16ch">${words(l.name)}</h1>
      <div style="margin-top:18px" data-rv="fade"><a class="arrowlink" href="/business/${l.slug}">View public profile <span class="ar">${ARROW}</span></a></div>
    </div>
    <div class="stats" data-rv="up">
      <div class="stat"><span>Rank · ${esc(l.city)}</span><b>#${String(rank).padStart(2, '0')}</b></div>
      <div class="stat"><span>Committed</span><b>${money(l.total)}</b></div>
      <div class="stat"><span>Profile views</span><b>${l.views.toLocaleString()}</b></div>
      <div class="stat"><span>Website clicks</span><b>${l.clicks.toLocaleString()}</b></div>
      <div class="stat"><span>Click-through</span><b>${ctr}%</b></div>
      <div class="stat"><span>Enquiries</span><b>${leads.length}</b></div>
      <div class="stat"><span>Cost per click</span><b>${l.clicks ? money(l.total / l.clicks) : '—'}</b></div>
      <div class="stat"><span>Cost per enquiry</span><b>${leads.length ? money(l.total / leads.length) : '—'}</b></div>
    </div>
    ${secHead(1, 'Recommendations', '助言')}
    <ul class="list" data-rv="up">
      ${above ? `<li><span><b style="color:var(--bone);font-weight:400">${esc(above.name)}</b> is one place above you on ${money(above.total)}.
        <a class="claim" href="/raise/${l.id}">+${money(above.total - l.total + D.RULES.TOP_STEP)} takes their spot →</a></span></li>`
        : '<li><span>You hold #1 on this board. Outbids are instant — watch the activity feed.</span></li>'}
      ${l.views > 20 && l.clicks / l.views < 0.1 ? '<li><span>Click-through is under ten percent. Your one-line pitch is doing the selling — make it specific and outcome-led.</span></li>'
        : '<li><span>Click-through looks healthy for your position.</span></li>'}
      ${!l.phone || !l.email ? '<li><span>Add a phone number and email — profile completeness is worth up to twenty points of visibility score.</span></li>'
        : '<li><span>Profile is complete — full twenty points on completeness.</span></li>'}
      ${!D.todayBoard().some(x => x.id === l.id) ? '<li><span>You are not on today\u2019s board. A small daily top-up keeps you visible on Today and Momentum for far less than defending all-time #1.</span></li>'
        : '<li><span>You are live on today\u2019s board.</span></li>'}
      ${leads.length === 0 ? '<li><span>No enquiries yet. Businesses with a filled-out pitch and a phone number convert roughly twice as often.</span></li>'
        : `<li><span>${leads.length} enquiries at ${money(l.total / leads.length)} each — compare that with your usual cost per lead before raising.</span></li>`}
    </ul>
    ${secHead(2, 'Enquiries', '問合')}
    ${leads.length ? `<div class="rows">${leads.map((x, i) => `<div class="row" data-rv="up" data-d="${i}">
      <div class="grow"><div class="rname">${esc(x.name)}</div>
        <div class="body" style="margin-top:6px">${esc(x.message)}</div>
        <div class="rmeta">${esc(x.email)}${x.phone ? ' · ' + esc(x.phone) : ''} · ${new Date(x.ts).toLocaleString('en-NZ')}</div></div></div>`).join('')}</div>`
      : '<div class="panel body">No enquiries yet.</div>'}
    <div style="display:flex;gap:14px;margin-top:36px;flex-wrap:wrap" data-rv="up">
      <a class="btn verm" href="/raise/${l.id}">Climb the board ${ARROW}</a>
      <a class="btn ghost" href="/takeover">Buy a takeover</a>
    </div>
  </div>`, 'dash');
}

module.exports = { setNonce, jsonld, layout, board, categoryPage, profile, submit, raise, takeover, rules, about, ask, dashboard, esc, money };
