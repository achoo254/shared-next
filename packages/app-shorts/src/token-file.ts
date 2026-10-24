// The owner's `access-tokens.json` (kept in iCloud, never in a repository): a `tokens` array of
// `{ service, used_by, token }` entries. Errors name the entry and the missing field, never a value,
// and a write keeps every other key and entry of the file as it was.
import { readFileSync, renameSync, writeFileSync } from "node:fs";

export const TOKEN_FILE_ENV = "MARKETING_TOKEN_FILE";
export const YOUTUBE_SERVICE = "youtube.googleapis.com";

/** OAuth client of the Google Cloud project and the refresh token the channel owner granted. */
export interface YoutubeSecret {
	client_id: string;
	client_secret: string;
	refresh_token: string;
	/** The channel the grant was made for, checked when it was saved. */
	channel_id?: string;
}

/** Entries of other services keep whatever shape they have (some list several users in `used_by`). */
interface TokenEntry {
	service: unknown;
	used_by: unknown;
	token: unknown;
}

interface TokenFile {
	tokens: TokenEntry[];
	[key: string]: unknown;
}

export class CredentialError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CredentialError";
	}
}

/** The token file path: the `--token-file` argument, else the environment variable. */
export function tokenFilePath(
	fromArgs: string | undefined,
	env: NodeJS.ProcessEnv = process.env,
): string {
	const file = fromArgs ?? env[TOKEN_FILE_ENV];
	if (!file) {
		throw new CredentialError(
			`pass --token-file or set ${TOKEN_FILE_ENV} to the path of access-tokens.json`,
		);
	}
	return file;
}

function isEntry(value: unknown): value is TokenEntry {
	return typeof value === "object" && value !== null;
}

function parseTokenFile(text: string): TokenFile {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		// The parser's message is left out on purpose: it can quote the file.
		throw new CredentialError("the token file is not valid JSON");
	}
	const tokens = (parsed as { tokens?: unknown } | null)?.tokens;
	if (!Array.isArray(tokens) || !tokens.every(isEntry)) {
		throw new CredentialError("the token file has no valid `tokens` array");
	}
	return parsed as TokenFile;
}

function readTokenFile(file: string): { data: TokenFile; crlf: boolean } {
	let text: string;
	try {
		text = readFileSync(file, "utf8");
	} catch {
		throw new CredentialError("cannot read the token file");
	}
	return { data: parseTokenFile(text), crlf: text.includes("\r\n") };
}

/** Throws now, before the owner is asked for anything, when the token file cannot be read or written back. */
export function checkTokenFile(file: string): void {
	readTokenFile(file);
}

/** The YouTube grant saved for `usedBy`, e.g. "hoandat-apps marketing". */
export function readYoutubeSecret(file: string, usedBy: string): YoutubeSecret {
	const label = `${YOUTUBE_SERVICE} / ${usedBy}`;
	const matches = readTokenFile(file).data.tokens.filter(
		(t) => t.service === YOUTUBE_SERVICE && t.used_by === usedBy,
	);
	if (matches.length === 0) {
		throw new CredentialError(`the token file has no entry ${label}`);
	}
	if (matches.length > 1) {
		throw new CredentialError(
			`the token file has ${matches.length} entries ${label}; keep one`,
		);
	}
	const token = (matches[0]?.token ?? {}) as Record<string, unknown>;
	const missing = ["client_id", "client_secret", "refresh_token"].filter(
		(field) => typeof token[field] !== "string" || token[field] === "",
	);
	if (missing.length > 0) {
		throw new CredentialError(
			`entry ${label} is missing or has a malformed field: ${missing.join(", ")}`,
		);
	}
	return token as unknown as YoutubeSecret;
}

/**
 * Adds or replaces the YouTube grant of `usedBy`, keeping everything else in the file. The new
 * text goes to a sibling file first and replaces the original in one rename, so a crash midway
 * never leaves a half-written token file.
 */
export function saveYoutubeSecret(
	file: string,
	usedBy: string,
	secret: YoutubeSecret,
): void {
	const { data, crlf } = readTokenFile(file);
	const entry: TokenEntry = {
		service: YOUTUBE_SERVICE,
		used_by: usedBy,
		token: secret,
	};
	const index = data.tokens.findIndex(
		(t) => t.service === YOUTUBE_SERVICE && t.used_by === usedBy,
	);
	if (index === -1) data.tokens.push(entry);
	else data.tokens[index] = entry;
	let text = `${JSON.stringify(data, null, 2)}\n`;
	if (crlf) text = text.replace(/\n/g, "\r\n");
	const temporary = `${file}.saving`;
	writeFileSync(temporary, text, { mode: 0o600 });
	renameSync(temporary, file);
}
