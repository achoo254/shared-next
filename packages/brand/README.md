# @achoo254/brand

Gói thương hiệu dùng chung của các sản phẩm *-next: schema `brand.config.schema.json`, `defineBrand` cho trình
duyệt, `./hosts`, `./build` (kiểm schema, sinh manifest web/Capacitor, vẽ icon qua renderer được truyền vào) và
`./check-brand` (chặn tên sản phẩm viết cứng). Gói giao JavaScript đã biên dịch trong `dist/`; mã nguồn TypeScript ở `src/`.

Cài: `npm install @achoo254/brand`. Người dùng pnpm 11: bản vừa phát hành dưới 24 giờ bị chặn
(`minimumReleaseAge`); muốn cài ngay thì thêm đúng version vào `minimumReleaseAgeExclude` của `pnpm-workspace.yaml`.

Cách khai báo phụ thuộc, tùy chọn của từng sản phẩm, cách phát hành và quy tắc đồng bộ: xem
[README của repo](../../README.md).
