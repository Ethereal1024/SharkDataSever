# 🎉 Linux 一键脚本已创建完成！

## ✅ 新增的 Linux/macOS 脚本文件

我已经为您创建了完整的 Linux/macOS 一键启动脚本：

### 📄 核心脚本文件

1. **`start.sh`** - 服务器启动脚本
   - ✅ 自动检测 Node.js 和 npm
   - ✅ 自动安装依赖
   - ✅ 检查视频源文件
   - ✅ 彩色输出和友好提示
   - ✅ 信号处理（Ctrl+C 优雅退出）

2. **`test-mqtt.sh`** - MQTT 测试客户端脚本
   - ✅ 自动检测环境
   - ✅ 连接到 MQTT Broker
   - ✅ 实时显示接收数据

3. **`test-udp.sh`** - UDP 视频流测试脚本
   - ✅ 监听 UDP 端口
   - ✅ 接收和组装视频帧
   - ✅ 统计显示

4. **`install-and-run.sh`** - 交互式安装和运行脚本（⭐推荐）
   - ✅ 完整的环境检查
   - ✅ 自动安装依赖
   - ✅ 图形化菜单界面
   - ✅ 一键启动多终端
   - ✅ 内置使用说明

## 🚀 使用方法

### 最简单的方式（推荐）

```bash
# 1. 进入项目目录
cd SharkDataSever

# 2. 添加执行权限
chmod +x install-and-run.sh

# 3. 运行交互式脚本
./install-and-run.sh
```

### 传统方式

```bash
# 添加权限
chmod +x *.sh

# 启动服务器
./start.sh

# 测试 MQTT（新终端）
./test-mqtt.sh

# 测试 UDP（新终端）
./test-udp.sh
```

## 📚 新增文档

### 1. **`LINUX-GUIDE.md`** - Linux/macOS 完整使用指南
包含：
- 🐧 详细的安装步骤
- 📋 脚本功能说明
- 🔧 权限管理
- 🎯 推荐工作流程
- 🐛 故障排除
- 📈 性能优化建议
- 💡 提示和技巧

### 2. **`SCRIPTS-GUIDE.md`** - 全平台脚本总览
包含：
- 📁 所有脚本文件清单
- 🚀 快速启动指南（Windows/Linux）
- 📋 脚本功能对比
- 🎨 输出示例
- 🔧 技术细节
- ⚙️ 自定义方法

### 3. **更新的 `QUICKSTART.md`**
- ✅ 添加了 Linux/macOS 快速启动说明
- ✅ 分平台展示不同的启动方式
- ✅ 完整的故障排除指南

### 4. **更新的 `README.md`**
- ✅ 添加了 Linux 脚本使用说明
- ✅ 更新了项目结构（包含所有脚本）
- ✅ 跨平台使用方法

## 🎨 脚本特色功能

### 彩色输出
```bash
✅ 成功信息 - 绿色
❌ 错误信息 - 红色
⚠️  警告信息 - 黄色
ℹ️  提示信息 - 蓝色
```

### 交互式菜单 (install-and-run.sh)
```
╔═══════════════════════════════════════════════════════╗
║                    请选择操作                         ║
╚═══════════════════════════════════════════════════════╝

  1) 启动服务器
  2) 测试 MQTT 客户端
  3) 测试 UDP 视频流客户端
  4) 同时启动服务器和测试客户端 (推荐)
  5) 查看使用说明
  6) 退出
```

### 自动化检查
- ✅ 操作系统检测
- ✅ Node.js 版本检查
- ✅ npm 版本检查
- ✅ 依赖安装状态
- ✅ 视频源文件检测
- ✅ 执行权限自动设置

## 📊 完整的项目文件结构

```
SharkDataSever/
├── 📄 核心文件
│   ├── server.js                    # 主服务器
│   ├── udp-video-streamer.js        # UDP 模块
│   ├── mqtt-server.js               # MQTT 模块
│   ├── test-mqtt-client.js          # MQTT 测试
│   └── test-udp-client.js           # UDP 测试
│
├── ⚙️ 配置文件
│   ├── package.json                 # 项目配置
│   └── .gitignore                   # Git 忽略
│
├── 🪟 Windows 脚本
│   ├── start.bat                    # 启动服务器
│   ├── test-mqtt.bat                # MQTT 测试
│   └── test-udp.bat                 # UDP 测试
│
├── 🐧 Linux/macOS 脚本（新增）
│   ├── start.sh                     # 启动服务器
│   ├── test-mqtt.sh                 # MQTT 测试
│   ├── test-udp.sh                  # UDP 测试
│   └── install-and-run.sh           # 交互式安装（⭐推荐）
│
├── 📖 文档
│   ├── README.md                    # 完整说明文档
│   ├── QUICKSTART.md                # 快速启动指南
│   ├── INSTALL.md                   # Windows 安装说明
│   ├── LINUX-GUIDE.md               # Linux 使用指南（新增）
│   └── SCRIPTS-GUIDE.md             # 脚本总览（新增）
│
├── 📁 proto/
│   └── messages.proto               # Protobuf 定义
│
└── 📁 VideoSource/
    └── 1111.mp4                     # 视频源
```

## 🎯 跨平台支持总结

### Windows 用户
- ✅ 双击 `.bat` 文件即可运行
- ✅ 自动依赖检测和安装
- ✅ UTF-8 彩色输出

### Linux/macOS 用户
- ✅ Shell 脚本自动化一切
- ✅ 交互式菜单（`install-and-run.sh`）
- ✅ ANSI 彩色输出
- ✅ 支持 tmux/screen
- ✅ 可配置为系统服务

## 📖 文档导航

根据你的需求查看相应文档：

| 需求 | 推荐文档 |
|------|---------|
| 快速开始 | [QUICKSTART.md](./QUICKSTART.md) |
| Windows 详细说明 | [INSTALL.md](./INSTALL.md) |
| Linux 详细说明 | [LINUX-GUIDE.md](./LINUX-GUIDE.md) |
| 脚本功能对比 | [SCRIPTS-GUIDE.md](./SCRIPTS-GUIDE.md) |
| 完整技术文档 | [README.md](./README.md) |

## 🌟 推荐使用流程

### 首次使用

**Windows：**
1. 双击 `start.bat`
2. 双击 `test-mqtt.bat` 和 `test-udp.bat` 测试

**Linux/macOS：**
1. 运行 `chmod +x install-and-run.sh && ./install-and-run.sh`
2. 从菜单选择选项 4（同时启动所有服务）

### 日常使用

**Windows：**
```powershell
# 直接双击对应的 .bat 文件
start.bat
test-mqtt.bat
test-udp.bat
```

**Linux/macOS：**
```bash
# 终端 1
./start.sh

# 终端 2
./test-mqtt.sh

# 终端 3
./test-udp.sh
```

## 🎓 进阶技巧

### 使用 tmux（Linux/macOS）
```bash
# 启动 tmux 会话
tmux new -s shark

# 分割窗格运行不同服务
# Ctrl+B % (垂直分割)
# Ctrl+B " (水平分割)

# 在不同窗格中运行
./start.sh
./test-mqtt.sh
./test-udp.sh
```

### 使用 PM2（生产环境）
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name shark-server

# 开机自启
pm2 startup
pm2 save
```

## ✨ 全部完成！

现在您拥有：
- ✅ 完整的 Node.js 服务器代码
- ✅ Windows 一键启动脚本
- ✅ Linux/macOS 一键启动脚本
- ✅ 交互式安装运行脚本
- ✅ 完善的测试客户端
- ✅ 详细的多平台文档

**立即开始使用吧！** 🚀

---

**问题反馈**：如有任何问题，请查看对应平台的详细文档或故障排除部分。
