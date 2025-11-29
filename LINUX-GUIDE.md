# Linux/macOS 使用指南

## 🐧 快速开始（推荐方式）

### 方法一：交互式安装脚本（最简单）

```bash
# 1. 进入项目目录
cd SharkDataSever

# 2. 添加执行权限
chmod +x install-and-run.sh

# 3. 运行交互式脚本
./install-and-run.sh
```

这个脚本会：
- ✅ 自动检查系统环境
- ✅ 自动安装所有依赖
- ✅ 提供图形化菜单操作
- ✅ 可以一键启动所有服务

### 方法二：使用独立脚本

**1. 添加执行权限**
```bash
chmod +x start.sh test-mqtt.sh test-udp.sh
```

**2. 启动服务器**
```bash
./start.sh
```

**3. 测试服务（打开新终端）**
```bash
# MQTT 测试
./test-mqtt.sh

# UDP 测试（再打开一个新终端）
./test-udp.sh
```

### 方法三：手动运行

```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 测试（新终端）
node test-mqtt-client.js
node test-udp-client.js
```

## 📋 脚本说明

### start.sh - 服务器启动脚本

**功能：**
- 自动检查 Node.js 和 npm
- 自动安装依赖（如果未安装）
- 检查视频源文件
- 启动服务器

**使用方法：**
```bash
chmod +x start.sh
./start.sh
```

### test-mqtt.sh - MQTT 测试脚本

**功能：**
- 连接到 MQTT Broker
- 订阅 robot/data 主题
- 实时显示接收到的数据

**使用方法：**
```bash
chmod +x test-mqtt.sh
./test-mqtt.sh
```

### test-udp.sh - UDP 测试脚本

**功能：**
- 监听 UDP 端口
- 接收视频流数据包
- 组装和保存视频帧

**使用方法：**
```bash
chmod +x test-udp.sh
./test-udp.sh
```

### install-and-run.sh - 交互式安装和运行脚本

**功能：**
- 完整的环境检查
- 自动安装依赖
- 图形化菜单界面
- 一键启动所有服务

**菜单选项：**
1. 启动服务器
2. 测试 MQTT 客户端
3. 测试 UDP 视频流客户端
4. 同时启动服务器和测试客户端（推荐）
5. 查看使用说明
6. 退出

**使用方法：**
```bash
chmod +x install-and-run.sh
./install-and-run.sh
```

## 🔧 权限管理

### 一次性添加所有脚本的执行权限

```bash
chmod +x *.sh
```

### 查看脚本权限

```bash
ls -l *.sh
```

应该看到类似输出：
```
-rwxr-xr-x  1 user user 1234 Nov 29 10:00 start.sh
-rwxr-xr-x  1 user user 2345 Nov 29 10:00 test-mqtt.sh
-rwxr-xr-x  1 user user 3456 Nov 29 10:00 test-udp.sh
-rwxr-xr-x  1 user user 4567 Nov 29 10:00 install-and-run.sh
```

## 🎯 推荐工作流程

### 开发/测试流程

**终端 1 - 服务器：**
```bash
./start.sh
```

**终端 2 - MQTT 测试：**
```bash
./test-mqtt.sh
```

**终端 3 - UDP 测试：**
```bash
./test-udp.sh
```

### 使用 tmux（推荐）

如果你安装了 tmux，可以更方便地管理多个终端：

```bash
# 安装 tmux（如果没有）
# Ubuntu/Debian: sudo apt-get install tmux
# macOS: brew install tmux

# 启动 tmux 会话
tmux new -s shark

# 分割窗口（Ctrl+B 然后按 %）
# 在不同窗格中运行不同的脚本

# 窗格 1
./start.sh

# 切换到窗格 2（Ctrl+B 然后方向键）
./test-mqtt.sh

# 创建新窗格（Ctrl+B 然后 %）
./test-udp.sh

# 退出 tmux: Ctrl+B 然后 D
# 重新连接: tmux attach -t shark
```

### 使用 screen

```bash
# 安装 screen（如果没有）
# Ubuntu/Debian: sudo apt-get install screen
# macOS: brew install screen

# 启动 screen 会话
screen -S shark

# 运行服务器
./start.sh

# 创建新窗口（Ctrl+A 然后 C）
./test-mqtt.sh

# 创建另一个新窗口（Ctrl+A 然后 C）
./test-udp.sh

# 切换窗口: Ctrl+A 然后数字键
# 退出 screen: Ctrl+A 然后 D
# 重新连接: screen -r shark
```

## 🚀 一键启动所有服务

使用 `install-and-run.sh` 的选项 4 可以自动在多个终端窗口中启动所有服务：

```bash
./install-and-run.sh
# 选择选项 4
```

支持的终端模拟器：
- GNOME Terminal
- xterm
- KDE Konsole

如果你的终端不在支持列表中，脚本会提示手动启动。

## 🐛 故障排除

### 问题 1：权限被拒绝

```bash
# 错误信息
bash: ./start.sh: Permission denied

# 解决方案
chmod +x start.sh
```

### 问题 2：找不到 Node.js

```bash
# 检查是否安装
node --version
npm --version

# 安装 Node.js
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm

# Arch Linux
sudo pacman -S nodejs npm

# macOS (使用 Homebrew)
brew install node
```

### 问题 3：依赖安装失败

```bash
# 清除缓存
npm cache clean --force

# 删除旧的依赖
rm -rf node_modules package-lock.json

# 使用淘宝镜像重新安装
npm install --registry=https://registry.npmmirror.com

# 或设置永久镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 问题 4：端口被占用

```bash
# 检查端口占用
sudo lsof -i :3333  # MQTT 端口
sudo lsof -i :3334  # UDP 端口

# 杀死占用端口的进程
sudo kill -9 <PID>

# 或修改配置
# 编辑 server.js 修改端口号
```

### 问题 5：视频文件问题

```bash
# 检查视频文件
ls -lh VideoSource/

# 支持的格式
# .mp4, .avi, .mov

# 如果没有视频文件，下载一个测试视频
# 例如（需要有 wget）
wget -O VideoSource/test.mp4 "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
```

### 问题 6：FFmpeg 错误

```bash
# 检查 FFmpeg 是否安装
ffmpeg -version

# 如果需要系统级 FFmpeg（可选）
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# 注意：项目会自动安装 FFmpeg，通常不需要手动安装
```

## 📊 系统资源监控

### 查看进程

```bash
# 查看 Node.js 进程
ps aux | grep node

# 查看端口监听
sudo netstat -tlnp | grep -E "3333|3334"

# 或使用 ss
sudo ss -tlnp | grep -E "3333|3334"
```

### 监控资源使用

```bash
# 使用 htop（推荐）
htop

# 或使用 top
top

# 过滤 Node.js 进程
top -p $(pgrep -d',' node)
```

## 🔐 安全建议

### 仅本地使用（当前配置）

当前配置使用 `127.0.0.1`，仅限本机访问，这是最安全的。

### 局域网使用（修改配置）

如果需要在局域网中使用：

**1. 修改 server.js：**
```javascript
const CONFIG = {
    udp: {
        port: 3334,
        host: '0.0.0.0'  // 监听所有网卡
    },
    mqtt: {
        port: 3333,
        host: '0.0.0.0'  // 监听所有网卡
    }
};
```

**2. 配置防火墙（Ubuntu 示例）：**
```bash
# 允许端口
sudo ufw allow 3333/tcp
sudo ufw allow 3334/udp

# 查看状态
sudo ufw status
```

**3. 安全注意事项：**
- ⚠️ 确保在可信网络中使用
- ⚠️ 不建议暴露到公网
- ⚠️ 考虑添加认证机制

## 📈 性能优化

### 1. 使用生产环境 Node.js

```bash
# 设置环境变量
export NODE_ENV=production
npm start
```

### 2. 使用 PM2 进程管理器

```bash
# 安装 PM2
npm install -g pm2

# 使用 PM2 启动
pm2 start server.js --name shark-server

# 查看状态
pm2 status

# 查看日志
pm2 logs shark-server

# 停止服务
pm2 stop shark-server

# 开机自启动
pm2 startup
pm2 save
```

### 3. 限制资源使用

```bash
# 使用 systemd 限制资源（高级）
# 创建服务文件: /etc/systemd/system/shark-server.service
[Unit]
Description=SharkDataServer
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/SharkDataSever
ExecStart=/usr/bin/node server.js
Restart=on-failure
MemoryLimit=512M
CPUQuota=50%

[Install]
WantedBy=multi-user.target

# 启动服务
sudo systemctl daemon-reload
sudo systemctl start shark-server
sudo systemctl enable shark-server
```

## 🎓 学习资源

### Shell 脚本教程

- [Bash 脚本教程](https://www.runoob.com/linux/linux-shell.html)
- [Linux 命令大全](https://man.linuxde.net/)

### Node.js 学习

- [Node.js 官方文档](https://nodejs.org/docs/)
- [npm 使用手册](https://docs.npmjs.com/)

### 相关技术

- [MQTT 协议](http://mqtt.org/)
- [Protobuf 文档](https://developers.google.com/protocol-buffers)
- [FFmpeg 文档](https://ffmpeg.org/documentation.html)

## 💡 提示和技巧

### 1. 查看脚本内容

```bash
# 查看脚本做了什么
cat start.sh
less install-and-run.sh
```

### 2. 调试脚本

```bash
# 以调试模式运行
bash -x start.sh
```

### 3. 后台运行服务器

```bash
# 使用 nohup
nohup ./start.sh > server.log 2>&1 &

# 查看日志
tail -f server.log

# 查找进程 ID
ps aux | grep "node server.js"

# 停止进程
kill <PID>
```

### 4. 创建桌面快捷方式

在 Ubuntu 上创建 `.desktop` 文件：

```bash
# 创建文件
nano ~/.local/share/applications/shark-server.desktop

# 内容：
[Desktop Entry]
Type=Application
Name=SharkDataServer
Comment=UDP & MQTT Server
Exec=gnome-terminal -- bash -c "cd /path/to/SharkDataSever && ./start.sh; exec bash"
Icon=network-server
Terminal=true
Categories=Development;

# 保存后刷新
update-desktop-database ~/.local/share/applications/
```

## 📞 获取帮助

遇到问题时：
1. 查看脚本的详细输出
2. 检查日志文件
3. 查阅 README.md
4. 查看 INSTALL.md

---

祝使用愉快！🎉
