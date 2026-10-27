/**
 * The apps one account signs in to, in the order the switcher lists them.
 * Static on purpose: the IdP has no public catalog API, and the strict CSP
 * of Chat and Scribe blocks requests to it. Every app lives under the same
 * root domain, given by the caller. Miu World is left out: its players are
 * children. Tiểu Đệ is listed but does not show the switcher itself.
 */
/** Locales the labels are written in. */
export const APP_SWITCHER_LOCALES = ["en", "vi", "zh-CN"];
/** Apps that show the switcher (the value of `current`). */
export const APP_SWITCHER_APP_IDS = [
    "chat",
    "scribe",
    "localman",
    "tunelo",
];
function same(text) {
    return { en: text, vi: text, "zh-CN": text };
}
export const APP_SWITCHER_CATALOG = [
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
    },
    {
        id: "tieude",
        label: same("Tiểu Đệ"),
        description: {
            en: "An AI bot that does small writing jobs for free and lives on voluntary tips.",
            vi: "Bot AI làm giúp miễn phí các việc viết nhỏ, sống nhờ tiền ủng hộ tự nguyện.",
            "zh-CN": "免费帮你写些小东西的 AI 机器人，靠自愿打赏维持运行。",
        },
        hostTemplate: "tieude.{domain}",
        path: "/",
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
