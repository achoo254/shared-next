/**
 * The apps one account signs in to, in the order the switcher lists them.
 * Static on purpose: the IdP has no public catalog API, and the strict CSP
 * of Chat and Scribe blocks requests to it. Every app lives under the same
 * root domain, given by the caller. Entries come in three groups, Tools,
 * Entertainment and Learning, each under its own heading. Tử Vi, Miu
 * World, Web Nhanh and Tiểu Đệ are listed but do not show the switcher
 * themselves. Knowledge Base (`kb`) is a main app: it can pass itself as
 * `current` once it shows the switcher.
 */

/** Locales the labels are written in. */
export const APP_SWITCHER_LOCALES = ["en", "vi", "zh-CN"] as const;
export type AppSwitcherLocale = (typeof APP_SWITCHER_LOCALES)[number];

/** Apps that show the switcher (the value of `current`). */
export const APP_SWITCHER_APP_IDS = [
	"chat",
	"kb",
	"scribe",
	"localman",
	"tunelo",
] as const;
export type AppSwitcherAppId = (typeof APP_SWITCHER_APP_IDS)[number];

/** Every entry of the list: the apps by group, then the account page. */
export type AppSwitcherEntryId =
	| AppSwitcherAppId
	| "tuvi"
	| "miu"
	| "webnhanh"
	| "clip"
	| "truyen"
	| "lockin"
	| "tieude"
	| "account";

/** The three kinds of app, in the order the switcher lists them. */
export const APP_SWITCHER_GROUPS = ["tools", "fun", "learn"] as const;
export type AppSwitcherGroup = (typeof APP_SWITCHER_GROUPS)[number];

export type LocalizedText = Readonly<Record<AppSwitcherLocale, string>>;

export interface AppSwitcherCatalogEntry {
	readonly id: AppSwitcherEntryId;
	/** Product name, or what the link does for the account page. */
	readonly label: LocalizedText;
	/** One short line under the label. */
	readonly description: LocalizedText;
	/** Host under the root domain, e.g. `chat.{domain}`. */
	readonly hostTemplate: string;
	/** Path on that host, starting with `/`. */
	readonly path: string;
	/** The group heading it is listed under; the account page has none. */
	readonly group?: AppSwitcherGroup;
}

function same(text: string): LocalizedText {
	return { en: text, vi: text, "zh-CN": text };
}

export const APP_SWITCHER_CATALOG: readonly AppSwitcherCatalogEntry[] = [
	{
		id: "webnhanh",
		label: same("Web Nhanh"),
		description: {
			en: "A website from a template, published at its own address.",
			vi: "Làm website từ mẫu có sẵn và đăng ngay ở địa chỉ riêng.",
			"zh-CN": "用现成模板制作网站，并发布到专属地址。",
		},
		hostTemplate: "webnhanh.{domain}",
		path: "/",
		group: "tools",
	},
	{
		id: "chat",
		label: same("Chat"),
		description: {
			en: "Fast messaging with searchable history and bots.",
			vi: "Nhắn tin nhanh, tìm lại lịch sử tin nhắn và dùng bot.",
			"zh-CN": "快速聊天，可搜索历史消息并使用机器人。",
		},
		hostTemplate: "chat.{domain}",
		path: "/",
		group: "tools",
	},
	{
		id: "tieude",
		label: same("Tiểu Đệ"),
		description: {
			en: "An AI bot that does small writing jobs for free.",
			vi: "Bot AI làm giúp miễn phí các việc viết nhỏ.",
			"zh-CN": "免费帮你写些小东西的 AI 机器人。",
		},
		hostTemplate: "tieude.{domain}",
		path: "/",
		group: "tools",
	},
	{
		id: "scribe",
		label: same("Scribe"),
		description: {
			en: "Record audio and turn it into searchable, editable transcripts.",
			vi: "Ghi âm và chuyển thành bản chép lời để tìm kiếm, chỉnh sửa.",
			"zh-CN": "录音并转写为可搜索、可编辑的文字稿。",
		},
		hostTemplate: "scribe.{domain}",
		path: "/",
		group: "tools",
	},
	{
		id: "localman",
		label: same("Localman"),
		description: {
			en: "Mock APIs and an API client in your browser.",
			vi: "Mock API và API client ngay trên trình duyệt.",
			"zh-CN": "在浏览器中使用 Mock API 和 API 客户端。",
		},
		hostTemplate: "localman.{domain}",
		path: "/",
		group: "tools",
	},
	{
		id: "tunelo",
		label: same("Tunelo"),
		description: {
			en: "Your tunnels in the browser.",
			vi: "Tunnel của bạn trên trình duyệt.",
			"zh-CN": "在浏览器中查看你的隧道。",
		},
		hostTemplate: "tunnel.{domain}",
		path: "/",
		group: "tools",
	},
	{
		id: "tuvi",
		label: same("Tử Vi"),
		description: {
			en: "Your 12-palace horoscope chart and a fortune stick every day, just for fun.",
			vi: "Lập lá số 12 cung và xin quẻ mỗi ngày, xem cho vui.",
			"zh-CN": "排出你的十二宫命盘，每天求一支签，娱乐参考。",
		},
		hostTemplate: "tuvi.{domain}",
		path: "/",
		group: "fun",
	},
	{
		id: "clip",
		label: same("Clip"),
		description: {
			en: "Short vertical videos from a template.",
			vi: "Video dọc ngắn làm từ mẫu có sẵn.",
			"zh-CN": "用模板制作竖屏短视频。",
		},
		hostTemplate: "clip.{domain}",
		path: "/",
		group: "fun",
	},
	{
		id: "truyen",
		label: same("Truyện"),
		description: {
			en: "Vietnamese and world folk tales, retold.",
			vi: "Truyện cổ tích Việt Nam và thế giới, kể lại.",
			"zh-CN": "重述的越南与世界民间故事。",
		},
		hostTemplate: "truyen.{domain}",
		path: "/",
		group: "fun",
	},
	{
		id: "lockin",
		label: same("Lockin"),
		description: {
			en: "Lock in plans through one link.",
			vi: "Chốt kèo bằng một link.",
			"zh-CN": "用一个链接敲定计划。",
		},
		hostTemplate: "lockin.{domain}",
		path: "/",
		group: "fun",
	},
	{
		id: "miu",
		label: same("Miu World"),
		description: {
			en: "A 3D block world to play with friends, with maths and Vietnamese quests.",
			vi: "Thế giới khối 3D chơi cùng bạn bè, vượt thử thách Toán và Tiếng Việt.",
			"zh-CN": "和朋友一起玩的 3D 方块世界，闯数学和越南语关卡。",
		},
		hostTemplate: "miu.{domain}",
		path: "/",
		group: "learn",
	},
	{
		id: "kb",
		label: same("Knowledge Base"),
		description: {
			en: "Bilingual articles on all kinds of topics to read, search and ask AI.",
			vi: "Kho tri thức song ngữ về đủ mọi chủ đề để đọc, tìm và hỏi AI.",
			"zh-CN": "涵盖各类主题的双语知识库，可阅读、搜索并向 AI 提问。",
		},
		hostTemplate: "kb.{domain}",
		path: "/",
		group: "learn",
	},
	{
		id: "account",
		label: {
			en: "Manage your account",
			vi: "Quản lý tài khoản",
			"zh-CN": "管理你的账号",
		},
		description: {
			en: "Sign-in, devices and app access.",
			vi: "Đăng nhập, thiết bị và quyền của ứng dụng.",
			"zh-CN": "登录、设备和应用权限。",
		},
		hostTemplate: "auth.{domain}",
		path: "/account",
	},
];
