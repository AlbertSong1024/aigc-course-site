@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================================
echo   AIGC应用与实践 · 课程教程站
echo ============================================================
echo.

rem ---- 找一个可用的 Python ----
set "PY="
where py >nul 2>nul && set "PY=py"
if not defined PY where python >nul 2>nul && set "PY=python"
if not defined PY if exist "C:\Users\Albert\.workbuddy-ai\binaries\python\versions\3.13.12\python.exe" set "PY=C:\Users\Albert\.workbuddy-ai\binaries\python\versions\3.13.12\python.exe"

if not defined PY (
  echo [错误] 没找到 Python。请安装 Python，或把 python.exe 路径填到本文件的 PY 变量。
  echo.
  pause
  exit /b 1
)

set "PORT=8806"

rem ---- 检查端口是否被占用 ----
netstat -ano | findstr "LISTENING" | findstr ":%PORT% " >nul 2>nul
if not errorlevel 1 (
  echo [提示] 端口 %PORT% 已被占用，可能服务已在运行。直接打开浏览器试试。
  echo.
  start http://127.0.0.1:%PORT%/
  echo 如果打不开，请先关掉占用该端口的程序，或改用：python tools\serve.py 8807
  echo.
  pause
  exit /b 0
)

echo 正在启动本地服务……
echo.
echo   首页：http://127.0.0.1:%PORT%/
echo.
echo 浏览器 2 秒后自动打开。关掉这个黑窗口 = 停止服务。
echo.

start "" /b cmd /c "timeout /t 2 >nul & start http://127.0.0.1:%PORT%/"

"%PY%" tools\serve.py %PORT%

echo.
echo 服务已停止。
pause
