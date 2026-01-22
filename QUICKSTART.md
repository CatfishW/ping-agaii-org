# 快速开始指南 / Quick Start Guide

## 中文说明

### 1. 安装后端依赖

打开终端并进入 backend 目录：

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. 启动后端服务器

```bash
python main.py
```

后端将在 http://localhost:8000 运行
API 文档：http://localhost:8000/docs

### 3. 安装前端依赖

打开新的终端并进入 frontend 目录：

```bash
cd frontend
npm install
```

### 4. 启动前端服务器

```bash
npm start
```

前端将自动在浏览器中打开 http://localhost:3000

### 5. 访问应用

- 主页：http://localhost:3000
- 浏览模拟：点击 MODULES 查看所有模拟
- 玩游戏：点击 "Forces and Motion: Basics" 卡片上的 "Launch Simulation"

---

## English Instructions

### 1. Install Backend Dependencies

Open terminal and navigate to backend directory:

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows (use source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
```

### 2. Start Backend Server

```bash
python main.py
```

Backend will run at http://localhost:8000
API docs: http://localhost:8000/docs

### 3. Install Frontend Dependencies

Open new terminal and navigate to frontend directory:

```bash
cd frontend
npm install
```

### 4. Start Frontend Server

```bash
npm start
```

Frontend will automatically open at http://localhost:3000

### 5. Access the Application

- Home: http://localhost:3000
- Browse simulations: Click MODULES to see all simulations
- Play game: Click "Launch Simulation" on "Forces and Motion: Basics" card

---

## 使用快捷脚本 / Use Shortcut Scripts

### Windows
双击运行以下文件：
- `start-backend.bat` - 启动后端
- `start-frontend.bat` - 启动前端

### Linux/Mac
```bash
chmod +x start-backend.sh start-frontend.sh
./start-backend.sh  # 启动后端
./start-frontend.sh  # 启动前端
```

---

## 项目结构 / Project Structure

```
ping-agaii-org/
├── frontend/              # React 前端 / React Frontend
│   ├── public/
│   │   └── images/       # 图片资源 / Image assets
│   ├── src/
│   │   ├── components/   # React 组件 / React components
│   │   │   ├── Header.js
│   │   │   ├── Hero.js
│   │   │   ├── SimulationBrowser.js
│   │   │   └── GameEmbed.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backend/               # FastAPI 后端 / FastAPI Backend
│   ├── main.py           # API 端点 / API endpoints
│   └── requirements.txt
│
├── Force&Motion/         # Unity 游戏 / Unity Game
│   ├── index.html
│   ├── Build/
│   └── TemplateData/
│
└── HTML/                 # 旧版 HTML（参考）/ Legacy HTML (reference)
```

---

## 功能特性 / Features

✅ 交互式模拟浏览器 / Interactive simulation browser
✅ 实时搜索和筛选 / Real-time search and filtering
✅ 学科分类 / Subject categorization
✅ Unity 游戏嵌入 / Unity game embedding
✅ 响应式设计 / Responsive design
✅ RESTful API / RESTful API

---

## 技术栈 / Tech Stack

**前端 / Frontend:**
- React 18
- React Router 6
- Axios
- Lucide Icons

**后端 / Backend:**
- FastAPI
- Python 3.8+
- Uvicorn
- Pydantic

**游戏 / Game:**
- Unity WebGL

---

## 下一步开发 / Next Steps

根据 todo.md 中的蓝图，接下来需要实现：

1. PostgreSQL 数据库集成
2. 用户认证系统（Google OAuth + 邮箱登录）
3. Guest 模式和协议同意
4. 行为数据采集系统
5. 教师和管理员界面
6. 组织级配置管理

详见 [todo.md](todo.md) 完整蓝图。
