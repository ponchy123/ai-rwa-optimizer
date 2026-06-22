#!/bin/bash
echo "========================================"
echo "AI-RWA Portfolio Optimizer"
echo "========================================"
echo ""

echo "[1/3] 启动AI后端..."
cd ai-backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

echo "[2/3] 等待AI后端启动..."
sleep 3

echo "[3/3] 启动前端..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "服务已启动！"
echo "========================================"
echo "AI后端: http://localhost:8000"
echo "Swagger文档: http://localhost:8000/docs"
echo "前端: http://localhost:3000"
echo "========================================"

# 等待进程
wait $BACKEND_PID $FRONTEND_PID