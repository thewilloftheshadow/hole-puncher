import { readFile } from "node:fs/promises";
import { accessSync, constants } from "node:fs";
import path from "node:path";

export type HolePuncherConfig = {
	channelId: string;
	userId: string;
	botToken: string;
};

const CONFIG_FILE = "config.json";

function loadConfigFile(): Promise<Partial<HolePuncherConfig>> | null {
	const configPath = path.resolve(process.cwd(), CONFIG_FILE);
	try {
		accessSync(configPath, constants.R_OK);
	} catch {
		return null;
	}

	return readFile(configPath, "utf8").then(
		(raw) => JSON.parse(raw) as Partial<HolePuncherConfig>,
	);
}

function requireConfigValue(value: string | undefined, envVarName: string): string {
	if (!value?.trim()) {
		throw new Error(
			`Missing ${envVarName}. Set it in config.json or via the ${envVarName} environment variable.`,
		);
	}

	return value;
}

export async function loadConfig(): Promise<HolePuncherConfig> {
	const fileConfig = (await loadConfigFile()) ?? {};
	const channelId = requireConfigValue(
		fileConfig.channelId ?? process.env.HOLE_PUNCHER_CHANNEL_ID,
		"HOLE_PUNCHER_CHANNEL_ID",
	);
	const userId = requireConfigValue(
		fileConfig.userId ?? process.env.HOLE_PUNCHER_USER_ID,
		"HOLE_PUNCHER_USER_ID",
	);
	const botToken = requireConfigValue(
		fileConfig.botToken ?? process.env.DISCORD_BOT_TOKEN,
		"DISCORD_BOT_TOKEN",
	);

	return {
		channelId,
		userId,
		botToken,
	};
}
