# Discord Joke Bot

A small [discord.js](https://discord.js.org) bot for humor, keyword replies, cats, jokes, and a few admin-only utilities (timers, D&D availability polls).

---

## Features

- **Slash commands** — help, jokes, cats, dice rolls, timers, D&D availability polls, and a list of text triggers.
- **Message triggers** — keyword replies, directed greetings, name gags, and optional insult clapbacks (with safeguards).
- **External APIs** — [The Cat API](https://thecatapi.com/) and [JokeAPI](https://v2.jokeapi.dev/).

### Project layout (option B)

| Folder | Purpose |
|--------|---------|
| `src/commands/` | Slash command definitions (`data` + `execute`). |
| `src/events/` | Discord client events (`ready`, `messageCreate`, `interactionCreate`). |
| `src/handlers/` | Non-slash message pipeline (e.g. keyword replies). |
| `src/api/` | HTTP client + outbound API calls (axios, timeouts), including [D&D 5e API](https://www.dnd5eapi.co/) helpers. |
| `src/services/` | Reusable domain logic (dice, text matching, cooldowns). |
| `src/guards/` | Permission / “is this message for the bot?” checks. |
| `src/middleware/` | Cross-cutting slash-command helpers (e.g. centralized error replies). |
| `src/constants/` | Copy, limits, endpoints, safe mention presets. |

---

## Prerequisites

- **Node.js** (v18+ recommended; v22 works well).
- A **Discord application** with a bot user: [Discord Developer Portal](https://discord.com/developers/applications).

---

## Quick start

1. **Clone and install**

   ```bash
   git clone git@github.com:Sovereign-Greed/discord-joke-bot.git
   cd discord-joke-bot
   npm install
   ```

2. **Environment**

   ```bash
   npm run env:init
   ```

   Edit `.env` and set:

   | Variable | Where to find it |
   |----------|------------------|
   | `BOT_TOKEN` | Portal → **Bot** → reset/copy token (keep secret). |
   | `APPLICATION_ID` | Portal → **General Information** → Application ID (same snowflake as the bot user). |
   | `PUBLIC_KEY` | Portal → **General Information** → Public Key (64 hex chars). |
   | `BAD_ROLLER_NAME` | Optional. First name or nickname used in **`/roll`** natural-1 jokes. Leave unset to disable that flavor. |

   Validate:

   ```bash
   npm run check-env
   ```

3. **Register slash commands** (required for `/help`, `/cat`, etc.)

   ```bash
   npm run deploy-commands
   ```

   You should see a line like: `Registered N global application (/) command(s).`  
   **Global commands** can take **up to about an hour** to show in every server; they often appear quickly in **DMs with the bot** or after a short wait in a guild.

4. **Run the bot**

   ```bash
   npm start
   ```

   For local development (restart on save):

   ```bash
   npm run dev
   ```

---

## Invite the bot to your server

In the Developer Portal, use **OAuth2 → URL Generator**:

- **Scopes:** `bot`, `applications.commands`
- **Bot permissions** (minimum starting point): View channels, Send messages, Embed links, Read message history, Add reactions, Mention everyone (not required for this bot’s safe defaults), Use slash commands.

Open the generated URL, pick your server, and authorize.

If slash commands never appear in a guild, generate a **new** invite with **`applications.commands`** checked and add the bot again so that scope is granted.

---

## Slash commands

| Command | Who can use it | What it does |
|---------|----------------|--------------|
| `/help` | Everyone | Lists registered slash commands. |
| `/list-triggers` | Everyone (ephemeral) | Summarizes **message** triggers and points at `/cat` / `/joke`. |
| `/cat` | Everyone | Random cat image (Cat API). |
| `/joke` | Everyone | Random one-liner (JokeAPI). |
| `/roll` | Everyone | Roll dice (supports `notation` like `2d6+3`); **adv/dis** rolls the pool twice and keeps the higher/lower **total**. Optional nat-1 jokes if `BAD_ROLLER_NAME` is set (see **Personalization**). |
| `/spell` | Everyone | SRD spell lookup ([dnd5eapi.co](https://www.dnd5eapi.co/)) — compact embed + links. |
| `/monster` | Everyone | SRD monster lookup — compact embed + links. |
| `/timer` | **Admin** (Administrator permission **or** role named `Admin`) | Starts a timer and pings one user when it ends (per-channel cooldowns apply). |
| `/check-dnd-availability` | **Admin** (same as above) | Posts an embed + **✅ / ❌** reaction “poll” and pings the **`Players`** role only. |

**D&D poll note:** The server must have a role named **`Players`** (case-insensitive match). Create or rename a role to match, or change `PLAYERS_ROLE_NAME` in `src/constants/roles.js` to match your server.

---

## Message triggers (no slash)

Users can still trigger replies by typing in chat (exact phrases, keywords, etc.). For an up-to-date list, run **`/list-triggers`** in Discord.

To edit behavior, see **Personalization** below.

---

## Personalization for your server

These are the main places to customize without rewriting the whole bot:

1. **Keyword replies and meme lines** — `src/constants/replies.js`  
   Add or change `{ match, reply }` entries. Single-word matches use **whole-word** matching; phrases with spaces use substring rules (see code comments).

2. **Name-intro prefixes** (`im` / `i’m` / `i am`) — `src/constants/triggers.js`

3. **Greeting words** (hi / hey / hello to the bot) — `src/constants/phrases.js`

4. **Directed insult replies** — `src/constants/botInsults.js` (word lists and witty lines).

5. **Role names used by commands** — `src/constants/roles.js`  
   - Default **Admin** gate for `/timer` and `/check-dnd-availability` (also accepts **Administrator** permission).  
   - Default **`Players`** role for D&D pings. Align these names with your server or change the constants.

6. **Limits** (timeouts, cooldowns) — `src/constants/limits.js`

7. **`/roll` friend who rolls badly** — Set `BAD_ROLLER_NAME` in `.env` (e.g. a friend’s first name). On a **natural 1** on a single **d20**, the bot may add a lighthearted line that uses that name. If `BAD_ROLLER_NAME` is **unset or empty**, those nat-1 lines are **disabled** (no extra text for nat 1). To change the jokes themselves, edit the `NAT1_FRIEND_LINES` array in `src/services/diceRoll.js`: each string can include `{name}` where the env value should appear.

8. **`/roll` input tips**  
   - Use `notation` for quick rolls: `2d6+3`, `d20-1`, `4d8`  
   - Or use `die` + `count` + `modifier`  
   - Set `mode` to `advantage` / `disadvantage` to roll the whole pool twice and keep the better/worse total.

9. **Server integration UI** — In Discord: **Server Settings → Integrations → your bot** to tweak which roles can use which slash commands in that server (overrides are per-guild).

10. **Fork-only ideas** — Swap API base URLs in `src/constants/endpoints.js`, adjust embed colors in command files, or add new slash commands under `src/commands/` and register them in `src/commands/index.js`, then run **`npm run deploy-commands`** again.

---

## Deploy on Fly.io

This repo includes a **`Dockerfile`** and **`fly.toml`** for [Fly Machines](https://fly.io/docs/machines/). The bot is a **long-running process** (no HTTP server); Fly runs `npm start`, which runs `prestart` (`check-env`) then `node src/index.js`.

**Fly CLI cheat sheet** (start/stop machines, secrets, logs): **[docs/fly.md](docs/fly.md)**.

**GitHub Actions CI/CD** (lint + deploy to Fly on `master`): **[docs/github-cicd.md](docs/github-cicd.md)** — set the **`FLY_API_TOKEN`** secret and configure branch protection so merges match your policy.

### Prereqs

- Install the [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) (`flyctl`).
- Have Docker available locally if you want to build/test images before deploying.

### Local checks before deploy

```bash
npm run build               # ESLint (same as `verify`)
npm run build:docker        # Docker image only
npm run build:all             # lint + Docker image (same idea as `verify:docker`)
npm run verify               # ESLint only (CI-friendly)
npm run verify:docker        # lint + `docker build` (matches Fly’s Docker build)
npm run build:babel          # optional: transpile `src/` → `build/` (not used by `npm start`)
```

Optional smoke test (does **not** connect to Discord until env is valid):

```bash
docker run --rm ^
  -e BOT_TOKEN=your_token ^
  -e APPLICATION_ID=your_app_id ^
  -e PUBLIC_KEY=your_public_key ^
  discord-joke-bot:local
```

(Use `\` line continuations on macOS/Linux instead of `^`.)

### First-time Fly setup

1. Log in: `fly auth login`
2. From the repo root, create the app (pick a unique name if `discord-joke-bot` is taken):

   ```bash
   fly launch --no-deploy
   ```

   Align `app` in `fly.toml` with the name Fly created, or edit `fly.toml` after launch.

3. Set secrets (same values as `.env`; no file is uploaded):

   ```bash
   fly secrets set BOT_TOKEN="..." APPLICATION_ID="..." PUBLIC_KEY="..."
   ```

   Optional:

   ```bash
   fly secrets set BAD_ROLLER_NAME="Kimo"
   ```

4. Deploy:

   ```bash
   fly deploy
   ```

`fly.toml` includes a **`release_command`** that runs `node scripts/deploy-commands.js` so global slash commands stay registered on each deploy. Remove the `[deploy]` block in `fly.toml` if you prefer registering commands only from your laptop (`npm run deploy-commands`).

### Scale to exactly one Machine (recommended)

This bot does not need horizontal scaling. After the app exists, pin **one** Machine and cap **one per region**:

```bash
npm run fly:scale-one
fly scale show
```

That maps to `fly scale count 1 --max-per-region 1`. Fly does **not** auto-scale this app unless you separately add an autoscaler or scale commands yourself—staying at **count 1** keeps cost predictable.

`[[vm]]` in `fly.toml` is already the **smallest** shared CPU + **256 MB** RAM Fly enforces from the file (good for a Discord gateway bot).

### Understanding `fly logs` (release vs main bot)

On deploy you will often see **two different Machines** in the log stream:

1. **Release Machine** — Fly runs **`release_command`** (`node scripts/deploy-commands.js`) in a **short-lived** Machine. It prints `Registered N global application…`, exits with code **0**, and shuts down. **This is normal.** It is **not** your main bot “restarting.”
2. **App Machine** — A separate long-running Machine runs **`CMD`** (`npm start` → Discord client). That is the bot.

So: the app is **not** failing because `deploy-commands` finished; that job is **supposed** to exit. If you want **one fewer** Fly Machine per deploy, remove the `[deploy]` block and run `npm run deploy-commands` locally when slash commands change.

**Trial time limit:** Logs like `Trial machine stopping… To run for longer than 5m0s, add a credit card` come from Fly’s **trial/account** rules, not from this repo. A 24/7 bot usually needs a **paid** (or card-backed) Fly plan—check [Fly pricing](https://fly.io/docs/about/pricing/) for current free allowances.

**Practical ways to limit spend**

- Keep **one** Machine (`npm run fly:scale-one`) and **one** region in `fly.toml` (`primary_region`).
- Avoid extra Machines: don’t run `fly machine clone` / scale up unless you mean to.
- Optional: drop **`release_command`** so each deploy doesn’t spin a second Machine for `deploy-commands` (register commands from CI or your PC instead).
- Watch usage: `fly dashboard` / billing email alerts if Fly offers them.
- This bot has **no public HTTP** in `fly.toml`, so Fly Proxy **autostop/autostart** for idle web apps does not apply the same way as for an HTTP service—billing is mostly “Machine running × size × time.”

### After deploy

- Logs: `fly logs`
- SSH (debug): `fly ssh console`
- Status: `fly status`

### CI

GitHub Actions runs `npm run lint:check` on pushes/PRs to `main`/`master` (see `.github/workflows/ci.yml`).

---

## Troubleshooting

- **`npm run deploy-commands` fails** — Check `BOT_TOKEN` and `APPLICATION_ID` belong to the **same** application.  
- **Slash commands missing in a server** — Wait for global propagation, try a DM with the bot first, confirm the invite includes `applications.commands`, restart the Discord client once.  
- **Bot “does nothing” on messages** — Ensure **Message Content Intent** is enabled in the Portal if you rely on non-slash triggers (the bot reads message text for those).

---

## Contributing

Pull requests are welcome: new triggers, commands, or API improvements.

---

## License

This project is licensed under the [ISC License](LICENSE).
