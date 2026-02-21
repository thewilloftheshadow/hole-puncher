import { Client } from "@buape/carbon";
import { GatewayIntents, GatewayPlugin } from "@buape/carbon/gateway";
import { loadConfig } from "./config.js";
import MessageForwarder from "./events/messageForwarder.js";
import { OutputStreamer } from "./outputStreamer.js";
import { createTerminalSession } from "./terminal.js";

const config = await loadConfig();
const terminal = createTerminalSession();
const pendingOutput: string[] = [];
let outputStreamer: OutputStreamer | null = null;

terminal.onData((data) => {
	if (outputStreamer) {
		outputStreamer.push(data);
		return;
	}
	pendingOutput.push(data);
});

const gateway = new GatewayPlugin({
	intents: GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent,
});

const client = new Client(
	{
		baseUrl: "http://localhost",
		clientId: "1",
		publicKey: "1",
		token: config.botToken,
		disableDeployRoute: true,
		disableEventsRoute: true,
		disableInteractionsRoute: true,
	},
	{
		commands: [],
		listeners: [new MessageForwarder(config, terminal)],
	},
	[gateway],
);

outputStreamer = new OutputStreamer(client, config.channelId);
if (pendingOutput.length) {
	pendingOutput.forEach((data) => outputStreamer?.push(data));
	pendingOutput.length = 0;
}

console.log(
	`Hole Puncher forwarding user ${config.userId} in channel ${config.channelId} to a live PTY session.`,
);

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_BOT_TOKEN?: string;
			HOLE_PUNCHER_CHANNEL_ID?: string;
			HOLE_PUNCHER_USER_ID?: string;
		}
	}
}
