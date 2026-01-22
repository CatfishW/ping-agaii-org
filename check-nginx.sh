#!/bin/bash
# React Router 404 问题排查和修复脚本

echo "========================================"
echo "React Router 404 问题诊断"
echo "========================================"

# 1. 检查 Nginx 配置
echo ""
echo "1. 检查 Nginx 配置中的 try_files 设置..."
grep -A 2 "location /" /etc/nginx/sites-available/ping.agaii.org 2>/dev/null || \
grep -A 2 "location /" /www/server/panel/vhost/nginx/*.conf 2>/dev/null

# 2. 检查 build 目录
echo ""
echo "2. 检查前端 build 目录..."
ls -lh /www/wwwroot/ping-frontend/build/index.html 2>/dev/null || echo "❌ index.html 未找到"

# 3. 测试 Nginx 配置
echo ""
echo "3. 测试 Nginx 配置语法..."
nginx -t

# 4. 检查实际文件服务
echo ""
echo "4. 检查根目录设置..."
grep "root" /www/server/panel/vhost/nginx/*.conf 2>/dev/null | grep ping

# 5. 修复建议
echo ""
echo "========================================"
echo "修复步骤："
echo "========================================"
echo "如果直接访问 /game/xxx 返回 404，请确保："
echo ""
echo "1️⃣  Nginx 配置包含："
echo "   location / {"
echo "       try_files \$uri \$uri/ /index.html;"
echo "   }"
echo ""
echo "2️⃣  检查是否有其他 location 规则覆盖了 /game："
echo "   如果有 'location /game { ... }'，请删除或改为 alias"
echo ""
echo "3️⃣  重新加载 Nginx："
echo "   sudo nginx -s reload"
echo ""
echo "4️⃣  清除浏览器缓存后重试"
echo ""
echo "5️⃣  查看 Nginx 错误日志："
echo "   tail -f /www/wwwroot/ping-frontend/logs/error.log"
