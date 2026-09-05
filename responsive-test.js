// Responsive audit — checks real rendered layout at device widths.
// Usage: node responsive-test.js [baseUrl]
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://localhost:3000';

const DEVICES = [
  { name: 'iPhone SE',        w: 375,  h: 667,  m: true },
  { name: 'Android small',    w: 360,  h: 800,  m: true },
  { name: 'iPhone 14 Pro',    w: 393,  h: 852,  m: true },
  { name: 'iPhone 14 Max',    w: 430,  h: 932,  m: true },
  { name: 'Phone landscape',  w: 852,  h: 393,  m: true },
  { name: 'iPad mini',        w: 768,  h: 1024, m: true },
  { name: 'iPad Pro',         w: 1024, h: 1366, m: true },
  { name: 'Laptop',           w: 1440, h: 900,  m: false },
  { name: 'Desktop wide',     w: 1920, h: 1080, m: false }
];
const PAGES = ['/', '/today', '/rules', '/about', '/ask', '/submit', '/dashboard',
  '/business/kushal-ai', '/category/ai-agents-automation'];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const fails = [];
  let checks = 0;

  for (const d of DEVICES) {
    const page = await browser.newPage();
    await page.setViewport({ width: d.w, height: d.h, isMobile: d.m, deviceScaleFactor: 1,
      hasTouch: d.m });
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 20000 });
      const r = await page.evaluate(() => {
        const de = document.documentElement;
        // horizontal overflow
        const overflow = de.scrollWidth - de.clientWidth;
        // find the widest offending elements
        const wide = [];
        if (overflow > 1) {
          document.querySelectorAll('body *').forEach(el => {
            const b = el.getBoundingClientRect();
            if (b.width > de.clientWidth + 1 || b.right > de.clientWidth + 1.5) {
              wide.push((el.tagName.toLowerCase() + '.' + (el.className || '').toString().split(' ')[0]).slice(0, 40)
                + ' w=' + Math.round(b.width) + ' r=' + Math.round(b.right));
            }
          });
        }
        // tap targets under 40px on interactive elements that are visible
        const small = [];
        document.querySelectorAll('a,button,input,select,textarea').forEach(el => {
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) return;
          const st = getComputedStyle(el);
          if (st.visibility === 'hidden' || st.display === 'none') return;
          if (b.height < 24) small.push((el.textContent || el.tagName).trim().slice(0, 22) + ' h=' + Math.round(b.height));
        });
        // text too small to read on mobile
        const tiny = [];
        document.querySelectorAll('p,li,td,.body,.rtag').forEach(el => {
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs && fs < 11 && el.textContent.trim()) tiny.push(Math.round(fs) + 'px');
        });
        // inputs that would trigger iOS zoom
        const zoomy = [];
        document.querySelectorAll('input,select,textarea').forEach(el => {
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs && fs < 16) zoomy.push(el.name || el.tagName);
        });
        return { overflow, wide: [...new Set(wide)].slice(0, 4), small: small.slice(0, 3),
          tiny: [...new Set(tiny)], zoomy: [...new Set(zoomy)].slice(0, 3) };
      });
      checks++;
      if (r.overflow > 1) fails.push(`[OVERFLOW ${r.overflow}px] ${d.name} ${path} :: ${r.wide.join(' | ')}`);
      if (d.m && r.small.length) fails.push(`[TAP<24px] ${d.name} ${path} :: ${r.small.join(', ')}`);
      if (d.m && r.zoomy.length) fails.push(`[iOS-ZOOM] ${d.name} ${path} :: ${r.zoomy.join(', ')}`);
    }
    // burger behaviour
    if (d.w <= 960) {
      await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
      const nav = await page.evaluate(() => {
        const b = document.getElementById('burger'), nl = document.getElementById('navlinks');
        if (!b || !nl) return { err: 'missing burger/navlinks' };
        const visible = getComputedStyle(b).display !== 'none';
        const before = nl.getBoundingClientRect().height;
        b.click();
        return new Promise(res => setTimeout(() => {
          const after = nl.getBoundingClientRect().height;
          res({ visible, before, after, expanded: b.getAttribute('aria-expanded') });
        }, 600));
      });
      if (!nav.visible) fails.push(`[NAV] ${d.name} burger hidden at ${d.w}px`);
      else if (!(nav.after > nav.before + 20)) fails.push(`[NAV] ${d.name} menu did not open (${nav.before}->${nav.after})`);
    } else {
      const hidden = await page.evaluate(() => getComputedStyle(document.getElementById('burger')).display === 'none');
      if (!hidden) fails.push(`[NAV] ${d.name} burger should be hidden at ${d.w}px`);
    }
    await page.close();
  }

  await browser.close();
  console.log(`\n=== Responsive audit — ${DEVICES.length} devices × ${PAGES.length} pages (${checks} checks) ===\n`);
  if (!fails.length) console.log('PASS — no horizontal overflow, no tiny tap targets, no iOS zoom triggers, nav correct at every width.\n');
  else { fails.forEach(f => console.log('FAIL ' + f)); console.log(`\n${fails.length} issues\n`); }
  process.exitCode = fails.length ? 1 : 0;
})();
