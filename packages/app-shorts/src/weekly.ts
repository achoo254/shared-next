// One run of the weekly series: the first feature (in `features` order) that `posted.json` does not have
// yet is rendered, joined and posted. Without `--publish` the video is still built, so it can be watched,
// but nothing is sent.
//
//   node src/weekly.ts [--publish] [--privacy private|unlisted|public] [--token-file <file>]
import { parseArgs } from "node:util";
import { buildVideo } from "./build-video.ts";
import { type Feature, features } from "./features.ts";
import { isEntryPoint } from "./paths.ts";
import { renderSlides } from "./render-slides.ts";
import { featureShort } from "./shorts.ts";
import {
	type PostedShort,
	parsePrivacy,
	postShort,
	readLedger,
} from "./youtube-upload.ts";

export function nextFeature(ledger: PostedShort[]): Feature | undefined {
	const posted = new Set(ledger.map((entry) => entry.short));
	return features.find((feature) => !posted.has(feature.id));
}

async function main(): Promise<void> {
	const { values } = parseArgs({
		options: {
			privacy: { type: "string", default: "public" },
			publish: { type: "boolean", default: false },
			"token-file": { type: "string" },
		},
	});
	const feature = nextFeature(readLedger());
	if (!feature) {
		console.log(`all ${features.length} feature Shorts are posted`);
		return;
	}
	const short = featureShort(feature);
	await renderSlides([short]);
	buildVideo(short);
	console.log(
		await postShort(short, {
			privacy: parsePrivacy(values.privacy),
			publish: values.publish,
			...(values["token-file"] ? { tokenFile: values["token-file"] } : {}),
		}),
	);
}

if (isEntryPoint(import.meta.url)) {
	main().catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	});
}
