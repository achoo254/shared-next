/**
 * The apps one account signs in to, in the order the switcher lists them.
 * Static on purpose: the IdP has no public catalog API, and the strict CSP
 * of Chat and Scribe blocks requests to it. Mirrors auth-next's /apps page
 * (src/app-directory/apps-catalog.ts): Chat and Scribe exist on the primary
 * tenant only. Miu World is left out: its players are children.
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
        primaryTenantOnly: true,
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
        primaryTenantOnly: true,
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
        primaryTenantOnly: false,
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
        primaryTenantOnly: false,
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
        primaryTenantOnly: false,
    },
];
