import type { Client } from "@buape/carbon";
import { Routes } from "discord-api-types/v10";

const MIN_CHUNK = 1500;
const MAX_CHUNK = 1800;
const DEFAULT_FLUSH_INTERVAL = 150;

export class OutputStreamer {
	private buffer = "";
	private flushTimer: NodeJS.Timeout | null = null;
	private sending: Promise<void> = Promise.resolve();

	constructor(
		private readonly client: Client,
		private readonly channelId: string,
		private readonly flushIntervalMs: number = DEFAULT_FLUSH_INTERVAL,
	) {}

	push(data: string): void {
		const cleaned = stripAnsi(data.replace(/\r/g, ""));
		if (!cleaned) return;
		this.buffer += cleaned;
		if (this.buffer.length >= MAX_CHUNK) {
			this.flush();
			return;
		}
		this.scheduleFlush();
	}

	private scheduleFlush(): void {
		if (this.flushTimer) return;
		this.flushTimer = setTimeout(() => this.flush(), this.flushIntervalMs);
	}

	private flush(): void {
		if (this.flushTimer) {
			clearTimeout(this.flushTimer);
			this.flushTimer = null;
		}
		if (!this.buffer) return;
		const payload = this.buffer;
		this.buffer = "";
		const chunks = chunkOutput(payload);
		if (!chunks.length) return;
		this.enqueueChunks(chunks);
	}

	private enqueueChunks(chunks: string[]): void {
		this.sending = this.sending
			.then(() => this.sendChunks(chunks))
			.catch((error) => {
				console.error("[Hole Puncher] Failed to send output chunk:", error);
			});
	}

	private async sendChunks(chunks: string[]): Promise<void> {
		for (const chunk of chunks) {
			const content = chunk.trim().length ? chunk : `\u200b${chunk}`;
			await this.client.rest.post(Routes.channelMessages(this.channelId), {
				body: {
					content,
				},
			});
		}
	}
}

function chunkOutput(output: string): string[] {
	const chunks: string[] = [];
	let remaining = output;

	while (remaining.length > 0) {
		if (remaining.length <= MAX_CHUNK) {
			chunks.push(remaining);
			break;
		}

		const breakIndex = findBreakIndex(remaining);
		chunks.push(remaining.slice(0, breakIndex));
		remaining = remaining.slice(breakIndex);
	}

	return chunks;
}

function findBreakIndex(text: string): number {
	const upper = Math.min(text.length, MAX_CHUNK);
	const lower = Math.min(MIN_CHUNK, upper);

	for (let i = upper; i >= lower; i -= 1) {
		const char = text[i - 1];
		if (char === "\n" || char === " ") {
			return i;
		}
	}

	return upper;
}

const ANSI_ESC = String.fromCharCode(27);
const ANSI_BEL = String.fromCharCode(7);
const ANSI_CSI = new RegExp(`${ANSI_ESC}\\[[0-9;?]*[A-Za-z]`, "g");
const ANSI_OSC_BEL = new RegExp(`${ANSI_ESC}\\][^${ANSI_ESC}]*${ANSI_BEL}`, "g");
const ANSI_OSC_ST = new RegExp(`${ANSI_ESC}\\][^${ANSI_ESC}]*${ANSI_ESC}\\\\`, "g");

function stripAnsi(text: string): string {
	return text.replace(ANSI_CSI, "").replace(ANSI_OSC_BEL, "").replace(ANSI_OSC_ST, "");
}
