# BudgetFit

BudgetFit là ứng dụng web hỗ trợ người dùng quản lý mục tiêu sức khỏe và ngân sách cá nhân trong cùng một hệ thống. Ứng dụng cho phép đăng ký, đăng nhập, khai báo hồ sơ cá nhân, tạo kế hoạch 30 ngày, theo dõi cân nặng, ghi nhận chi tiêu và xem dashboard tổng quan để đánh giá tiến độ.

## Mục tiêu dự án

- Hỗ trợ người dùng theo dõi hành trình tăng cân, giảm cân hoặc duy trì cân nặng.
- Kết hợp quản lý sức khỏe với quản lý chi tiêu thay vì tách rời thành nhiều ứng dụng.
- Tạo kế hoạch ăn uống, vận động và phân bổ ngân sách theo hồ sơ cá nhân.
- Cung cấp dashboard trực quan để người dùng theo dõi tiến độ thực hiện.

## Tính năng chính

- Đăng ký, đăng nhập, đăng xuất bằng email/password.
- Đăng nhập bằng Google.
- Xác thực bằng JWT access token và refresh token.
- Onboarding hồ sơ cá nhân: tuổi, chiều cao, cân nặng, mục tiêu, thời lượng, ngân sách, địa điểm tập, số bữa ăn mỗi ngày.
- Sinh kế hoạch 30 ngày dựa trên hồ sơ người dùng.
- Xem kế hoạch hiện tại và chi tiết từng ngày.
- Theo dõi cân nặng theo thời gian.
- Theo dõi chi tiêu theo danh mục.
- Xem dashboard tổng hợp tiến độ sức khỏe và ngân sách.
- Xem phân bổ ngân sách hiện tại.

## Kiến trúc hệ thống

Project được tổ chức theo kiểu backend REST API và frontend SPA:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT + Google Sign-In

Backend không phải MVC thuần mà đang theo mô hình:

`Route -> Controller -> Service -> Database`

Trong đó:

- `routes` định nghĩa API endpoint
- `controllers` xử lý request/response
- `services` chứa business logic và truy vấn MySQL
- `config/db.js` quản lý kết nối database

## Công nghệ sử dụng

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Radix UI
- Recharts
- Lucide React

### Backend

- Express
- mysql2
- jsonwebtoken
- bcryptjs
- zod
- swagger-jsdoc
- swagger-ui-express

### Database

- MySQL
- File schema và dữ liệu mẫu: [backend/database/budgetfit.sql](/d:/FinalSS2/backend/database/budgetfit.sql)

## Chức năng theo module

### Authentication

- Đăng ký tài khoản
- Đăng nhập bằng email/password
- Đăng nhập bằng Google
- Refresh access token
- Lấy thông tin người dùng hiện tại
- Đăng xuất

### Profile

- Lưu hồ sơ cá nhân sau onboarding
- Xem lại hồ sơ cá nhân

### Plan

- Sinh kế hoạch cá nhân theo hồ sơ
- Xem kế hoạch hiện tại
- Xem chi tiết từng ngày của kế hoạch

### Tracking

- Ghi log cân nặng
- Xem lịch sử cân nặng
- Ghi log chi tiêu
- Xem lịch sử chi tiêu

### Dashboard

- Tổng hợp cân nặng hiện tại
- Tính tiến độ mục tiêu
- Tổng hợp ngân sách và chi tiêu
- Thống kê số ngày hoàn thành trong plan

### Budget

- Xem breakdown ngân sách hiện tại của plan

## Cấu trúc thư mục

```text
FinalSS2/
|-- backend/
|   |-- database/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- app.js
|   |   `-- server.js
|   `-- tests/
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |   |-- components/
|   |   |   |-- lib/
|   |   |   `-- screens/
|   |   `-- styles/
|   `-- index.html
`-- README.md
```

## Cơ sở dữ liệu

Database chính của project là `budgetfit_db`.

Một số bảng quan trọng:

- `users`
- `user_profiles`
- `plans`
- `plan_days`
- `meals`
- `workouts`
- `weight_logs`
- `expense_logs`
- `budget_breakdowns`

Các migration đang có:

- [backend/database/001_add_refresh_token_hash.sql](/d:/FinalSS2/backend/database/001_add_refresh_token_hash.sql)
- [backend/database/002_add_google_auth_columns.sql](/d:/FinalSS2/backend/database/002_add_google_auth_columns.sql)

## API chính

Một số endpoint tiêu biểu:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/profile`
- `GET /api/profile`
- `POST /api/plans/generate`
- `GET /api/plans/current`
- `GET /api/plans/current/day/:dayNumber`
- `GET /api/tracking/weights`
- `POST /api/tracking/weights`
- `GET /api/tracking/expenses`
- `POST /api/tracking/expenses`
- `GET /api/dashboard/summary`
- `GET /api/budget/current`

Swagger docs được mount tại:

- `http://localhost:5000/api-docs`

## Yêu cầu hệ thống

- Node.js
- npm
- MySQL
- Công cụ quản lý MySQL như MySQL Workbench, DBeaver hoặc XAMPP

## Hướng dẫn chạy project

### 1. Clone source code

```bash
git clone https://github.com/quockhhanhchit/FinalSS2.git
cd FinalSS2
```

### 2. Tạo database và import dữ liệu mẫu

Mở MySQL Workbench hoặc MySQL CLI, sau đó tạo database:

```sql
CREATE DATABASE budgetfit_db;
```

Import file:

- [backend/database/budgetfit.sql](/d:/FinalSS2/backend/database/budgetfit.sql)

Sau đó chạy thêm các migration:

- [backend/database/001_add_refresh_token_hash.sql](/d:/FinalSS2/backend/database/001_add_refresh_token_hash.sql)
- [backend/database/002_add_google_auth_columns.sql](/d:/FinalSS2/backend/database/002_add_google_auth_columns.sql)
- [backend/database/003_create_daily_task_completions.sql](/d:/FinalSS2/backend/database/003_create_daily_task_completions.sql)

### 3. Cấu hình backend

Di chuyển vào thư mục backend:

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=budgetfit_db
DB_USER=root
DB_PASSWORD='your_mysql_password'
JWT_SECRET=budgetfit_super_secret_key
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
```

Chạy backend:

```bash
npm run dev
```

### 4. Cấu hình frontend

Mở terminal mới:

```bash
cd frontend
npm install
```

Tạo file `.env` trong thư mục `frontend`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Chạy frontend:

```bash
npm run dev
```

Frontend mặc định chạy tại:

- `http://localhost:5173`

## Google Sign-In

Để dùng Google Sign-In, cần cấu hình OAuth client trên Google Cloud Console:

- Tạo OAuth Client loại `Web application`
- Thêm `http://localhost:5173` vào `Authorized JavaScript origins`
- Dùng cùng một `client id` cho:
  - `backend/.env` -> `GOOGLE_CLIENT_ID`
  - `frontend/.env` -> `VITE_GOOGLE_CLIENT_ID`

## Kiểm thử

Chạy test backend:

```bash
cd backend
npm test
```

## Định hướng phát triển

- Tách tầng truy vấn dữ liệu sang repository hoặc ORM
- Bổ sung phân quyền admin/user
- Hoàn thiện reward và notification flow
- Thêm cập nhật trạng thái hoàn thành task trong plan
- Cải thiện test coverage cho frontend và backend

## Nhóm phát triển

Project được phát triển cho mục đích học tập và thực hành xây dựng hệ thống full-stack với React, Express và MySQL.
