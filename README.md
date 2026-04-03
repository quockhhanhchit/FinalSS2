### 1. Yêu cầu hệ thống trước khi bắt đầu
- **Node.js** (Để chạy môi trường Javascript)
- **MySQL** (Và các phần mềm quản lý như MySQL Workbench, XAMPP, DBeaver)
---
### 2. Thiết lập Cơ sở dữ liệu (Database) 
Nhóm đã nén sẵn cấu trúc bảng và dữ liệu mẫu vào file `budgetfit.sql` nằm trong thư mục `backend/database/`.
- **Bước 1:** Mở MySQL Workbench (hoặc tool tương tự).
- **Bước 2:** Chạy lệnh tạo một database mới: `CREATE DATABASE budgetfit_db;`
- **Bước 3:** Import (nạp) dữ liệu: Chọn **Server -> Data Import**. Chọn tuỳ chọn **"Import from Self-Contained File"** rồi trỏ vào file `budgetfit.sql`. Ở mục *Default Target Schema* chọn `budgetfit_db` và nhấn **Start Import** để hoàn thành.
---
### 3. Thiết lập và Chạy Backend (NodeJS)
*(Các thư viện chính (packages) đã được setup sẵn trong file package.json: express, mysql2, jsonwebtoken, bcryptjs, zod...)*
- **Bước 1:** Mở Terminal, trỏ đường dẫn vào thư mục backend:
  cd backend
- **Bước 2:** Cài đặt toàn bộ thư viện:
  npm install
- **Bước 3:** Kết nối Database: Bạn cần TỰ TẠO một file có tên là `.env` (file này bị git ẩn độ bảo mật) đặt ngang hàng trong thư mục `backend`. Dán nội dung sau vào file (Thay đổi Password cho khớp với MySQL dưới máy của bạn):
  PORT=5000
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=budgetfit_db
  DB_USER=root
  DB_PASSWORD=nhập_mật_khẩu_mysql_của_bạn_vào_đây
  JWT_SECRET=budgetfit_super_secret_key
  JWT_EXPIRES_IN=7d
- **Bước 4:** Khởi động máy chủ Backend:
  npm run dev
---
### 4. Thiết lập và Chạy Frontend (React/Vite)
*(Các thư viện chính (packages) đã được setup sẵn: react, react-dom, tailwindcss, @mui/material, recharts, radix-ui...)*
- **Bước 1:** Mở một cửa sổ Terminal MỚI, trỏ đường dẫn vào thư mục frontend:
  cd frontend
- **Bước 2:** Cài đặt toàn bộ thư viện UI:
  npm install
- **Bước 3:** Khởi động hệ thống giao diện:
  npm run dev
*(Lưu ý: Frontend của nhóm dùng Vite và đã cấu hình Proxy kết nối trực tiếp đến cổng 5000 của Backend, do đó **KHÔNG CẦN CHỈNH SỬA BẤT KỲ FILE .env NÀO Ở THƯ MỤC NÀY**). Website sẽ tự động khởi động tại địa chỉ: `http://localhost:5173`*
