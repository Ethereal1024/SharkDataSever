# SharkDataServer - UDP视频流 & MQTT数据模拟服务器

这是一个集成了UDP视频流发送和MQTT协议数据发送的Node.js后端模拟服务器，专为本地测试设计。

## 功能特性

### 🎥 UDP 视频流发送模块
- **端口**: 3334 (本地回环)
- **功能**: 持续发送 HEVC (H.265) 格式的视频流数据
- **视频源**: 从 `VideoSource` 文件夹读取视频文件
- **数据格式**: 每个 UDP 包前 8 字节包含：
  - 帧编号（递增）: 2 字节
  - 当前帧内分片序号: 2 字节
  - 当前帧总字节数: 4 字节
- **编码**: 使用 FFmpeg 将视频实时转码为 HEVC 格式
- **特性**: 视频循环播放，自动分包发送

### 📡 MQTT 数据发送模块
- **端口**: 3333 (本地回环)
- **功能**: 搭建本地 MQTT Broker，定时推送模拟机器人数据
- **主题**: `robot/data`
- **频率**: 每 3 秒发送一次
- **数据格式**: 使用 Protobuf 序列化
- **数据类型**: 
  - GameStatus (游戏状态)
  - RobotDynamicStatus (机器人动态状态)
  - RobotPosition (机器人位置)
  - GlobalUnitStatus (全局单位状态)

## 环境要求

- **Node.js**: >= 14.0.0
- **操作系统**: Windows / Linux / macOS
- **FFmpeg**: 自动安装（通过 @ffmpeg-installer/ffmpeg）

## 安装步骤

### 1. 克隆或下载项目

```powershell
cd c:\Users\Administrator\Desktop\SharkDataSever
```

### 2. 安装依赖

```powershell
npm install
```

安装的依赖包括：
- `aedes` - MQTT Broker
- `mqtt` - MQTT 客户端库
- `fluent-ffmpeg` - FFmpeg Node.js 封装
- `protobufjs` - Protobuf 序列化/反序列化
- `@ffmpeg-installer/ffmpeg` - FFmpeg 二进制文件
- `protobufjs-cli` - Protobuf 编译工具

### 3. 生成 Protobuf JavaScript 文件（可选）

如果需要手动生成 Protobuf 文件：

```powershell
npm run proto
```

这会从 `proto/messages.proto` 生成：
- `proto/messages.js` - JavaScript 代码
- `proto/messages.d.ts` - TypeScript 类型定义

## 使用方法

### 启动服务器

**Windows 系统：**

使用批处理脚本：
```powershell
# 双击 start.bat 或在命令行运行
.\start.bat
```

或手动启动：
```powershell
npm start
# 或
node server.js
```

**Linux/macOS 系统：**

使用 Shell 脚本：
```bash
# 添加执行权限
chmod +x start.sh

# 启动服务器
./start.sh
```

或使用交互式安装脚本（推荐）：
```bash
# 添加执行权限
chmod +x install-and-run.sh

# 运行交互式菜单
./install-and-run.sh
```

或手动启动：
```bash
npm start
# 或
node server.js
```

### 预期输出

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

📊 服务状态:
   ✅ MQTT Broker: mqtt://127.0.0.1:3333
   ✅ UDP 视频流: 127.0.0.1:3334

💡 提示:
   - MQTT 客户端连接后，每3秒会收到序列化的机器人数据
   - UDP 客户端会持续接收 HEVC 格式的视频流数据
   - 每个 UDP 包前8字节包含: 帧编号(2) + 分片序号(2) + 总字节数(4)
   - 按 Ctrl+C 停止服务器
```

### 停止服务器

按 `Ctrl+C` 即可优雅关闭所有服务。

## 测试客户端

### MQTT 客户端测试

**Windows 系统：**
```powershell
# 双击 test-mqtt.bat 或在命令行运行
.\test-mqtt.bat
# 或
node test-mqtt-client.js
```

**Linux/macOS 系统：**
```bash
# 使用脚本
chmod +x test-mqtt.sh
./test-mqtt.sh

# 或直接运行
node test-mqtt-client.js
```

**编程方式连接：**

使用任何 MQTT 客户端连接到服务器：

```javascript
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://127.0.0.1:3333');

client.on('connect', () => {
    console.log('已连接到 MQTT Broker');
    client.subscribe('robot/data', (err) => {
        if (!err) {
            console.log('已订阅 robot/data 主题');
        }
    });
});

client.on('message', (topic, message) => {
    console.log(`收到消息 [${topic}]:`, message.length, '字节');
    // 使用 Protobuf 解码 message
});
```

### UDP 客户端测试

**Windows 系统：**
```powershell
# 双击 test-udp.bat 或在命令行运行
.\test-udp.bat
# 或
node test-udp-client.js
```

**Linux/macOS 系统：**
```bash
# 使用脚本
chmod +x test-udp.sh
./test-udp.sh

# 或直接运行
node test-udp-client.js
```

**编程方式接收：**

```javascript
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

client.on('message', (msg, rinfo) => {
    // 解析前8字节头部
    const frameNumber = msg.readUInt16BE(0);
    const packetIndex = msg.readUInt16BE(2);
    const totalBytes = msg.readUInt32BE(4);
    const payload = msg.slice(8);
    
    console.log(`帧 #${frameNumber}, 包 #${packetIndex}, 总字节: ${totalBytes}, 载荷: ${payload.length}`);
});

client.bind(3334, '127.0.0.1');
```

## 项目结构

```
SharkDataSever/
├── server.js                    # 主服务器入口
├── udp-video-streamer.js        # UDP 视频流模块
├── mqtt-server.js               # MQTT 服务模块
├── test-mqtt-client.js          # MQTT 测试客户端
├── test-udp-client.js           # UDP 测试客户端
├── package.json                 # 项目配置
├── README.md                    # 详细说明文档
├── QUICKSTART.md                # 快速启动指南
├── INSTALL.md                   # 安装说明
├── .gitignore                   # Git 忽略配置
│
├── Windows 脚本:
│   ├── start.bat                # Windows 启动脚本
│   ├── test-mqtt.bat            # Windows MQTT 测试脚本
│   └── test-udp.bat             # Windows UDP 测试脚本
│
├── Linux/macOS 脚本:
│   ├── start.sh                 # Linux 启动脚本
│   ├── test-mqtt.sh             # Linux MQTT 测试脚本
│   ├── test-udp.sh              # Linux UDP 测试脚本
│   └── install-and-run.sh       # 交互式安装和运行脚本
│
├── proto/
│   └── messages.proto           # Protobuf 定义文件
│
└── VideoSource/
    └── 1111.mp4                 # 视频源文件
```

## UDP 数据包格式

每个 UDP 数据包结构如下：

```
+-------------------+-------------------+-------------------+
|   帧编号 (2字节)   | 分片序号 (2字节)   | 总字节数 (4字节)   |
+-------------------+-------------------+-------------------+
|                                                           |
|                   HEVC 视频数据载荷                        |
|                   (最大约 1392 字节)                       |
|                                                           |
+-----------------------------------------------------------+
```

### 字段说明

1. **帧编号** (2 字节, Big-Endian)
   - 从 1 开始递增
   - 每个新帧递增 1
   - 循环使用（0-65535）

2. **分片序号** (2 字节, Big-Endian)
   - 当前包在帧内的序号
   - 从 0 开始
   - 如果一帧被分为 N 个包，序号为 0 到 N-1

3. **总字节数** (4 字节, Big-Endian)
   - 当前完整帧的总字节数
   - 不包括分包头部的 8 字节
   - 所有属于同一帧的包该值相同

4. **载荷数据**
   - HEVC (H.265) 编码的视频数据
   - 每个包最大约 1392 字节
   - 需要根据分片序号重组完整帧

## MQTT 数据格式

服务器会循环发送以下类型的 Protobuf 消息到 `robot/data` 主题：

- `GameStatus` - 比赛状态
- `RobotDynamicStatus` - 机器人实时数据
- `RobotPosition` - 机器人位置坐标
- `GlobalUnitStatus` - 全局单位状态

所有消息都经过 Protobuf 序列化，客户端需要使用对应的 `.proto` 文件进行解码。

## 异常处理

服务器包含完善的异常处理机制：

- ✅ UDP 发送错误捕获和日志记录
- ✅ MQTT 连接错误处理
- ✅ FFmpeg 编码失败自动重试
- ✅ Protobuf 序列化验证
- ✅ 视频文件缺失检测
- ✅ 优雅关闭处理（Ctrl+C）
- ✅ 未捕获异常全局处理

## 常见问题

### Q: 启动时提示找不到视频文件？
A: 确保 `VideoSource` 文件夹存在，并且包含至少一个 `.mp4`、`.avi` 或 `.mov` 格式的视频文件。

### Q: MQTT 客户端无法连接？
A: 检查端口 3333 是否被占用，确保防火墙允许本地连接。

### Q: FFmpeg 编码失败？
A: 检查视频文件是否损坏，或尝试使用其他视频文件。服务器会自动重试。

### Q: 如何修改端口？
A: 编辑 `server.js` 中的 `CONFIG` 对象，修改对应的端口号。

### Q: 如何添加更多 Protobuf 消息类型？
A: 在 `proto/messages.proto` 中已定义多种消息类型，在 `mqtt-server.js` 的 `generateMockRobotData()` 方法中添加相应的模拟数据即可。

## 技术说明

### HEVC 编码
服务器使用 FFmpeg 的 `libx265` 编码器将视频实时转换为 HEVC 格式，配置参数：
- `preset: ultrafast` - 最快编码速度
- `tune: zerolatency` - 零延迟优化
- 输出格式: H.265 原始流

### UDP 分包策略
- 最大包大小: 1400 字节（8字节头 + 1392字节载荷）
- 避免 IP 分片
- 适合以太网 MTU (1500字节)

### Protobuf 序列化
使用 `protobufjs` 库进行消息的编码和解码，支持所有定义在 `messages.proto` 中的消息类型。

## 开发者

如需修改或扩展功能，请参考以下文件：

- `udp-video-streamer.js` - UDP 视频流逻辑
- `mqtt-server.js` - MQTT 服务和数据生成逻辑
- `server.js` - 服务器启动和管理

## 许可证

ISC

## 更新日志

### v1.0.0
- ✅ 初始版本
- ✅ UDP 视频流发送功能
- ✅ MQTT 数据发送功能
- ✅ Protobuf 序列化支持
- ✅ HEVC 视频编码
- ✅ 完善的日志和异常处理
