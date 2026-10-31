# @achoo254/app-shell

Khung giao diện chung cho trang chưa đăng nhập của mọi app hoandat.com: header, khung trang, thẻ đăng nhập, khối giới
thiệu, danh sách tính năng, footer, nút đổi ngôn ngữ và nút đổi giao diện. Bố cục lấy theo trang tài khoản
(`auth-next` `src/ui/layout.ts` và `static/css/app.css`). App chỉ truyền nội dung (brand, link, URL đăng nhập, chữ
riêng của app, phần body); chữ trên nút của khung, số nút, thứ tự và breakpoint do gói quyết định, nên các app không
lệch nhau.

- **Component React 19**: `PublicPage`, `PublicHeader`, `PublicFooter`, `SignInCard`, `Hero`, `FeatureList`, `AccountMenu`,
  `LanguageSwitch`, `ThemeSwitch`. Render được trên server bằng `renderToStaticMarkup` (không cần DOM).
- **Lựa chọn dùng chung** (`@achoo254/app-shell/preferences`, không phụ thuộc React): cookie `hd_lang` và `hd_theme`.
- **Trang dựng trên server không có React phía trình duyệt** (auth-next, Tunelo): `app-shell-enhance.js`, một file
  script thường không import gì, làm nút đổi giao diện chạy dưới CSP `script-src 'self'` (xem "Trang dựng trên
  server").
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
  đụng tới phần tử nào khác của app. Từ 0.3.0 cả `box-sizing: border-box` và vòng focus cũng chỉ áp cho phần tử có
  class `shell-*` (bọc trong `:where()`, CSS của app ghi đè dễ); nội dung của app trong `<main>` giữ box-sizing và
  vòng focus của app.
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

`onLocaleChange` và `languageHref` nhận đúng kiểu ngôn ngữ của app (theo `locales` và `locale`): app vi/en truyền
thẳng `setLocale: (locale: "vi" | "en") => void`, không cần kiểm `isLocale` nữa. App có ngôn ngữ khác vi và en phải
truyền `locales`, để gói chỉ gọi callback với ngôn ngữ của app.

### Mời đăng ký (0.5.0)

Nút của header cho khách giờ là **"Đăng ký miễn phí"** ("Sign up free", "免费注册"); dưới 480 px chỉ hiện dạng ngắn
"Đăng ký" để tên app không bị cắt. Đăng nhập bằng Google/GitHub/Apple tạo tài khoản ngay lần đầu, nên đăng nhập và đăng
ký là cùng một nút; `signInHref` không đổi.

`AccountValueCard` là thẻ app hiện cho khách **sau việc thật đầu tiên** (lập xong lá số, xong một nhiệm vụ, dựng xong
video): tối đa ba dòng lợi ích do app viết (`benefits`), dòng chung "Một tài khoản dùng cho mọi app của …" và nút đăng
ký như header. App tự quyết lúc hiện; gói không giữ trạng thái đã đóng.

```tsx
<AccountValueCard
	brand={brand}
	locale={locale}
	signInHref="/api/auth/login"
	benefits={["Lưu lá số để xem lại", "Quẻ hôm nay mỗi sáng"]}
/>
```

### Header trên điện thoại: giữ nguyên tên app

Dưới 480 px header chỉ đủ chỗ cho dấu, **trọn tên app**, nhiều nhất một link ngắn và nút đăng nhập hoặc một control tài
khoản. Có hơn thế thì tên app bị cắt (Clip ở 390 px với hai link và "Đăng xuất"). Khi đó chọn một trong hai:

- `hideOnPhones: true` trên từng link: link đó ẩn dưới 480 px (như 0.2).
- `hideNavOnPhones` trên `PublicPage`: ẩn cả dãy link của header dưới 480 px, và footer hiện lại chúng trong hàng link
  (chỉ trên điện thoại, `data-id="foot-<dataId>"`; link nào footer đã có cùng `href` thì không lặp).

### Ô tài khoản: nút đăng xuất, ẩn nút đăng nhập

`accountSlot` thay nút "Đăng nhập". Gói không có logic đăng nhập; app tự dựng control, dùng class của gói để trông như
link header:

```tsx
// App React: đăng xuất bằng script của app.
accountSlot={<button type="button" className="shell-topbar-link" data-id="sign-out" onClick={signOut}>{t("signOut")}</button>}

// Trang server (Tunelo): đăng xuất bằng POST có CSRF, không cần script.
accountSlot={
	<form className="shell-topbar-form" method="post" action="/auth/logout">
		<input type="hidden" name="csrf" value={csrfToken} />
		<button type="submit" className="shell-topbar-link" data-id="sign-out">{t("signOut")}</button>
	</form>
}
```

- `shell-topbar-link` trên `<button>` đã bỏ viền, nền và margin mặc định của nút: app xoá CSS reset riêng (Tử Vi, Clip
  đang có `topbar-button`).
- `shell-topbar-form` (`display: contents`) để form không chen thêm hộp vào hàng header.
- Chữ phụ chỉ hiện từ 480 px (ví dụ tên người dùng): thêm class `shell-hide-phone`.
- `accountSlot={null}`: không hiện gì ở chỗ đó (đăng nhập chưa cấu hình trên server), thay cho `<></>`. Bỏ trống
  (`undefined`) thì vẫn hiện nút "Đăng nhập".

### Footer: nút và ghi chú của app

`footerLinks` nhận cả link `{ href, label, dataId }` lẫn nút `{ label, dataId, onClick }` (không có `href`). Nút là
`<button type="button" class="shell-foot-link">`, trông như link, dùng cho việc mở form trên trang (Feedback của
Localman) thay cho link giả `#feedback`. Trên trang server không có React, bỏ `onClick` và gắn sự kiện theo `data-id`
trong file script của trang.

`footerNote`: một dòng chữ nhỏ của app dưới hàng link (`<p class="shell-foot-note" data-id="foot-note">`), ví dụ "Nội
dung mang tính giải trí, tham khảo" của Tử Vi.

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
| `hideNavOnPhones` | `PublicHeader`, `PublicPage` | Ẩn mọi link của header dưới 480 px; `PublicPage` hiện lại chúng ở footer trên điện thoại |
| `accountSlot` | `PublicHeader` | Thay nút đăng nhập khi khách đã đăng nhập (mở app, menu tài khoản, nút đăng xuất); `null` không hiện gì, bỏ trống thì hiện nút "Đăng nhập" |
| `homeHref` | `PublicHeader` | Đích của dấu và tên app, mặc định `/` |
| `onLocaleChange(locale)` hoặc `languageHref(locale)` | `PublicFooter`, `LanguageSwitch` | Bắt buộc một trong hai: callback (nút bấm, gói lưu cookie) hoặc URL của server (link, không cần script) |
| `privacyHref`, `termsHref` | `PublicFooter` | Mặc định `/privacy`, `/terms`; `termsHref: null` bỏ link điều khoản cho app không có trang điều khoản riêng (như trang tài khoản) |
| `footerLinks` | `PublicFooter` | Link (`{ href, label, dataId, current? }`) và nút (`{ label, dataId, onClick? }`) riêng của app sau Điều khoản |
| `footerNote` | `PublicFooter` | Dòng ghi chú nhỏ của app dưới hàng link |
| `legacyThemeKey` | `PublicFooter`, `ThemeSwitch` | Key localStorage cũ của app, đọc khi chưa có cookie chung |
| `linkComponent` | header, footer, thẻ | Link của router cho đường dẫn nội bộ; URL khác luôn là `<a>`. Không dùng cho route server (`/api/...`) và không truyền cho `SignInCard`, xem trên |
| `layout` | `PublicPage` | `"flow"` (mặc định) cho trang giới thiệu và pháp lý, `"center"` cho `/login` |
| `mainId` | `PublicPage` | `id` của `<main>`, đích của skip link; mặc định `main` |
| `title`, `description`, `headingLevel`, `children` | `SignInCard` | Chữ của app; `h1` mặc định, `h2` khi đứng cạnh `Hero` |
| `pending` | `SignInCard` | Đăng nhập đang chạy (chờ trình duyệt hệ thống): CTA có `aria-busy`, `aria-disabled`, mờ đi và bỏ qua mọi lần bấm; chữ và kích thước giữ nguyên, nên vẫn một dòng ở 320 px |
| `eyebrow`, `title`, `lede`, `children`, `aside` | `Hero` | `aside` nằm cạnh từ 900 px, dưới ở màn hẹp |
| `items`, `eyebrow`, `title`, `id`, `dataId` | `FeatureList` | `items`: `{ id, title, description, icon? }`; `dataId` mặc định `features`, mỗi danh sách trên một trang một giá trị |

Mỗi khối có `data-id`: `skip-link`, `public-header`, `public-home`, `public-sign-in`, `public-footer`, `foot-home`,
`foot-privacy`, `foot-terms`, `foot-note`, `foot-<dataId>` (link header lặp lại ở footer với `hideNavOnPhones`), `lang-switch`, `lang-<locale>` (`lang-vi`, `lang-en`, `lang-zh-CN`), `theme-switch`, `theme-light`, `theme-dark`,
`theme-system`, `sign-in-card`, `sign-in-cta`, `hero`, `features` (hoặc `dataId`), `feature-<id>`; link app truyền vào dùng `dataId`
của nó.

## Đổi giao diện: chống nháy màu

Đặt script inline trong `<head>`, trước CSS, để `data-theme` có trước lần vẽ đầu:

```ts
import { themeBootstrapScript } from "@achoo254/app-shell/preferences";

const script = themeBootstrapScript({ legacyThemeKey: "localman-theme" });
// index.html: <script>${script}</script>; CSP cho phép bằng hash sha256 của đúng chuỗi này
```

Cùng tùy chọn luôn cho cùng một chuỗi, nên hash CSP ổn định. Trang server có CSP không cho script inline nào dùng
file `app-shell-enhance.js` trong `<head>` thay cho script này (xem "Trang dựng trên server"). `ThemeSwitch` không đụng `data-theme` lúc mount (script
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

## Trang dựng trên server (auth-next, Tunelo)

Trang dựng HTML trên server bằng `renderToStaticMarkup`, không chạy React trong trình duyệt, CSP không có
`'unsafe-inline'`:

```ts
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { PublicPage, SignInCard } from "@achoo254/app-shell";

const body = renderToStaticMarkup(
	createElement(PublicPage, {
		brand, locale, locales: ["en", "zh-CN", "vi"], signInHref, homeHref: "/apps",
		languageHref: (locale) => languageHref(locale, page.path), // link /lang?set=…, không cần script
		layout: "center",
		children: createElement(SignInCard, { brand, locale, signInHref, title }),
	}),
);

const html = `<!DOCTYPE html><html lang="${locale}"><head>
<script src="/assets/js/app-shell-enhance.js"></script>
<link rel="stylesheet" href="/assets/css/tokens.css"><link rel="stylesheet" href="/assets/css/app-shell.css">
</head><body>${body}</body></html>`;
```

**`app-shell-enhance.js`** (`@achoo254/app-shell/app-shell-enhance.js`, file `dist/app-shell-enhance.js`): một script
thường (IIFE), không import gì lúc chạy, khoảng 7 KB chưa nén. App phục vụ nó như một file tĩnh của chính origin: chép
vào thư mục static lúc build, hoặc trả thẳng file của gói
(`fileURLToPath(import.meta.resolve("@achoo254/app-shell/app-shell-enhance.js"))`).

- Đặt trong `<head>`, **không** `defer`/`async`/`type="module"`: script đặt `data-theme` theo lựa chọn đã lưu (cookie
  `hd_theme`, rồi localStorage) trước lần vẽ đầu, thay cho `themeBootstrapScript` inline. Không cần hash CSP.
- Khi DOM xong, mọi `ThemeSwitch` dựng trên server (`[data-id="theme-switch"]`) chạy: bấm thì ghi `hd_theme` cho tên
  miền gốc trong `data-domain` của fieldset (qua chính module `preferences`), đặt `data-theme`, chuyển `aria-pressed`.
  Trang được xem lại (focus, `visibilitychange`) sau khi app khác đổi giao diện thì trang và nút theo lựa chọn mới.
- Chỉ bắt sự kiện bằng `addEventListener` (một listener click cho cả trang): không có `onclick` inline, nên chạy được
  với `script-src-attr 'none'`. Không đặt `style` nào, nên hợp `style-src 'self'`. Nạp hai lần cũng chỉ chạy một lần.
- Nút đổi ngôn ngữ trên trang server vẫn là link (`languageHref`), không cần script: server ghi cookie `hd_lang` rồi
  quay lại trang.
- Không dùng script này trên trang có React chạy phía trình duyệt: `ThemeSwitch` của React đã tự làm việc đó.

CSP tối thiểu cho trang như vậy: `script-src 'self'` (cộng nguồn analytics nếu có), `style-src 'self'`,
`img-src 'self' data:` (dấu app). auth-next đã có `script-src 'self'`; Tunelo hiện chỉ cho
`https://static.cloudflareinsights.com`, phải thêm `'self'`. React 19 chèn `<link rel="preload" as="image">` cho dấu
app ngay trước khung; HTML của gói không có thuộc tính `style` hay script inline nào.

## Menu tài khoản khi đã đăng nhập (`AccountMenu`, từ 0.4.0)

Nút avatar + tên trên header và menu tài khoản, như top bar của Localman. Mọi app trừ Localman (bản gốc), Miu và
Tiểu Đệ dùng component này; không chép tay.

```tsx
<PublicHeader
	brand={brand} locale={locale} signInHref="/login"
	accountSlot={
		<AccountMenu
			user={{ name: me.name, email: me.email, picture: me.picture }}
			locale={locale}
			domain={brand.domain}
			idpAccountUrl="https://auth.hoandat.com/account"
			entries={[[{ label: "Cài đặt", dataId: "account-menu-settings", href: "/settings" }]]}
			signOut={{ onClick: signOut, busy }}   // hoặc { action: "/logout", fields: { csrf } }
			linkComponent={RouterLink}
		/>
	}
/>
```

- Avatar: ảnh IdP nếu là `https:`, không thì chữ cái đầu của tên (hoặc email) trên nền màu chính. Tên: `name`, rồi
  `email`, rồi chữ "Tài khoản". Dưới 640px chỉ còn avatar.
- Menu: tên + email, các nhóm `entries` của app, nhóm "Tài khoản hoandat.com · mở tab mới" (Email, Phương thức đăng
  nhập; `idpAccountUrl: null` bỏ nhóm này, dùng trên chính trang IdP), Đăng xuất.
- App native (Capacitor) truyền `onOpenExternal` để mở link IdP bằng trình duyệt hệ thống.
- Là một `<details>`: mở được không cần script. Đóng khi bấm ra ngoài, Escape, tab ra khỏi menu hay chọn một mục:
  React tự gắn; trang dựng trên server được `app-shell-enhance.js` gắn.
- CSP: ảnh avatar đến từ Google (`https://lh3.googleusercontent.com`) và GitHub
  (`https://avatars.githubusercontent.com`), phải có trong `img-src`. Ảnh tải với `referrerpolicy="no-referrer"`.

## Nâng từ 0.2 lên 0.3 (tag `v0.9.0`)

Không có thay đổi phá API: mọi prop và kiểu của 0.2 vẫn dùng như cũ (kiểu không truyền tham số mặc định
`ShellLocale`). Những chỗ hiển thị đổi:

- `accountSlot={null}` giờ ẩn nút đăng nhập (0.2 vẫn hiện nút). Không app nào đang truyền `null` để mong có nút.
- `box-sizing` và vòng focus của gói không còn áp lên nội dung của app trong `.shell` (`.shell *`,
  `.shell :focus-visible` cũ).
- Trên màn cảm ứng và dưới 480 px, link và nút ở header, footer, nút ngôn ngữ rộng ít nhất 44 px (chữ ngắn như
  "Terms", "登录" được đệm, căn giữa).
- Fieldset của `ThemeSwitch` có thêm `data-domain`; test so khớp HTML của app có thể phải cập nhật.

Từng app:

- **Scribe**: không bắt buộc sửa. Có thể truyền thẳng `setLocale` cho `onLocaleChange` thay cho `followStoredLocale`.
- **Chat**: như Scribe; kiểm lại nội dung trong `<main>` nếu từng dựa vào `.shell *` của gói (Chat có preflight
  Tailwind nên không đổi).
- **Localman web**: thay link `#feedback` và listener click ở layout bằng mục nút
  `{ label, dataId: FEEDBACK_LINK_ID, onClick: openFeedback }` trong `footerLinks`; bỏ ép kiểu ngôn ngữ ở
  `onLocaleChange` nếu có.
- **Tử Vi**: dòng "giải trí, tham khảo" chuyển sang `footerNote`; `accountSlot={null}` thay `<></>`; nút đăng xuất chỉ
  cần `className="shell-topbar-link"`, xoá CSS reset riêng; bỏ `isLocale` trong `onLocaleChange`.
- **Clip**: như Tử Vi (trừ `footerNote`); có thể dùng `hideNavOnPhones` thay cho `hideOnPhones` từng link để link vẫn
  có ở footer trên điện thoại.
- **auth-next** (bước 4): dựng header, footer, thẻ bằng `renderToStaticMarkup` như trên; phục vụ
  `app-shell-enhance.js` và đặt nó trong `<head>`; cookie `hd_theme` do script ghi (không `httpOnly`), cookie `hd_lang`
  server ghi phải bỏ `httpOnly` và đặt `Domain=hoandat.com` như kế hoạch.
- **Tunelo**: như auth-next; thêm `'self'` vào `script-src`; form đăng xuất dùng `shell-topbar-form` và nút
  `shell-topbar-link` trong `accountSlot`.

## Thay đổi gói

Sửa `src/`, chạy các bước kiểm trong README của repo, commit `src` và `dist` cùng nhau và phát hành version mới (README
của repo, "Phát hành"). `tokens.css` từ nay là bản gốc của token: app (kể cả `localman-next`) xoá bản chép và nạp từ gói. Hai khối dark phải
giống nhau (`test/css.test.ts`).
