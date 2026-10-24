# `@shared-next/app-shorts`

Dựng và đăng Shorts dọc (1080 × 1920, khoảng 21 giây) cho kênh YouTube **Hoandat Apps**
(`@hoandatapps`, kênh `UC5kF-54QdobLrtQ94tgVLmg`): mỗi app một video gồm logo và tagline, năm cảnh
ảnh chụp store (Tunelo dùng cảnh terminal) có tiêu đề tiếng Việt, và cảnh cuối có link. Gói riêng tư,
không publish, chỉ chạy trên máy dev.

## Cần có

- Node ≥ 22.18 (chạy thẳng file `.ts` bằng type stripping), `ffmpeg` trong `PATH`.
- Các repo nằm cạnh nhau: `chat-next`, `scribe-next`, `localman-next`, `miu-world-next` cùng thư mục cha
  với `shared-next` (khác thì đặt `HOANDAT_APPS_DIR`). Gói đọc ảnh store và icon của từng app, nhạc CC0
  Komiku của Miu World (`miu-world-next/assets/generated/music`), và mượn Chromium của Playwright mà
  miu-world-next đã cài; gói không tự cài trình duyệt.

## Lệnh

Chạy trong `packages/app-shorts`:

| Lệnh | Làm gì |
| --- | --- |
| `pnpm render [app]` | Dựng slide PNG vào `out/<app>/` (không commit) |
| `pnpm video [app]` | Ghép slide thành `out/<app>.mp4` (zoom chậm, chuyển cảnh mờ 0,5 s, nhạc) |
| `pnpm upload --app <app>` | Chạy khô: in ra sẽ đăng gì, không đọc token, không gọi mạng |
| `pnpm upload --app <app> --publish [--privacy private\|unlisted\|public]` | Đăng thật, ghi vào `posted.json` |
| `pnpm grant --client <file> --used-by <tên> --channel <UC…>` | Cấp quyền YouTube một lần cho một kênh |

`app` là `chat`, `scribe`, `localman` hoặc `tunelo`. Nội dung và lời mô tả nằm ở `src/apps.ts`; mọi câu
phải đối chiếu được với store listing hoặc README của app. Mô tả gắn
`utm_source=youtube&utm_medium=social&utm_campaign=app-short` và link danh mục `auth.hoandat.com/apps`.
`posted.json` ghi các video đã đăng; `upload` từ chối đăng lại app đã có trong đó trừ khi thêm `--again`.

## Credential

Token đọc lúc chạy từ `access-tokens.json` của người phụ trách (iCloud, thư mục `ENV production`), trỏ tới
bằng `MARKETING_TOKEN_FILE` hoặc `--token-file`, không bao giờ nằm trong repo và không bị in ra. Mỗi kênh
một mục `service: "youtube.googleapis.com"`:

| `used_by` | Kênh |
| --- | --- |
| `hoandat-apps marketing` | Hoandat Apps (gói này) |
| `miu-world marketing` | Miu World (`pnpm marketing:weekly` của miu-world-next, biến `MIU_MARKETING_TOKEN_FILE`) |

Cả hai dùng chung OAuth client loại Desktop app "YouTube Shorts uploader" của project Google Cloud
`miu-world` (đã bật YouTube Data API v3; màn hình đồng ý ở trạng thái In production nên refresh token không
hết hạn sau 7 ngày). Cấp lại quyền khi token bị thu hồi: tải JSON của client từ Cloud Console rồi chạy
`pnpm grant`. Script mở cổng tạm trên `127.0.0.1`, in địa chỉ trang đồng ý, buộc chọn lại tài khoản và kênh,
và chỉ lưu khi kênh được cấp đúng là `--channel`.

**Giới hạn của Google:** video tải lên qua API từ project chưa qua kiểm tra tuân thủ (API Compliance Audit)
bị khóa ở chế độ riêng tư dù gửi `public`. Muốn API đăng công khai thì nộp mẫu kiểm tra trong Cloud Console;
trước đó, video đăng qua API phải được đổi sang công khai trong YouTube Studio.
