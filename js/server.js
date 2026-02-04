/**
 * 主服务器类
 * 整合所有模块，提供统一的接口
 */

const aedes = require('aedes')();
const ProtoLoader = require('./proto-loader');
const FieldParser = require('./field-parser');
const MessagePublisher = require('./message-publisher');
const MQTTHandler = require('./mqtt-handler');
const HTTPHandler = require('./http-handler');
const HTMLGenerator = require('./html-generator');
const { DEFAULT_CONFIG } = require('./constants');

class VisualMQTTServer {
    constructor(mqttPort = DEFAULT_CONFIG.mqttPort, httpPort = DEFAULT_CONFIG.httpPort, host = DEFAULT_CONFIG.host) {
        this.mqttPort = mqttPort;
        this.httpPort = httpPort;
        this.host = host;
        
        // 初始化模块
        this.protoLoader = new ProtoLoader();
        this.fieldParser = new FieldParser();
        this.messagePublisher = new MessagePublisher(aedes, this.protoLoader, this.fieldParser);
        this.mqttHandler = new MQTTHandler(aedes, this.protoLoader, this.fieldParser);
        this.htmlGenerator = new HTMLGenerator();
        this.httpHandler = new HTTPHandler(
            this.protoLoader, 
            this.mqttHandler, 
            this.messagePublisher, 
            this.htmlGenerator
        );
        
        // 设置最大历史记录大小
        this.mqttHandler.setMaxHistorySize(DEFAULT_CONFIG.maxHistorySize);
    }

    /**
     * 启动服务器
     */
    async start() {
        const loaded = await this.protoLoader.loadProto();
        if (!loaded) {
            throw new Error('Protobuf 加载失败，无法启动服务');
        }

        await this.mqttHandler.startMQTT(this.mqttPort, this.host);
        this.httpHandler.startHTTP(this.httpPort, this.host);
    }

    /**
     * 停止服务器
     */
    async stop() {
        // 停止所有自动发布
        this.messagePublisher.stopAllAutoPublishers();
        
        // 停止 MQTT 服务器
        await this.mqttHandler.stopMQTT();
        
        // 停止 HTTP 服务器
        await this.httpHandler.stopHTTP();
        
        // 关闭 aedes broker
        aedes.close(() => {
            console.log('⏹️ MQTT Broker 已关闭');
        });
    }

    /**
     * 获取服务器状态
     */
    getStatus() {
        const mqttStatus = this.mqttHandler.getServerStatus();
        const httpStatus = this.httpHandler.getServerStatus();
        const autoPublishStatus = this.messagePublisher.getAutoPublishStatus();
        
        return {
            mqtt: {
                ...mqttStatus,
                port: this.mqttPort,
                host: this.host
            },
            http: {
                ...httpStatus,
                port: this.httpPort,
                host: this.host
            },
            autoPublish: autoPublishStatus,
            messages: {
                server: this.protoLoader.getServerMessages().length,
                client: this.protoLoader.getClientMessages().length
            }
        };
    }

    /**
     * 手动发布消息
     */
    async publishMessage(messageType, data, topic = null) {
        return await this.messagePublisher.publishMessage(messageType, data, topic);
    }

    /**
     * 开始自动发布消息
     */
    startAutoPublish(messageType, intervalMs, topic = null, data = null) {
        return this.messagePublisher.startAutoPublishForMessage(messageType, intervalMs, topic, data);
    }

    /**
     * 停止自动发布消息
     */
    stopAutoPublish(messageType) {
        return this.messagePublisher.stopAutoPublishForMessage(messageType);
    }

    /**
     * 获取接收到的消息历史
     */
    getReceivedMessages(limit = null) {
        return this.mqttHandler.getReceivedMessages(limit);
    }

    /**
     * 清空消息历史
     */
    clearMessageHistory() {
        this.mqttHandler.clearMessageHistory();
    }

    /**
     * 获取消息元数据
     */
    getMessageMetadata(messageName) {
        return this.protoLoader.getMessageMetadata(messageName);
    }

    /**
     * 获取所有消息元数据
     */
    getAllMessageMetadata() {
        return this.protoLoader.getAllMessageMetadata();
    }

    /**
     * 获取服务器消息列表
     */
    getServerMessages() {
        return this.protoLoader.getServerMessages();
    }

    /**
     * 获取客户端消息列表
     */
    getClientMessages() {
        return this.protoLoader.getClientMessages();
    }

    /**
     * 设置最大历史记录大小
     */
    setMaxHistorySize(size) {
        this.mqttHandler.setMaxHistorySize(size);
    }

    /**
     * 获取自动发布状态
     */
    getAutoPublishStatus() {
        return this.messagePublisher.getAutoPublishStatus();
    }

    /**
     * 检查消息是否正在自动发布
     */
    isAutoPublishing(messageType) {
        return this.messagePublisher.isAutoPublishing(messageType);
    }

    /**
     * 获取下行消息配置
     */
    getDownlinkConfig(messageType) {
        return this.messagePublisher.getDownlinkConfig(messageType);
    }

    /**
     * 设置下行消息配置
     */
    setDownlinkConfig(messageType, data) {
        this.messagePublisher.setDownlinkConfig(messageType, data);
    }
}

module.exports = VisualMQTTServer;