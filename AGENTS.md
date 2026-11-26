# AGENTS.md

`shared-next`: các gói dùng chung của hệ sản phẩm `*-next`. Mã chung chỉ sửa ở đây, không chép hay vá tại chỗ trong từng sản phẩm. Đọc `README.md` và README của gói trong `packages/` trước khi làm.

## Gate trước khi báo xong

`pnpm lint` (Biome) → `pnpm typecheck` → `pnpm test`. Chỉ dùng `pnpm`, không dùng npm.

## Phát hành, không deploy

Repo này không có server và không phát hành lên npm (chốt 27/10/2026). Sản phẩm cài gói bằng phụ thuộc git trỏ vào tag `v<x.y.z>` của repo này. Sửa gói thì push `main`, kiểm `ci`, tạo tag mới theo README, rồi nâng tag ở sản phẩm dùng nó; không đổi tag đã phát hành. Deploy sản phẩm sau đó theo `../docs/deploy-standard.md`.

## Repo công khai

Không commit IP, cổng SSH, user máy chủ, secret hay file env.
