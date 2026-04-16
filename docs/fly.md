# Fly.io CLI cheat sheet — Discord Joke Bot

Replace `discord-joke-bot` with your app name if yours differs (`app` in `fly.toml`).

---

## Machine is **stopped** — start it

List machines (copy the **ID** from the first column):

```bash
fly machine list -a discord-joke-bot
```

Start a specific machine:

```bash
fly machine start 1851d5da297678 -a discord-joke-bot
```

Use the ID from **`fly status`** or **`fly machine list`**, not the example above.

Confirm:

```bash
fly status -a discord-joke-bot
fly logs -a discord-joke-bot
```

**Redeploy** also recreates/starts the app process (if you changed code or image):

```bash
fly deploy
```

---

## About “Standby” in `fly status`

If Fly labels a machine as **standby** (†), it is a backup role in the pool. Starting it with `fly machine start` is still valid. If you only ever want **one** always-on bot process, prefer:

```bash
npm run fly:scale-one
```

(from `package.json`: `fly scale count 1 --max-per-region 1`)

If the machine **stops again after a few minutes** on a trial account, Fly may be enforcing trial limits—check the dashboard and [Fly pricing](https://fly.io/docs/about/pricing/).

---

## Auth & app

```bash
fly auth login
fly apps list
fly status -a discord-joke-bot
```

---

## Secrets (same as `.env`, but on Fly)

```bash
fly secrets list -a discord-joke-bot

fly secrets set BOT_TOKEN="..." APPLICATION_ID="..." PUBLIC_KEY="..." -a discord-joke-bot
# optional:
fly secrets set BAD_ROLLER_NAME="Kimo" -a discord-joke-bot
```

Secrets apply to the next deploy or machine start that loads the app.

---

## Deploy & release

```bash
fly deploy -a discord-joke-bot
```

This repo’s `fly.toml` may run **`release_command`** (`node scripts/deploy-commands.js`) once per deploy to register slash commands—see main **README** if you want to remove that.

---

## Scale (one Machine)

```bash
npm run fly:scale-one
# or:
fly scale count 1 --max-per-region 1 -a discord-joke-bot
fly scale show -a discord-joke-bot
```

---

## Logs & debug

```bash
fly logs -a discord-joke-bot
fly logs -a discord-joke-bot --no-tail
fly ssh console -a discord-joke-bot
```

---

## Machine lifecycle (optional)

```bash
fly machine stop <id> -a discord-joke-bot
fly machine start <id> -a discord-joke-bot
fly machine restart <id> -a discord-joke-bot
fly machine list -a discord-joke-bot
```

---

## Docker build locally (same as Fly’s build)

```bash
npm run verify:docker
```

---

## Resource / cost notes (this bot)

- **Fly** already uses **1 shared CPU** and **256 MB RAM** (`fly.toml` `[[vm]]`). That caps the Machine size; Fly does not add more CPUs automatically when Discord traffic spikes.
- The **Dockerfile** sets `NODE_OPTIONS=--max-old-space-size=200` so the Node heap stays bounded on small VMs (less GC thrash under load).
- In the app, **per-user rate limits** on slash commands and message handling reduce CPU burn if someone spams commands or messages (see `src/constants/limits.js`).

## Troubleshooting

| Symptom | What to try |
|--------|-------------|
| Machine **stopped** | `fly machine start <id> -a discord-joke-bot` or `fly deploy` |
| Bot **offline** after start | `fly logs`; check `BOT_TOKEN` / intents in Discord Portal |
| **Trial** stops after ~5 minutes | Fly trial limits; add a payment method or upgrade per Fly docs |
| Slash commands missing | Run `npm run deploy-commands` locally with same app credentials, or keep `release_command` in `fly.toml` |
