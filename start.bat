@echo off
echo ========================================
echo AI-RWA Portfolio Optimizer
echo ========================================
echo.

echo [1/3] 启动AI后端...
start "AI Backend" cmd /k "cd ai-backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] 等待AI后端启动...
timeout /t 3 /nobreak > nul

echo [3/3] 启动前端...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo 服务已启动！
echo ========================================
echo AI后端: http://localhost:8000
echo Swagger文档: http://localhost:8000/docs
echo 前端: http://localhost:3000
echo ========================================
pause