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
	/**
	 * The header pill for guests. Signing in with Google, GitHub or Apple
	 * creates the account on first use, so it invites newcomers to sign up;
	 * phones show the short form so the app name keeps its room.
	 */
	readonly signUp: string;
	readonly signUpShort: string;
	/** Title of the card that tells a guest what an account keeps. */
	readonly valueTitle: (domain: string) => string;
	/** Last line of that card, the same for every app. */
	readonly valueEveryApp: (domain: string) => string;
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
	/** Name of a signed-in user the app knows nothing about. */
	readonly account: string;
	/** Accessible name of the avatar button. */
	readonly accountTrigger: (name: string) => string;
	/** Heading of the account menu's links to the IdP account pages. */
	readonly idpHeading: (domain: string) => string;
	readonly idpEmail: string;
	readonly idpSignIn: string;
	/** Read after each IdP link: where it opens. */
	readonly opensIdp: (domain: string) => string;
	readonly signOut: string;
}

export const SHELL_MESSAGES: Readonly<Record<ShellLocale, ShellMessages>> = {
	vi: {
		skipToContent: "Bỏ qua tới nội dung",
		nav: "Điều hướng",
		signUp: "Đăng ký miễn phí",
		signUpShort: "Đăng ký",
		valueTitle: (domain) => `Giữ lại với tài khoản ${domain} miễn phí`,
		valueEveryApp: (domain) => `Một tài khoản dùng cho mọi app của ${domain}`,
		signInWith: (domain) => `Đăng nhập bằng ${domain}`,
		signInNote: (domain) =>
			`Dùng tài khoản ${domain}: đăng nhập bằng Google, GitHub hoặc Apple. App không bao giờ thấy mật khẩu của bạn.`,
		ecosystem: (domain) => `Một app của ${domain}`,
		privacy: "Quyền riêng tư",
		terms: "Điều khoản",
		footLinks: "Liên kết cuối trang",
		language: "Ngôn ngữ",
		theme: "Giao diện",
		themes: { light: "Sáng", dark: "Tối", system: "Theo máy" },
		account: "Tài khoản",
		accountTrigger: (name) => `${name} · Tài khoản`,
		idpHeading: (domain) => `Tài khoản ${domain} · mở tab mới`,
		idpEmail: "Email",
		idpSignIn: "Phương thức đăng nhập",
		opensIdp: (domain) => `, mở trang tài khoản ${domain} ở tab mới`,
		signOut: "Đăng xuất",
	},
	en: {
		skipToContent: "Skip to content",
		nav: "Navigation",
		signUp: "Sign up free",
		signUpShort: "Sign up",
		valueTitle: (domain) => `Keep it with a free ${domain} account`,
		valueEveryApp: (domain) => `One account for every ${domain} app`,
		signInWith: (domain) => `Sign in with ${domain}`,
		signInNote: (domain) =>
			`Use your ${domain} account: sign in with Google, GitHub or Apple. The app never sees your password.`,
		ecosystem: (domain) => `An app from ${domain}`,
		privacy: "Privacy",
		terms: "Terms",
		footLinks: "Footer links",
		language: "Language",
		theme: "Theme",
		themes: { light: "Light", dark: "Dark", system: "System" },
		account: "Account",
		accountTrigger: (name) => `${name} · Account`,
		idpHeading: (domain) => `${domain} account · opens in a new tab`,
		idpEmail: "Email",
		idpSignIn: "Sign-in methods",
		opensIdp: (domain) => `, opens your ${domain} account in a new tab`,
		signOut: "Sign out",
	},
	// Worded as the account app and Localman word the same things.
	"zh-CN": {
		skipToContent: "跳到主要内容",
		nav: "站点导航",
		signUp: "免费注册",
		signUpShort: "注册",
		valueTitle: (domain) => `用免费的 ${domain} 账号保存`,
		valueEveryApp: (domain) => `一个账号通用 ${domain} 所有应用`,
		signInWith: (domain) => `使用 ${domain} 登录`,
		signInNote: (domain) =>
			`使用你的 ${domain} 账号：通过 Google、GitHub 或 Apple 登录。应用永远看不到你的密码。`,
		ecosystem: (domain) => `${domain} 旗下应用`,
		privacy: "隐私政策",
		terms: "使用条款",
		footLinks: "页脚链接",
		language: "语言",
		theme: "颜色模式",
		themes: { light: "浅色主题", dark: "深色主题", system: "跟随系统" },
		account: "账号",
		accountTrigger: (name) => `${name} · 账号`,
		idpHeading: (domain) => `${domain} 账号 · 在新标签页中打开`,
		idpEmail: "邮箱",
		idpSignIn: "登录方式",
		opensIdp: (domain) => `，在新标签页中打开 ${domain} 账号`,
		signOut: "退出登录",
	},
};
