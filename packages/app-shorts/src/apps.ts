// What each Short of the Hoandat Apps channel says and shows. Every claim is checked against the app's
// store listing or README (24/10/2026); the apps are not in the stores yet, so the Shorts point to the web.
import { inPackage, inWorkspace } from "./paths.ts";

/** A slide shows either a store screenshot or a terminal session of `[prompt, text]` lines. */
export type Slide = { title: string; sub: string } & (
	| { shot: string }
	| { term: [string, string][] }
);

export interface AppShort {
	id: string;
	name: string;
	icon: string;
	/** Host shown on the last slide and linked from the description. */
	host: string;
	tagline: string;
	outroNote: string;
	/** A track of Miu World's CC0 Komiku pack, without `.m4a`. */
	music: string;
	slides: Slide[];
	title: string;
	intro: string;
	bullets: string[];
	/** The words in front of the link, e.g. "Dùng miễn phí, không quảng cáo". */
	cta: string;
	hashtags: string[];
}

export const UTM =
	"utm_source=youtube&utm_medium=social&utm_campaign=app-short";
export const DIRECTORY_URL = "https://auth.hoandat.com/apps";

const chatShots = "chat-next/docs/store/screenshots/android";
const scribeShots = "scribe-next/docs/app-store/screenshots/6.9";
const localmanShots = "localman-next/docs/store/screenshots/android";

export const apps: AppShort[] = [
	{
		id: "chat",
		name: "Chat",
		icon: inWorkspace("chat-next/brand/icon.svg"),
		host: "chat.hoandat.com",
		tagline: "Nhắn tin riêng, nhóm, kênh và bot. Một tài khoản, mọi máy.",
		outroNote: "Miễn phí · Không quảng cáo",
		music: "good-fellow",
		slides: [
			{
				shot: inWorkspace(`${chatShots}/01-chats.png`),
				title: "Mọi cuộc trò chuyện một chỗ",
				sub: "Chat riêng, nhóm, kênh và bot",
			},
			{
				shot: inWorkspace(`${chatShots}/02-conversation.png`),
				title: "Gửi ảnh, video, tin thoại",
				sub: "Trả lời, thả cảm xúc, ghim và thu hồi tin",
			},
			{
				shot: inWorkspace(`${chatShots}/03-group.png`),
				title: "Nhóm có tin ghim",
				sub: "Gõ @ để nhắc đúng người",
			},
			{
				shot: inWorkspace(`${chatShots}/04-search.png`),
				title: "Tìm tin không cần gõ dấu",
				sub: "Gõ “da lat” vẫn ra “Đà Lạt”",
			},
			{
				shot: inWorkspace(`${chatShots}/05-privacy.png`),
				title: "Bạn chọn ai thấy mình",
				sub: "Ai được nhắn, ai được thêm bạn vào nhóm",
			},
		],
		title: "Chat: nhắn tin nhóm, kênh và bot, tìm tin không cần gõ dấu #Shorts",
		intro:
			"Chat là app nhắn tin cho bạn bè, gia đình và nhóm làm việc, dùng chung một tài khoản trên điện thoại, máy tính và trình duyệt.",
		bullets: [
			"Chat riêng, nhóm, kênh và bot",
			"Gửi ảnh, video, file, tin thoại; trả lời, thả cảm xúc, ghim, thu hồi",
			'Tìm tin không cần gõ dấu: gõ "da lat" vẫn ra "Đà Lạt"',
			"Bạn chọn ai thấy mình, ai nhắn và ai thêm bạn vào nhóm",
		],
		cta: "Dùng miễn phí, không quảng cáo",
		hashtags: ["Shorts", "HoandatApps", "Chat", "NhanTin"],
	},
	{
		id: "scribe",
		name: "Scribe",
		icon: inWorkspace("scribe-next/web/brand/icon.svg"),
		host: "scribe.hoandat.com",
		tagline: "Ghi âm cuộc họp, chép lời tiếng Việt, ra biên bản.",
		outroNote: "Có gói miễn phí",
		music: "tea-with-granma",
		slides: [
			{
				shot: inWorkspace(`${scribeShots}/01-ghi-am.png`),
				title: "Ghi âm và chép trực tiếp",
				sub: "Chữ hiện ra ngay trong lúc họp",
			},
			{
				shot: inWorkspace(`${scribeShots}/02-loi-chep.png`),
				title: "Lời chép có tên người nói",
				sub: "Kèm mốc thời gian từng câu",
			},
			{
				shot: inWorkspace(`${scribeShots}/03-bien-ban.png`),
				title: "Biên bản tự động",
				sub: "Quyết định, việc cần làm, người phụ trách",
			},
			{
				shot: inWorkspace(`${scribeShots}/04-hoi-scribe.png`),
				title: "Hỏi Scribe về cuộc họp",
				sub: "Câu trả lời dẫn đúng đoạn nguồn",
			},
			{
				shot: inWorkspace(`${scribeShots}/05-ban-dich.png`),
				title: "Dịch sang tiếng Anh",
				sub: "Xem song song bản gốc và bản dịch",
			},
		],
		title: "Scribe: ghi âm cuộc họp, chép lời tiếng Việt, ra biên bản #Shorts",
		intro: "Scribe ghi âm cuộc họp và chép lời tiếng Việt cho bạn.",
		bullets: [
			"Chép trực tiếp: chữ hiện ra ngay trong lúc họp",
			"Lời chép có tên người nói và mốc thời gian",
			"Biên bản tự động: quyết định, việc cần làm, người phụ trách",
			"Hỏi Scribe về nội dung cuộc họp, câu trả lời dẫn đúng đoạn nguồn",
			"Dịch sang tiếng Anh, xem song song bản gốc và bản dịch",
		],
		cta: "Có gói miễn phí",
		hashtags: ["Shorts", "HoandatApps", "Scribe", "ChepLoi", "BienBanHop"],
	},
	{
		id: "localman",
		name: "Localman",
		icon: inWorkspace("localman-next/docs/store/play/icon-512.png"),
		host: "localman.hoandat.com",
		tagline: "Mock REST API và API client cho lập trình viên.",
		outroNote: "Đang miễn phí",
		music: "intensive-puzzle-resolution",
		slides: [
			{
				shot: inWorkspace(`${localmanShots}/01-mock-api.png`),
				title: "Mock API có trạng thái",
				sub: "Khai báo resource là có endpoint CRUD",
			},
			{
				shot: inWorkspace(`${localmanShots}/02-du-lieu-faker.png`),
				title: "Dữ liệu giả bằng Faker",
				sub: "Sinh dữ liệu mẫu trong một chạm",
			},
			{
				shot: inWorkspace(`${localmanShots}/03-api-client.png`),
				title: "Gửi request ngay trên web",
				sub: "Collections, environments, params, headers",
			},
			{
				shot: inWorkspace(`${localmanShots}/04-nhat-ky-request.png`),
				title: "Log từng lượt gọi, trực tiếp",
				sub: "Lọc theo method, status, nguồn",
			},
			{
				shot: inWorkspace(`${localmanShots}/05-webhook-inbox.png`),
				title: "Webhook inbox",
				sub: "URL công khai hứng webhook từ dịch vụ ngoài",
			},
		],
		title:
			"Localman: mock REST API có dữ liệu Faker và API client trên web #Shorts",
		intro: "Localman là bộ công cụ API cho lập trình viên.",
		bullets: [
			"Mock API có trạng thái: khai báo resource là có endpoint CRUD",
			"Sinh dữ liệu giả bằng Faker trong một chạm",
			"API client trên web: collections, environments, params, headers",
			"Request log trực tiếp, lọc theo method, status, nguồn",
			"Webhook inbox: URL công khai hứng webhook từ dịch vụ bên ngoài",
		],
		cta: "Đang miễn phí",
		hashtags: ["Shorts", "HoandatApps", "Localman", "MockAPI", "RESTAPI"],
	},
	{
		id: "tunelo",
		name: "Tunelo",
		icon: inPackage("assets/hoandat-apps-logo.svg"),
		host: "tunnel.hoandat.com",
		tagline: "Đưa localhost ra internet qua HTTPS, chỉ một lệnh.",
		outroNote: "npm install -g tunelo",
		music: "space-bicycle",
		slides: [
			{
				term: [
					["$ ", "npm install -g tunelo"],
					["", "added 1 package"],
					["$ ", "tunelo --version"],
				],
				title: "Cài bằng một lệnh",
				sub: "Chạy trên macOS, Windows và Linux",
			},
			{
				term: [
					["$ ", "tunelo login"],
					["", "Sign in to Tunelo in your browser:"],
					["", "https://auth.hoandat.com/device"],
					["", "Confirm the code: ABCD-EFGH"],
				],
				title: "Đăng nhập một lần",
				sub: "Bằng tài khoản Google hoặc GitHub",
			},
			{
				term: [
					["$ ", "tunelo http 3000"],
					["=> ", "https://demo.tunnel.hoandat.com"],
					["", "   → http://localhost:3000"],
				],
				title: "Có ngay URL HTTPS công khai",
				sub: "Chia sẻ app đang chạy trên máy bạn",
			},
			{
				term: [
					["$ ", "tunelo http 3000 -s myapp"],
					["$ ", "tunelo http 8080 -a user:pass"],
					["$ ", "tunelo tcp 5432"],
				],
				title: "Subdomain riêng, Basic Auth, TCP",
				sub: "Nhiều cổng cùng lúc, mỗi cổng một subdomain",
			},
			{
				term: [
					["$ ", "tunelo watch"],
					["", "POST /webhook   200"],
					["", "GET  /api/users 200"],
					["", "GET  /favicon   404"],
				],
				title: "Xem request theo thời gian thực",
				sub: "Lọc theo status hoặc đường dẫn",
			},
		],
		title: "Tunelo: đưa localhost ra internet qua HTTPS bằng một lệnh #Shorts",
		intro:
			"Tunelo mở tunnel HTTPS từ máy của bạn ra internet: https://ten-ban-chon.tunnel.hoandat.com chuyển về localhost.\n\nnpm install -g tunelo\ntunelo login\ntunelo http 3000",
		bullets: [
			"Subdomain riêng (-s myapp), Basic Auth (-a user:pass), tunnel TCP",
			"Nhiều cổng cùng lúc, mỗi cổng một subdomain",
			"tunelo watch: xem request qua tunnel theo thời gian thực",
			"Chạy trên macOS, Windows, Linux",
		],
		cta: "Xem tunnel của bạn",
		hashtags: ["Shorts", "HoandatApps", "Tunelo", "Localhost", "DevTools"],
	},
];

/** The YouTube description: what the app does, the tagged link, and the directory of the other apps. */
export function describe(app: AppShort): string {
	return [
		app.intro,
		app.bullets.map((bullet) => `• ${bullet}`).join("\n"),
		`${app.cta}: https://${app.host}/?${UTM}\nĐăng nhập bằng Google hoặc GitHub qua tài khoản hoandat.`,
		`Các app khác của Hoandat Apps: ${DIRECTORY_URL}`,
		app.hashtags.map((tag) => `#${tag}`).join(" "),
	].join("\n\n");
}

export function findApp(id: string): AppShort {
	const app = apps.find((candidate) => candidate.id === id);
	if (!app) {
		throw new Error(
			`unknown app "${id}"; one of ${apps.map((a) => a.id).join(", ")}`,
		);
	}
	return app;
}
