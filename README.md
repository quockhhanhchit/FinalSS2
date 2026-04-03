# BudgetFit

BudgetFit là web app hỗ trợ người dùng quản lý mục tiêu cân nặng theo ngân sách:
- đăng ký / đăng nhập
- nhập thông tin cá nhân và ngân sách
- tạo kế hoạch 30 ngày
- theo dõi cân nặng và chi tiêu
- xem dashboard tổng quan

## 1. Yêu cầu cài trước

Máy cần có:
- `Node.js` 18+ và `npm`
- `MySQL` 8+ hoặc tương đương
- `Git`

Kiểm tra nhanh:

```bash
node -v
npm -v
mysql --version
git --version
```

## 2. Clone project

```bash
git clone <LINK_GITHUB_CUA_BAN>
cd project
```

## 3. Cài package

Project chia 2 phần: `backend` và `frontend`.

### Cài package cho backend

```bash
cd backend
npm install
```

### Cài package cho frontend

```bash
cd ../frontend
npm install
```

### Nếu dùng Windows PowerShell bị chặn `npm.ps1`

Dùng:

```bash
npm.cmd install
```

Thay vì:

```bash
npm install
```

## 4. Cấu hình database MySQL

Tạo database:

```sql
CREATE DATABASE budgetfit_db;
```

Sau đó import schema database của project vào `budgetfit_db`.

Lưu ý:
- Repo hiện có file migration thêm cột refresh token:
  [backend/database/001_add_refresh_token_hash.sql](d:/SPRING2026/SS2/project/backend/database/001_add_refresh_token_hash.sql)
- Nếu database của bạn đã có sẵn bảng `users`, hãy chạy thêm:

```sql
ALTER TABLE users
ADD COLUMN refresh_token_hash TEXT NULL;
```

Hoặc chạy file:

```bash
mysql -u root -p budgetfit_db < backend/database/001_add_refresh_token_hash.sql
```

## 5. Cấu hình biến môi trường backend

Tạo file `backend/.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=budgetfit_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=budgetfit_super_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Nếu chưa dùng refresh config riêng, backend vẫn có thể fallback từ `JWT_SECRET`.

## 6. Chạy project

Mở 2 terminal riêng.

### Terminal 1: chạy backend

```bash
cd backend
npm run dev
```

Nếu PowerShell lỗi:

```bash
cd backend
npm.cmd run dev
```

Backend chạy tại:

```text
http://localhost:5000
```

Swagger API docs:

```text
http://localhost:5000/api-docs
```

### Terminal 2: chạy frontend

```bash
cd frontend
npm run dev
```

Nếu PowerShell lỗi:

```bash
cd frontend
npm.cmd run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

## 7. Các lệnh hữu ích

### Build frontend

```bash
cd frontend
npm run build
```

### Chạy backend test

```bash
cd backend
npm test
```

### Chạy Playwright E2E

Cài browser cho Playwright lần đầu:

```bash
cd frontend
npx playwright install
```

Sau đó chạy test:

```bash
npm run test:e2e
```

## 8. Các package chính đang dùng

### Backend

Được cài tự động khi chạy `npm install` trong `backend`:
- `express`
- `mysql2`
- `dotenv`
- `cors`
- `bcryptjs`
- `jsonwebtoken`
- `zod`
- `swagger-ui-express`
- `swagger-jsdoc`
- `nodemon`
- `jest`
- `supertest`

### Frontend

Được cài tự động khi chạy `npm install` trong `frontend`:
- `react`
- `react-dom`
- `react-router`
- `vite`
- `tailwindcss`
- `zod`
- `recharts`
- `lucide-react`
- `@playwright/test`

## 9. Nếu clone từ GitHub về mà chạy lỗi

### Lỗi `Unknown column 'refresh_token_hash'`

Database của bạn chưa migrate.

Chạy:

```sql
ALTER TABLE users
ADD COLUMN refresh_token_hash TEXT NULL;
```

### Lỗi `npm.ps1 cannot be loaded`

Dùng `npm.cmd` thay cho `npm`.

### Lỗi kết nối MySQL

Kiểm tra lại:
- MySQL đã bật chưa
- thông tin trong `backend/.env`
- database `budgetfit_db` đã tồn tại chưa
- các bảng đã được import chưa

## 10. Ghi chú

- Đây là project tách riêng `frontend` và `backend`.
- Frontend gọi API qua backend port `5000`.
- Nếu database schema chưa đầy đủ thì app sẽ không chạy hoàn chỉnh.

