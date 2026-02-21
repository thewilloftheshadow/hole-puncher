import { spawn } from "node-pty";

export type TerminalSessionOptions = {
	shell?: string;
	cwd?: string;
	cols?: number;
	rows?: number;
	env?: Record<string, string | undefined>;
};

export type TerminalSession = {
	write: (input: string) => void;
	onData: (handler: (data: string) => void) => void;
	dispose: () => void;
};

const DEFAULT_COLS = 120;
const DEFAULT_ROWS = 40;

export function createTerminalSession(options: TerminalSessionOptions = {}): TerminalSession {
	const shell = options.shell ?? defaultShell();
	const pty = spawn(shell, [], {
		name: "xterm-256color",
		cols: options.cols ?? DEFAULT_COLS,
		rows: options.rows ?? DEFAULT_ROWS,
		cwd: options.cwd ?? process.cwd(),
		env: buildEnv(options.env),
	});

	return {
		write: (input: string) => {
			pty.write(input);
		},
		onData: (handler: (data: string) => void) => {
			pty.onData(handler);
		},
		dispose: () => {
			pty.kill();
		},
	};
}

function defaultShell(): string {
	if (process.env.SHELL) return process.env.SHELL;
	if (process.platform === "win32") return "powershell.exe";
	return "/bin/bash";
}

function buildEnv(overrides: Record<string, string | undefined> = {}): Record<string, string> {
	const env: Record<string, string> = {};
	for (const [key, value] of Object.entries(process.env)) {
		if (value !== undefined) {
			env[key] = value;
		}
	}

	for (const [key, value] of Object.entries(overrides)) {
		if (value !== undefined) {
			env[key] = value;
		}
	}

	return env;
}
