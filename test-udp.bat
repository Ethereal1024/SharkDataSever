@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════
echo 📹 UDP 视频流测试客户端
echo ═══════════════════════════════════════════════════════
echo.

echo 📡 正在监听 UDP 视频流...
echo.
node test-udp-client.js

pause
