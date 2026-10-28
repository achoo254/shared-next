/**
 * Words of the shared chrome, owned here so no app can word them
 * differently. App copy (titles, ledes, features) comes from props.
 */
import type { ShellLocale } from "./locale.js";
import type { ThemePreference } from "./preferences.js";

export interface ShellMessages {
	/** First stop of the keyboard: jumps past the header to the page body. */
	readonly skipToContent: string;
	/** Accessible name of the header links. */
	readonly nav: string;
	/** The header pill. */
	readonly signIn: string;
	/** The one call to action of the sign-in card. */
	readonly signInWith: (domain: string) => string;
	/** Under the call to action: how the sign-in page signs people in. */
	readonly signInNote: (domain: string) => string;
	/** First footer link, to the ecosystem's home page. */
	readonly ecosystem: (domain: string) => string;
	readonly privacy: string;
	readonly terms: string;
	readonly footLinks: string;
	readonly language: string;
	readonly theme: string;
	readonly themes: Readonly<Record<ThemePreference, string>>;
}

export const SHELL_MESSAGES: Readonly<Record<ShellLocale, ShellMessages>> = {
	vi: {
		skipToContent: "Bỏ qua tới nội dung",
		nav: "Điều hướng",
		signIn: "Đăng nhập",
		signInWith: (domain) => `Đăng nhập bằng ${domain}`,
		signInNote: (domain) =>
			`Dùng tài khoản ${domain}: đăng nhập bằng Google hoặc GitHub. App không bao giờ thấy mật khẩu của bạn.`,
		ecosystem: (domain) => `Một app của ${domain}`,
		privacy: "Quyền riêng tư",
		terms: "Điều khoản",
		footLinks: "Liên kết cuối trang",
		language: "Ngôn ngữ",
		theme: "Giao diện",
		themes: { light: "Sáng", dark: "Tối", system: "Theo máy" },
	},
	en: {
		skipToContent: "Skip to content",
		nav: "Navigation",
		signIn: "Sign in",
		signInWith: (domain) => `Sign in with ${domain}`,
		signInNote: (domain) =>
			`Use your ${domain} account: sign in with Google or GitHub. The app never sees your password.`,
		ecosystem: (domain) => `An app from ${domain}`,
		privacy: "Privacy",
		terms: "Terms",
		footLinks: "Footer links",
		language: "Language",
		theme: "Theme",
		themes: { light: "Light", dark: "Dark", system: "System" },
	},
	// Worded as the account app and Localman word the same things.
	"zh-CN": {
		skipToContent: "跳到主要内容",
		nav: "站点导航",
		signIn: "登录",
		signInWith: (domain) => `使用 ${domain} 登录`,
		signInNote: (domain) =>
			`使用你的 ${domain} 账号：通过 Google 或 GitHub 登录。应用永远看不到你的密码。`,
		ecosystem: (domain) => `${domain} 旗下应用`,
		privacy: "隐私政策",
		terms: "使用条款",
		footLinks: "页脚链接",
		language: "语言",
		theme: "颜色模式",
		themes: { light: "浅色主题", dark: "深色主题", system: "跟随系统" },
	},
};
