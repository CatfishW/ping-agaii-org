# 快速测试指南 / Quick Test Guide

## 🚀 阶段二功能测试 / Phase 2 Feature Testing

### 前置条件 / Prerequisites

1. ✅ PostgreSQL 已安装并运行
2. ✅ 数据库 `ping_db` 已创建
3. ✅ Backend `.env` 已配置
4. ✅ 后端和前端服务都在运行

---

## 测试清单 / Test Checklist

### 1. ✅ 用户注册 / User Registration

**步骤**:
1. 访问 http://localhost:3000
2. 点击右上角 <User图标>
3. 点击 "Register" 标签
4. 填写:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
5. 点击 "Create Account"

**预期结果**:
- ✅ 弹窗关闭
- ✅ 右上角显示 "Test User"
- ✅ 可以看到下拉菜单

**验证数据库**:
```sql
SELECT email, username, role FROM users WHERE email = 'test@example.com';
```

---

### 2. ✅ 用户登录 / User Login

**步骤**:
1. 刷新页面（清除状态）
2. 点击右上角 <User图标>
3. 在 "Login" 标签下输入:
   - Email: `test@example.com`
   - Password: `password123`
4. 点击 "Sign In"

**预期结果**:
- ✅ 弹窗关闭
- ✅ 显示用户名
- ✅ localStorage 中有 token

**验证 Token**:
按 F12 → Console:
```javascript
localStorage.getItem('token')
```

---

### 3. ✅ Guest 模式 / Guest Mode

**步骤**:
1. 刷新页面或登出
2. 点击右上角 <User图标>
3. 点击 "Continue as Guest"

**预期结果**:
- ✅ 弹窗关闭
- ✅ 右上角显示 "Guest" 和黄色徽章
- ✅ localStorage 中有 guest_id

**验证数据库**:
```sql
SELECT id, guest_id, role FROM users WHERE role = 'guest' ORDER BY created_at DESC LIMIT 1;
```

---

### 4. ✅ 用户菜单 / User Menu

**步骤**:
1. 登录后，点击右上角用户名
2. 查看下拉菜单

**预期结果**:
- ✅ 显示邮箱
- ✅ 显示角色（student/guest）
- ✅ 有 "Sign Out" 按钮

---

### 5. ✅ 登出 / Logout

**步骤**:
1. 点击 "Sign Out"

**预期结果**:
- ✅ 下拉菜单关闭
- ✅ 右上角变回 <User图标>
- ✅ localStorage 中 token 被清除

**验证**:
```javascript
localStorage.getItem('token')  // 应该是 null
```

---

### 6. ✅ 密码验证 / Password Validation

**步骤**:
1. 尝试注册，密码输入 `123`（少于8个字符）
2. 点击 "Create Account"

**预期结果**:
- ✅ 显示错误信息："Password must be at least 8 characters"

---

### 7. ✅ 邮箱重复检查 / Duplicate Email Check

**步骤**:
1. 尝试用已存在的邮箱注册
2. Email: `test@example.com`

**预期结果**:
- ✅ 显示错误："Email already registered"

---

### 8. ✅ 错误密码 / Wrong Password

**步骤**:
1. 尝试登录，密码输入错误
2. Email: `test@example.com`
3. Password: `wrongpassword`

**预期结果**:
- ✅ 显示错误："Incorrect email or password"

---

### 9. ✅ 受保护的 API / Protected API

**使用 PowerShell 测试**:

**无 Token（应该失败）**:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me"
```
**预期结果**: 401 Unauthorized

**有 Token（应该成功）**:
```powershell
# 先登录获取 token
$loginBody = @{
    username = "test@example.com"
    password = "password123"
}

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $loginBody
$token = $response.access_token

# 使用 token 访问
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me" -Headers $headers
```
**预期结果**: 返回用户信息

---

### 10. ✅ Guest 同意提交 / Guest Consent Submission

**使用 PowerShell 测试**:

```powershell
# 创建 Guest
$guestBody = @{ session_id = "test_session" } | ConvertTo-Json
$guestResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/guest" -Method POST -ContentType "application/json" -Body $guestBody
$guestToken = $guestResponse.access_token

# 提交同意
$consentBody = @{
    terms_accepted = $true
    privacy_accepted = $true
    data_collection_accepted = $true
    cookie_accepted = $true
} | ConvertTo-Json

$headers = @{ Authorization = "Bearer $guestToken" }
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/consent" -Method POST -Headers $headers -ContentType "application/json" -Body $consentBody
```

**验证数据库**:
```sql
SELECT * FROM consent_records ORDER BY consented_at DESC LIMIT 1;
```

---

## 🔍 调试技巧 / Debugging Tips

### 查看后端日志
后端终端会显示所有 API 请求:
```
INFO:     127.0.0.1:xxxxx - "POST /api/auth/register HTTP/1.1" 200 OK
```

### 查看前端网络请求
1. 按 F12 打开开发者工具
2. 切换到 "Network" 标签
3. 进行操作（如登录）
4. 查看请求和响应

### 查看 React 状态
在 Console 中:
```javascript
// 查看 localStorage
localStorage

// 查看所有 keys
Object.keys(localStorage)

// 清除所有
localStorage.clear()
```

---

## 🐛 常见问题 / Common Issues

### 1. 数据库连接失败
**错误**: `could not connect to server`

**解决**:
- 检查 PostgreSQL 是否运行
- 检查 .env 中的 DATABASE_URL
- 确认数据库 ping_db 已创建

### 2. Token 验证失败
**错误**: `Could not validate credentials`

**解决**:
- 清除 localStorage
- 重新登录
- 检查 SECRET_KEY 是否一致

### 3. CORS 错误
**错误**: `CORS policy: No 'Access-Control-Allow-Origin'`

**解决**:
- 确认后端 CORS 配置包含前端 URL
- 重启后端服务器

### 4. 端口已被占用
**错误**: `Port 8000 is already in use`

**解决**:
```powershell
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# 或使用不同端口
uvicorn main:app --port 8001
```

---

## ✅ 完成检查 / Completion Checklist

- [ ] ✅ 用户可以注册
- [ ] ✅ 用户可以登录
- [ ] ✅ Guest 可以创建会话
- [ ] ✅ 密码验证正常
- [ ] ✅ 邮箱重复检查正常
- [ ] ✅ 错误提示显示正确
- [ ] ✅ 用户菜单显示正常
- [ ] ✅ 登出功能正常
- [ ] ✅ Token 存储和验证正常
- [ ] ✅ 数据库记录正确

---

## 📊 测试数据清理 / Test Data Cleanup

清理测试数据:
```sql
-- 删除测试用户
DELETE FROM users WHERE email = 'test@example.com';

-- 删除所有 Guest
DELETE FROM users WHERE role = 'guest';

-- 删除同意记录
DELETE FROM consent_records;

-- 重置自增ID（可选）
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE consent_records_id_seq RESTART WITH 1;
```

---

**所有测试通过 = 阶段二成功！** ✅  
**All tests pass = Phase 2 success!** ✅
