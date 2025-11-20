@echo off
echo ========================================
echo   HỆ THỐNG QUẢN LÝ HỘ KHẨU
echo ========================================
echo.

REM Dừng process cũ trên port 4000
echo [1/3] Đang dừng process cũ trên port 4000...
powershell -Command "Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
timeout /t 1 /nobreak >nul

REM Khởi động backend server
echo [2/3] Đang khởi động backend server...
start "Backend Server" cmd /k "node server/index.js"

REM Đợi server khởi động
timeout /t 3 /nobreak >nul

REM Khởi động frontend server
echo [3/3] Đang khởi động frontend server...
start "Frontend Server" cmd /k "npx serve . -p 5500"

echo.
echo ========================================
echo   ĐÃ KHỞI ĐỘNG THÀNH CÔNG!
echo ========================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5500
echo.
echo Mở trình duyệt và truy cập: http://localhost:5500
echo.
echo Đăng nhập với:
echo   Username: admin
echo   Password: 123456
echo.
echo Nhấn phím bất kỳ để đóng cửa sổ này...
pause >nul


