# Hole Puncher

Hole Puncher is a Carbon-based Discord bot that turns one Discord channel into a live PTY shell. It forwards messages from a single user to a local shell and streams the output back into the same channel.

## ⚠️ Danger Zone

This project blindly injects Discord message content into a live shell session. That is effectively remote input into whatever is running in that session. Treat it like handing someone your keyboard: a malicious or compromised account can run commands, exfiltrate secrets, delete data, or otherwise destroy your host. Only use this in tightly controlled environments, lock it to a single trusted user/channel, and never point it at a shell you care about.

## Requirements

- Bun 1.1+
- A host that can build native dependencies (`node-pty`)
- Discord app with the **Message Content** gateway intent enabled

## Quick Start

1. **Create a Discord app**
    - In the [Discord Developer Portal](https://discord.com/developers/applications), create an app + bot.
    - Enable **Message Content** intent.
    - Copy the **Bot Token**.
2. **Invite the bot** to your server with permissions to read and send messages.
3. **Configure Hole Puncher**
    - Copy `config.json.example` to `config.json` and fill it in:
        ```json
        {
        	"channelId": "123456789012345678",
        	"userId": "123456789012345678",
        	"botToken": "your-bot-token"
        }
        ```
    - Or set environment variables instead of `config.json`:
        - `HOLE_PUNCHER_CHANNEL_ID`
        - `HOLE_PUNCHER_USER_ID`
        - `DISCORD_BOT_TOKEN`
4. **Install + run**
    ```bash
    bun install
    bun run dev
    ```

For production:

```bash
bun run start
```

## Usage

- Send a message in the configured channel as the configured user.
- The bot writes it to the PTY shell and streams output back to Discord.
- The PTY session is in-memory and **resets if the bot restarts**.

## Streaming Output

Output is streamed live back into the channel and chunked into messages between **1500–1800 characters**. Heavy output can hit Discord rate limits and lag behind real time. Failed sends are logged but not retried.

## Scripts

- `bun run lint` → `oxlint .`
- `bun run format` → `oxfmt .`
- `bun run typecheck` → `tsc --noEmit`

## Troubleshooting

- **No output?** Ensure Message Content intent is enabled and the bot can read the channel.
- **Wrong user/channel?** Double-check `channelId` + `userId` in config.
- **Native build failures?** `node-pty` requires a working compiler toolchain on your host.
