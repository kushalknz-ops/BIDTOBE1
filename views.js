const D = require('./db');
const THEME = require('./theme');
const UI = require('./ui');
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
// Safe JSON for embedding inside <script>: neutralises </script>, HTML comments and JS line separators.
const safeJson = o => JSON.stringify(o)
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const ARROW = '<svg viewBox="0 0 13 13" fill="none"><path d="M2 11L11 2M11 2H4M11 2V9" stroke="#dfe7e0" stroke-width="1.2"/></svg>';

function layout(title, body, active = '', head = '', opts = {}) {
  const s = D.stats(), t = D.currentTakeover();
  const nav = [['/', 'Categories', 'all'], ['/nz', 'All NZ', 'nz'], ['/today', 'Today', 'today'],
    ['/ask', 'Ask', 'ask'], ['/rules', 'Rules', 'rules'], ['/about', 'About', 'about'],
    ['/dashboard', 'Dashboard', 'dash']];
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
${head}<style>${THEME.CSS}${UI.CSS}</style></head><body>
<a class="skip" href="#main">Skip to content</a>
<div class="ticker">
  <span class="live"><span class="pip"></span>${s.listings} listed</span>
  <span>${money(s.revenue)} committed</span>
  <span>${s.clicks.toLocaleString()} clicks sent</span>
  <span>${s.leads} enquiries</span>
  ${t ? `<span class="vermilion">Takeover — ${esc(t.listing.name)}</span>` : ''}
</div>
<header><nav class="nav" id="nav">
  <a class="logo" href="/" aria-label="BIDTOBE1 home">
    <img src="/logo-mark.png" alt="" width="26" height="26">
    <span>BIDTOBE<i>1</i></span>
  </a>
  <div class="navlinks" id="navlinks">
    ${nav.map(([h, l, k]) => `<a class="link ${active === k ? 'on' : ''}" href="${h}">${l}</a>`).join('')}
    <a class="btn sm verm navcta" href="/submit">Claim a rank</a>
  </div>
  <button class="cmd-trigger" type="button" aria-label="Search (Command K)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
    <span class="ct-label">Search</span><span class="kbd">${'\u2318'}K</span>
  </button>
  <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="navlinks">
    <span></span><span></span>
  </button>
</nav></header>
<div class="page">${body}</div>
<footer>
  <img src="/logo-mark.png" alt="BIDTOBE1" width="46" height="46" style="opacity:.9;margin-bottom:18px">
  <div class="eyebrow" style="justify-content:center;margin-bottom:18px"><span class="dot"></span> One more bid. Be #1.</div>
  <div class="fl"><a href="/rules">Rules</a><a href="/about">About</a><a href="/ask">AI Search</a><a href="/submit">Claim</a></div>
  <div class="fl" style="margin-top:20px;color:#4a534d">Paid placement · listings are advertisements, not editorial rankings · demo payments</div>
</footer>
<script${NONCE ? ` nonce="${NONCE}"` : ''}>window.__CMD__=${safeJson(opts.noIndex ? commandData().filter(c => c.group === 'Go to') : commandData())};</script>
<script${NONCE ? ` nonce="${NONCE}"` : ''}>${THEME.JS}${UI.JS}</script></body></html>`;
}

function commandData() {
  const out = [];
  D.allTime().slice(0, 60).forEach(l => out.push({
    group: 'Businesses', label: l.name, meta: '#' + D.rankOf(l.id) + ' \u00b7 ' + money(l.total),
    href: '/business/' + l.slug, icon: '\u25b8'
  }));
  D.CATEGORIES.forEach(c => out.push({ group: 'Categories', label: c.name,
    meta: D.allTime({ category: c.slug }).length + ' listed', href: '/category/' + c.slug, icon: '\u25c7' }));

  [['Claim a rank', '/submit'], ['All-time board', '/'], ["Today's board", '/today'],
   ['Ask AI', '/ask'], ['Rules', '/rules'],
   ['My dashboard', '/dashboard'], ['Homepage takeover', '/takeover']]
    .forEach(([label, href]) => out.push({ group: 'Go to', label, href, icon: '\u2192' }));
  return out;
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

function featuredCard(top, amount, catSlug, opts = {}) {
  const step = D.RULES.TOP_STEP;
  const lab = opts.national ? 'All over New Zealand' : (catSlug ? D.catName(catSlug) : 'New Zealand');
  const price = catSlug ? D.minToTopCategory(catSlug) : amount + step;
  return `<article class="t1${opts.national ? ' t1-nz' : ''}" data-rv="up">
    <div class="t1-info">
      <div class="t1-rank"><span class="t1-num">01</span><span class="t1-lab">${esc(lab)}</span></div>
      <a href="/business/${top.slug}"><h3 class="t1-name">${esc(top.name)}</h3></a>
      <div class="t1-badges">${badges(top)}</div>
      <dl class="t1-dl">
        <div><dt>Bid</dt><dd class="t1-amt">${money(amount)}</dd></div>
        <div><dt>Category</dt><dd><a href="/category/${top.category}">${esc(D.catName(top.category))}</a></dd></div>
        ${opts.national ? `<div><dt>Reached</dt><dd>${new Date(top.reachedAt || top.createdAt).toLocaleString('en-NZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</dd></div>` : ''}
        <div><dt>Operating</dt><dd>${esc(top.city)}</dd></div>
        <div><dt>Clicks sent</dt><dd>${top.clicks.toLocaleString()}</dd></div>
        ${top.phone ? `<div><dt>Phone</dt><dd>${esc(top.phone)}</dd></div>` : ''}
      </dl>
      <a class="claim t1-claim" href="/raise/${top.id}">Take this rank \u2192 ${money(price)}</a>
    </div>
    <div class="t1-ad">
      <span class="t1-adtag">Their message</span>
      <p class="t1-pitch">${esc(top.tagline || top.name + ' holds the top rank.')}</p>
      <div class="t1-actions">
        <a class="btn" href="/go/${top.id}" target="_blank" rel="nofollow noopener">Visit website ${ARROW}</a>
        <a class="btn ghost" href="/business/${top.slug}#enquiry">Request a quote</a>
      </div>
      <div class="t1-score"><span>Visibility ${D.visibilityScore(top)}/100</span><i style="width:${D.visibilityScore(top)}%"></i></div>
    </div>
  </article>`;
}

// Tiered board: 01 featured, 02/03 pair, 04+ compact rows. Any number of companies.
function boardTiers(list, amountOf, catSlug) {
  if (!list.length) return '';
  const step = D.RULES.TOP_STEP;
  const second = list.slice(1, 3), restTier = list.slice(3);

  const pair = second.length ? `<div class="t2">${second.map((l, i) => `<article class="t2-card" data-rv="up" data-d="${i * 2}">
      <div class="t2-head"><span class="t2-num">${String(i + 2).padStart(2, '0')}</span>
        <img class="t2-ico" src="${fav(l.url)}" alt="" loading="lazy"></div>
      <a href="/business/${l.slug}"><h3 class="t2-name">${esc(l.name)}</h3></a>
      <p class="t2-pitch">${esc(l.tagline)}</p>
      <div class="t2-foot">
        <span class="t2-amt">${money(amountOf(l))}</span>
        <span class="rmeta">${esc(D.catName(l.category))} \u00b7 ${l.clicks.toLocaleString()} clicks</span>
        <a class="claim" href="/raise/${l.id}">Take this rank \u2192 ${money(amountOf(l) + step)}</a>
      </div>
    </article>`).join('')}</div>` : '';

  const rows = restTier.length ? `<div class="t3">${restTier.map((l, i) => `<a class="t3-row" href="/business/${l.slug}" data-rv="up" data-d="${Math.min(i, 8)}">
      <span class="t3-num">${String(i + 4).padStart(2, '0')}</span>
      <img class="t3-ico" src="${fav(l.url)}" alt="" loading="lazy">
      <span class="t3-name">${esc(l.name)}</span>
      <span class="t3-pitch">${esc(l.tagline)}</span>
      <span class="t3-meta">${esc(D.catName(l.category))}</span>
      <span class="t3-amt">${money(amountOf(l))}</span>
      <span class="t3-claim">${money(amountOf(l) + step)} \u2192</span>
    </a>`).join('')}</div>` : '';

  return featuredCard(list[0], amountOf(list[0]), catSlug) + pair + rows;
}

function secHead(n, title, meta) {
  return `<div class="sec-head" data-rv="fade"><h2 class="k">${esc(title)}</h2><span class="rule"></span>${meta ? `<span class="k k-meta">${esc(meta)}</span>` : ''}</div>`;
}

function filterBar(base, f) {
  const q = cat => base + (cat ? '?category=' + cat : '');
  return `<div class="chips" data-rv="fade">
    <a class="chip ${!f.category ? 'on' : ''}" href="${q('')}">All of New Zealand</a>
    ${D.CATEGORIES.map(c => `<a class="chip ${f.category === c.slug ? 'on' : ''}" href="${q(f.category === c.slug ? '' : c.slug)}">${esc(c.name)}</a>`).join('')}</div>`;
}

function claimBox(f) {
  const cat = f.category || D.CATEGORIES[0].slug;
  const need = D.minToTopCategory(cat);
  return `<div class="claimbox" data-rv="up" data-d="3">
    <div class="eyebrow"><span class="dot"></span> Claim #1 in ${esc(D.catName(cat))}</div>
    <div class="price">${money(need)}</div>
    <div class="k" style="color:#c9d1cc">Minimum to lead this category</div>
    <form class="claimform" method="post" action="/submit">
      <input name="url" placeholder="yourbusiness.co.nz" required>
      <input name="name" placeholder="Business name" required>
      <select name="category" aria-label="Category" onchange="location.href='/?category='+this.value">${D.CATEGORIES.map(c => `<option value="${c.slug}" ${cat === c.slug ? 'selected' : ''}>${esc(c.name)} \u2014 ${money(D.minToTopCategory(c.slug))}</option>`).join('')}</select>
      <div class="two">
        <input name="amount" type="number" min="${D.RULES.MIN_BID}" value="${need}" aria-label="Amount in NZD">
        <button class="btn verm" style="justify-content:center">Claim rank</button>
      </div>
    </form>
    <div class="note">New listings from ${money(D.RULES.MIN_BID)}. Already listed? Enter the same website to raise — you pay only the difference.</div>
  </div>`;
}

function categoryGrid() {
  const prices = D.categoryPrices();
  const live = prices.filter(c => c.count), open = prices.filter(c => !c.count);
  return `<div class="catgrid" data-rv="up">
    ${live.map(c => `<a class="cg" href="/category/${c.slug}">
      <div class="cg-top"><span class="cg-name">${esc(c.name)}</span><span class="cg-n">${c.count}</span></div>
      <div class="cg-leader"><img class="cg-ico" src="${fav(c.leader.url)}" alt="" loading="lazy">
        <span>${esc(c.leader.name)}</span></div>
      <div class="cg-foot"><span class="cg-amt">${money(c.top)}</span>
        <span class="cg-price">Take #1 \u00b7 ${money(c.priceToTop)}</span></div>
    </a>`).join('')}
    ${open.map(c => `<a class="cg cg-open" href="/category/${c.slug}">
      <div class="cg-top"><span class="cg-name">${esc(c.name)}</span></div>
      <div class="cg-leader cg-none">Unclaimed</div>
      <div class="cg-foot"><span class="cg-amt">\u2014</span><span class="cg-price">Take #1 \u00b7 ${money(c.priceToTop)}</span></div>
    </a>`).join('')}
  </div>`;
}

function heroProof(list, amt) {
  const s = D.stats();
  const leaders = D.categoryLeaders().slice(0, 3);
  if (!leaders.length) return '';
  return `<div class="hero-proof" data-rv="up" data-d="6">
    <div class="hp-lab">Leading each category</div>
    <div class="hp-rows">
      ${leaders.map((l, i) => `<a class="hp-row" href="/category/${l.categorySlug}">
        <span class="hp-rk">${String(i + 1).padStart(2, '0')}</span>
        <img class="hp-ico" src="${fav(l.url)}" alt="" loading="lazy">
        <span class="hp-name">${esc(l.name)}</span>
        <span class="hp-amt">${money(l.total)}</span></a>`).join('')}
    </div>
    <div class="hp-stats">
      <div><b>${s.listings}</b><span>businesses</span></div>
      <div><b>${money(s.revenue)}</b><span>committed</span></div>
      <div><b>${s.clicks.toLocaleString()}</b><span>clicks sent</span></div>
    </div>
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
    all: { list: D.allTime(f), amt: l => l.total,
      title: f.category ? D.catName(f.category) : 'All-time', n: 1,
      lede: "New Zealand's public board", head: ['One more bid.', 'Be #1.'],
      intro: 'Pick your category and outbid the business above you. Every category is its own auction with its own price \u2014 leading Trades costs nothing like leading AI. Win yours, then see where it puts you nationally.',
      blurb: f.category
        ? `Ranked by everything committed in ${D.catName(f.category)}. Every listing also holds a place on the national board.`
        : 'Everything a business has ever committed, across all of New Zealand. It never expires.' },
    today: { list: D.todayBoard(f), amt: l => l.windowTotal,
      title: f.category ? D.catName(f.category) + ' \u00b7 today' : 'Today', n: 2,
      lede: 'Rolling 24 hours', head: ['Today\u2019s board.'],
      intro: 'Only what was committed in the last twenty-four hours. Each payment counts from the moment you pay, then drops away a day later \u2014 so this board resets itself continuously.',
      blurb: 'Ranked by spend in the last twenty-four hours.' }
  }[kind];
  const rest = cfg.list.slice(3);
  return layout(cfg.title + ' · BIDTOBE1', `
  <section class="hero"><div class="wrap" id="main" style="padding-bottom:0">
    <div class="eyebrow" data-rv="fade"><span class="dot"></span> ${esc(cfg.lede)}</div>
    ${kind === 'all' ? '<img class="hero-mark" src="/logo-mark.png" alt="" width="104" height="104" data-rv="fade">' : ''}
    <h1 class="display h-hero">${words(cfg.head[0])}${cfg.head[1] ? ` <span class="vermilion">${words(cfg.head[1])}</span>` : ''}</h1>
    <div class="hero-grid">
      <div class="hero-left">
        <p class="body-lg" data-rv="up" data-d="2" style="max-width:46ch">${esc(cfg.intro)}</p>
        <div class="hero-cta" data-rv="up" data-d="4">
          <a class="btn" href="/submit">Claim a rank ${ARROW}</a>
          <a class="arrowlink" href="/rules">Read the rules <span class="ar">${ARROW}</span></a>
        </div>
        ${heroProof(cfg.list, cfg.amt)}
      </div>
      ${claimBox(f)}
    </div>
  </div></section>

  <div class="wrap">
    <div class="tabs" data-rv="fade">
      <a class="tab ${kind === 'all' ? 'on' : ''}" href="${kind === 'all' ? '#' : '/'}${f.category ? (kind === 'all' ? '' : '?category=' + f.category) : ''}">All-time</a>
      <a class="tab ${kind === 'today' ? 'on' : ''}" href="/today${f.category ? '?category=' + f.category : ''}">Today</a>
    </div>
    ${filterBar(kind === 'all' ? '/' : '/' + kind, f)}
    ${secHead(cfg.n, cfg.title, cfg.list.length + ' listed')}
    <p class="sec-lede" data-rv="fade">${esc(cfg.blurb)}</p>

    ${kind === 'all' && !f.category ? categoryGrid() : (cfg.list.length ? boardTiers(cfg.list, cfg.amt, f.category)
      : UI.empty({ icon: '\u25c7', title: 'This board is empty',
          desc: `Nobody has claimed a rank here yet. The first listing takes #1 for ${money(D.RULES.MIN_BID)}.`,
          actions: `<a class="btn verm" href="/submit">Take #1 for ${money(D.RULES.MIN_BID)}</a><a class="btn ghost" href="/rules">How it works</a>` }))}

    <div class="board-aside">
      ${activityFeed()}
      <div class="panel" data-rv="up"><div class="eyebrow" style="margin-bottom:14px"><span class="dot"></span> Homepage takeover</div>
        <p class="body">Pay ${D.RULES.TAKEOVER_MULTIPLE}\u00d7 the current #1 of your category and own the banner across every page for ${D.RULES.TAKEOVER_HOURS} hours.</p>
        <a class="claim" style="display:inline-block;margin-top:14px" href="/takeover">Buy a takeover \u2192</a></div>
    </div>
  </div>`, kind, jsonld({
    '@context': 'https://schema.org', '@type': 'ItemList', name: cfg.title, description: cfg.blurb,
    numberOfItems: cfg.list.length,
    itemListElement: cfg.list.slice(0, 20).map((l, i) => ({ '@type': 'ListItem', position: i + 1,
      item: { '@type': 'LocalBusiness', name: l.name, url: l.url, description: l.tagline,
        address: { '@type': 'PostalAddress', addressLocality: l.city, addressCountry: 'NZ' } } }))
  }));
}

function overallPage() {
  const champ = D.categoryLeaders()[0];   // single highest bid across all categories
  const active = D.categoryPrices().filter(c => c.count).length;
  return layout('All over New Zealand · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:var(--s5)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> All over New Zealand</div>
      <h1 class="display h-page" style="margin-top:16px;max-width:15ch">${words('The highest bid in the country.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:56ch;margin-top:20px">
        Every category runs its own independent auction. This page compares the leading bid from each one
        and shows the single highest in New Zealand. It is read-only \u2014 nothing here changes what a bid
        costs inside any category.</p>
    </div>

    ${champ ? `
    <div class="nz-lab" data-rv="fade">#1 Overall New Zealand</div>
    ${featuredCard(champ, champ.total, champ.categorySlug, { national: true })}
    <p class="sec-lede" data-rv="fade" style="margin-top:var(--s3)">
      ${esc(champ.name)} leads ${esc(champ.categoryName)} on ${money(champ.total)}, the highest bid of the
      ${active} active ${active === 1 ? 'category' : 'categories'}. To take this spot you must first lead
      <a class="vermilion" href="/category/${champ.categorySlug}">${esc(champ.categoryName)}</a>
      \u2014 that category's own price is <b style="color:#fff;font-weight:400">${money(D.minToTopCategory(champ.categorySlug))}</b>,
      and bidding there changes nothing in any other category.</p>`
    : UI.empty({ icon: '\u25c7', title: 'No bids in any category yet',
        desc: 'As soon as one business leads a category, it appears here as the national #1.',
        actions: '<a class="btn verm" href="/submit">Claim the first rank</a>' })}
  </div>`, 'nz');
}

function categoryPage(cat, f) {
  const list = D.categoryBoard(cat.slug);
  const price = D.minToTopCategory(cat.slug);
  const leader = list[0];
  const history = D.categoryHistory(cat.slug, 8);
  const others = D.categoryPrices().filter(c => c.slug !== cat.slug && c.count).slice(0, 6);
  return layout(cat.name + ' \u00b7 BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:var(--s5)">
      <div data-rv="fade">${UI.crumb([{ label: 'Board', href: '/' }, { label: cat.name }])}</div>
      <h1 class="display h-page" style="margin-top:16px;max-width:16ch">${words(cat.name)}</h1>
      <div class="cat-bar" data-rv="up" data-d="2">
        <div><span>Leading bid</span><b>${leader ? money(leader.total) : '\u2014'}</b></div>
        <div><span>To take #1 here</span><b class="vermilion">${money(price)}</b></div>
        <div><span>Businesses</span><b>${list.length}</b></div>
      </div>
      <p class="body-lg" data-rv="up" data-d="3" style="max-width:56ch;margin-top:var(--s3)">
        This category runs its own auction. ${leader
          ? `${esc(leader.name)} leads on ${money(leader.total)}, so #1 here costs ${money(price)}.`
          : `Nobody has bid yet, so #1 starts at ${money(D.RULES.MIN_BID)}.`}
        What businesses pay in other categories has no effect on this price.</p>
      <div class="hero-cta" data-rv="up" data-d="4">
        <a class="btn verm" href="/submit?category=${cat.slug}">Bid in this category ${ARROW}</a>
        <a class="arrowlink" href="/nz">See the national #1 <span class="ar">${ARROW}</span></a>
      </div>
    </div>

    ${secHead(1, cat.name + ' ranking', list.length + ' listed')}
    ${list.length ? boardTiers(list, l => l.total, cat.slug)
      : UI.empty({ icon: '\u25c7', title: 'This category is unclaimed',
          desc: `No business has bid in ${esc(cat.name)} yet. The first listing takes #1 for ${money(D.RULES.MIN_BID)} and holds it until someone bids higher \u2014 in this category only.`,
          actions: `<a class="btn verm" href="/submit?category=${cat.slug}">Take #1 for ${money(D.RULES.MIN_BID)}</a>` })}

    <div class="board-aside">
      ${history.length ? `<div class="panel feed" data-rv="up">
        <div class="eyebrow" style="margin-bottom:16px"><span class="dot"></span> Bidding history \u00b7 ${esc(cat.name)}</div>
        ${history.map(h => `<a href="/business/${h.listing.slug}">
          <img class="ico" style="width:24px;height:24px" src="${fav(h.listing.url)}" alt="" loading="lazy">
          <span class="grow"><span class="fn">${esc(h.listing.name)}</span>
          <span class="fm" style="display:block">+${money(h.amount)} \u00b7 ${ago(h.ts)}</span></span></a>`).join('')}
      </div>` : ''}
      <div class="panel catlist" data-rv="up">
        <div class="eyebrow" style="margin-bottom:14px"><span class="dot"></span> Other category prices</div>
        ${others.map(c => `<a href="/category/${c.slug}">${esc(c.name)} <i>${money(c.priceToTop)}</i></a>`).join('')}
        <p class="field-desc" style="margin-top:14px">Each price is independent. Bidding here never changes these.</p>
      </div>
    </div>
  </div>`);
}

function profile(l) {
  const inCat = D.rankInCategory(l.id);
  const catCount = D.categoryBoard(l.category).length;
  const leaders = D.categoryLeaders();
  const natPos = leaders.findIndex(x => x.id === l.id) + 1;   // only category leaders rank nationally
  const overall = D.rankOf(l.id), total = D.allTime().length;
  const also = D.allTime({ category: l.category }).filter(x => x.id !== l.id).slice(0, 5);
  const onToday = D.todayBoard().some(x => x.id === l.id);
  return layout(`${l.name} · #${overall} on BIDTOBE1`, `<div class="wrap" id="main">
    <div style="padding-top:var(--s5)">
      <div data-rv="fade">${UI.crumb([{ label: 'Board', href: '/' },
        { label: D.catName(l.category), href: '/category/' + l.category }, { label: l.name }])}</div>
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
        <button class="copy-btn" type="button" data-copy="url">Copy link</button>
      </div>
    </div>
    <div class="stats" data-rv="up">
      <div class="stat"><span>Category rank</span><b>#${String(inCat).padStart(2, '0')}</b><span style="margin-top:6px">of ${catCount} in ${esc(D.catName(l.category))}</span></div>
      <div class="stat"><span>Overall New Zealand</span><b>${natPos ? '#' + String(natPos).padStart(2, '0') : '\u2014'}</b><span style="margin-top:6px">${natPos ? 'of ' + leaders.length + ' category leaders' : 'lead your category to enter'}</span></div>
      <div class="stat"><span>Committed</span><b>${money(l.total)}</b><span style="margin-top:6px">raised ${l.raises} time${l.raises === 1 ? '' : 's'}</span></div>
      <div class="stat"><span>${UI.tip('AI visibility', 'Blends rank spend (capped at 35), click-through, profile completeness, enquiries and verification. Money alone cannot buy 100.')}</span><b>${D.visibilityScore(l)}</b><span style="margin-top:6px">out of 100</span></div>
    </div>
    <div class="split">
      <div>
        ${secHead(1, 'About this ranking', null)}
        <div class="q"><h3>What rank does ${esc(l.name)} hold?</h3>
          <p class="body">${esc(l.name)} has committed ${money(l.total)} to rank #${inCat} of ${catCount} in ${esc(D.catName(l.category))}, and #${overall} of ${total} across New Zealand.</p></div>
        <div class="q"><h3>Have they ranked today?</h3>
          <p class="body">${onToday ? 'Yes — they have added spend in the last twenty-four hours and appear on <a class="vermilion" href="/today">today\'s board</a>.' : 'No spend in the last twenty-four hours, so they are not on today\'s board.'}</p></div>
        <div class="q"><h3>How do I outrank them?</h3>
          <p class="body">Anyone can take this rank for <span class="vermilion">${money(D.minToTopCategory(l.category))}</span> in ${esc(D.catName(l.category))}. That price is set by this category alone. <a class="claim" href="/raise/${l.id}">Do it →</a></p></div>
        <div class="q"><h3>Is this an editorial recommendation?</h3>
          <p class="body">No. Rank is paid placement. The AI Visibility Score and the Verified badge are the parts that are never for sale.</p></div>

        ${secHead(2, 'AI visibility score', null)}
        <div class="panel" data-rv="up">
          ${D.scoreBreakdown(l).map(([k, v, m]) => `<div style="margin:16px 0">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <span class="k" style="color:var(--bone-dim)">${k}</span><span class="num" style="font-size:15px">${v}/${m}</span></div>
            <div class="bar"><i style="width:${(v / m) * 100}%"></i></div></div>`).join('')}
          <div class="note">Unlike rank, this score cannot be bought outright — committed spend is capped at 35 of 100.</div>
        </div>

        ${secHead(3, 'Request a quote', null)}
        <form class="panel" method="post" action="/lead/${l.id}" id="enquiry" data-rv="up" novalidate>
          ${UI.field({ label: 'Your name', name: 'name', required: true, autocomplete: 'name' })}
          ${UI.field({ label: 'Email', name: 'email', type: 'email', required: true, autocomplete: 'email',
            desc: 'So they can reply. Never sold or shared.' })}
          ${UI.field({ label: 'Phone', name: 'phone', type: 'tel', autocomplete: 'tel', desc: 'Optional \u2014 speeds up a callback.' })}
          ${UI.field({ label: 'What do you need?', name: 'message', rows: 4,
            placeholder: 'e.g. AI receptionist for a six-person clinic in Auckland' })}
          <button class="btn verm" style="margin-top:24px" data-loading-text="Sending">Send enquiry ${ARROW}</button>
          <div class="field-desc" style="margin-top:14px">Goes straight to ${esc(l.name)}. BIDTOBE1 never sells your details.</div>
        </form>
      </div>
      <div >
        <div class="panel" data-rv="up"><div class="eyebrow" style="margin-bottom:16px"><span class="dot"></span> Contact</div>
          <div class="k" style="color:var(--muted)">Website</div><a class="body" style="color:var(--bone);display:block;margin-bottom:14px;padding:4px 0;min-height:28px" href="/go/${l.id}">${esc(l.url)}</a>
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
        text: `${l.name} has committed $${l.total} to rank #${inCat} of ${catCount} in ${D.catName(l.category)} and #${overall} of ${total} across New Zealand.` } },
      { '@type': 'Question', name: `How do I outrank ${l.name}?`, acceptedAnswer: { '@type': 'Answer',
        text: `Anyone can take this rank for $${l.total + D.RULES.TOP_STEP} on the ${D.catName(l.category)} board.` } },
      { '@type': 'Question', name: 'Is this an editorial recommendation?', acceptedAnswer: { '@type': 'Answer',
        text: 'No. Rank is paid placement. The AI Visibility Score and Verified badge are not for sale.' } }] }
  ]));
}

function submit(err, v = {}) {
  return layout('Claim a rank · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:var(--s5)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> Chapter 01 — The claim</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:14ch">${words('Take your place on the board.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:52ch;margin-top:22px">
        New listings start at ${money(D.RULES.MIN_BID)}. Taking #1 overall currently costs ${money(D.minToTop())}.
        Paying less still puts you on the board, at whatever rank that amount can hold.</p>
    </div>
    ${err ? `<div data-rv="fade">${UI.alert('destructive', 'Could not claim that rank', esc(err))}</div>` : ''}
    <div class="split" style="margin-top:clamp(32px,5vh,56px)">
      <form class="panel" method="post" action="/submit" data-rv="up" novalidate
            data-confirm="1" data-confirm-title="Confirm your claim"
            data-confirm-desc="This claims your rank immediately. Payments are final and anyone can outbid you at any time."
            data-confirm-label="Your bid" data-confirm-ok="Pay and claim">
        ${UI.field({ label: 'Website', name: 'url', value: v.url, required: true, placeholder: 'yourbusiness.co.nz',
          desc: 'Where your listing sends visitors. Tracking parameters are stripped.', autocomplete: 'url', inputmode: 'url' })}
        ${UI.field({ label: 'Business name', name: 'name', value: v.name, required: true, autocomplete: 'organization' })}
        ${UI.field({ label: 'One-line pitch', name: 'tagline', value: v.tagline,
          desc: 'The one sentence buyers read on the board. Outcome-led beats generic \u2014 it decides your click-through.' })}
        <div class="field-row">
          ${UI.field({ label: 'Category', name: 'category', value: v.category,
            options: D.CATEGORIES.map(c => ({ value: c.slug, label: c.name })) })}
          ${UI.field({ label: 'Where you operate', name: 'city', value: v.city,
            options: D.CITIES.map(c => ({ value: c, label: c })),
            desc: 'Shown on your profile. Rank is national.' })}
        </div>
        <div class="field-row">
          ${UI.field({ label: 'Phone', name: 'phone', type: 'tel', value: v.phone, autocomplete: 'tel',
            desc: 'Adds visibility points.' })}
          ${UI.field({ label: 'Email', name: 'email', type: 'email', value: v.email, autocomplete: 'email',
            desc: 'Where enquiries land.' })}
        </div>
        ${UI.field({ label: 'Amount', name: 'amount', type: 'number', value: v.amount || D.RULES.MIN_BID,
          min: D.RULES.MIN_BID, max: D.RULES.MAX_BID, required: true, prefix: 'NZ$', inputmode: 'numeric',
          desc: `Minimum ${money(D.RULES.MIN_BID)}. ${money(D.minToTop())} takes #1 overall right now.` })}
        <button class="btn verm" style="margin-top:26px" data-loading-text="Claiming">Pay and claim my rank ${ARROW}</button>
        ${UI.alert('info', 'Demo mode', 'No card is charged. The Stripe hook is marked in server.js.')}
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
  const needCat = D.minToTopCategory(l.category);
  const catRank = D.rankInCategory(l.id);
  return layout('Raise ' + l.name, `<div class="wrap" id="main">
    <div style="padding-top:var(--s5)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> Raise a listing</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:16ch">${words(l.name)}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="margin-top:20px">Currently ${money(l.total)}, ranked #${catRank} in ${esc(D.catName(l.category))}. You pay only the difference, and only this category's price applies.</p>
    </div>
    ${err ? UI.alert('destructive', 'Could not raise', esc(err)) : ''}
    <form class="panel" method="post" action="/raise/${l.id}" style="margin-top:34px;max-width:520px" data-rv="up" novalidate
          data-confirm="1" data-confirm-title="Confirm your raise"
          data-confirm-desc="You only pay the difference. Payments are final and your new rank is not guaranteed."
          data-confirm-label="You add" data-confirm-ok="Pay and climb">
      ${UI.field({ label: 'Add amount', name: 'amount', type: 'number', prefix: 'NZ$', inputmode: 'numeric',
        value: Math.max(D.RULES.RAISE_STEP, needCat - l.total), min: D.RULES.RAISE_STEP, max: D.RULES.MAX_BID, required: true,
        desc: `Current total ${money(l.total)}. #1 in ${esc(D.catName(l.category))} costs ${money(needCat)}.` })}
      <ul class="list" style="margin-top:22px">
        <li><span><b style="color:var(--bone);font-weight:400">+${money(Math.max(1, needCat - l.total))}</b> takes #1 in ${esc(D.catName(l.category))}</span></li>
        <li><span>Leading your category also enters you in the <a class="vermilion" href="/nz">Overall New Zealand ranking</a>.</span></li>
      </ul>
      <button class="btn verm" style="margin-top:26px" data-loading-text="Processing">Pay and climb ${ARROW}</button>
    </form>
  </div>`);
}

function takeover(err) {
  const list = D.allTime(), need = Math.max(D.RULES.MIN_BID, (list[0]?.total || 0) * D.RULES.TAKEOVER_MULTIPLE);
  return layout('Homepage takeover · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:var(--s5)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> Chapter 02 — The takeover</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:14ch">${words('Skip the queue entirely.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:52ch;margin-top:22px">
        Pay ${D.RULES.TAKEOVER_MULTIPLE}× the current #1 — ${money(need)} — and your business owns the banner across every page
        for ${D.RULES.TAKEOVER_HOURS} hours, regardless of what the board says. The spend still counts toward your normal rank.</p>
    </div>
    ${err ? UI.alert('destructive', 'Could not buy takeover', esc(err)) : ''}
    <form class="panel" method="post" action="/takeover" style="margin-top:34px;max-width:520px" data-rv="up" novalidate
          data-confirm="1" data-confirm-title="Confirm the takeover"
          data-confirm-desc="Your business owns the banner across every page for ${D.RULES.TAKEOVER_HOURS} hours. Payments are final."
          data-confirm-label="Takeover cost" data-confirm-ok="Buy takeover">
      ${UI.field({ label: 'Listing', name: 'listingId',
        options: list.map(l => ({ value: l.id, label: l.name + ' \u2014 ' + money(l.total) })) })}
      ${UI.field({ label: 'Amount', name: 'amount', type: 'number', prefix: 'NZ$', inputmode: 'numeric',
        value: need, min: need, max: D.RULES.MAX_BID, required: true,
        desc: `${D.RULES.TAKEOVER_MULTIPLE}\u00d7 the current #1. Also counts toward your normal rank.` })}
      <button class="btn verm" style="margin-top:26px" data-loading-text="Processing">Buy the takeover ${ARROW}</button>
    </form>
  </div>`);
}

function rules() {
  const R = D.RULES;
  return layout('Rules · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:var(--s5)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> The manifesto</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:12ch">${words('One rule runs every board.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:54ch;margin-top:24px">
        BIDTOBE1 is a public leaderboard for New Zealand businesses. No ads, no algorithm, no editorial score deciding position.
        You pay to stand above everyone else. Rank is what you pay — nothing else.</p>
    </div>
    ${secHead(1, 'The boards', null)}
    <p class="body-lg" data-rv="fade" style="max-width:54ch;margin-top:-14px">One payment ranks you on every board that includes that spend. The boards simply look at different windows of time.</p>
    <ul class="list" data-rv="up" style="margin-top:26px">
      <li><span><b style="color:var(--bone);font-weight:400">Each category is its own auction.</b> It keeps its own leading bid, its own bidding history, its own ranking and its own price to reach #1. Bidding in one category never changes the price in another. Leading Trades &amp; Construction might cost ${money(D.minToTopCategory('trades-construction'))} while leading AI Agents &amp; Automation costs ${money(D.minToTopCategory('ai-agents-automation'))} — you only ever pay against the category you choose.</span></li>
      <li><span><b style="color:var(--bone);font-weight:400">Overall New Zealand</b> — a read-only scoreboard. It takes the current leader of every category, compares those bids, and shows the single highest as national #1. It never sets a price and never moves money between categories.</span></li>
      <li><span><b style="color:var(--bone);font-weight:400">Ties</b> — if two category leaders hold the same amount, the one who reached it first ranks higher. If the amount and the timestamp are identical, listing ID decides, so the order is always the same.</span></li>
      <li><span><b style="color:var(--bone);font-weight:400">Today</b> — a rolling twenty-four hours across all categories. Each payment counts from the moment you pay, then drops off a day later.</span></li>
      <li><span><b style="color:var(--bone);font-weight:400">Location</b> — the city on your listing is profile information for buyers. It does not affect rank.</span></li>
    </ul>
    ${secHead(2, 'How ranking works', null)}
    <ul class="list" data-rv="up">
      <li>New listings are whole New Zealand dollars — ${money(R.MIN_BID)} minimum, ${money(R.MAX_BID)} maximum.</li>
      <li>Taking #1 costs at least ${money(R.TOP_STEP)} more than the current leader <b style="color:var(--bone);font-weight:400">of that category</b>. Paying less still puts you on the category board at whatever rank that amount can take.</li>
      <li>Equal amounts stay in the order they were placed — the older listing keeps the higher rank.</li>
      <li>Already on the board? Enter the same website again to raise. The new amount must be at least ${money(R.RAISE_STEP)} above your current total, and checkout charges only the difference. Someone else cannot take your rank by paying that difference.</li>
      <li>Listings are keyed by website, with tracking query strings ignored, so one business cannot occupy two ranks.</li>
      <li>A homepage takeover costs ${R.TAKEOVER_MULTIPLE}× the current #1 and lasts ${R.TAKEOVER_HOURS} hours.</li>
    </ul>
    ${secHead(3, 'What you can list', null)}
    <ul class="list" data-rv="up">
      <li>A real business website, or an X / LinkedIn profile. Products and profiles only — no chat invites, no link shorteners, no adult content, no scams or unlicensed financial services.</li>
      <li>Listed businesses must show valid company details. We may ask for an NZBN.</li>
      <li>Regulated trades — electrical, gas, building, legal, financial advice — must hold current New Zealand licensing.</li>
    </ul>
    ${secHead(4, 'Badges are never for sale', null)}
    <p class="body-lg" data-rv="fade" style="max-width:54ch;margin-top:-14px">
      A <span class="badge v">Verified</span> badge means we checked the NZBN and the licensing. An
      <span class="badge e">Editor's pick</span> means a human looked and liked it. Neither can be bought — only position can.
      This is the line that keeps the board worth reading.</p>
    ${secHead(5, 'After you pay', null)}
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
    <div style="padding-top:var(--s5)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> About</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:13ch">${words('A public board, honestly priced.')}</h1>
      <p class="body-lg" data-rv="up" data-d="2" style="max-width:54ch;margin-top:24px">
        BIDTOBE1 is a leaderboard for New Zealand businesses: no ads, no API keys, no revenue sharing. Claim #1 in your city
        and your trade — that is it. Then we add the part a pure bid board does not have: real profiles, tracked enquiries,
        and an AI Visibility Score that money cannot fully buy.</p>
    </div>
    ${secHead(1, 'The board so far', null)}
    <div class="stats" data-rv="up">
      <div class="stat"><span>Visitors</span><b>${s.visitors.toLocaleString()}</b></div>
      <div class="stat"><span>Committed</span><b>${money(s.revenue)}</b></div>
      <div class="stat"><span>Listed</span><b>${s.listings}</b></div>
      <div class="stat"><span>Highest rank</span><b>${money(s.top)}</b></div>
      <div class="stat"><span>Clicks sent</span><b>${s.clicks.toLocaleString()}</b></div>
      <div class="stat"><span>Enquiries</span><b>${s.leads.toLocaleString()}</b></div>
    </div>
    ${secHead(2, 'From those who took #1', null)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px" data-rv="up">
      <div class="tw"><b>Auckland AI agency</b>Spent $850 to hold #1 in AI &amp; Automation Auckland. Fourteen enquiries in nine days, two became retainers.</div>
      <div class="tw"><b>Christchurch plumber</b>$120 for #1 in my city board. Cheaper than one week of Google Ads, and I can actually see the clicks.</div>
      <div class="tw"><b>Wellington law firm</b>The visibility score told us our profile was incomplete. We fixed it and the click-through doubled.</div>
    </div>
    <div class="note" style="margin-top:24px">These are illustrative placeholders for the MVP. Never publish customer results you cannot evidence —
      under the Fair Trading Act, unverified testimonials are a real risk.</div>
    ${secHead(3, 'The rule', null)}
    <p class="display h-sec" data-rv="up" style="max-width:16ch">${words('Rank is what you pay.')}</p>
    <p class="body-lg" data-rv="fade" style="max-width:48ch;margin-top:22px">The board is here. Same rules for everyone. Nothing else decides it.</p>
  </div>`, 'about');
}

function ask(q, results) {
  return layout('Ask · BIDTOBE1', `<div class="wrap" id="main">
    <div style="padding-top:var(--s5)">
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
    ${q ? `${secHead(1, 'Top matches', null)}
      ${results.length ? `<div class="rows">${results.map((l, i) => row(l, i, l.total, null, i)).join('')}</div>`
        : UI.empty({ icon: '\u25ce', title: 'No matches',
            desc: 'Nothing on the board fits that yet. Try a broader city or category \u2014 or claim the spot yourself.',
            actions: '<a class="btn verm" href="/submit">Claim it</a>' })}
      <div class="note" style="margin-top:24px">Ranking here blends paid position with performance signals, and paid placement is always disclosed.
        Swap this deterministic matcher for an LLM over the same data when you are ready.</div>` : ''}
  </div>`, 'ask');
}

function dashboard(l, owned = []) {
  if (!l) {
    return layout('Dashboard · BIDTOBE1', `<div class="wrap" id="main">
      <div style="padding-top:var(--s5)">
        <div class="eyebrow" data-rv="fade"><span class="dot"></span> Private</div>
        <h1 class="display h-page" style="margin-top:20px;max-width:14ch">${words('Your listings.')}</h1>
        <p class="body-lg" data-rv="up" data-d="2" style="max-width:52ch;margin-top:22px">
          Enquiries and analytics are private to the business that owns the listing. Claim or raise one from this browser to unlock it.</p>
      </div>
      ${secHead(1, 'Owned by you', null)}
      ${owned.length ? `<div class="rows">${owned.map((x, i) => `<div class="row" data-rv="up" data-d="${i}">
        <div class="rk">${String(D.rankOf(x.id)).padStart(2, '0')}</div>
        <img class="ico" src="${fav(x.url)}" alt="">
        <a class="grow" href="/dashboard?id=${x.id}"><div class="rname">${esc(x.name)}</div>
          <div class="rmeta">${esc(D.catName(x.category))} · ${esc(x.city)}</div></a>
        <div class="ramt"><b>${money(x.total)}</b><span>committed</span></div></div>`).join('')}</div>`
        : UI.empty({ icon: '\u25a1', title: 'No listings in this browser',
            desc: 'Analytics and customer enquiries are private to the business that owns a listing. Claim or raise one from this browser and its dashboard unlocks here.',
            actions: '<a class="btn verm" href="/submit">Claim a rank</a><a class="btn ghost" href="/">Browse the board</a>' })}
    </div>`, 'dash', '', { noIndex: true });
  }
  const inCat = { category: l.category };
  const rank = D.rankOf(l.id, inCat), boardList = D.allTime(inCat);
  const natRank = D.rankOf(l.id);
  const above = boardList[rank - 2];
  const leads = D.leadsFor(l.id).slice().reverse();
  const ctr = l.views ? (l.clicks / l.views * 100).toFixed(1) : '0.0';
  return layout('Dashboard · ' + l.name, `<div class="wrap" id="main">
    <div style="padding-top:var(--s5)">
      <div class="eyebrow" data-rv="fade"><span class="dot"></span> Private dashboard</div>
      <h1 class="display h-page" style="margin-top:20px;max-width:16ch">${words(l.name)}</h1>
      <div style="margin-top:18px" data-rv="fade"><a class="arrowlink" href="/business/${l.slug}">View public profile <span class="ar">${ARROW}</span></a></div>
    </div>
    <div class="stats" data-rv="up">
      <div class="stat"><span>${esc(D.catName(l.category))}</span><b>#${String(rank).padStart(2, '0')}</b></div>
      <div class="stat"><span>New Zealand</span><b>#${String(natRank).padStart(2, '0')}</b></div>
      <div class="stat"><span>Committed</span><b>${money(l.total)}</b></div>
      <div class="stat"><span>Profile views</span><b>${l.views.toLocaleString()}</b></div>
      <div class="stat"><span>Website clicks</span><b>${l.clicks.toLocaleString()}</b></div>
      <div class="stat"><span>Click-through</span><b>${ctr}%</b></div>
      <div class="stat"><span>Enquiries</span><b>${leads.length}</b></div>
      <div class="stat"><span>Cost per click</span><b>${l.clicks ? money(l.total / l.clicks) : '—'}</b></div>
      <div class="stat"><span>${UI.tip('Cost per enquiry', 'Total committed divided by enquiries received. Compare this against your usual cost per lead before raising.')}</span><b>${leads.length ? money(l.total / leads.length) : '\u2014'}</b></div>
    </div>
    ${secHead(1, 'Recommendations', null)}
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
    ${secHead(2, 'Enquiries', null)}
    ${leads.length ? `<div class="rows">${leads.map((x, i) => `<div class="row" data-rv="up" data-d="${i}">
      <div class="grow"><div class="rname">${esc(x.name)}</div>
        <div class="body" style="margin-top:6px">${esc(x.message)}</div>
        <div class="rmeta">${esc(x.email)}${x.phone ? ' · ' + esc(x.phone) : ''} · ${new Date(x.ts).toLocaleString('en-NZ')}</div></div></div>`).join('')}</div>`
      : UI.empty({ icon: '\u2709', title: 'No enquiries yet',
          desc: 'When someone submits the quote form on your profile it lands here. Listings with a complete pitch, phone and email convert roughly twice as often.',
          actions: `<a class="btn ghost" href="/business/${l.slug}#enquiry">View your form</a>` })}
    <div style="display:flex;gap:14px;margin-top:36px;flex-wrap:wrap" data-rv="up">
      <a class="btn verm" href="/raise/${l.id}">Climb the board ${ARROW}</a>
      <a class="btn ghost" href="/takeover">Buy a takeover</a>
    </div>
  </div>`, 'dash', '', { noIndex: true });
}

module.exports = { setNonce, jsonld, layout, board, overallPage, categoryPage, profile, submit, raise, takeover, rules, about, ask, dashboard, esc, money };
