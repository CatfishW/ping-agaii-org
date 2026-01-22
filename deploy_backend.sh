#!/bin/bash
# Backend 部署脚本

cd /www/wwwroot/pingbackend

# 激活虚拟环境
source b85815d04cec053ce6deb8021f2df1b8_venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 检查 PostgreSQL 配置
echo "检查数据库配置..."
cat .env 2>/dev/null || echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/ping_db" > .env

# 启动应用
echo "启动 FastAPI 应用..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
