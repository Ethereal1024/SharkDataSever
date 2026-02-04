/**
 * HTTP 服务器和路由处理模块
 */

const http = require('http');
const { STATUS_MAPPINGS, MESSAGE_DEFAULT_FREQUENCIES, MESSAGE_DISPLAY_NAMES } = require('./constants');

class HTTPHandler {
    constructor(protoLoader, mqttHandler, messagePublisher, htmlGenerator) {
        this.protoLoader = protoLoader;
        this.mqttHandler = mqttHandler;
        this.messagePublisher = messagePublisher;
        this.htmlGenerator = htmlGenerator;
        
        this.httpServer = null;
    }

    /**
     * 启动 HTTP 服务器
     */
    startHTTP(port = 2026, host = '127.0.0.1') {
        this.httpServer = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.httpServer.listen(port, host, () => {
            console.log(`✅ Web 可视化界面已启动 - http://${host}:${port}`);
            console.log(`🌐 请在浏览器中打开: http://${host}:${port}`);
        });
    }

    /**
     * 处理 HTTP 请求
     */
    handleRequest(req, res) {
        // 设置CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        
        // 路由处理
        if (url.pathname === '/' || url.pathname === '/index.html') {
            this.serveHTML(res);
        } else if (url.pathname === '/api/messages') {
            this.handleGetMessages(res);
        } else if (url.pathname === '/api/uplink-history') {
            this.handleGetUplinkHistory(res);
        } else if (url.pathname === '/api/publish' && req.method === 'POST') {
            this.handlePublish(req, res);
        } else if (url.pathname === '/api/auto-publish' && req.method === 'POST') {
            this.handleAutoPublish(req, res);
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    }

    /**
     * 提供 HTML 页面
     */
    serveHTML(res) {
        const html = this.htmlGenerator.generateHTML();
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    }

    /**
     * 处理获取消息定义请求
     */
    handleGetMessages(res) {
        const serverMessages = this.protoLoader.getServerMessages().map(name => ({
            name: name,
            metadata: this.protoLoader.getMessageMetadata(name)
        }));
        
        const clientMessages = this.protoLoader.getClientMessages().map(name => ({
            name: name,
            metadata: this.protoLoader.getMessageMetadata(name)
        }));
        
        const response = {
            serverMessages: serverMessages,
            clientMessages: clientMessages,
            statusMappings: STATUS_MAPPINGS,
            messageDisplayNames: MESSAGE_DISPLAY_NAMES,
            messageDefaultFrequencies: MESSAGE_DEFAULT_FREQUENCIES,
            autoPublishers: this.messagePublisher.getAutoPublishingMessages()
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    }

    /**
     * 处理获取上行消息历史请求
     */
    handleGetUplinkHistory(res) {
        const history = this.mqttHandler.getReceivedMessages();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(history));
    }

    /**
     * 处理发布消息请求
     */
    handlePublish(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { messageType, data, topic } = JSON.parse(body);
                
                const result = await this.messagePublisher.publishMessage(messageType, data, topic);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
                
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }

    /**
     * 处理自动发布请求
     */
    handleAutoPublish(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { messageType, enabled, intervalMs, topic, data } = JSON.parse(body);
                
                if (!messageType) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'messageType is required' }));
                    return;
                }
                
                if (enabled) {
                    // 存储模板数据
                    if (data) {
                        this.messagePublisher.setDownlinkConfig(messageType, data);
                    }
                    this.messagePublisher.startAutoPublishForMessage(messageType, intervalMs, topic, data);
                } else {
                    this.messagePublisher.stopAutoPublishForMessage(messageType);
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true,
                    messageType: messageType,
                    enabled: this.messagePublisher.isAutoPublishing(messageType),
                    intervalMs: intervalMs || 0
                }));
                
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }

    /**
     * 停止 HTTP 服务器
     */
    stopHTTP() {
        return new Promise((resolve) => {
            if (this.httpServer) {
                this.httpServer.close(() => {
                    console.log('⏹️ Web 服务已停止');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * 获取服务器状态
     */
    getServerStatus() {
        return {
            isRunning: !!this.httpServer,
            address: this.httpServer ? this.httpServer.address() : null
        };
    }
}

module.exports = HTTPHandler;