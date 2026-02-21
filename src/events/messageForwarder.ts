import {
	ListenerEvent,
	MessageCreateListener,
	type ListenerEventData,
	type Client,
} from "@buape/carbon";
import type { HolePuncherConfig } from "../config.js";
import type { TerminalSession } from "../terminal.js";

const MAX_ATTACHMENT_LIST = 5;

type MessageCreateData = ListenerEventData[typeof ListenerEvent.MessageCreate];

export default class MessageForwarder extends MessageCreateListener {
	constructor(
		private readonly config: HolePuncherConfig,
		private readonly terminal: TerminalSession,
	) {
		super();
	}

	async handle(data: ListenerEventData[this["type"]], _client: Client): Promise<void> {
		if (data.author.bot) return;
		if (data.channel_id !== this.config.channelId) return;
		if (data.author.id !== this.config.userId) {
			console.warn(
				`⚠️ Received message from unexpected user ${data.author.id}, expected ${this.config.userId}`,
			);
			return;
		}

		const message = formatMessage(data);
		if (!message) return;

		const payload = message.endsWith("\n") ? message : `${message}\n`;
		this.terminal.write(payload);
		console.log(
			`[Hole Puncher] Forwarded message ${data.id} from ${data.author.username} (${data.author.id}).`,
		);
	}
}

function formatMessage(data: MessageCreateData): string | null {
	const content = data.content?.trim();
	const attachmentUrls = data.attachments
		?.map((attachment) => attachment.url)
		.filter(Boolean)
		.slice(0, MAX_ATTACHMENT_LIST);

	const lines: string[] = [];

	if (content) {
		lines.push(content);
	}

	if (attachmentUrls?.length) {
		lines.push(`Attachments: ${attachmentUrls.join(" ")}`);
		if ((data.attachments?.length ?? 0) > attachmentUrls.length) {
			lines.push(
				`(${(data.attachments?.length ?? 0) - attachmentUrls.length} more attachments omitted)`,
			);
		}
	}

	return lines.length ? lines.join("\n") : null;
}
