# BIDTOBE1 — pay-to-rank board for NZ businesses (running MVP)

Built after auditing the live outbid.lol. Same section architecture, our own brand/copy/code, plus additions they don't have.

## Run
```
cd bidtobe1 && npm install && node server.js   # http://localhost:3000
```
Delete `data.json` to start from empty.

---

## Part 1 — What outbid.lol actually has (audited from the live site)

| Their section | Detail | In BIDTOBE1? |
|---|---|---|
| Hero "Claim #1 for $X" with inline bid widget | Live price to take #1, category picker, one-click claim | ✅ `/` hero, price recalculates per city+category filter |
| Top-3 podium cards | Big favicon, bid, description, "claim this rank for $X" | ✅ |
| Ranked list #4→∞ | favicon, title, $, description, category · age · domain · click count · "see details" | ✅ same fields |
| All-time board | Cumulative, never expires | ✅ `/` |
| Today board | Rolling 24h | ✅ `/today` |
| Daily board | UTC calendar day, past days freeze as archive | ✅ `/daily` (NZ time) + archive chips |
| Category boards | e.g. AI Agents & Infrastructure, SEO, Crypto, Hiring, Security | ✅ `/category/:slug`, 10 NZ-relevant categories |
| Latest activity feed | "X at #139 · $171 · 10 hours ago" + Show more | ✅ sidebar feed |
| Product detail page | Category rank "#1 of 152", overall "#1 of 2,784", raise count, click count, FAQ block ("What rank does X hold?", "Has X ranked today?", "How do I outrank X?"), "Also in category" | ✅ `/business/:slug`, all four Q&As |
| Rules page | Boards, ranking maths, what you can list, after you pay | ✅ `/rules` |
| About page | Launch story, live counters (visitors / revenue / highest rank / listings), #1 customer testimonials, founder bio | ✅ `/about` (testimonials clearly marked placeholder) |
| Live stats ticker | "47 online · 1,503,655 visitors" | ✅ top ticker |
| Incremental raise, pay only the difference | Same URL re-submitted, ≥$1 above current | ✅ `/raise/:id` |
| Tie-break: older listing wins | | ✅ |
| URL keying, tracking params stripped | One business = one rank | ✅ `urlKey` |
| Outbound click tracking + utm | | ✅ `/go/:id` |
| Guest checkout, no account | | ✅ |
| Homepage takeover (5× top bid, 3h) | | ✅ `/takeover` |
| Verified / Editor's pick badges never for sale | seen on the outbidfinance.lol variant | ✅ |

**Their numbers as of the audit:** #1 see.io $17,000 / 51,000 clicks; #2 Tutti $16,000; #3 JONI $14,028. About page: 1,845,828 visitors, $255,506 revenue, 2,984 listings, launched 19 Aug 2026, built in ~3 hours on Next.js + Postgres (supastarter), Polar/Stripe as merchant of record, ~10 copycats in day one, $100k acquisition offer declined.

**Their weak points** (from the clone-wave analysis and the site itself): click counters that appear to reset hourly, an all-time board that goes stale once #1 is $17k, no lead capture, no reason for a buyer to return, and zero defensibility — dozens of clones (lowbid, warmap, lastspot, rankbid, biddirectory, outoutbid…) appeared within 48 hours.

---

## Part 2 — What BIDTOBE1 adds that makes the model more interesting

These are the answers to "can we make this more interesting" — each one attacks a specific weakness above.

**1. Momentum board (`/momentum`) — 30-day decay.** Only the last 30 days count toward rank. This is the single biggest fix: on outbid, one $17k whale kills the board forever. Decay converts a one-off purchase into a **subscription with a competitive trigger**. Outbidbid.lol already proved the mechanic works; nobody has combined it with everything below.

**2. City × category micro-boards.** $50 can't buy #1 in "AI Agents worldwide", but it buys #1 in "Hamilton plumbers". Thousands of winnable #1 spots = thousands of buyers instead of ten whales, and every one is a shareable screenshot.

**3. Lead capture on every profile.** Outbid sells clicks. We sell **enquiries**. Cost-per-enquiry is on the dashboard — that's the number that makes a tradie renew.

**4. AI Visibility Score with a hard cap on money.** Spend is capped at 35/100; the rest is CTR, profile completeness, enquiries and verification. So the board answers "who paid most" *and* "who's actually good" — the credibility outbid deliberately gave up. Published breakdown = businesses grind to improve it = free engagement.

**5. Badges that are never for sale.** ✓ Verified (NZBN + trade licence checked) and Editor's pick. Cheap to run, impossible for clones to copy credibly, and it's your Fair Trading Act defence.

**6. `/ask` — AI search over the board.** "Best AI receptionist in Auckland for a small law firm." This is the long-game: as buyers ask LLMs instead of Googling, being the structured NZ business dataset that AI cites is worth more than the leaderboard. Live at `/api/ask` for agents.

**7. Homepage takeover.** 5× the top bid for 3 hours. A price ceiling above #1 — lets a whale spend without permanently freezing the board.

**8. Dashboard with competitor intel.** "Southern Automation is one place above you on $700. +$555 takes their spot." That sentence is the entire revenue engine, automated.

**Not built yet, worth doing next (ranked by leverage):**
- **Auto-defend** — "keep me #1 up to $500/mo", card on file. Turns bidding wars into recurring revenue and is the closest thing to a moat.
- **Outbid alerts by email/SMS** — the retention loop. Free to send, directly causes the next payment.
- **Free seeded listings for real businesses** — solves the cold start; a board of 500 real Auckland firms is worth bidding into, an empty one isn't.
- **Head-to-head compare pages** ("Company A vs Company B") — pure SEO/AI-citation surface.
- **Pro subscription $49/mo** — analytics, competitor tracking, review monitoring.
- **Your AI agents as an upsell** — receptionist/sales/review agents billed on top of the listing. This is where BIDTOBE1 stops being a directory and becomes your distribution channel for the agency.

---

## Security
`node pentest.js` — 26 live attacks (XSS, IDOR, open redirect, CSRF, mass assignment, bid manipulation, prototype pollution, path traversal, flooding, headers). **Currently 26/26 passing.** First run found 1 critical + 2 high + 4 medium + 3 low; all fixed in `security.js`. Full report: **SECURITY.md**.

## Marketing
**MARKETING.md** — go-to-market for BIDTOBE1 (seed one Auckland board free → manufacture the first bidding war → programmatic SEO + AI-citation) and the "you won #1" pack for the business at the top.

## Files
- `security.js` — URL sanitisation, money validation, HMAC owner auth, rate limiting, CSRF, headers, moderation.
- `pentest.js` — the attack suite. Exits 1 on any CRITICAL/HIGH, so it can gate CI.
- `db.js` — rules, boards, scoring, AI matcher. Swap to Supabase, keep the function names.
- `views.js` — every page's HTML/CSS (own copy, nothing lifted).
- `server.js` — routes; the two payment hooks are marked.
- `data.json` — seeded with 10 NZ demo businesses.

## Routes
`/` `/today` `/daily` `/momentum` `/category/:slug` `/business/:slug` `/go/:id` `/submit` `/raise/:id` `/takeover` `/lead/:id` `/dashboard?id=` `/rules` `/about` `/ask` · API: `/api/board` `/api/min-to-top` `/api/ask` `/api/stats`

## Swap demo payments for real money (~30 min)
1. `npm i stripe`; set `STRIPE_SECRET_KEY`.
2. In `POST /submit`, `POST /raise/:id`, `POST /takeover`: create a Checkout Session with the amount and the listing fields in `metadata`, redirect to `session.url`. Do **not** write the bid yet.
3. `POST /webhook` (raw body) → on `checkout.session.completed`, call `createListing` / `addBid` / `buyTakeover`. A settled payment is the only thing that changes rank.
4. Wrap rank writes in a DB transaction once you're on Postgres — simultaneous bids race otherwise.
5. Consider a merchant of record (Polar/Paddle) — they handle GST and global tax; outbid used Polar for exactly this.

## Before launch
- Trademark/domain/company check the final name (IPONZ Trade Mark Check + Companies Register). "BIDTOBE1" is a placeholder.
- Terms: payments final, rank not guaranteed, right to remove listings.
- Fair Trading Act: paid placement must be obvious on every screen — it's in the ticker, hero, rules and footer. Don't publish testimonials you can't evidence (the `/about` ones are labelled placeholders).
- Seed one category (Auckland AI & Automation) with 20–30 real free listings before opening bidding.
