# PING 平台开发进度

## ✅ 阶段一：基础架构（已完成 - 2026-01-20）

1. ✅ React 前端结构搭建
2. ✅ FastAPI 后端结构搭建
3. ✅ 核心 UI 组件开发
4. ✅ Unity 游戏集成
5. ✅ 基础 API 端点
6. ✅ 搜索和筛选功能
7. ✅ 项目配置和文档

## ✅ 阶段二：用户认证 + 数据库（已完成 - 2026-01-20）

### 后端实现

1. ✅ **数据库架构**
   - PostgreSQL 连接配置（database.py）
   - SQLAlchemy ORM 设置
   - 环境变量配置（.env.example）

2. ✅ **数据模型**（models.py）
   - User（用户表 - 支持注册/Guest/OAuth）
   - Organization（组织表）
   - Class（班级表）
   - Module（模块表）
   - ModuleWhitelist（模块白名单）
   - ConsentRecord（同意记录）
   - BehaviorData（行为数据）
   - AuditLog（审计日志）

3. ✅ **认证系统**
   - 密码哈希（bcrypt）
   - JWT token 生成和验证（auth.py）
   - OAuth2 密码流支持

4. ✅ **API 端点**（routers/auth_router.py）
   - POST /api/auth/register - 用户注册
   - POST /api/auth/login - 用户登录（Form）
   - POST /api/auth/login-json - 用户登录（JSON）
   - GET /api/auth/me - 获取当前用户信息
   - POST /api/auth/guest - 创建 Guest 会话
   - POST /api/auth/consent - 提交同意记录

5. ✅ **数据验证**（schemas.py）
   - Pydantic models for request/response
   - 密码强度验证
   - Email 验证

### 前端实现

1. ✅ **认证上下文**（context/AuthContext.js）
   - React Context for global auth state
   - Login/Register/Guest 登录逻辑
   - Token 管理（localStorage）
   - 用户信息获取

2. ✅ **UI 组件**
   - AuthModal（登录/注册弹窗）
   - 支持切换登录/注册模式
   - 密码可见性切换
   - Guest 登录按钮
   - 错误提示

3. ✅ **Header 更新**
   - 用户状态显示
   - 用户下拉菜单
   - Guest 徽章显示
   - 登出功能

4. ✅ **App.js 集成**
   - AuthProvider 包裹整个应用
   - AuthModal 状态管理

### 文档

- ✅ DATABASE_SETUP.md - 数据库设置指南
- ✅ .env.example - 环境变量模板
- ✅ 更新 README.md

---

## 🚧 阶段三：合规和同意（进行中）

### 待实现功能

- [ ] 同意弹窗组件（ConsentModal）
- [ ] 服务条款页面
- [ ] 隐私政策页面
- [ ] Cookie 同意管理
- [ ] 进入游戏前强制同意流程
- [ ] K-12 合规声明

---

## ⏳ 阶段四：数据采集（计划中）

### 待实现功能

- [ ] Unity → React postMessage 通信
- [ ] 键盘事件采集（仅按键类型，不采集内容）
- [ ] 行为数据上报 API
- [ ] 数据匿名化处理
- [ ] 采集开关（按组织配置）

---

## ⏳ 阶段五：教师功能（计划中）

### 待实现功能

- [ ] 创建班级界面
- [ ] 生成 join_code
- [ ] 学生列表管理
- [ ] 数据仪表板
- [ ] 模块分配
- [ ] 实时进度查看

---

## ⏳ 阶段六：管理功能（计划中）

### 待实现功能

- [ ] 组织管理界面
- [ ] 模块上传系统
- [ ] 模块发布流程
- [ ] 审计日志查看
- [ ] 用户邀请系统
- [ ] 配置管理（采集策略、保留期等）

---

# PING 平台蓝图（完整版）

---

## 0. 关键约束（必须贯彻）
1. **未注册可玩（Guest）**：允许匿名/游客进入游戏，不要求创建账号。
2. **进游戏前必须同意**：
   - 服务条款/隐私政策（必选）
   - 行为数据采集同意（必选；拒绝则不允许进入游戏）
   - Cookie 同意（是否必选由组织策略决定；但“必要 Cookie”用于登录/会话可在合规文案中注明）
3. **K-12 合规最小化采集**（重点：键盘采集）
   - 只采 **key code / 按键类型**（如 `ArrowLeft`, `KeyA`, `Space`），不采输入文本内容
   - 只在 Unity 区域 focus 时采集
   - 登录/表单输入时必须禁用采集
4. **模块不开放外部上传**：Unity 模块由你们内部（Platform Admin）上架/发版，并按组织白名单发布。
5. **组织级配置优先**：采集开关、同意文案、Cookie 文案、模块白名单、保留策略等由 Org Admin/Platform Admin 配置并强制执行。
6. **审计必做**：所有配置变更、模块发布/下架、邀请、导出等写入 audit log。
7. **敏感凭据不写进代码/文档**：DB/SMTP/Google secrets 只放环境变量或密钥管理（不要提交 git）。

---

## 1. 站点分层与页面能力（未登录 vs 登录）
### 1.1 站点划分
- 官网（Marketing）：`https://ping.agaii.org/`（未登录访问）
- 应用（App）：`https://app.ping.agaii.org/`（含 Guest 玩游戏 + 教师/管理登录）

### 1.2 官网（未登录）能做什么
> 目的：讲清楚价值/信任/合规，并把用户导向试点申请或登录。

- Home：产品介绍、价值、CTA（Request Pilot / Login / Play Demo）
- Modules（公开库）：浏览、搜索、筛选、查看详情（不提供上传）
- Teaching：课堂使用方式、FAQ
- Research：研究合作说明（表单）
- Trust & Safety：隐私/Cookie/行为采集原则、未成年人模式说明
- Contact：试点申请表单 + 内容合作（Unity 游戏）联系表单

### 1.3 App（应用）能做什么
#### 未注册（Guest）
- 输入 join_code 加入课堂/班级玩法（或进入 Demo）
- 完成协议/隐私/采集同意（按策略也可能需要 Cookie 同意）
- 进入 Unity Player 玩游戏
- 行为数据采集与上报（受组织策略控制）
- 退出/完成后写入进度与事件数据

#### 已登录（Teacher / Org Admin / Platform Admin）
- Teacher：建班、生成 join_code、布置模块、看实时与课后数据
- Org Admin：配置组织策略（同意文案、采集策略、模块白名单、保留/导出等）、邀请教师
- Platform Admin：创建组织、上架 Unity 模块、发版/回滚、发布到组织、下架、全局审计与监控

---

## 2. 角色与权限（RBAC）
> Guest 不是 “users 表里的正式用户”，但会有 guest_id 与 guest_token，用于会话/数据归属。

- Guest（游客）
- Teacher（教师）
- Org Admin（学校/学区管理员）
- Platform Admin（平台管理员）

权限摘要：
- Guest：只能“玩”和产生数据；不能看报告/导出
- Teacher：只能看自己班级数据
- Org Admin：看组织范围数据、配置组织策略、管理教师
- Platform Admin：全局管理（上架/发布/审计）

---

## 3. “未注册也能玩”的完整流程（强制同意 + Cookie）
### 3.1 Guest 课堂玩法（join_code）
1) 用户打开 `app.../play`
2) 输入 join_code
3) 系统显示“班级确认卡片”（学校/班级/教师名）→ 用户确认
4) 进入 `/consent`：
   - 展示 Terms/Privacy（必选）
   - 展示 Telemetry 同意（必选）
   - Cookie 同意（按 org_settings 决定是否必选；同时说明必要 Cookie 用途）
5) 同意后后端创建：
   - guest 记录
   - guest_token（建议 HttpOnly cookie）
   - consent_records（落库，可追溯）
6) 进入 `/player/:assignment_id`：
   - 创建 telemetry_session
   - Unity WebGL 加载
7) 游戏中采集并批量上报 telemetry_events
8) 退出/完成：结束 session，更新 assignment_progress

### 3.2 Guest Demo 玩法
- `app.../play` → “Try Demo” → `/consent`（用 demo org 文案）→ `/player/:demo_assignment_id`

---

## 4. 班级确认、join_code、学生注册（补齐缺口）
### 4.1 join_code（班级邀请码）
- Teacher 创建班级自动生成 join_code（如 `ABCD-1234`）
- Teacher 可“轮换/重置 join_code”（防泄露）
- 可选：join_code 过期时间

### 4.2 Guest 与班级/任务绑定（关键）
- Guest 输入 join_code 后：
  - 绑定到 class_id（或至少绑定到 assignment_id）
  - Teacher 报告中显示为 `Guest-xxxx` 或 guest display_name（若允许填写）

### 4.3 学生注册（可选项，MVP 可先不做）
> 你们现在明确“未注册也能玩”，所以注册不是必须功能。  
> 若后续要做“学生账号”，建议做成“从 Guest 升级”。

- 升级入口（可选）：`/student/upgrade`
- K-12 建议：display_name + PIN（不需要邮箱）
- 升级后把 guest 的历史归并到 student（通过一次性迁移码或同一设备+token）

---

## 5. 组织配置（管理员先配置好的所有项）
> 这些都存在 org_settings，前端与后端必须强制执行。

### 5.1 Org Settings（合规与同意）
- require_cookie_consent（bool）
- require_telemetry_consent（bool，建议永远 true）
- consent_version（int）
- consent_text_html（协议/隐私文案）
- telemetry_consent_text_html（采集同意文案，或合并在 consent_text 中）
- cookie_banner_text_html（Cookie banner 文案）
- minors_mode（bool，K-12 模式开关）

### 5.2 Telemetry（采集策略）
- telemetry_enabled（bool）
- capture_keyboard（bool，默认 true）
- capture_mouse（bool，默认可 false）
- capture_focus_blur（bool）
- capture_text_input（bool，必须默认 false）
- sampling_rate（0~1）
- batch_ms（如 1000）
- max_events_per_session（防炸库）

### 5.3 模块控制
- allowed_module_ids（白名单）
- blocked_module_ids（黑名单）
- default_version_policy（锁定版本/允许升级）

### 5.4 数据与导出/保留
- data_retention_days
- teacher_export_enabled
- export_fields_allowlist（json）

### 5.5 教师注册策略（配合 Google 登录）
- teacher_self_signup_enabled（默认 false：只允许邀请制）
- allowed_email_domains（可选：仅允许某些域名邮箱登录/注册）
- google_login_enabled（bool）

---

## 6. Unity 嵌入 React + 键盘行为采集（严格规则）
### 6.1 Unity WebGL 嵌入
- 页面：`/player/:assignment_id`
- 推荐：iframe + CSP（更安全）
- Unity 与 React 通信：postMessage 或 JS bridge

### 6.2 键盘采集规则（必须）
**允许采：**
- key_down / key_up
- payload：{ code, repeat, alt, ctrl, shift }

**禁止采：**
- 任何输入框文字内容（绝对不记录）

**采集时机：**
- 仅当 `consent_granted == true` 且 `unityFocused == true` 才启用监听
- 当用户点击页面其它输入框或失焦：立即禁用

### 6.3 批量上报（必须）
- 前端 events queue
- 每 batch_ms flush
- 单批上限 200（可配置）
- 失败重试（指数退避+上限）
- 超过 max_events_per_session：停止采集或降采样

---

## 7. 技术栈与工程结构（React + FastAPI + PG）
### 7.1 Monorepo 建议
```
repo/
  apps/
    web/         # React (Vite 或 Next)
    api/         # FastAPI
  infra/
    docker/      # docker compose, nginx
```

### 7.2 后端模块（FastAPI）
- auth（邮箱登录 + Google 登录）
- orgs / org_settings
- classes / join_code
- modules / module_versions（平台上架）
- assignments / progress
- consent
- telemetry（session + batch events）
- reports（实时/课后聚合）
- audit

---

## 8. 数据库表（PostgreSQL，MVP 详细）
> 不包含任何真实密码/连接串。

### 8.1 组织与配置
- orgs(id, name, type, created_at)
- org_settings(org_id PK, ...所有配置字段..., updated_by, updated_at)

### 8.2 用户（教师/管理员）
- users(
  id, org_id,
  email UNIQUE NULL,
  email_verified,
  password_hash NULL,
  role,
  display_name,
  status,
  created_at
)

### 8.3 OAuth 身份（支持 Google）
> 建议单独表，避免把 provider 字段塞爆 users。
- oauth_identities(
  id uuid PK,
  org_id uuid,
  user_id uuid FK users,
  provider text,               -- "google"
  provider_sub text,           -- Google "sub"
  email text,
  email_verified bool,
  picture_url text NULL,
  created_at timestamptz,
  UNIQUE(provider, provider_sub)
)

### 8.4 邀请（教师邀请制）
- teacher_invites(
  id uuid PK,
  org_id uuid,
  email text,
  role text DEFAULT 'teacher',
  token_hash text,
  expires_at timestamptz,
  accepted_at timestamptz NULL,
  created_by uuid FK users,
  created_at timestamptz
)

### 8.5 Guest
- guests(id, org_id, class_id NULL, display_name NULL, created_at)
- guest_tokens(id, guest_id, token_hash, expires_at, created_at)

### 8.6 班级
- classes(id, org_id, name, grade_band, subject, teacher_id, join_code UNIQUE, join_code_expires_at NULL, created_at)

### 8.7 模块与版本（Unity）
- modules(id, slug UNIQUE, title, description, subject, grade_band, tags, status, created_at)
- module_versions(id, module_id, version, unity_build_url, changelog, created_at)
- org_module_allowlist(org_id, module_id, allowed, UNIQUE(org_id, module_id))

### 8.8 布置与进度
- assignments(id, org_id, class_id, module_version_id, title NULL, starts_at, due_at, created_by, created_at)
- assignment_progress(
  assignment_id,
  actor_type,   -- "guest" / "user"
  actor_id,     -- guest_id 或 user_id
  status,
  started_at NULL,
  completed_at NULL,
  last_event_at NULL,
  UNIQUE(assignment_id, actor_type, actor_id)
)

### 8.9 同意记录（对 Guest 也适用）
- consent_records(
  id,
  org_id,
  actor_type,  -- guest/user
  actor_id,
  consent_type,    -- cookie/terms/telemetry
  consent_version,
  granted,
  granted_at,
  meta jsonb NULL
)

### 8.10 Telemetry（高频）
- telemetry_sessions(
  id,
  org_id,
  assignment_id,
  actor_type,
  actor_id,
  module_version_id,
  started_at,
  ended_at NULL,
  client_build NULL
)
- telemetry_events(
  id bigserial,
  org_id,
  session_id,
  ts,
  event_name,
  payload jsonb
)
索引建议：
- telemetry_events(session_id, ts)
- telemetry_events GIN(payload)

### 8.11 审计
- audit_logs(id, org_id, actor_user_id, action, target_type, target_id NULL, meta jsonb, created_at)

---

## 9. API 蓝图（含 Google 登录）
### 9.1 Guest / Play
- POST /play/verify-join-code
- POST /play/create-guest
- POST /consent/grant
- GET  /consent/status
- POST /telemetry/session/start
- POST /telemetry/events/batch
- GET  /play/assignment/:id

### 9.2 Teacher Auth（邮箱）
- POST /auth/register
- POST /auth/login
- GET  /auth/verify-email?token=...
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/logout

### 9.3 Google 登录（核心）
- POST /auth/google
  - 入参：{ id_token, invite_token? }
  - 行为：
    - 校验 id_token（audience=GOOGLE_CLIENT_ID）
    - 找 oauth_identities(provider="google", sub)
      - 有：登录
      - 无：按策略创建或拒绝
        - 若 teacher_self_signup_enabled=false：必须有有效 invite（invite_token 或 email 匹配未过期 invite）
        - 若 allowed_email_domains 存在：必须匹配域名
    - 返回：会话 cookie 或 JWT

### 9.4 Teacher 功能
- POST /classes
- GET  /classes
- POST /classes/:id/rotate-join-code
- POST /assignments
- GET  /reports/class/:id/live
- GET  /reports/class/:id/summary

### 9.5 Org Admin
- GET /org/settings
- PUT /org/settings
- POST /org/invites/teacher
- GET /org/audit
- PUT /org/modules/allowlist

### 9.6 Platform Admin
- POST /platform/orgs
- POST /platform/modules
- POST /platform/modules/:id/versions
- POST /platform/modules/:id/publish
- POST /platform/modules/:id/unpublish

---

## 10. Google 登录接入（React + FastAPI）—— 实施步骤
### 10.1 Google Cloud Console 配置
1) 创建 OAuth Client（Web 应用）
2) 配置 Authorized JavaScript origins：
   - https://app.ping.agaii.org
   - http://localhost:5173（或你本地端口）
3) 获取 **Client ID**（前端使用）

### 10.2 React 前端（Google Identity Services）
依赖：`@react-oauth/google`

- 在 App 根组件用 `GoogleOAuthProvider clientId={...}`
- 登录按钮使用 `GoogleLogin`，成功后拿到 `credential`（id_token）
- 把 id_token POST 给后端 `/auth/google`

示例（仅示意）：
```tsx
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export function AppRoot() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* routes */}
    </GoogleOAuthProvider>
  );
}

export function GoogleSignInButton() {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const idToken = credentialResponse.credential; // id_token
        await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }),
          credentials: "include",
        });
      }}
      onError={() => {}}
    />
  );
}
```

### 10.3 FastAPI 后端：校验 Google id_token + 创建/登录用户
依赖：`google-auth`

关键点：必须校验 audience=GOOGLE_CLIENT_ID；并处理邀请制/域名白名单策略。

示例（仅示意）：
```py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

router = APIRouter()

class GoogleAuthIn(BaseModel):
    id_token: str
    invite_token: str | None = None

@router.post("/auth/google")
def auth_google(payload: GoogleAuthIn):
    try:
        idinfo = id_token.verify_oauth2_token(
            payload.id_token,
            grequests.Request(),
            audience=GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    sub = idinfo.get("sub")
    email = idinfo.get("email")
    email_verified = bool(idinfo.get("email_verified"))
    # TODO: 查 oauth_identities；若不存在按 invite/self_signup/domains 创建或拒绝
    return {"ok": True}
```

### 10.4 教师邀请制（推荐默认）
- 默认：teacher_self_signup_enabled=false
- Org Admin 邀请教师邮箱 → 发邀请邮件（带 invite_token 链接）
- 教师点击链接进入 app 后可选择 Google 登录
- 后端 `/auth/google` 若携带 invite_token：
  - 校验 invite 属于 org 且未过期
  - 允许创建用户并赋予 role

---

## 11. 邮件 SMTP（注册验证 + 邀请）
### 11.1 环境变量（示例）
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_FROM="PING <no-reply@ping.agaii.org>"
- SMTP_USE_TLS=true
- APP_BASE_URL=https://app.ping.agaii.org

### 11.2 邮件类型（MVP 必备）
- Verify Email（邮箱注册验证）
- Reset Password（重置密码）
- Invite Teacher（邀请教师加入组织）

---

## 12. 环境变量（统一清单）
### 12.1 Web（React）
- VITE_API_BASE_URL
- VITE_GOOGLE_CLIENT_ID

### 12.2 API（FastAPI）
- DATABASE_URL
- SESSION_SECRET / JWT_SECRET
- GOOGLE_CLIENT_ID
- SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM / SMTP_USE_TLS
- APP_BASE_URL
- CORS_ALLOWED_ORIGINS
- COOKIE_SECURE=true（生产）
- COOKIE_SAMESITE=Lax（或 Strict）
- TELEMETRY_MAX_PAYLOAD_BYTES（例如 32768）
- TELEMETRY_RATE_LIMIT（例如 每 session 每分钟 N 次）

---

## 13. 实施顺序（严格按顺序）
1) 工程脚手架：monorepo + docker compose（pg + api + web）+ Alembic
2) 组织与 org_settings（先做管理员配置）+ audit_logs
3) 班级 classes + join_code（verify-join-code 返回确认卡片）
4) Guest + consent gate（guests/guest_tokens + consent_records + /consent）
5) 模块上架（modules + versions + org allowlist）
6) assignment 布置（assignments + progress）
7) Unity Player + telemetry（sessions + events + 键盘采集+批量上报）
8) 教师实时/课后聚合报告（live/summary）
9) 认证：邮箱注册验证（SMTP）+ 邀请制（teacher_invites）
10) Google 登录：React GIS + FastAPI /auth/google + oauth_identities

---

## 14. 最小验收标准（每阶段可验收）
- Guest：join_code → 确认班级 → 同意 → 进入 Unity → telemetry_events 入库
- Teacher：登录（邮箱或 Google）→ 建班 → 布置 → 看到 guest 进度与汇总
- Org Admin：能配置同意文案版本、采集策略、模块白名单；配置变更有审计
- Platform Admin：能上架 Unity build、发版、发布到组织、回滚/下架

---

## 15. 合规实现提示（务必落地）
- consent 必须落库（不能只靠 cookie/localStorage）
- telemetry ingestion 要限流、校验 event 白名单、限制 payload 大小
- 键盘采集只采 code，不采文本；只在 Unity focus；输入框禁用监听
- 数据保留按 org_settings 定期清理（job）

（完）
