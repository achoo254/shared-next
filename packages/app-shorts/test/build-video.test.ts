import { describe, expect, it } from "vitest";
import {
	filterGraph,
	slideDurations,
	totalSeconds,
} from "../src/build-video.ts";

describe("video filter graph", () => {
	it("gives the intro slide less time than the others", () => {
		expect(slideDurations(3)).toEqual([2.6, 3.6, 3.6]);
	});

	it("subtracts one fade per joint from the total", () => {
		// 2.6 + 6 × 3.6 − 6 × 0.5
		expect(totalSeconds(slideDurations(7))).toBe(21.2);
	});

	it("chains each fade from the end of the video so far", () => {
		const { graph, video, total } = filterGraph(slideDurations(3));
		expect(graph).toContain(
			"[v0][v1]xfade=transition=fade:duration=0.5:offset=2.1[x1]",
		);
		expect(graph).toContain(
			"[x1][v2]xfade=transition=fade:duration=0.5:offset=5.2[x2]",
		);
		expect(graph).toContain(`[3:a]atrim=0:${total}`);
		expect(video).toBe("x2");
	});
});
