# BudgetFit

BudgetFit la ung dung web ho tro nguoi dung quan ly suc khoe va ngan sach ca nhan trong cung mot he thong. Du an gom:

- `frontend`: React + Vite
- `backend`: Node.js + Express
- `database`: MySQL

README nay duoc viet lai theo huong dan cho nguoi moi clone code tu GitHub ve va muon chay du an tu dau den cuoi.

## 1. Yeu cau truoc khi chay

Can cai san:

- Node.js 18+ de tranh loi dependency
- npm
- MySQL 8.x
- Mot cong cu quan ly MySQL nhu MySQL Workbench, DBeaver hoac phpMyAdmin
- Git

Kiem tra nhanh:

```bash
node -v
npm -v
mysql --version
git --version
```

## 2. Clone source code

```bash
git clone https://github.com/quockhhanhchit/FinalSS2.git
cd FinalSS2
```

Neu ban da tai source code dang `.zip` thi chi can giai nen va mo terminal tai thu muc goc cua project.

## 3. Cau truc project

```text
FinalSS2/
|-- backend/
|   |-- database/
|   |-- src/
|   |-- tests/
|   |-- package.json
|   `-- .env.example
|-- frontend/
|   |-- src/
|   `-- package.json
|-- meal_library_import.csv
|-- workout_library_import.csv
`-- README.md
```

## 4. Setup database

Day la buoc quan trong nhat. Project nay khong chi can tao bang ma con can nap them du lieu thu vien mon an va bai tap.

### 4.1. Tao database

Mo MySQL Workbench hoac MySQL CLI va chay:

```sql
CREATE DATABASE budgetfit_db;
```

### 4.2. Import file SQL all-in-one

File import chinh:

- [backend/database/budgetfit_all_in_one.sql](/d:/SPRING2026/SS2/project/backend/database/budgetfit_all_in_one.sql)

File nay da gom:

- schema goc
- du lieu mau co san trong dump
- cac migration SQL de tao day du bang, cot va rang buoc moi nhat

Ban chi can mo file nay trong MySQL Workbench roi nhan `Execute` mot lan.

### 4.3. Import them du lieu meal library va workout library

Luu y: file SQL all-in-one hien tai tao bang `meal_library` va `workout_library` nhung chua tu dong do du lieu CSV vao hai bang nay.

Neu bo qua buoc nay, app van len duoc nhung mot so chuc nang sinh plan se thieu du lieu.

Sau khi import SQL xong, chay script import CSV:

```bash
cd backend
npm install
node database/import_csv.js
```

Script nay se doc du lieu tu:

- `../meal_library_import.csv`
- `../workout_library_import.csv`

Neu import thanh cong, ban se thay log thong bao so luong du lieu da duoc nap vao database.

## 5. Cau hinh backend

Di chuyen vao thu muc backend:

```bash
cd backend
```

### 5.1. Cai dependency backend

```bash
npm install
```

### 5.2. Tao file `.env`

Ban co the copy tu file mau:

```bash
copy .env.example .env
```

Neu dung PowerShell:

```powershell
Copy-Item .env.example .env
```

Sau do sua file `backend/.env`.

Gia tri toi thieu de chay local:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=budgetfit_db
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=budgetfit_super_secret_key
JWT_EXPIRES_IN=7d

APP_URL=http://localhost:5173
```

### 5.3. Bien moi truong tuy chon

Neu muon dung them cac tinh nang sau, can cau hinh them:

- Dang nhap Google:

```env
GOOGLE_CLIENT_ID=your_google_client_id
```

- Quen mat khau qua email:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=BudgetFit <your_email@gmail.com>
```

- AI assistant / weekly summary:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

Neu khong cau hinh cac bien tuy chon tren:

- app van co the chay co ban
- Google login se khong hoat dong
- quen mat khau qua email se khong gui mail duoc
- AI assistant se bi vo hieu hoa

### 5.4. Chay backend

```bash
npm run dev
```

Neu thanh cong, backend se chay tai:

- `http://localhost:5000`

Swagger docs:

- `http://localhost:5000/api-docs`

## 6. Cau hinh frontend

Mo terminal moi, quay lai thu muc goc project roi vao `frontend`:

```bash
cd frontend
```

### 6.1. Cai dependency frontend

```bash
npm install
```

### 6.2. Tao file `.env`

Tao file `frontend/.env` voi noi dung toi thieu:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Giai thich:

- `VITE_API_URL`: URL cua backend local
- `VITE_GOOGLE_CLIENT_ID`: chi can neu muon bat dang nhap Google

Neu ban khong dung Google login, co the bo dong nay hoac de rong:

```env
VITE_API_URL=http://localhost:5000
```

### 6.3. Chay frontend

```bash
npm run dev
```

Frontend thuong se chay tai:

- `http://localhost:5173`

## 7. Thu tu chay du an de tranh loi

Day la thu tu nen lam:

1. Clone repo
2. Tao database `budgetfit_db`
3. Import `backend/database/budgetfit_all_in_one.sql`
4. Chay `node backend/database/import_csv.js` sau khi da `npm install` trong `backend`
5. Tao `backend/.env`
6. Chay backend bang `npm run dev`
7. Tao `frontend/.env`
8. Chay frontend bang `npm run dev`
9. Mo `http://localhost:5173`

## 8. Cac URL quan trong

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Swagger docs: `http://localhost:5000/api-docs`

## 9. Neu muon dung Google Login

Can cau hinh tren Google Cloud Console:

- `Authorized JavaScript origins`:
  - `http://localhost:5173`
- `Authorized redirect URIs`:
  - Neu ban co cau hinh redirect rieng thi them theo setup cua ban

Sau do dat cung mot `GOOGLE_CLIENT_ID` cho:

- `backend/.env`
- `frontend/.env`

Neu hai ben khong giong nhau, dang nhap Google se that bai.

## 10. Cac loi thuong gap

### Loi ket noi MySQL

Kiem tra lai:

- MySQL da bat chua
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` co dung khong
- database `budgetfit_db` da duoc tao va import chua

### Loi backend chay duoc nhung sinh plan loi

Nguyen nhan thuong la chua import CSV cho:

- `meal_library`
- `workout_library`

Can chay lai:

```bash
cd backend
node database/import_csv.js
```

### Loi frontend khong goi duoc API

Kiem tra:

- backend co dang chay tai `http://localhost:5000` khong
- `frontend/.env` co `VITE_API_URL=http://localhost:5000` khong
- co mo nham frontend truoc khi backend san sang khong

### Loi Google login khong hien nut hoac khong dang nhap duoc

Kiem tra:

- `VITE_GOOGLE_CLIENT_ID` da khai bao chua
- `GOOGLE_CLIENT_ID` ben backend da khai bao chua
- origin `http://localhost:5173` da them trong Google Cloud Console chua

## 11. Lenh hay dung

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Import CSV:

```bash
cd backend
node database/import_csv.js
```

## 12. Ghi chu

- File SQL all-in-one da co san de import nhanh:
  - [backend/database/budgetfit_all_in_one.sql](/d:/SPRING2026/SS2/project/backend/database/budgetfit_all_in_one.sql)
- File schema goc:
  - [backend/database/budgetfit.sql](/d:/SPRING2026/SS2/project/backend/database/budgetfit.sql)
- File migration phan bo sung sau dump:
  - [backend/database/post_dump_migrations.sql](/d:/SPRING2026/SS2/project/backend/database/post_dump_migrations.sql)

