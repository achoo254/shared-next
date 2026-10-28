# shared-next

Các gói dùng chung của hệ sản phẩm *-next. Mã chung chỉ sửa ở đây rồi phát hành có version, để các sản phẩm không
chép lại hay vá tại chỗ cùng một đoạn mã. Danh sách gói thực tế là các thư mục trong [`packages/`](packages/), mỗi gói
có README riêng:

- [`@achoo254/brand`](packages/brand/README.md): một nguồn duy nhất cho thương hiệu của từng sản phẩm (schema
  `brand.config.json`, loader cho trình duyệt, sinh manifest và icon, chặn tên sản phẩm viết cứng).
- [`@achoo254/capacitor-system-auth`](packages/capacitor-system-auth/README.md): plugin Capacitor mở trang đăng nhập
  trong trình duyệt hệ thống, không bao giờ trong WebView.
- [`@achoo254/app-switcher`](packages/app-switcher/README.md): nút chuyển sang app khác cùng tài khoản.
- [`@achoo254/app-shell`](packages/app-shell/README.md): khung giao diện chung của trang chưa đăng nhập (header,
  thẻ đăng nhập, footer, nút đổi ngôn ngữ và giao diện), cookie lựa chọn dùng chung `hd_lang`/`hd_theme` và
  `tokens.css`.

## Quyết định

- **Scope `@achoo254`**: các gói từng tên `@shared-next/*`; scope `@shared-next` trên npm không thuộc về chúng ta nên
  đổi sang `@achoo254`.
- **Không phát hành lên npm** (chốt 27/10/2026): gói chỉ phục vụ các sản phẩm `*-next`, nên sản phẩm cài bằng phụ
  thuộc git từ tag của repo này (xem "Cách dùng trong một sản phẩm"). Không có registry nào phải vận hành hay chờ.
- **Desktop chỉ là PWA**: hệ sinh thái không có Tauri hay app desktop native, nên gói brand không sinh `tauri.json`
  và schema không có `appIds.desktop`.
- **Gói brand không phụ thuộc Playwright**: icon vẽ qua một renderer do sản phẩm truyền vào (Chromium mà sản phẩm đã
  cài). Entry cho trình duyệt không dùng `node:*` và không dùng Ajv (Ajv biên dịch bằng `new Function`, bị CSP chặn).
- Phần riêng của từng sản phẩm (tên cho server Go của chat, đường dẫn Bot API, danh sách file logo của miu...) nằm ở
  repo sản phẩm, không nằm trong gói.

## Cách dùng trong một sản phẩm

Khai báo phụ thuộc git trỏ vào một tag `v<x.y.z>` của repo này và thư mục gói, dạng
`"@achoo254/brand": "github:achoo254/shared-next#<tag>&path:/packages/brand"` (bên trái là tên gói trong
`packages/<gói>/package.json`). Tag đang dùng của từng sản phẩm ghi trong `package.json` của sản phẩm đó. Cách import,
entry và tùy chọn của từng gói ở README của gói. Gói giao JavaScript ESM đã biên dịch kèm `.d.ts` trong `dist/`; sản
phẩm không import từ `src/`. Yêu cầu Node theo `engines` của [`package.json`](package.json).

Với `@achoo254/brand`:

- `$schema` trong `brand.config.json` trỏ về `brand.config.schema.json` của gói đã cài; sản phẩm xóa bản schema chép
  tay của mình.
- Cách mỗi sản phẩm gọi `writeBrandFiles` (tùy chọn manifest, `indent`, renderer, trường bắt buộc) là
  [`packages/brand/test/consumers.ts`](packages/brand/test/consumers.ts); test so từng byte với file sinh ra đã commit
  của sản phẩm.
- Dòng `check:brand` thật của từng sản phẩm nằm trong `package.json` của sản phẩm đó; các luật và tùy chọn của
  `check-brand` ở [`packages/brand/src/check-brand.ts`](packages/brand/src/check-brand.ts).

## Quy tắc đồng bộ

- Mã thương hiệu chỉ sửa **ở đây**. Nhu cầu riêng của một sản phẩm thì thêm thành tùy chọn ở đây, phát hành bản mới
  rồi nâng sản phẩm lên.
- Mọi thay đổi phải giữ nguyên từng byte file sinh ra của mọi sản phẩm, trừ khi cố ý làm khác đi. Fixture ở
  [`packages/brand/test/fixtures/`](packages/brand/test/fixtures/) là bản chép `brand.config.json` và manifest đã
  commit của từng repo. Logo sản phẩm **không** nằm ở đây: fixture dùng hình giữ chỗ trung tính
  (`fixtures/placeholder/`), PNG/ICO so với sha256 ghi từ một lần vẽ thật bằng Chromium; mỗi sản phẩm tự chứng minh
  từng byte với logo thật trong repo của mình. Khi một sản phẩm cố ý đổi file sinh ra, chép lại fixture của sản phẩm
  đó trong cùng commit.
- Các sản phẩm nên dùng cùng một version. Khi nâng version cho một sản phẩm, mở việc nâng cho các sản phẩm còn lại.

## Phát hành

Một bản phát hành là một tag chung `v<x.y.z>` của repo, tăng so với tag `v*` mới nhất; lời tag ghi gói nào ở version
nào. Sản phẩm trỏ phụ thuộc git vào tag đó.

1. Sửa `packages/<gói>/src`, chạy `pnpm build` để biên dịch lại `dist`. CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))
   báo đỏ khi `dist` lệch `src`.
2. Tăng `version` trong `packages/<gói>/package.json` theo semver: sửa lỗi là patch; thêm tùy chọn hay trường tùy chọn
   là minor; đổi hay bỏ API, schema, hoặc làm đổi file sinh ra của một sản phẩm là major (khi còn `0.x` thì minor).
3. Commit **cả `src` lẫn `dist`** trong cùng một commit, đẩy `main`, chờ CI xanh, rồi gắn và đẩy tag `v<x.y.z>`.
4. Ở từng sản phẩm, đổi tag trong phụ thuộc git, chạy `pnpm install`, `pnpm brand:gen` và các bước kiểm của sản phẩm;
   gói Capacitor thì chạy lại `cap sync`.

Tag đã đẩy không sửa hay xoá: phát hành sai thì sửa và gắn tag mới.

## Phát triển

Lệnh `build`, `lint`, `typecheck`, `test` ở mục `scripts` của [`package.json`](package.json); CI chạy chúng theo thứ
tự trong [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Giấy phép

Mã nguồn theo license MIT ([`LICENSE`](LICENSE)). Tên và logo của các sản phẩm không thuộc phạm vi license này: logo và icon app (kể cả dấu app trong `packages/app-switcher/assets/marks/`) là AI-generated with OpenAI gpt-image for the hoandat ecosystem; owned by hoandat, all rights reserved (not CC0).
