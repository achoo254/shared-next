# shared-next

Các gói dùng chung của hệ sản phẩm *-next (chat-next, scribe-next, localman-next, miu-world-next).
Hiện có ba gói dùng trong sản phẩm và một gói công cụ:

- **`@achoo254/brand`** (thư mục `packages/brand`): cấu hình thương hiệu, mô tả bên dưới.
- **`@achoo254/capacitor-system-auth`** (thư mục `packages/capacitor-system-auth`): plugin Capacitor 8 mở
  trang đăng nhập trong trình duyệt hệ thống (iOS `ASWebAuthenticationSession`, Android Auth Tab / Custom Tabs)
  và trả URL callback. Cách dùng và cấu hình app: [`packages/capacitor-system-auth/README.md`](packages/capacitor-system-auth/README.md).
- **`@achoo254/app-switcher`** (thư mục `packages/app-switcher`): nút 9 chấm chuyển sang app khác cùng tài
  khoản (Chat, Scribe, Localman, Tunelo, rồi trang tài khoản), React 19, danh mục tĩnh dưới một tên miền gốc, link gắn
  `utm_source`/`utm_medium=app_switcher`. Peer dependency `@achoo254/brand` (dựng host bằng `hostsFor`).
  Cách dùng và biến CSS: [`packages/app-switcher/README.md`](packages/app-switcher/README.md).
- **`@achoo254/app-shorts`** (thư mục `packages/app-shorts`, riêng tư, không publish): dựng Shorts dọc
  cho kênh YouTube Hoandat Apps từ ảnh store của từng app và đăng bằng YouTube Data API; cũng là nơi có
  script cấp quyền YouTube cho cả kênh Miu World. Cách chạy: [`packages/app-shorts/README.md`](packages/app-shorts/README.md).

## `@achoo254/brand` là gì

Một nguồn duy nhất cho thương hiệu của từng sản phẩm. Mỗi sản phẩm giữ **một** `brand.config.json` (tên, màu,
icon, bundle id, URL scheme, tên miền chính (`primaryTenant`), mẫu host). Gói này cung cấp:

- **Schema** `brand.config.schema.json`: tập hợp mọi trường bốn sản phẩm đang dùng. Trường mà chỉ vài sản phẩm cần
  (`sharedDomains`, `devOrigins`, `pushSenderName`, `webInstall`, `appIds.android`, `colors.primary`,
  `colors.theme`, `colors.backgroundDark`) là tùy chọn; sản phẩm nào cần thì bắt buộc nó bằng
  `parseBrandConfig(value, { require: [...] })`, và kiểu trả về coi các trường đó là có mặt.
- **Entry cho trình duyệt** (`.`): kiểu `BrandConfig` và `defineBrand(config)`, nhận `brand.config.json` đã import
  dạng module, trả lại đúng kiểu chính xác của file JSON đó. Không dùng `node:*`, không dùng Ajv (Ajv biên dịch
  bằng `new Function`, bị CSP chặn), nên chạy được trong bundle web và bundle server.
- **`./hosts`** (cho trình duyệt, chỉ dùng khi cần): `hostsFor`, `primaryOrigin`, `allowedOrigins`, `miniAppOrigin`.
- **`./build`** (chỉ Node): kiểm schema bằng Ajv, sinh `web.webmanifest.json` và `capacitor.json` theo tùy chọn,
  vẽ icon PNG/ICO từ SVG qua một **renderer được truyền vào** (sản phẩm đưa Chromium của Playwright mà nó đã cài,
  gói này không phụ thuộc Playwright), ghi `icons-source.json`.
- **`./check-brand`** (chỉ Node): chặn tên sản phẩm viết cứng trong code, dạng hàm (`checkBrand`,
  `findNameProblems`) và CLI (`check-brand`).

**Desktop chỉ là PWA** (quyết định 20/10/2026): không có Tauri hay app desktop native trong hệ sinh thái. Gói không
sinh `tauri.json` và schema không có `appIds.desktop`. Khi chuyển sang gói này, mỗi sản phẩm xóa
`appIds.desktop` khỏi `brand.config.json` và xóa file `generated/tauri.json` của mình.

Ba gói công khai trên npm dưới scope `@achoo254` (tài khoản npm `achoo254`), license MIT, phát hành từ GitHub Actions
qua trusted publishing nên mỗi bản có provenance. Trước 24/10/2026 các gói tên `@shared-next/*` và được cài bằng
phụ thuộc git (`github:achoo254/shared-next#<tag>&path:…`); scope `@shared-next` trên npm không thuộc về chúng ta.

## Cách dùng trong một sản phẩm

### Khai báo phụ thuộc

```sh
pnpm add @achoo254/brand            # hoặc npm install @achoo254/brand
```

pnpm 11 mặc định không cài bản phát hành chưa đủ 24 giờ (`minimumReleaseAge = 1440` phút). Muốn dùng một bản vừa
phát hành, thêm **đúng version đó** (không dùng wildcard theo scope) vào `pnpm-workspace.yaml`, rồi gỡ khi bản đã quá
24 giờ:

```yaml
minimumReleaseAgeExclude:
  - "@achoo254/brand@0.3.0"
```

Gói giao JavaScript ESM đã biên dịch kèm `.d.ts` (thư mục `dist`), yêu cầu Node >=22.12. Mọi nơi dùng được như một
gói npm thường: `node`, `vite.config.ts` với trình nạp cấu hình mặc định của Vite, Vitest, `tsc` (cả `NodeNext` lẫn
`Bundler`). Mã nguồn TypeScript ở `packages/brand/src` để đọc và sửa; sản phẩm không import từ đó.

### Trỏ `$schema` về schema của gói

Trong `brand.config.json` của sản phẩm, để trình soạn thảo gợi ý và báo lỗi theo đúng schema mà gói kiểm:

```json
"$schema": "./node_modules/@achoo254/brand/brand.config.schema.json"
```

(đường dẫn tính từ thư mục chứa `brand.config.json`; sản phẩm xóa bản schema chép tay của mình.)

### Thương hiệu trong bundle (web, server)

```ts
import config from "../brand.config.json" with { type: "json" };
import { defineBrand } from "@achoo254/brand";

export const brand = defineBrand(config);
```

### Kiểm schema và sinh file (`pnpm brand:gen`)

Mỗi sản phẩm giữ một script ngắn gọi `writeBrandFiles`. Ví dụ của chat:

```ts
import { chromium } from "playwright"; // scribe: "@playwright/test"
import {
	chromiumRenderer,
	loadBrandConfig,
	svgManifestIcons,
	writeBrandFiles,
} from "@achoo254/brand/build";

const root = new URL("../../../", import.meta.url); // thư mục chứa brand.config.json
const brand = loadBrandConfig(root, {
	require: [
		"sharedDomains",
		"devOrigins",
		"pushSenderName",
		"appIds.android",
		"colors.primary",
		"colors.backgroundDark",
	],
});
await writeBrandFiles({
	brand,
	root,
	generatedDir: new URL("../generated/", import.meta.url),
	manifests: {
		web: {
			id: "/",
			lang: "vi",
			dir: "ltr",
			themeColor: "primary",
			categories: ["social"],
			preferRelatedApplications: false,
			icons: svgManifestIcons(),
		},
		capacitor: true,
	},
	renderer: chromiumRenderer(chromium),
});
```

Tùy chọn của bốn sản phẩm (đúng như `packages/brand/test/consumers.ts`, nơi test so từng byte với file đã commit):

| Sản phẩm | `web` | `capacitor` | `indent` | `renderer` |
|---|---|---|---|---|
| chat | `id "/"`, `lang "vi"`, `dir "ltr"`, `themeColor "primary"`, `categories ["social"]`, `preferRelatedApplications false`, `svgManifestIcons()` | `true` | `2` | Chromium từ `playwright` |
| scribe | như chat nhưng `themeColor "background"`, `categories ["productivity"]`, `svgManifestIcons("favicon.svg")` (favicon SVG phục vụ ở `/favicon.svg`; `webIconFiles` cũng nhận `faviconSvg: "favicon.svg"`) | `{ urlScheme: false }` | `2` | Chromium từ `@playwright/test` |
| localman | như chat nhưng `lang "en"`, `categories ["productivity", "utilities"]`; `require` thêm `"webInstall"` | `true` | `"\t"` | Chromium từ `playwright` |
| miu | `lang "vi"`, `display "fullscreen"`, `orientation "any"`, `themeColor "theme"`, danh sách icon PNG của miu | `true` | `2` | không truyền (icon PNG vẽ sẵn bằng `pnpm assets:logo`) |

`hostsFor` và `allowedOrigins` báo lỗi khi tên miền gốc không khớp mẫu `domain` của schema (chữ thường, không
cổng, không đường dẫn); sản phẩm nào đọc tên miền từ `location.host` (có thể kèm cổng) thì tách cổng trước khi gọi.

Các phần còn lại thuộc từng sản phẩm, không nằm trong gói: bản sao tên cho server Go của chat
(`serverBrandNames`), đường dẫn Bot API và webhook của chat (`/bot/v1`, `/hook`), danh sách file logo của miu.

### Chặn tên sản phẩm viết cứng (`pnpm lint`)

Dùng CLI (bin `check-brand`, chạy bằng `node`) hoặc gọi
`checkBrand({ root, appName, dirs, ... })` trong script riêng. Dòng `check:brand` trong `package.json` của từng sản
phẩm, đã đối chiếu với repo hiện tại (20/10/2026): cùng tập file được đọc, cùng tập file áp luật literal, cùng tập
HTML, 0 vi phạm như lệnh cũ:

**chat-next (thư mục gốc repo)**

```json
"check:brand": "check-brand --config brand.config.json --dir apps --dir packages --dir server --dir proto --dir sdk --dir spec --dir deploy --skip-dir gen --banned chat-inet --test-file '/test/|_test\\.go$|\\.test\\.ts$' --hint 'read it from @achoo254/brand'"
```

**scribe-next (thư mục `web/`)**

```json
"check:brand": "check-brand --config brand.config.json --dir src --dir scripts --dir e2e --file index.html --file vite.config.ts --file vite-brand.ts --file vitest.config.ts --file capacitor.config.ts --skip-dir test-results --skip-dir playwright-report --skip-dir check-brand --banned OneScribe --html-word --source-file '\\.(ts|tsx|js|mjs|cjs|json|html|css)$' --code-file '\\.(ts|tsx|js|mjs|cjs)$' --test-file '(^|/)(e2e|test)/|\\.(test|spec)\\.tsx?$' --hint 'read it from src/lib/brand.ts'"
```

**localman-next**

```json
"check:brand": "check-brand --config brand.config.json --dir apps --dir packages --skip-dir portal-dist --ignore-path apps/web/public --source-file '\\.(ts|tsx|js|mjs|cjs)$' --code-file '\\.(ts|tsx|js|mjs|cjs)$' --test-file '\\.test\\.[cm]?[jt]sx?$|/__tests__/|/testing/|/test-support/' --hint 'read brand.appName from @achoo254/brand'"
```

**miu-world-next**

```json
"check:brand": "check-brand --config brand.config.json --dir apps --dir packages --skip-dir test-results --skip-dir playwright-report --skip-dir e2e --skip-dir test --skip-dir testing --source-file '\\.(ts|tsx|js|mjs|cjs)$' --code-file '\\.(ts|tsx|js|mjs|cjs)$' --test-file '\\.(test|spec)\\.(ts|tsx|js|mjs)$' --jsx-text --skip-comment-lines --colour-dir apps/web/src/ui --colour-dir apps/web/src/seo --token-file apps/web/src/ui/tokens.css --hint 'read it from @achoo254/brand'"
```

Ghi chú theo sản phẩm:

- **chat**: `--test-file` giữ đúng cách chat nhận diện test hôm nay (`/test/`, `_test.go`, `.test.ts`).
- **scribe**: hôm nay còn quét thêm `--dir brand/src --dir brand/test` (bản chép gói brand cũ); hai thư mục đó bị
  xóa khi chuyển sang gói này nên không có trong dòng trên. `--skip-dir check-brand` bỏ thư mục luật cũ (có viết
  tên cấm), vô hại sau khi xóa.
- **localman**: `--test-file` của localman không coi `apps/web/src/test/*` (helper của app) là test, nên 9 file đó
  vẫn được kiểm như hôm nay.
- **miu**: hôm nay miu bỏ file test ngay khi duyệt thư mục; gói vẫn đọc chúng nhưng không áp luật literal, và miu
  không có tên cấm, nên kết quả như nhau.
- Mẫu test mặc định (khi không truyền `--test-file`) chỉ nhận test qua tên file (`.test.*`, `.spec.*`, `_test.go`)
  và thư mục `__tests__/`; thư mục `test/`, `e2e/`, `testing/` mỗi repo hiểu một kiểu, nên sản phẩm tự khai.

Các luật bật theo sản phẩm:

| Luật | Tùy chọn | Ai dùng |
|---|---|---|
| Tên cũ bị cấm ở mọi file, kể cả test, mọi kiểu chữ | `bannedNames` / `--banned` | chat (`chat-inet`), scribe (`OneScribe`) |
| `appName` là nguyên một chuỗi literal trong code ngoài test | luôn bật; `codeFile`, `testFile` | cả bốn |
| `appName` là một từ trong HTML (dùng `%APP_NAME%`) | `htmlWord` / `--html-word` | scribe |
| `appName` là nguyên nội dung một phần tử JSX | `jsxText` / `--jsx-text` | miu |
| Bỏ qua dòng chỉ có chú thích | `skipCommentLines` / `--skip-comment-lines` | miu |
| Dòng có `check-brand-ignore: <lý do>` được bỏ qua | `ignoreMarker` (mặc định bật; `--ignore-marker ''` để tắt) | localman (các repo khác chưa dùng) |
| Mã màu trong CSS ngoài file token | `colours` / `--colour-dir`, `--token-file` | miu |

Đường dẫn khai báo mà không tồn tại thì lệnh báo lỗi (thoát mã 2) thay vì lặng lẽ cho qua. Mã thoát: 0 sạch,
1 có vi phạm, 2 lỗi cách dùng hoặc cấu hình.

## Phát hành

Mỗi gói phát hành riêng, bằng tag `<gói>-v<version>`: `brand-v*`, `app-switcher-v*`, `capacitor-system-auth-v*`.
Workflow `.github/workflows/publish.yml` chạy khi đẩy tag: kiểm tag khớp `version` của gói, chạy lint, typecheck,
build (so `dist`), test, rồi `pnpm publish` qua trusted publishing (OIDC, có provenance; không có token npm nào).

1. Sửa mã nguồn trong `packages/<gói>/src`, chạy `pnpm lint`, `pnpm typecheck`.
2. Biên dịch lại `dist`: `pnpm build`, rồi `pnpm test` (có test nạp `dist` qua `exports` của gói bằng `node`).
3. Tăng `version` trong `packages/<gói>/package.json` theo semver: sửa lỗi là patch, thêm tùy chọn hay trường tùy
   chọn là minor, đổi hay bỏ API, schema, hoặc làm đổi file sinh ra của một sản phẩm là major (khi còn `0.x` thì
   minor).
4. Commit **cả `src` lẫn `dist`** trong cùng một commit, đẩy `main`, chờ CI xanh.
5. Gắn tag và đẩy:

   ```sh
   git tag brand-v0.3.0
   git push origin brand-v0.3.0
   ```

6. Ở từng sản phẩm, nâng `@achoo254/<gói>` trong `package.json` (kèm `minimumReleaseAgeExclude` nếu chưa đủ 24 giờ),
   chạy `pnpm install`, `pnpm brand:gen` và các bước kiểm của sản phẩm. Gói Capacitor thì chạy lại `cap sync`.

Bản đã publish không unpublish: phát hành sai thì `npm deprecate` rồi publish bản patch qua CI.

## Quy tắc đồng bộ

- Mã thương hiệu chỉ sửa **ở đây**. Sản phẩm không chép lại hay vá tại chỗ phần mã của gói; nhu cầu riêng thì thêm
  thành tùy chọn ở đây, phát hành tag mới rồi nâng sản phẩm lên.
- Mọi thay đổi phải giữ nguyên từng byte file sinh ra của cả bốn sản phẩm, trừ khi thay đổi đó cố ý làm khác đi.
  Fixture ở `packages/brand/test/fixtures/<sản phẩm>/` là bản chép `brand.config.json` và các manifest trong
  `generated/` đã commit của từng repo. Logo sản phẩm **không** nằm ở đây: các đường dẫn icon chứa hình giữ chỗ
  trung tính (`fixtures/placeholder/`), `icons-source.json` là bản sinh từ hình giữ chỗ, còn PNG/ICO được so với
  sha256 ghi lại từ một lần vẽ thật bằng Chromium (`fixtures/placeholder/icons.sha256.json`). Mỗi sản phẩm tự chứng
  minh từng byte với logo thật trong repo của mình khi chuyển sang gói này. Khi một sản phẩm cố ý đổi file sinh ra, chép lại fixture của sản phẩm đó
  trong cùng commit.
- Các sản phẩm nên dùng cùng một version. Khi nâng version cho một sản phẩm, mở việc nâng cho ba sản phẩm còn lại.

## Giấy phép

Mã nguồn theo license MIT (xem `LICENSE`). Tên và logo của các sản phẩm (Chat, Scribe, Localman, Miu World,
Auth Next) không thuộc phạm vi license này.

## Phát triển

```sh
pnpm install
pnpm lint        # Biome
pnpm typecheck   # tsc cho toàn bộ gói, rồi riêng hai entry trình duyệt với lib DOM và không có kiểu Node
pnpm build       # tsc -> packages/*/dist (commit kết quả)
pnpm test        # Vitest, kể cả test nạp dist bằng node
```
