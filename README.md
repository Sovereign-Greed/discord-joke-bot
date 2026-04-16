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
| `/roll` | Everyone | Roll dice with optional modifier and adv/dis for **d20**. |
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

7. **Server integration UI** — In Discord: **Server Settings → Integrations → your bot** to tweak which roles can use which slash commands in that server (overrides are per-guild).

8. **Fork-only ideas** — Swap API base URLs in `src/constants/endpoints.js`, adjust embed colors in command files, or add new slash commands under `src/commands/` and register them in `src/commands/index.js`, then run **`npm run deploy-commands`** again.

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
