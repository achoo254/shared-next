# @achoo254/app-shell

Khung giao diện chung cho trang chưa đăng nhập của mọi app hoandat.com: header, khung trang, thẻ đăng nhập, khối giới
thiệu, danh sách tính năng, footer, nút đổi ngôn ngữ và nút đổi giao diện. Bố cục lấy theo trang tài khoản
(`auth-next` `src/ui/layout.ts` và `static/css/app.css`). App chỉ truyền nội dung (brand, link, URL đăng nhập, chữ
riêng của app, phần body); chữ trên nút của khung, số nút, thứ tự và breakpoint do gói quyết định, nên các app không
lệch nhau.

- **Component React 19**: `PublicPage`, `PublicHeader`, `PublicFooter`, `SignInCard`, `Hero`, `FeatureList`,
  `LanguageSwitch`, `ThemeSwitch`. Render được trên server bằng `renderToStaticMarkup` (không cần DOM).
- **Lựa chọn dùng chung** (`@achoo254/app-shell/preferences`, không phụ thuộc React): cookie `hd_lang` và `hd_theme`.
- **CSS**: `tokens.css` (bản chuyển nguyên văn từ `localman-next/packages/design-tokens/tokens.css`) và
  `app-shell.css` (class tiền tố `shell-`, chỉ dùng biến của `tokens.css`, không phụ thuộc Tailwind).
- **Chữ**: vi, en và zh-CN (tiếng Trung giản thể) cho phần khung. App chọn ngôn ngữ trang và truyền `locale` vào, cùng
  danh sách ngôn ngữ của app (`locales`).

## Cài

Không phát hành lên npm: cài `@achoo254/app-shell` và `@achoo254/brand` bằng phụ thuộc git từ tag của repo này, như
README của repo mô tả ("Cách dùng trong một sản phẩm"), cùng `react` 19. Peer dependency: `react` 19 và
`@achoo254/brand` (khoảng version ở `package.json`; tên miền gốc được kiểm bằng cùng `DOMAIN_PATTERN` của brand).

## CSS: thứ tự nạp

Nạp `tokens.css` trước, `app-shell.css` sau, rồi tới CSS riêng của app:

```css
/* App dùng Tailwind v4 (src/styles.css) */
@import "tailwindcss";
@import "@achoo254/app-shell/tokens.css";
@import "@achoo254/app-shell/app-shell.css";
```

```ts
// App dùng CSS thường
import "@achoo254/app-shell/tokens.css";
import "@achoo254/app-shell/app-shell.css";
```

- `tokens.css` thay bản `tokens.css` chép tay của app; xoá bản chép đó.
- `app-shell.css` không nằm trong `@layer` nào, nên thắng preflight của Tailwind; nó chỉ chọn class `shell-*`, không
  đụng tới phần tử nào khác của app.
- Font `Inter` và `JetBrains Mono` (biến `--font-sans`, `--font-mono`) do app tự nạp.

## Dùng trong một app React

```tsx
import {
	FeatureList,
	Hero,
	PublicPage,
	type ShellBrand,
	type ShellLinkComponent,
	SignInCard,
	matchShellLocale,
	readPreferences,
} from "@achoo254/app-shell";
import { Link } from "react-router";

const shellBrand: ShellBrand = {
	appName: brand.appName, // brand.config.json
	domain: brand.primaryTenant.domain, // "hoandat.com"
	markSrc: markUrl, // dấu AI của app (asset đã bundle hoặc data URI), vẽ 24 px
};

// Link nội bộ (bắt đầu bằng "/") đi qua router, không tải lại trang.
const RouterLink: ShellLinkComponent = ({ href, ...rest }) => <Link to={href} {...rest} />;

// Ngôn ngữ đầu tiên: lựa chọn chung, rồi key cũ của app, rồi ngôn ngữ máy.
// App chỉ có vi và en thì không cần `locales`: zh-CN do app khác lưu được coi như chưa chọn.
const initialLocale =
	readPreferences({ domain: shellBrand.domain, legacyLangKey: "scribe-lang" }).lang ??
	matchShellLocale(navigator.language) ??
	"vi";

// App có tiếng Trung (Localman): truyền danh sách ngôn ngữ, theo thứ tự trên nút đổi.
const LOCALES = ["en", "zh-CN", "vi"] as const;
const localmanLocale =
	readPreferences({ domain: shellBrand.domain, locales: LOCALES }).lang ??
	matchShellLocale(navigator.language, LOCALES) ??
	"en";

<PublicPage
	brand={shellBrand}
	locale={locale}
	onLocaleChange={setLocale} // gói đã lưu cookie hd_lang; app chỉ render lại
	signInHref="/login"
	navLinks={[{ href: "#features", label: t("nav.features"), dataId: "topbar-features", hideOnPhones: true }]}
	footerLinks={[{ href: "/docs", label: t("nav.docs"), dataId: "foot-docs" }]}
	legacyThemeKey="scribe-theme"
	linkComponent={RouterLink}
>
	<Hero
		eyebrow="Scribe"
		title={t("landing.title")}
		lede={t("landing.lede")}
		aside={
			<SignInCard
				brand={shellBrand}
				locale={locale}
				signInHref="/api/auth/login" // route server: không truyền linkComponent cho thẻ
				title={t("login.title")}
				headingLevel={2}
				pending={signingIn} // đang chờ trình duyệt hệ thống: CTA bận, không nhận bấm
			/>
		}
	/>
	<FeatureList id="features" title={t("landing.features")} items={features} />
	<FeatureList dataId="features-mobile" title={t("landing.mobile")} items={mobileFeatures} />
</PublicPage>;
```

Trang `/login`: `<PublicPage layout="center" signInCurrent …><SignInCard … /></PublicPage>`.

`PublicPage` tự đặt link "Bỏ qua tới nội dung" (en "Skip to content", zh-CN "跳到主要内容") đầu trang, chỉ hiện khi
người dùng bàn phím tab tới, trỏ tới `<main id="main" tabindex="-1">`. App không tự đặt skip link hay bọc body trong
một `div id="main"` nữa; trang đã có phần tử `id="main"` khác thì đổi bằng `mainId`.

### `linkComponent` và route server

`linkComponent` áp cho mọi `href` bắt đầu bằng `/`. Chỉ truyền nó cho các trang của app mà router render được. Không
dùng cho route của server như `/api/auth/login`: router sẽ cố điều hướng nội bộ tới route đó thay vì để trình duyệt tải
nó. Vì CTA của `SignInCard` thường trỏ tới route server hoặc URL đăng nhập, **không truyền `linkComponent` cho
`SignInCard`**; header và footer vẫn dùng được (link đăng nhập trong header cũng qua `linkComponent` khi `signInHref`
bắt đầu bằng `/`, nên khi đó `signInHref` của header phải là route của router, ví dụ `/login`).

### Tùy chọn

| Prop | Ở đâu | Ý nghĩa |
|---|---|---|
| `brand` | mọi component có chữ của brand | `{ appName, domain, markSrc }` |
| `locale` | mọi component có chữ của khung | `"vi"`, `"en"` hoặc `"zh-CN"` |
| `locales` | `PublicPage`, `PublicFooter`, `LanguageSwitch` | Ngôn ngữ của app theo thứ tự trên nút đổi, mặc định `["vi", "en"]`; Localman và trang tài khoản truyền `["en", "zh-CN", "vi"]` |
| `signInHref` | `PublicHeader`, `SignInCard` | Route `/login` của app hoặc URL đăng nhập |
| `onSignIn(href)` | `PublicHeader`, `SignInCard` | Thay vì đi theo link (app native mở trình duyệt hệ thống bằng `@achoo254/capacitor-system-auth`) |
| `signInCurrent` | `PublicHeader` | Đánh dấu nút "Đăng nhập" là trang hiện tại (trên `/login`) |
| `navLinks` | `PublicHeader` | Vài link trước nút đăng nhập; `hideOnPhones` ẩn dưới 480 px; `current` đánh dấu trang hiện tại |
| `accountSlot` | `PublicHeader` | Thay nút đăng nhập khi khách đã đăng nhập (mở app, menu tài khoản) |
| `homeHref` | `PublicHeader` | Đích của dấu và tên app, mặc định `/` |
| `onLocaleChange(locale)` hoặc `languageHref(locale)` | `PublicFooter`, `LanguageSwitch` | Bắt buộc một trong hai: callback (nút bấm, gói lưu cookie) hoặc URL của server (link, không cần script) |
| `privacyHref`, `termsHref` | `PublicFooter` | Mặc định `/privacy`, `/terms` |
| `footerLinks` | `PublicFooter` | Link riêng của app sau Điều khoản |
| `legacyThemeKey` | `PublicFooter`, `ThemeSwitch` | Key localStorage cũ của app, đọc khi chưa có cookie chung |
| `linkComponent` | header, footer, thẻ | Link của router cho đường dẫn nội bộ; URL khác luôn là `<a>`. Không dùng cho route server (`/api/...`) và không truyền cho `SignInCard`, xem trên |
| `layout` | `PublicPage` | `"flow"` (mặc định) cho trang giới thiệu và pháp lý, `"center"` cho `/login` |
| `mainId` | `PublicPage` | `id` của `<main>`, đích của skip link; mặc định `main` |
| `title`, `description`, `headingLevel`, `children` | `SignInCard` | Chữ của app; `h1` mặc định, `h2` khi đứng cạnh `Hero` |
| `pending` | `SignInCard` | Đăng nhập đang chạy (chờ trình duyệt hệ thống): CTA có `aria-busy`, `aria-disabled`, mờ đi và bỏ qua mọi lần bấm; chữ và kích thước giữ nguyên, nên vẫn một dòng ở 320 px |
| `eyebrow`, `title`, `lede`, `children`, `aside` | `Hero` | `aside` nằm cạnh từ 900 px, dưới ở màn hẹp |
| `items`, `eyebrow`, `title`, `id`, `dataId` | `FeatureList` | `items`: `{ id, title, description, icon? }`; `dataId` mặc định `features`, mỗi danh sách trên một trang một giá trị |

Mỗi khối có `data-id`: `skip-link`, `public-header`, `public-home`, `public-sign-in`, `public-footer`, `foot-home`,
`foot-privacy`, `foot-terms`, `lang-switch`, `lang-<locale>` (`lang-vi`, `lang-en`, `lang-zh-CN`), `theme-switch`, `theme-light`, `theme-dark`,
`theme-system`, `sign-in-card`, `sign-in-cta`, `hero`, `features` (hoặc `dataId`), `feature-<id>`; link app truyền vào dùng `dataId`
của nó.

## Đổi giao diện: chống nháy màu

Đặt script inline trong `<head>`, trước CSS, để `data-theme` có trước lần vẽ đầu:

```ts
import { themeBootstrapScript } from "@achoo254/app-shell/preferences";

const script = themeBootstrapScript({ legacyThemeKey: "localman-theme" });
// index.html: <script>${script}</script>; CSP cho phép bằng hash sha256 của đúng chuỗi này
```

Cùng tùy chọn luôn cho cùng một chuỗi, nên hash CSP ổn định. `ThemeSwitch` không đụng `data-theme` lúc mount (script
đã đặt); nó áp lựa chọn khi người dùng bấm, và khi trang được xem lại sau khi một app khác đổi cookie.

## Lựa chọn dùng chung (`@achoo254/app-shell/preferences`)

| Hàm | Việc |
|---|---|
| `readPreferences({ domain, locales?, legacyThemeKey?, legacyLangKey? })` | `{ lang, theme }`: cookie, rồi localStorage `hd_*`, rồi lựa chọn chưa lưu được của lượt xem này, rồi key cũ của app. `theme` mặc định `"system"`, `lang` để `undefined` cho app tự chọn. Ngôn ngữ đã lưu không nằm trong `locales` của app (mặc định `["vi", "en"]`) được coi như chưa chọn; kiểu của `lang` theo `locales` |
| `writePreference("theme" \| "lang", value, { domain })` | Ghi cookie; nếu cookie không giữ được thì ghi localStorage; rồi báo các subscriber. Giá trị sai ném `RangeError` |
| `subscribePreferences(listener)` | Gọi lại sau mỗi lần ghi và khi trang được xem lại (focus, `visibilitychange`); trả về hàm huỷ |
| `applyTheme(theme)` | Đặt `data-theme` trên `<html>`; `"system"` xoá thuộc tính để `tokens.css` theo máy |
| `themeBootstrapScript({ legacyThemeKey? })` | Chuỗi script inline cho `<head>` |
| `cookieDomainFor(hostname, domain)` | Domain của cookie cho một host |

Ngôn ngữ (từ `@achoo254/app-shell`): `SHELL_LOCALES` (`vi`, `en`, `zh-CN`), `DEFAULT_SHELL_LOCALES` (`vi`, `en`),
`SHELL_LOCALE_NAMES` (tên tự gọi: "Tiếng Việt", "English", "中文"), `isShellLocale(value)`, và
`matchShellLocale(tag, locales?)`: thẻ BCP 47 theo ngôn ngữ chính (`vi-VN` là vi, mọi thẻ `zh*` là zh-CN), chỉ trong
`locales` của app (mặc định vi và en).

Cookie: `hd_lang=<vi|en|zh-CN>` / `hd_theme=<light|dark|system>`, `Path=/`, `Max-Age` một năm, `SameSite=Lax`, `Secure`
khi trang chạy https, và `Domain=<domain>` khi host là chính domain gốc hoặc nằm dưới nó (`scribe.hoandat.com` →
`Domain=hoandat.com`). Trên `localhost` hay host khác, cookie chỉ thuộc host đó. Trong WebView Capacitor
(`capacitor://localhost`) không có cookie: lựa chọn nằm trong localStorage của WebView đó. Không có DOM (server) thì
đọc trả mặc định, ghi không làm gì.

Chuyển từ key cũ: khi chưa có cookie chung, `readPreferences` và script inline đọc key localStorage cũ của app
(`legacyThemeKey`, `legacyLangKey`), nên người dùng giữ lựa chọn cũ. Lần đầu bấm đổi, lựa chọn được ghi vào cookie
chung và từ đó key cũ không còn được đọc.

## Dùng trên server (auth-next)

```ts
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { PublicPage, SignInCard } from "@achoo254/app-shell";

const html = renderToStaticMarkup(
	createElement(PublicPage, {
		brand, locale, signInHref, homeHref: "/apps",
		languageHref: (locale) => languageHref(locale, page.path), // link /lang?set=…, không cần script
		layout: "center",
		children: createElement(SignInCard, { brand, locale, signInHref, title }),
	}),
);
```

Trên server `ThemeSwitch` hiện "Theo máy"; nút chỉ hoạt động khi trang có React chạy phía client (hoặc script riêng
của trang đặt `data-theme` theo `value` của nút). React 19 chèn `<link rel="preload" as="image">` cho dấu app ngay
trước khung.

## Thay đổi gói

Sửa `src/`, chạy các bước kiểm trong README của repo, commit `src` và `dist` cùng nhau và phát hành version mới (README
của repo, "Phát hành"). `tokens.css` từ nay là bản gốc của token: app (kể cả `localman-next`) xoá bản chép và nạp từ gói. Hai khối dark phải
giống nhau (`test/css.test.ts`).
