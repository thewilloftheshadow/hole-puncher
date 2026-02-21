# Hole Puncher

A Carbon-based Discord bot that forwards a single user's messages from a single channel into a live PTY shell session.

## ⚠️ Danger Zone

This project blindly injects Discord message content into a live shell session. That is effectively remote input into whatever is running in that session. Treat it like handing someone your keyboard: a malicious or compromised account can run commands, exfiltrate secrets, delete data, or otherwise destroy your host. Only use this in tightly controlled environments, lock it to a single trusted user/channel, and never point it at a shell you care about.

## Requirements

- Bun 1.1+
- A host that can build native dependencies (`node-pty`)
- Discord app with the **Message Content** gateway intent enabled

## Configuration

Copy `config.json.example` to `config.json` and fill in your IDs:

```json
{
	"channelId": "123456789012345678",
	"userId": "123456789012345678",
	"botToken": "your-bot-token"
}
```

You can also set environment variables instead of `config.json`:

- `HOLE_PUNCHER_CHANNEL_ID`
- `HOLE_PUNCHER_USER_ID`
- `DISCORD_BOT_TOKEN` (if not set in `config.json`)

The PTY session is in-memory and resets if the bot restarts.

## Discord Environment

Set the standard Carbon/Discord environment variables (for example in a `.env` file):

- `BASE_URL` (required by Carbon but unused since HTTP routes are disabled)
- `DISCORD_CLIENT_ID`
- `DISCORD_PUBLIC_KEY` (required by Carbon but unused since HTTP routes are disabled)
- `DISCORD_BOT_TOKEN` (if not set in `config.json`)

## Streaming Output

Terminal output is streamed live back into the channel. Output is chunked into Discord messages between 1500 and 1800 characters, preserving all content.

## Running

```bash
bun install
bun run dev
```

For production:

```bash
bun run start
```

Messages sent by the configured user in the configured channel are injected directly into the PTY shell and streamed back to Discord.
