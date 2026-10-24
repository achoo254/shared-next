// Posts one app's Short to the Hoandat Apps channel through the YouTube Data API v3, with `fetch`
// alone: the saved refresh token becomes a short-lived access token, then the video goes up as one
// resumable upload and is recorded in `posted.json`. Without `--publish` it only describes the post
// and touches neither the token file nor the network.
//
//   node src/youtube-upload.ts --app chat [--file out/chat.mp4] [--privacy private] [--publish]
import { openAsBlob, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { type AppShort, describe, findApp } from "./apps.ts";
import { inPackage, isEntryPoint, outDir } from "./paths.ts";
import { readYoutubeSecret, tokenFilePath } from "./token-file.ts";

export const USED_BY = "hoandat-apps marketing";
export const CHANNEL_ID = "UC5kF-54QdobLrtQ94tgVLmg";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const UPLOAD_URL =
	"https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";
/** YouTube's category id for "Science & Technology". */
const SCIENCE_AND_TECHNOLOGY = "28";
const LEDGER = inPackage("posted.json");

export const PRIVACY = ["private", "unlisted", "public"] as const;
export type Privacy = (typeof PRIVACY)[number];

export interface PostedShort {
	app: string;
	videoId: string;
	url: string;
	privacy: Privacy;
	postedAt: string;
}

/** The metadata the upload starts with. The apps are tools for adults, so not made for kids. */
export function videoResource(
	app: AppShort,
	privacy: Privacy,
): Record<string, unknown> {
	return {
		snippet: {
			title: app.title,
			description: describe(app),
			tags: app.hashtags,
			categoryId: SCIENCE_AND_TECHNOLOGY,
			defaultLanguage: "vi",
			defaultAudioLanguage: "vi",
		},
		status: { privacyStatus: privacy, selfDeclaredMadeForKids: false },
	};
}

export function readLedger(file = LEDGER): PostedShort[] {
	return JSON.parse(readFileSync(file, "utf8")) as PostedShort[];
}

/** A response body for an error message, cut short, with every secret value replaced. */
async function failure(
	response: Response,
	secrets: readonly string[],
): Promise<string> {
	const body = (await response.text().catch(() => "")).slice(0, 300);
	return secrets.reduce(
		(text, secret) => text.split(secret).join("[secret]"),
		`HTTP ${response.status}${body ? `: ${body}` : ""}`,
	);
}

async function upload(
	app: AppShort,
	file: string,
	privacy: Privacy,
	tokenFile: string,
): Promise<string> {
	const secret = readYoutubeSecret(tokenFile, USED_BY);
	if (secret.channel_id && secret.channel_id !== CHANNEL_ID) {
		throw new Error(
			`the saved grant is for ${secret.channel_id}, not the Hoandat Apps channel`,
		);
	}
	const { client_id, client_secret, refresh_token } = secret;
	const tokenResponse = await fetch(TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id,
			client_secret,
			refresh_token,
			grant_type: "refresh_token",
		}),
	});
	const secrets = [client_secret, refresh_token];
	if (!tokenResponse.ok) {
		throw new Error(
			`Google refused the refresh token (${await failure(tokenResponse, secrets)}); run youtube-grant again`,
		);
	}
	const { access_token } = (await tokenResponse.json()) as {
		access_token: string;
	};
	secrets.push(access_token);
	const size = statSync(file).size;

	// The upload session: YouTube answers with the address to send the bytes to.
	const start = await fetch(UPLOAD_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${access_token}`,
			"Content-Type": "application/json; charset=UTF-8",
			"X-Upload-Content-Length": String(size),
			"X-Upload-Content-Type": "video/mp4",
		},
		body: JSON.stringify(videoResource(app, privacy)),
	});
	const session = start.headers.get("location");
	if (!start.ok || !session) {
		throw new Error(
			`YouTube would not start the upload (${await failure(start, secrets)})`,
		);
	}
	const sent = await fetch(session, {
		method: "PUT",
		headers: { "Content-Type": "video/mp4", "Content-Length": String(size) },
		body: await openAsBlob(file, { type: "video/mp4" }),
	});
	if (!sent.ok) {
		throw new Error(
			`YouTube did not take the video (${await failure(sent, secrets)})`,
		);
	}
	const video = (await sent.json().catch(() => null)) as {
		id?: unknown;
	} | null;
	if (typeof video?.id !== "string" || video.id === "") {
		throw new Error(
			"YouTube took the video but answered without its id; check the channel before posting again",
		);
	}
	return video.id;
}

async function main(): Promise<void> {
	const { values } = parseArgs({
		options: {
			app: { type: "string" },
			file: { type: "string" },
			privacy: { type: "string", default: "private" },
			publish: { type: "boolean", default: false },
			again: { type: "boolean", default: false },
			"token-file": { type: "string" },
		},
	});
	if (!values.app)
		throw new Error("usage: youtube-upload --app <id> [--publish]");
	const app = findApp(values.app);
	const privacy = values.privacy as Privacy;
	if (!PRIVACY.includes(privacy)) {
		throw new Error(`--privacy is one of ${PRIVACY.join(", ")}`);
	}
	const file = values.file ?? path.join(outDir, `${app.id}.mp4`);
	const ledger = readLedger();
	const earlier = ledger.find((entry) => entry.app === app.id);
	if (earlier && !values.again) {
		throw new Error(
			`${app.id} was posted on ${earlier.postedAt} (${earlier.url}); pass --again to post another`,
		);
	}
	if (!values.publish) {
		console.log(
			`dry run: would upload ${path.basename(file)} as ${privacy} "${app.title}"; nothing was sent`,
		);
		return;
	}
	const videoId = await upload(
		app,
		file,
		privacy,
		tokenFilePath(values["token-file"]),
	);
	const url = `https://youtube.com/shorts/${videoId}`;
	ledger.push({
		app: app.id,
		videoId,
		url,
		privacy,
		postedAt: new Date().toISOString(),
	});
	writeFileSync(LEDGER, `${JSON.stringify(ledger, null, "\t")}\n`);
	console.log(`posted ${app.id} as ${privacy}: ${url}`);
}

if (isEntryPoint(import.meta.url)) {
	main().catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	});
}
