# Script khởi động server - tự động dừng process cũ nếu có

Write-Host "Đang kiểm tra port 4000..." -ForegroundColor Yellow

# Dừng các process Node.js đang chạy trên port 4000
$processes = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($processes) {
    Write-Host "Đang dừng process cũ trên port 4000..." -ForegroundColor Yellow
    $processes | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        Write-Host "  - Đã dừng process ID: $_" -ForegroundColor Green
    }
    Start-Sleep -Seconds 1
}

Write-Host "`nĐang khởi động server..." -ForegroundColor Cyan
Write-Host "Server sẽ chạy tại: http://localhost:4000" -ForegroundColor Green
Write-Host "Nhấn Ctrl+C để dừng server`n" -ForegroundColor Yellow

# Chạy server
node server/index.js


