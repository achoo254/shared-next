// One-time YouTube grant for a channel, done the way Google documents for desktop apps: a loopback
// redirect on 127.0.0.1 with PKCE. The owner opens the printed address, picks the channel and allows
// access; the script trades the code for a refresh token, checks that the grant belongs to the
// expected channel, and saves it to the token file. No secret is printed.
//
//   node src/youtube-grant.ts --client <client_secret_*.json> --used-by "hoandat-apps marketing" \
//     --channel UC5kF-54QdobLrtQ94tgVLmg [--token-file <access-tokens.json>]
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { parseArgs } from "node:util";
import { isEntryPoint } from "./paths.ts";
import {
	checkTokenFile,
	saveYoutubeSecret,
	tokenFilePath,
} from "./token-file.ts";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CHANNELS_URL =
	"https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true";
/** Upload videos, and read the channel to confirm which one was granted. */
const SCOPES = [
	"https://www.googleapis.com/auth/youtube.upload",
	"https://www.googleapis.com/auth/youtube.readonly",
];
const WAIT_MS = 15 * 60 * 1000;

interface DesktopClient {
	client_id: string;
	client_secret: string;
}

/** What Google's token endpoint answers for an authorization code. */
interface CodeAnswer {
	refresh_token: string;
	access_token: string;
}

/** The `installed` block of the JSON file the Cloud Console downloads for a Desktop app client. */
export function readDesktopClient(file: string): DesktopClient {
	const parsed = JSON.parse(readFileSync(file, "utf8")) as {
		installed?: Partial<DesktopClient>;
	};
	const client = parsed.installed;
	if (!client?.client_id || !client.client_secret) {
		throw new Error(
			"the client file is not a Desktop app client (no `installed.client_id` / `client_secret`)",
		);
	}
	return { client_id: client.client_id, client_secret: client.client_secret };
}

export function consentUrl(
	clientId: string,
	redirectUri: string,
	state: string,
	challenge: string,
): string {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: SCOPES.join(" "),
		access_type: "offline",
		// Without a fresh consent Google returns no refresh token for a client already granted, and
		// without the chooser it reuses the channel picked last time.
		prompt: "consent select_account",
		state,
		code_challenge: challenge,
		code_challenge_method: "S256",
	});
	return `${AUTH_URL}?${params}`;
}

async function exchangeCode(
	client: DesktopClient,
	code: string,
	verifier: string,
	redirectUri: string,
): Promise<CodeAnswer> {
	const response = await fetch(TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			...client,
			code,
			code_verifier: verifier,
			grant_type: "authorization_code",
			redirect_uri: redirectUri,
		}),
	});
	const body = (await response.json().catch(() => null)) as Partial<
		CodeAnswer & { error: string }
	> | null;
	if (!response.ok) {
		throw new Error(
			`Google refused the code (${response.status} ${body?.error ?? ""})`,
		);
	}
	if (
		typeof body?.refresh_token !== "string" ||
		typeof body.access_token !== "string"
	) {
		throw new Error("Google answered without a refresh token");
	}
	return body as CodeAnswer;
}

async function grantedChannel(
	accessToken: string,
): Promise<{ id: string; title: string }> {
	const response = await fetch(CHANNELS_URL, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!response.ok) {
		throw new Error(
			`YouTube would not list the granted channel (${response.status})`,
		);
	}
	const body = (await response.json()) as {
		items?: { id: string; snippet?: { title?: string } }[];
	};
	const channel = body.items?.[0];
	if (!channel) throw new Error("the grant has no YouTube channel");
	return { id: channel.id, title: channel.snippet?.title ?? "" };
}

async function main(): Promise<void> {
	const { values } = parseArgs({
		options: {
			client: { type: "string" },
			"used-by": { type: "string" },
			channel: { type: "string" },
			"token-file": { type: "string" },
		},
	});
	const { client: clientFile, "used-by": usedBy, channel: expected } = values;
	if (!clientFile || !usedBy || !expected) {
		throw new Error(
			"usage: youtube-grant --client <file> --used-by <name> --channel <UC…> [--token-file <file>]",
		);
	}
	const tokenFile = tokenFilePath(values["token-file"]);
	checkTokenFile(tokenFile);
	const client = readDesktopClient(clientFile);
	const verifier = randomBytes(48).toString("base64url");
	const challenge = createHash("sha256").update(verifier).digest("base64url");
	const state = randomBytes(16).toString("base64url");

	await new Promise<void>((resolve, reject) => {
		let redirectUri = "";
		const finish = (error?: Error): void => {
			clearTimeout(timer);
			server.close();
			if (error) reject(error);
			else resolve();
		};
		const server = createServer((request, response) => {
			const url = new URL(request.url ?? "/", redirectUri);
			if (url.pathname !== "/") {
				response.writeHead(404).end();
				return;
			}
			const reply = (status: number, text: string): void => {
				response
					.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" })
					.end(text);
			};
			if (url.searchParams.get("state") !== state) {
				reply(400, "State does not match; start the grant again.");
				return;
			}
			const code = url.searchParams.get("code");
			if (!code) {
				const error = url.searchParams.get("error") ?? "no code";
				reply(400, `Access was not granted (${error}).`);
				finish(new Error(`access was not granted (${error})`));
				return;
			}
			exchangeCode(client, code, verifier, redirectUri)
				.then(async (answer) => {
					const channel = await grantedChannel(answer.access_token);
					if (channel.id !== expected) {
						throw new Error(
							`the grant is for channel "${channel.title}" (${channel.id}), not ${expected}; nothing was saved`,
						);
					}
					const { refresh_token } = answer;
					saveYoutubeSecret(tokenFile, usedBy, {
						...client,
						refresh_token,
						channel_id: channel.id,
					});
					reply(
						200,
						`Saved. ${channel.title} can now be posted to; close this tab.`,
					);
					console.log(
						`saved ${usedBy} for channel "${channel.title}" (${channel.id})`,
					);
					finish();
				})
				.catch((error: unknown) => {
					const failure =
						error instanceof Error ? error : new Error(String(error));
					reply(500, failure.message);
					finish(failure);
				});
		});
		const timer = setTimeout(
			() => finish(new Error("no answer within 15 minutes")),
			WAIT_MS,
		);
		server.listen(0, "127.0.0.1", () => {
			const { port } = server.address() as AddressInfo;
			redirectUri = `http://127.0.0.1:${port}`;
			console.log(
				`open: ${consentUrl(client.client_id, redirectUri, state, challenge)}`,
			);
		});
	});
}

if (isEntryPoint(import.meta.url)) {
	main().catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	});
}
