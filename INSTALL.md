# 安装和使用说明

## 📋 项目文件清单

```
SharkDataSever/
├── 📄 server.js                  # 主服务器（入口文件）
├── 📄 udp-video-streamer.js      # UDP视频流发送模块
├── 📄 mqtt-server.js             # MQTT服务模块
├── 📄 test-mqtt-client.js        # MQTT测试客户端
├── 📄 test-udp-client.js         # UDP测试客户端
├── 📄 package.json               # 项目依赖配置
├── 📄 README.md                  # 详细文档
├── 📄 QUICKSTART.md              # 快速启动指南
├── 📄 .gitignore                 # Git忽略文件
├── 🚀 start.bat                  # 一键启动服务器（Windows）
├── 🧪 test-mqtt.bat              # MQTT测试脚本（Windows）
├── 🧪 test-udp.bat               # UDP测试脚本（Windows）
├── 📁 proto/
│   └── messages.proto            # Protobuf消息定义
└── 📁 VideoSource/
    └── 1111.mp4                  # 视频源文件
```

## 🛠️ 安装步骤

### 方法一：使用启动脚本（推荐）

1. **双击运行 `start.bat`**
   - 脚本会自动检查并安装依赖
   - 然后启动服务器

### 方法二：手动安装

1. **打开 PowerShell**
   ```powershell
   cd c:\Users\Administrator\Desktop\SharkDataSever
   ```

2. **安装依赖**
   ```powershell
   npm install
   ```

3. **启动服务器**
   ```powershell
   npm start
   ```

## 🧪 测试服务

### MQTT 测试

**方法一：使用测试脚本**
- 双击运行 `test-mqtt.bat`

**方法二：手动运行**
```powershell
node test-mqtt-client.js
```

### UDP 测试

**方法一：使用测试脚本**
- 双击运行 `test-udp.bat`

**方法二：手动运行**
```powershell
node test-udp-client.js
```

## 📊 预期输出

### 服务器启动成功

```
═══════════════════════════════════════════════════════
🚀 SharkDataServer - UDP视频流 & MQTT数据模拟服务器
═══════════════════════════════════════════════════════

📡 正在启动 MQTT 服务...
✅ Protobuf 定义加载成功
✅ MQTT 服务已启动
   - 端口: 3333
   - 地址: mqtt://127.0.0.1:3333
   - 发布主题: robot/data
   - 发布频率: 每3秒一次

📹 正在启动 UDP 视频流服务...
✅ UDP 视频流服务已启动
   - 端口: 3334
   - 目标地址: 127.0.0.1:3334
📹 正在处理视频文件: 1111.mp4

═══════════════════════════════════════════════════════
✨ 所有服务已成功启动！
═══════════════════════════════════════════════════════
```

### MQTT 客户端输出示例

```
📨 收到消息 [robot/data] - 87 字节
✅ 成功解码为: RobotDynamicStatus
📄 数据内容:
{
  "current_health": 550,
  "current_heat": 45.2,
  "last_projectile_fire_rate": 16.8,
  ...
}
```

### UDP 客户端输出示例

```
📦 包 #1 - 帧 #1, 分片 1/25, 载荷: 1392 字节
📦 包 #2 - 帧 #1, 分片 2/25, 载荷: 1392 字节
...
✅ 帧 #1 组装完成 - 总大小: 34800 字节
💾 已保存: received_video\frame_1.h265
```

## 🔧 依赖说明

安装时会自动下载以下依赖：

| 依赖包 | 版本 | 用途 |
|--------|------|------|
| aedes | ^0.50.0 | MQTT Broker |
| mqtt | ^5.3.5 | MQTT 客户端库 |
| fluent-ffmpeg | ^2.1.3 | FFmpeg Node.js 封装 |
| protobufjs | ^7.2.6 | Protobuf 序列化 |
| @ffmpeg-installer/ffmpeg | ^1.1.0 | FFmpeg 二进制文件 |
| protobufjs-cli | ^1.1.2 | Protobuf 编译工具 |

**预计安装时间**：2-5 分钟（取决于网络速度）
**预计磁盘占用**：约 150-200 MB

## ⚙️ 配置说明

### 修改端口

编辑 `server.js` 文件中的 `CONFIG` 对象：

```javascript
const CONFIG = {
    udp: {
        port: 3334,      // UDP端口
        host: '127.0.0.1'
    },
    mqtt: {
        port: 3333,      // MQTT端口
        host: '127.0.0.1'
    }
};
```

### 修改 MQTT 发送频率

编辑 `mqtt-server.js` 中的发送间隔：

```javascript
this.publishInterval = setInterval(() => {
    this.publishRobotData();
}, 3000); // 修改这里的毫秒数，例如 1000 = 1秒
```

### 更换视频源

将你的视频文件放入 `VideoSource` 文件夹，支持的格式：
- `.mp4`
- `.avi`
- `.mov`

服务器会自动使用第一个找到的视频文件。

## 🐛 常见问题

### Q1: npm install 失败

**解决方案**：
```powershell
# 清除缓存
npm cache clean --force

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 或设置全局镜像
npm config set registry https://registry.npmmirror.com
```

### Q2: 启动时报错 "Cannot find module"

**解决方案**：
```powershell
# 删除 node_modules 重新安装
Remove-Item -Recurse -Force node_modules
npm install
```

### Q3: FFmpeg 编码失败

**可能原因**：
1. 视频文件损坏
2. 视频格式不支持

**解决方案**：
1. 尝试使用其他视频文件
2. 等待自动重试（5秒后）
3. 查看控制台错误信息

### Q4: MQTT 客户端无法连接

**检查清单**：
- [ ] 服务器是否已启动
- [ ] 端口 3333 是否被占用
- [ ] 防火墙是否允许本地连接

**解决方案**：
```powershell
# 检查端口占用
netstat -ano | findstr :3333

# 如果被占用，修改 server.js 中的端口配置
```

### Q5: UDP 收不到数据

**检查清单**：
- [ ] 服务器是否已启动
- [ ] VideoSource 文件夹中是否有视频文件
- [ ] 端口 3334 是否被占用

## 📈 性能说明

### 资源占用

- **CPU**: 10-30%（主要用于视频编码）
- **内存**: 100-300 MB
- **网络**: 
  - UDP: 约 5-10 Mbps（取决于视频码率）
  - MQTT: < 1 KB/s

### 优化建议

1. **降低视频码率**：使用分辨率较低的视频文件
2. **调整编码参数**：修改 `udp-video-streamer.js` 中的 FFmpeg 参数
3. **减少 MQTT 发送频率**：修改发送间隔

## 🔒 安全说明

⚠️ **重要**：本服务器仅用于本地测试，使用 127.0.0.1 回环地址。

如需在局域网中使用：
1. 修改 `host` 为 `0.0.0.0`
2. 配置防火墙规则
3. 注意数据安全

## 📞 技术支持

如遇到问题：
1. 查看 `README.md` 详细文档
2. 查看控制台错误日志
3. 检查 Node.js 版本（需要 >= 14.0.0）

## 📝 更新日志

### v1.0.0 (2025-11-29)
- ✅ 初始发布
- ✅ UDP 视频流发送功能
- ✅ MQTT 数据发送功能
- ✅ Protobuf 序列化支持
- ✅ HEVC 视频编码
- ✅ 测试客户端
- ✅ Windows 一键启动脚本

## 🎯 下一步

1. **启动服务器**：运行 `start.bat`
2. **测试 MQTT**：运行 `test-mqtt.bat`
3. **测试 UDP**：运行 `test-udp.bat`
4. **查看文档**：阅读 `README.md` 了解更多细节

祝使用愉快！🎉
