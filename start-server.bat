@echo off
echo Đang kiểm tra và dừng process cũ trên port 4000...

REM Dừng process Node.js trên port 4000 (PowerShell command)
powershell -Command "Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"

timeout /t 1 /nobreak >nul

echo.
echo Đang khởi động server...
echo Server sẽ chạy tại: http://localhost:4000
echo Nhấn Ctrl+C để dừng server
echo.

node server/index.js

pause


