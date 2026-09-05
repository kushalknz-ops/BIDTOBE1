# Deploying NZRank

Everything is configured. Pick **one** host, run the commands, and you get a permanent HTTPS URL.

**My recommendation: Render.** Free tier to test, one file already set up (`render.yaml`), persistent disk, and a Singapore region. Fly.io is better latency for NZ (Sydney) but needs Docker and a card.

---

## Step 0 — Push to GitHub (needed for Render/Railway)

```bash
cd nzrank
git init
git add -A
git commit -m "NZRank MVP"
gh repo create nzrank --private --source=. --push
# no gh CLI? make an empty repo on github.com, then:
# git remote add origin https://github.com/YOURNAME/nzrank.git && git push -u origin main
```

`data.json` and `.env` are gitignored — your board data and secrets never leave your machine.

---

## Option A — Render (easiest)

1. Go to **render.com** → New → **Blueprint** → connect your repo.
2. Render reads `render.yaml` and configures everything: build, start command, `/healthz`, a 1GB persistent disk at `/var/data`, and it auto-generates `NZRANK_SECRET`.
3. Click **Apply**. First deploy takes ~2 minutes.
4. You get `https://nzrank.onrender.com`.
5. Seed the demo data: Render dashboard → your service → **Shell** → `npm run seed`.
6. Set `PUBLIC_URL` to your final URL (Environment tab) so `sitemap.xml` emits absolute links.

> **Free plan caveat:** free instances sleep after 15 min idle (~30s cold start) and **do not support persistent disks** — your board resets on restart. Fine for a demo. For real listings use the **Starter plan (US$7/mo)**, which is what `render.yaml` specifies.

## Option B — Fly.io (best latency for NZ — Sydney)

```bash
curl -L https://fly.io/install.sh | sh
fly auth signup
cd nzrank
fly launch --no-deploy --copy-config --name nzrank   # reads fly.toml
fly volumes create nzrank_data --region syd --size 1
fly secrets set NZRANK_SECRET=$(openssl rand -hex 32)
fly deploy
fly ssh console -C "node /app/seed.js"               # seed demo data
fly open
```
`auto_stop_machines = "suspend"` keeps costs near zero when idle while resuming in milliseconds.

## Option C — Railway (fastest clicks)

```bash
npm i -g @railway/cli
railway login
railway init
railway up
railway domain                                        # generates the public URL
railway variables set NZRANK_SECRET=$(openssl rand -hex 32) DATA_DIR=/data
```
Then add a Volume mounted at `/data` in the Railway dashboard, or your data resets each deploy.

## Option D — Any VPS (full control, ~$6/mo)

```bash
ssh root@your-server
apt update && apt install -y nodejs npm nginx certbot python3-certbot-nginx
git clone https://github.com/YOURNAME/nzrank.git && cd nzrank
npm ci --omit=dev && npm run seed
npm i -g pm2
NZRANK_SECRET=$(openssl rand -hex 32) pm2 start server.js --name nzrank
pm2 save && pm2 startup
```
Then reverse-proxy port 3000 with nginx and run `certbot --nginx -d yourdomain.co.nz`.

---

## Custom domain (.co.nz)

1. Register at **1st Domains**, **Freeparking** or **Metaname** (~NZ$25/yr).
2. In your host's dashboard add the custom domain; it gives you a CNAME (or A record).
3. Add that record at your registrar. HTTPS is issued automatically by all three hosts.
4. Update `PUBLIC_URL` env var to the final domain.

**Do this before you buy:** check the name on the [IPONZ trade mark register](https://app.iponz.govt.nz/app/Extra/IP/TM/QbeCheck) and the [Companies Register](https://companies-register.companiesoffice.govt.nz/). "NZRank" is still a placeholder.

---

## Required environment variables

| Var | Needed | Purpose |
|---|---|---|
| `NZRANK_SECRET` | **Yes** | Signs owner cookies. Without it, dashboards log out on every restart. `openssl rand -hex 32` |
| `DATA_DIR` | **Yes** if using a disk | Where `data.json` lives, e.g. `/var/data` or `/data` |
| `PORT` | Auto | Set by the host |
| `PUBLIC_URL` | Recommended | Absolute URLs in `sitemap.xml` |
| `NODE_ENV` | Recommended | `production` |

---

## Post-deploy checklist

```bash
curl https://your-url/healthz                 # -> ok
node pentest.js https://your-url              # -> 26/26 (run against staging, not live customer data)
curl -sI https://your-url | grep -i content-security-policy
```

- [ ] `npm run seed` run once
- [ ] `NZRANK_SECRET` set (check logs for the warning)
- [ ] Persistent disk mounted and `DATA_DIR` pointing at it
- [ ] Custom domain + HTTPS
- [ ] `PUBLIC_URL` set, then verify `/sitemap.xml` and `/llms.txt`
- [ ] Submit the sitemap in Google Search Console
- [ ] Privacy policy page live (you're storing leads — Privacy Act 2020)

---

## Before you take real money

`data.json` is a single file. It is fine for a launch board of a few hundred listings, but **move to Postgres before you accept payments** — you need transactions so two simultaneous bids for #1 can't both win, and real backups. Render, Fly and Railway all offer managed Postgres; `db.js` keeps every function name stable so it's a contained rewrite.

Then wire Stripe as described in `README.md` — rank must only change inside a signature-verified webhook.
