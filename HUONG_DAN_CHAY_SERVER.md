# Hướng dẫn chạy chương trình

## CÁCH NHANH NHẤT (Khuyến nghị)

### Bước 1: Khởi động Backend Server
**Double-click vào file `start-server.bat`** trong thư mục `C:\PJ1`

Hoặc mở Command Prompt/PowerShell và chạy:
```bash
cd C:\PJ1
start-server.bat
```

### Bước 2: Mở Frontend
**Double-click vào file `index.html`** trong thư mục `C:\PJ1`

### Bước 3: Đăng nhập
- Username: `admin`
- Password: `123456`

---

## CÁCH CHI TIẾT

### Bước 1: Khởi động Backend Server

#### Cách A: Dùng script helper (Tự động dừng process cũ)
- **PowerShell**: Double-click `start-server.ps1` hoặc chạy `.\start-server.ps1`
- **Command Prompt**: Double-click `start-server.bat`

#### Cách B: Chạy thủ công
Mở Terminal (PowerShell hoặc Command Prompt):
```bash
cd C:\PJ1
node server/index.js
```

#### Cách C: Dùng npm
```bash
cd C:\PJ1
npm run dev
```
Hoặc:
```bash
npm start
```

## Kết quả mong đợi
Bạn sẽ thấy dòng:
```
Server đang chạy tại http://localhost:4000
```

## Lưu ý
- **Giữ terminal mở** để server tiếp tục chạy
- Để **dừng server**, nhấn `Ctrl + C` trong terminal
- Nếu thấy lỗi, kiểm tra:
  - MySQL đã chạy chưa?
  - File `.env` đã cấu hình đúng chưa?
  - Database `household_portal` đã được tạo chưa?

### Bước 2: Mở Frontend

#### Cách A: Mở trực tiếp file HTML (Khuyến nghị)
- Vào thư mục `C:\PJ1`
- **Double-click vào file `index.html`**
- Trang web sẽ mở trong trình duyệt

#### Cách B: Dùng static server (Tùy chọn)
Mở terminal mới (giữ terminal server đang chạy):
```bash
cd C:\PJ1
npx serve . -p 5500
```
Sau đó mở trình duyệt và truy cập: `http://localhost:5500`

### Bước 3: Đăng nhập
- Username: `admin`
- Password: `123456`

Sau khi đăng nhập, bạn sẽ thấy sidebar với các menu:
- Trang chủ
- Hộ khẩu
- Cư dân
- Đóng góp
- Tìm kiếm
- Cài đặt

---

## TÓM TẮT NHANH

1. **Double-click `start-server.bat`** → Giữ terminal mở
2. **Double-click `index.html`** → Mở trình duyệt
3. **Đăng nhập**: `admin` / `123456`

---

## XỬ LÝ LỖI

### Lỗi "EADDRINUSE: address already in use"
Port 4000 đang được sử dụng. Dùng script `start-server.bat` hoặc `start-server.ps1` để tự động dừng process cũ.

### Lỗi "Failed to fetch"
- Kiểm tra backend server đã chạy chưa (phải thấy dòng "Server đang chạy tại http://localhost:4000")
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra file `.env` đã cấu hình đúng chưa

### Lỗi kết nối MySQL
- Kiểm tra MySQL service đang chạy
- Kiểm tra mật khẩu trong file `.env` đúng chưa
- Kiểm tra database `household_portal` đã được tạo chưa (chạy file `schema.sql`)

