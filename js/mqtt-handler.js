/**
 * MQTT 服务器事件处理模块
 */

const net = require('net');

class MQTTHandler {
    constructor(aedes, protoLoader, fieldParser) {
        this.aedes = aedes;
        this.protoLoader = protoLoader;
        this.fieldParser = fieldParser;
        
        this.mqttServer = null;
        
        // 接收到的上行消息历史
        this.receivedMessages = [];
        this.maxHistorySize = 100;
    }

    /**
     * 启动 MQTT 服务器
     */
    async startMQTT(port = 3333, host = '127.0.0.1') {
        return new Promise((resolve, reject) => {
            this.mqttServer = net.createServer(this.aedes.handle);

            this.mqttServer.on('error', (err) => {
                console.error(`❌ MQTT 服务器错误: ${err.message}`);
                reject(err);
            });

            // 监听客户端连接
            this.aedes.on('client', (client) => {
                console.log(`📱 MQTT 客户端已连接: ${client.id}`);
            });

            // 监听客户端断开
            this.aedes.on('clientDisconnect', (client) => {
                console.log(`📴 MQTT 客户端已断开: ${client.id}`);
            });

            // 监听订阅
            this.aedes.on('subscribe', (subscriptions, client) => {
                console.log(`📌 客户端 ${client.id} 订阅:`, subscriptions.map(s => s.topic).join(', '));
            });

            // 监听客户端发布的消息
            this.aedes.on('publish', async (packet, client) => {
                if (!client) return;
                
                await this.handleIncomingMessage(packet, client);
            });

            this.mqttServer.listen(port, host, () => {
                console.log(`✅ MQTT 服务已启动 - mqtt://${host}:${port}`);
                resolve();
            });
        });
    }

    /**
     * 处理接收到的消息
     */
    async handleIncomingMessage(packet, client) {
        const topic = packet.topic;
        const clientMessageNames = this.protoLoader.getClientMessages();
        
        // 尝试解析消息
        for (const msgName of clientMessageNames) {
            if (topic.includes(msgName) || topic === msgName) {
                try {
                    const decoded = this.protoLoader.decodeMessage(msgName, packet.payload);
                    
                    // 解析字段的实际含义
                    const messageMetadata = this.protoLoader.getAllMessageMetadata();
                    const parsedData = this.fieldParser.parseFieldValues(msgName, decoded, messageMetadata);
                    
                    // 保存到历史记录
                    this.receivedMessages.unshift({
                        timestamp: new Date().toISOString(),
                        clientId: client.id,
                        topic: topic,
                        messageType: msgName,
                        data: decoded,
                        parsedData: parsedData  // 添加解析后的数据
                    });
                    
                    // 限制历史记录大小
                    if (this.receivedMessages.length > this.maxHistorySize) {
                        this.receivedMessages = this.receivedMessages.slice(0, this.maxHistorySize);
                    }
                    
                    console.log(`📥 收到上行消息 - 客户端: ${client.id}, 类型: ${msgName}`);
                    
                } catch (err) {
                    console.error(`❌ 解析消息失败 (${msgName}):`, err.message);
                }
                break;
            }
        }
    }

    /**
     * 停止 MQTT 服务器
     */
    stopMQTT() {
        return new Promise((resolve) => {
            if (this.mqttServer) {
                this.mqttServer.close(() => {
                    console.log('⏹️ MQTT 服务已停止');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * 获取接收到的消息历史
     */
    getReceivedMessages(limit = null) {
        if (limit && limit > 0) {
            return this.receivedMessages.slice(0, limit);
        }
        return this.receivedMessages;
    }

    /**
     * 清空消息历史
     */
    clearMessageHistory() {
        this.receivedMessages = [];
    }

    /**
     * 设置最大历史记录大小
     */
    setMaxHistorySize(size) {
        this.maxHistorySize = size;
        // 如果当前历史记录超过新的大小，截断
        if (this.receivedMessages.length > size) {
            this.receivedMessages = this.receivedMessages.slice(0, size);
        }
    }

    /**
     * 获取客户端连接数
     */
    getClientCount() {
        // 注意：aedes 没有直接提供客户端计数的方法
        // 在实际使用中，可能需要维护自己的客户端列表
        return 'N/A';
    }

    /**
     * 获取服务器状态
     */
    getServerStatus() {
        return {
            isRunning: !!this.mqttServer,
            receivedMessages: this.receivedMessages.length,
            maxHistorySize: this.maxHistorySize
        };
    }

    /**
     * 发布消息（直接通过 aedes）
     */
    publishDirect(topic, payload, options = {}) {
        return new Promise((resolve, reject) => {
            const publishOptions = {
                topic: topic,
                payload: payload,
                qos: options.qos || 0,
                retain: options.retain || false
            };
            
            this.aedes.publish(publishOptions, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = MQTTHandler;