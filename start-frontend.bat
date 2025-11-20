@echo off
echo Đang khởi động static server cho frontend...
echo.
echo Frontend sẽ chạy tại: http://localhost:5500
echo Nhấn Ctrl+C để dừng server
echo.

npx serve . -p 5500

pause


