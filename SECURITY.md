# BIDTOBE1 — security audit & remediation report

Attack suite: `node pentest.js [baseUrl]` — 26 live attacks against the running server.

## Round 1 (before hardening): 15/25 — 1 critical, 2 high, 4 medium, 3 low

| Sev | Finding | Real-world impact |
|---|---|---|
| CRITICAL | `/dashboard?id=` had no auth | **Anyone could read every business's customer enquiries** — names, emails, phone numbers. A Privacy Act 2020 notifiable breach on day one. |
| HIGH | `javascript:` accepted as a listing website | Stored XSS via the "Visit website" button; session/cookie theft. |
| HIGH | Open redirect via `//evil.com` | `/go/:id` became a phishing laundromat under your domain — kills your email/domain reputation. |
| MEDIUM | No CSRF protection | A malicious page could make a logged-in visitor submit bids/leads. |
| MEDIUM | Mass assignment on the lead form | Attacker sets `id`, `ts`, or `verified` on records. |
| MEDIUM | No rate limiting | 40 listings created in 69ms. Board spammable to death; cost-amplification once Stripe is live. |
| MEDIUM | No Content-Security-Policy | No defence-in-depth if any XSS slips through. |
| LOW | Missing `nosniff`, `Referrer-Policy`; `X-Powered-By: Express` leaked | MIME confusion, referrer leakage, version fingerprinting. |

## Round 2 (after hardening): **26/26 — zero findings**

```
PASS [CRITICAL] IDOR: cannot read another business's enquiries via /dashboard?id=
PASS [CRITICAL] Infinity / negative / zero bid rejected
PASS [CRITICAL] No corrupt totals on the board
PASS [CRITICAL] Stored XSS in listing name/tagline
PASS [HIGH] Above-max, scientific-notation bids rejected
PASS [HIGH] Attribute-break XSS via URL field
PASS [HIGH] Dashboard index leaks nothing to anonymous visitors
PASS [HIGH] javascript:/data:/file: URLs rejected
PASS [HIGH] Redirect normalised to absolute http(s)
PASS [HIGH] Path traversal, prototype pollution blocked
PASS [HIGH] Verified/EditorPick/total not settable by submitter
PASS [MEDIUM] CSP, CSRF, mass assignment, payload limit, rate limiting
PASS [LOW] No stack traces, nosniff, Referrer-Policy, X-Powered-By hidden
```

## What was built — `security.js`

- **`sanitiseUrl()`** — rejects `javascript:`/`data:`/`vbscript:`/`file:`, strips leading slashes (protocol-relative), forces `http(s)`, validates the hostname, **blocks private/internal IP ranges (SSRF pre-emptive)**, strips query + hash. Applied at write *and* re-applied at click time in `/go/:id`, so poisoned legacy rows can't redirect either.
- **`validAmount()`** — one money validator: `/^\d{1,7}$/` only. Kills `-5000`, `0`, `1e9`, `Infinity`, `NaN`, float-precision abuse. Money is never parsed by `Number()` anywhere.
- **Owner auth** — HMAC-SHA256 signed listing IDs in an `HttpOnly; SameSite=Lax` cookie, compared with `timingSafeEqual`. Granted on submit/raise. `/dashboard` shows only your listings; someone else's ID returns **403**.
- **`pick()` whitelisting** — every write takes an explicit field list. `verified`, `editorPick`, `total`, `id`, `ts` can never come from a form.
- **Rate limiting** — 300 req/min global, **8 writes/min per IP**, 120 clicks/min. Trusts `x-forwarded-for` first hop (set `app.set('trust proxy', 1)` behind a real proxy).
- **CSRF** — strict origin/referer check on all state-changing verbs.
- **Headers** — CSP, `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS; `X-Powered-By` removed.
- **Moderation** — banned-content regex on names/taglines/messages (adult, casino, link shorteners, Telegram/Discord invites) — the same junk that floods every open bid board.
- **Error handler** — no stack traces, no `node_modules` paths.
- **Body limit** — 32kb.

## Still required before real money (cannot be fixed in code alone)

1. **Payments** — rank must only change inside a verified Stripe webhook. Never trust the browser. Verify the signature; make the handler idempotent on `event.id`.
2. **Race conditions** — on Postgres, wrap rank writes in `SELECT … FOR UPDATE` / a serializable transaction. Two simultaneous bids for #1 will otherwise both "win".
3. **Chargebacks** — a bid reversal must subtract from the total and reshuffle the board, or you get free-rank fraud.
4. **Email verification / NZBN check** before a ✓ Verified badge is issued.
5. **Privacy Act 2020** — leads are personal information: publish a privacy policy, state retention, offer deletion, and have a breach plan (IPONZ/OPC notification within 72h of a notifiable breach).
6. **Real auth** — the signed cookie is right for an MVP; move to magic-link or OAuth before you have paying customers with money at stake.
7. **Backups** — `data.json` has no durability. Postgres + point-in-time recovery before launch.
8. **Dependency + secret scanning** — `npm audit`, Dependabot, and set `BIDTOBE1_SECRET` from the environment (it currently regenerates on restart, which invalidates ownership cookies).

## Re-run the audit

```bash
node pentest.js                       # local
node pentest.js https://your-domain   # staging — never against prod with real data
```
Add it to CI: the suite exits `1` if any CRITICAL or HIGH fails.
