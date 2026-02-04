/**
 * 消息发布和自动发布功能模块
 */

const { MESSAGE_DEFAULT_FREQUENCIES, MOCK_DATA_TEMPLATES } = require('./constants');

class MessagePublisher {
    constructor(aedes, protoLoader, fieldParser) {
        this.aedes = aedes;
        this.protoLoader = protoLoader;
        this.fieldParser = fieldParser;
        
        // 下行消息配置
        this.downlinkConfigs = {};
        
        // 每条消息的自动发送定时器映射
        this.autoPublishers = {};
        
        // 自动发送配置
        this.autoPublishEnabled = false;
    }

    /**
     * 发布消息
     */
    async publishMessage(messageType, data, topic = null) {
        try {
            // 获取消息类型
            const MessageType = this.protoLoader.getMessageType(messageType);
            
            // 转换数据
            const convertedData = this.fieldParser.convertKeysToCamel(data);
            
            // 验证数据
            const errMsg = this.protoLoader.verifyMessage(messageType, convertedData);
            if (errMsg) {
                throw new Error(`数据验证失败: ${errMsg}`);
            }
            
            // 创建并编码消息
            const message = MessageType.create(convertedData);
            const buffer = MessageType.encode(message).finish();
            
            // 发布到MQTT
            const publishTopic = topic || messageType;
            
            return new Promise((resolve, reject) => {
                this.aedes.publish({
                    topic: publishTopic,
                    payload: buffer,
                    qos: 0,
                    retain: false
                }, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        // 保存为自动发送模板
                        this.downlinkConfigs[messageType] = convertedData;
                        
                        resolve({
                            success: true,
                            topic: publishTopic,
                            size: buffer.length
                        });
                    }
                });
            });
            
        } catch (error) {
            throw error;
        }
    }

    /**
     * 开始自动发布消息
     */
    startAutoPublishForMessage(messageType, intervalMs, topic = null, data = null) {
        // 停止现有的自动发布
        this.stopAutoPublishForMessage(messageType);
        
        const ms = intervalMs || MESSAGE_DEFAULT_FREQUENCIES[messageType] || 1000;
        const publishTopic = topic || messageType;
        
        // 存储模板数据
        if (data) {
            this.downlinkConfigs[messageType] = data;
        }
        
        // 如果没有模板数据，生成模拟数据
        if (!this.downlinkConfigs[messageType]) {
            this.downlinkConfigs[messageType] = this.generateMockData(messageType) || {};
        }
        
        const template = this.downlinkConfigs[messageType];

        const timer = setInterval(() => {
            try {
                this.publishMessage(messageType, template, publishTopic)
                    .then(result => {
                        console.log(`📤 自动发送下行消息 - 类型: ${messageType}, 大小: ${result.size} 字节`);
                    })
                    .catch(error => {
                        console.error(`❌ 自动发送失败 (${messageType}):`, error.message);
                    });
            } catch (error) {
                console.error(`❌ 自动发送失败 (${messageType}):`, error.message);
            }
        }, ms);

        this.autoPublishers[messageType] = { timer, intervalMs: ms, topic: publishTopic };
        console.log(`🚀 开始自动发送下行消息(${messageType})，间隔: ${ms}ms`);
        
        return true;
    }

    /**
     * 停止自动发布消息
     */
    stopAutoPublishForMessage(messageType) {
        const publisher = this.autoPublishers[messageType];
        if (publisher && publisher.timer) {
            clearInterval(publisher.timer);
            delete this.autoPublishers[messageType];
            console.log(`⏹️ 停止自动发送下行消息(${messageType})`);
            return true;
        }
        return false;
    }

    /**
     * 停止所有自动发布
     */
    stopAllAutoPublishers() {
        Object.keys(this.autoPublishers).forEach(messageType => {
            this.stopAutoPublishForMessage(messageType);
        });
    }

    /**
     * 获取自动发布状态
     */
    getAutoPublishStatus() {
        const status = {};
        Object.keys(this.autoPublishers).forEach(messageType => {
            const publisher = this.autoPublishers[messageType];
            status[messageType] = {
                enabled: true,
                intervalMs: publisher.intervalMs,
                topic: publisher.topic
            };
        });
        return status;
    }

    /**
     * 生成模拟数据
     */
    generateMockData(messageType) {
        // 使用常量中的模拟数据模板
        if (MOCK_DATA_TEMPLATES[messageType]) {
            return JSON.parse(JSON.stringify(MOCK_DATA_TEMPLATES[messageType]));
        }
        
        // 如果没有预定义的模板，根据消息元数据生成基本数据
        const metadata = this.protoLoader.getMessageMetadata(messageType);
        if (!metadata || !metadata.fields) {
            return null;
        }
        
        const mockData = {};
        Object.entries(metadata.fields).forEach(([fieldName, fieldMeta]) => {
            if (fieldMeta.repeated) {
                mockData[fieldName] = [];
            } else if (fieldMeta.type === 'uint32' || fieldMeta.type === 'int32') {
                mockData[fieldName] = 0;
            } else if (fieldMeta.type === 'float' || fieldMeta.type === 'double') {
                mockData[fieldName] = 0.0;
            } else if (fieldMeta.type === 'bool') {
                mockData[fieldName] = false;
            } else if (fieldMeta.type === 'string') {
                mockData[fieldName] = "";
            } else {
                mockData[fieldName] = null;
            }
        });
        
        return mockData;
    }

    /**
     * 获取下行消息配置
     */
    getDownlinkConfig(messageType) {
        return this.downlinkConfigs[messageType];
    }

    /**
     * 设置下行消息配置
     */
    setDownlinkConfig(messageType, data) {
        this.downlinkConfigs[messageType] = data;
    }

    /**
     * 获取所有自动发布的消息
     */
    getAutoPublishingMessages() {
        return Object.keys(this.autoPublishers);
    }

    /**
     * 检查消息是否正在自动发布
     */
    isAutoPublishing(messageType) {
        return !!this.autoPublishers[messageType];
    }
}

module.exports = MessagePublisher;