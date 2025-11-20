## Hệ thống quản lý hộ khẩu (HTML + Node.js + MySQL)

Ứng dụng gồm:

- Front-end thuần HTML/CSS/JS (`index.html`, `styles.css`, `script.js`) chạy như một SPA với nhiều view (trang chủ, đăng nhập, quản lý hộ khẩu/cư dân/đóng góp, tìm kiếm, cài đặt).
- Backend Node.js (Express) kết nối MySQL để lưu dữ liệu hộ khẩu, cư dân, đóng góp và cài đặt.

### 1. Chuẩn bị cơ sở dữ liệu MySQL

1. Mở MySQL client và chạy file `schema.sql`:

   ```sql
   SOURCE /path/to/schema.sql;
   ```

   File tạo database `household_portal` cùng 4 bảng: `households`, `residents`, `contributions`, `settings`.

2. Cập nhật tài khoản MySQL nếu không dùng `root`.

### 2. Cấu hình backend

1. Sao chép file `.env.example` (nếu không tự tạo được, thêm file `.env` theo nội dung bên dưới) và cập nhật giá trị:

   ```
   PORT=4000
   CLIENT_ORIGIN=http://localhost:5500

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_db_password
   DB_NAME=household_portal

   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=123456
   ```

   `CLIENT_ORIGIN` có thể đặt thành `*` khi mở trực tiếp file HTML từ file system.

2. Cài đặt dependencies và chạy server:

   ```bash
   npm install
   npm run dev # hoặc npm start
   ```

   API sẽ chạy tại `http://localhost:4000`.

### 3. Chạy front-end

Mở `index.html` bằng trình duyệt hoặc dùng một static server (VD: `npx serve .`). Front-end sẽ gọi API qua `http://localhost:4000/api`.

### 4. Thông tin API mock đăng nhập

Mặc định trong `.env`: `admin / 123456`. Backend sinh token tạm và lưu trong bộ nhớ.

### 5. Cấu trúc thư mục chính

```
.
├── index.html          # SPA cho 6 view
├── styles.css          # Layout sidebar, card, bảng, responsive
├── script.js           # Logic navigation, fetch API, CRUD
├── schema.sql          # Lệnh tạo DB MySQL
├── package.json        # Cấu hình Node backend
└── server
    ├── index.js        # Khởi tạo Express app và router
    ├── db.js           # MySQL pool
    ├── utils/asyncHandler.js
    └── routes/
        ├── auth.js
        ├── households.js
        ├── residents.js
        ├── contributions.js
        ├── search.js
        └── settings.js
```

### 6. Các bước thao tác chính trên front

1. Đăng nhập bằng tài khoản mock để bật các view quản trị (sidebar sẽ hiển thị nút Đăng xuất, badge tên tài khoản).
2. Truy cập từng view để thêm/sửa/xóa, dữ liệu được đồng bộ qua API.
3. Trang Tìm kiếm kết hợp truy vấn theo từ khóa / phạm vi.
4. Trang Cài đặt cập nhật thông tin tổ chức.

### 7. Ghi chú

- Vì token lưu trong bộ nhớ, khi restart server các phiên đăng nhập phải thực hiện lại.
- Nếu muốn chạy front-end qua origin khác, cập nhật biến `CLIENT_ORIGIN`.



