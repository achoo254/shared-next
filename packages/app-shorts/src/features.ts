// The weekly series: one Short per feature, the apps taking turns. Every claim comes from the app's store
// listing (chat-next/docs/store/listing.md, scribe-next/docs/app-store/metadata.md,
// localman-next/docs/store/listing.md) or the Tunelo CLI README (localman-next/packages/tunelo-cli),
// as of 24/10/2026. The Shorts point to the web apps, so claims that hold only in the iPhone app (recording
// with the screen locked, lock-screen bookmarks) are left out.
import { type AppShort, type Slide, findApp } from "./apps.ts";
import { inWorkspace } from "./paths.ts";

export interface Feature {
	/** Unique across the catalog; also the Short's id, its output folder and `utm_content`. */
	id: string;
	app: AppShort;
	/** The opening line: the problem the feature answers. */
	hook: string;
	visual: Slide;
	points: [string, string, string];
}

const chatShot = (name: string): string =>
	inWorkspace(`chat-next/docs/store/screenshots/android/${name}.png`);
const scribeShot = (name: string): string =>
	inWorkspace(`scribe-next/docs/app-store/screenshots/6.9/${name}.png`);
const localmanShot = (name: string): string =>
	inWorkspace(`localman-next/docs/store/screenshots/android/${name}.png`);

const chat = findApp("chat");
const scribe = findApp("scribe");
const localman = findApp("localman");
const tunelo = findApp("tunelo");

const byApp: Feature[][] = [
	[
		{
			id: "chat-search",
			app: chat,
			hook: "Quên gõ dấu vẫn tìm ra tin nhắn cũ?",
			visual: {
				shot: chatShot("04-search"),
				title: "Tìm tin không cần gõ dấu",
				sub: "Gõ “da lat” vẫn ra “Đà Lạt”",
			},
			points: [
				"Tìm cả chat lẫn tin nhắn",
				"Lọc theo người gửi, loại tin và ngày",
				"Kết quả gộp cả tin cũ chưa có trên máy",
			],
		},
		{
			id: "chat-privacy",
			app: chat,
			hook: "Ai được nhắn tin cho bạn? Bạn chọn.",
			visual: {
				shot: chatShot("05-privacy"),
				title: "Bạn quyết định quyền riêng tư",
				sub: "Từng quyền một, không phải bật tắt cả cụm",
			},
			points: [
				"Chọn ai thấy trạng thái hoạt động và ảnh đại diện",
				"Chọn ai tìm được bạn, ai nhắn và ai thêm bạn vào nhóm",
				"Chặn và báo cáo tin, người hoặc chat",
			],
		},
		{
			id: "chat-groups",
			app: chat,
			hook: "Nhóm đông mà vẫn gọn từng việc",
			visual: {
				shot: chatShot("03-group"),
				title: "Nhóm có chủ đề",
				sub: "Gõ @ để nhắc đúng người",
			},
			points: [
				"Tách mỗi việc thành một chủ đề trong nhóm",
				"Mời người vào nhóm bằng link",
				"Ghim tin quan trọng để ai cũng thấy",
			],
		},
		{
			id: "chat-media",
			app: chat,
			hook: "Một cuộc trò chuyện, đủ kiểu nội dung",
			visual: {
				shot: chatShot("02-conversation"),
				title: "Gửi ảnh, video, file, tin thoại",
				sub: "Trả lời, sửa, thả cảm xúc ngay trên tin",
			},
			points: [
				"Ghim và thu hồi tin đã gửi",
				"Kênh để đăng tin cho nhiều người theo dõi",
				"“Cloud của tôi” lưu ghi chú, link và file cho riêng bạn",
			],
		},
		{
			id: "chat-devices",
			app: chat,
			hook: "Đổi máy không mất tin nhắn",
			visual: {
				shot: chatShot("01-chats"),
				title: "Điện thoại, máy tính và web",
				sub: "Một tài khoản, tin nhắn có ngay ở mọi máy",
			},
			points: [
				"Xem các thiết bị đang đăng nhập",
				"Đăng xuất một máy từ xa",
				"Không quảng cáo, không bán dữ liệu của bạn",
			],
		},
	],
	[
		{
			id: "scribe-live",
			app: scribe,
			hook: "Họp xong là có lời chép, không phải gõ lại",
			visual: {
				shot: scribeShot("01-ghi-am"),
				title: "Chép trực tiếp trong lúc họp",
				sub: "Chữ hiện ra ngay khi mọi người nói",
			},
			points: [
				"Lời chép tiếng Việt có mốc thời gian",
				"Chạm một câu để nghe lại đúng đoạn đó",
				"Có gói miễn phí",
			],
		},
		{
			id: "scribe-speakers",
			app: scribe,
			hook: "Ai nói câu nào? Scribe ghi rõ.",
			visual: {
				shot: scribeShot("02-loi-chep"),
				title: "Lời chép có tên người nói",
				sub: "Kèm mốc thời gian từng câu",
			},
			points: [
				"Sửa câu và đổi tên người nói",
				"Xuất TXT, SRT, VTT, Markdown hoặc Word",
				"Tìm trong mọi bản ghi, có dấu hay không dấu",
			],
		},
		{
			id: "scribe-minutes",
			app: scribe,
			hook: "Biên bản họp tự viết xong",
			visual: {
				shot: scribeShot("03-bien-ban"),
				title: "Biên bản tự động",
				sub: "Từ chính lời chép của cuộc họp",
			},
			points: [
				"Tóm tắt nội dung cuộc họp",
				"Các quyết định và việc cần làm",
				"Người làm và hạn cho từng việc",
			],
		},
		{
			id: "scribe-ask",
			app: scribe,
			hook: "Hỏi lại cuộc họp như hỏi đồng nghiệp",
			visual: {
				shot: scribeShot("04-hoi-scribe"),
				title: "Hỏi Scribe bằng câu tự nhiên",
				sub: "Câu trả lời dẫn đúng đoạn nguồn",
			},
			points: [
				"Bấm vào nguồn để nghe lại đoạn đó",
				"Tìm trong mọi bản ghi, có dấu hay không dấu",
				"Không quảng cáo, không theo dõi",
			],
		},
		{
			id: "scribe-translate",
			app: scribe,
			hook: "Họp tiếng Việt, gửi bản tiếng Anh",
			visual: {
				shot: scribeShot("05-ban-dich"),
				title: "Dịch Việt ↔ Anh",
				sub: "Xem song song từng câu",
			},
			points: [
				"Dịch lời chép cả hai chiều Việt và Anh",
				"Bản gốc và bản dịch đặt cạnh nhau",
				"Xuất lời chép ra Word hoặc Markdown",
			],
		},
	],
	[
		{
			id: "localman-crud",
			app: localman,
			hook: "Làm frontend khi backend chưa xong?",
			visual: {
				shot: localmanShot("01-mock-api"),
				title: "Mock REST API có trạng thái",
				sub: "Khai báo resource là có endpoint CRUD",
			},
			points: [
				"Khai báo resource bằng bảng field",
				"Có ngay GET, POST, PUT, PATCH, DELETE",
				"Lồng resource: /users/:userId/orders",
			],
		},
		{
			id: "localman-faker",
			app: localman,
			hook: "Dữ liệu mẫu như thật, một chạm",
			visual: {
				shot: localmanShot("02-du-lieu-faker"),
				title: "Dữ liệu giả bằng Faker.js",
				sub: "Chọn kiểu dữ liệu cho từng field",
			},
			points: [
				"Bấm một lần là sinh dữ liệu giả",
				"Phân trang, sắp xếp, lọc bằng query string",
				"Tuỳ biến response, rule và lỗi giả lập",
			],
		},
		{
			id: "localman-client",
			app: localman,
			hook: "Gửi request không cần cài app nặng",
			visual: {
				shot: localmanShot("03-api-client"),
				title: "API client ngay trên web",
				sub: "Collection, environment, params, headers",
			},
			points: [
				"Giá trị bí mật trong biến được mã hoá",
				"Dán lệnh cURL để tạo request",
				"Gửi tới localhost qua tunnel Tunelo",
			],
		},
		{
			id: "localman-log",
			app: localman,
			hook: "Vừa có gì gọi vào mock của bạn?",
			visual: {
				shot: localmanShot("04-nhat-ky-request"),
				title: "Log request trực tiếp",
				sub: "Lọc theo method, status, nguồn",
			},
			points: [
				"Method, path, status, thời gian, header và body",
				"Header nhạy cảm được che",
				"Mở lại request trong API client để gửi lại hoặc sửa",
			],
		},
		{
			id: "localman-webhook",
			app: localman,
			hook: "Test webhook không cần dựng server",
			visual: {
				shot: localmanShot("05-webhook-inbox"),
				title: "Webhook inbox",
				sub: "Một URL công khai hứng webhook",
			},
			points: [
				"Trả lời theo cấu hình của bạn",
				"Ghi lại từng lượt gửi tới",
				"Mỗi project mock có sẵn MCP endpoint cho AI agent",
			],
		},
	],
	[
		{
			id: "tunelo-quickstart",
			app: tunelo,
			hook: "Cho người khác xem app đang chạy trên máy bạn",
			visual: {
				term: [
					["$ ", "npm install -g tunelo"],
					["$ ", "tunelo login"],
					["$ ", "tunelo http 3000"],
					["=> ", "https://demo.tunnel.hoandat.com"],
				],
				title: "Localhost có URL HTTPS",
				sub: "Ba lệnh là xong",
			},
			points: [
				"Một subdomain .tunnel.hoandat.com chuyển về localhost",
				"Đăng nhập bằng tài khoản Google hoặc GitHub",
				"Chạy trên macOS, Windows và Linux",
			],
		},
		{
			id: "tunelo-subdomain",
			app: tunelo,
			hook: "URL cố định, không đổi mỗi lần chạy",
			visual: {
				term: [
					["$ ", "tunelo http 3000 -s myapp"],
					["=> ", "https://myapp.tunnel.hoandat.com"],
					["$ ", "tunelo http 3000:web 5000:api"],
				],
				title: "Chọn subdomain riêng",
				sub: "Nhiều cổng cùng lúc, mỗi cổng một tên",
			},
			points: [
				"Thêm -s myapp là có URL cố định",
				"Mở nhiều cổng trong một lệnh",
				"tunelo status liệt kê tunnel đang chạy",
			],
		},
		{
			id: "tunelo-auth",
			app: tunelo,
			hook: "Chia sẻ bản demo mà không lộ cho người lạ",
			visual: {
				term: [
					["$ ", "tunelo http 8080 -a user:pass"],
					["=> ", "https://demo.tunnel.hoandat.com"],
				],
				title: "Khoá tunnel bằng Basic Auth",
				sub: "Thêm một cờ khi mở tunnel",
			},
			points: [
				"Người mở link phải nhập tên và mật khẩu bạn đặt",
				"Ctrl+C là đóng tunnel",
				"tunelo kill để dừng tunnel đang chạy nền",
			],
		},
		{
			id: "tunelo-watch",
			app: tunelo,
			hook: "Webhook gọi vào máy bạn trả về gì?",
			visual: {
				term: [
					["$ ", "tunelo watch"],
					["", "POST /webhook   200"],
					["", "GET  /api/users 200"],
					["", "GET  /favicon   404"],
				],
				title: "tunelo watch",
				sub: "Xem request qua tunnel theo thời gian thực",
			},
			points: [
				"In 10 request gần nhất, đổi số bằng -n",
				"Lọc theo status (như 5xx) hoặc đường dẫn",
				"Thêm --headers và --body khi cần",
			],
		},
		{
			id: "tunelo-tcp",
			app: tunelo,
			hook: "Không chỉ web: mở cả cổng TCP",
			visual: {
				term: [
					["$ ", "tunelo tcp 5432"],
					["$ ", "tunelo status"],
					["$ ", "tunelo mcp"],
				],
				title: "Tunnel TCP",
				sub: "Ví dụ PostgreSQL ở cổng 5432",
			},
			points: [
				"tunelo tcp cho dịch vụ không phải HTTP",
				"tunelo mcp để agent AI tự mở tunnel",
				"tunelo update để lên bản mới nhất",
			],
		},
	],
];

/** The posting order: the apps take turns, each going through its features in the order above. */
export const features: Feature[] = Array.from(
	{ length: Math.max(...byApp.map((list) => list.length)) },
	(_, round) => byApp.flatMap((list) => list[round] ?? []),
).flat();
