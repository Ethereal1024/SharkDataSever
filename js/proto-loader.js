/**
 * Protobuf 加载和解析模块
 */

const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');
const { MESSAGE_DISPLAY_NAMES } = require('./constants');

class ProtoLoader {
    constructor() {
        this.protoRoot = null;
        this.serverMessageNames = []; // 下行消息（服务器->客户端）
        this.clientMessageNames = []; // 上行消息（客户端->服务器）
        this.messageMetadata = {}; // 消息元数据（包含注释信息）
    }

    /**
     * 加载 Protobuf 定义文件
     */
    async loadProto() {
        try {
            const protoPath = path.join(__dirname, '..', 'proto', 'messages.proto');
            const protoText = fs.readFileSync(protoPath, 'utf8');
            
            // 清理并解析proto
            const protoTextSanitized = protoText.replace(/^\s*package\s+\S+;\s*$/gm, '');
            const parsed = protobuf.parse(protoTextSanitized);
            this.protoRoot = parsed.root;
            
            // 解析消息和注释
            this.parseProtoMessages(protoText);
            
            console.log('✅ Protobuf 定义加载成功');
            console.log(`📤 下行消息 (服务器->客户端): ${this.serverMessageNames.length} 个`);
            console.log(`📥 上行消息 (客户端->服务器): ${this.clientMessageNames.length} 个`);
            
            return true;
        } catch (error) {
            console.error('❌ Protobuf 加载失败:', error.message);
            return false;
        }
    }

    /**
     * 解析 Protobuf 消息和注释
     */
    parseProtoMessages(protoText) {
        const lines = protoText.split(/\r?\n/);
        
        // 找到两个package的位置
        const upIndex = lines.findIndex(l => /^\s*package\s+rm_client_up\s*;/.test(l));
        const downIndex = lines.findIndex(l => /^\s*package\s+rm_client_down\s*;/.test(l));
        
        // 解析上行消息（客户端->服务器）
        if (upIndex !== -1) {
            const endIdx = downIndex !== -1 ? downIndex : lines.length;
            this.parseMessageBlock(lines, upIndex + 1, endIdx, 'client');
        }
        
        // 解析下行消息（服务器->客户端）
        if (downIndex !== -1) {
            this.parseMessageBlock(lines, downIndex + 1, lines.length, 'server');
        }
    }

    /**
     * 解析消息块
     */
    parseMessageBlock(lines, startIdx, endIdx, type) {
        let currentMessage = null;
        let currentField = null;
        let messageComments = [];
        let fieldComments = [];
            
        for (let i = startIdx; i < endIdx; i++) {
            const line = lines[i].trim();
            
            // 收集注释（区分消息注释和字段注释）
            if (line.startsWith('//')) {
                const comment = line.replace(/^\/\/\s*/, '');
                if (!currentMessage) {
                    // 消息级注释（在 message 声明之前）
                    messageComments.push(comment);
                } else {
                    // 字段注释（在消息内部，作用于下一行字段）
                    fieldComments.push(comment);
                }
                continue;
            }
            
            // 解析消息定义
            const msgMatch = line.match(/^\s*message\s+([A-Za-z0-9_]+)\s*\{/);
            if (msgMatch) {
                currentMessage = msgMatch[1];
                
                if (type === 'server') {
                    this.serverMessageNames.push(currentMessage);
                } else {
                    this.clientMessageNames.push(currentMessage);
                }
                
                // 清理消息描述：移除序号和重复的消息名
                let cleanedDescription = messageComments.join(' ');
                // 移除 "2.2.X MessageName" 格式
                cleanedDescription = cleanedDescription.replace(/^\d+\.\d+\.\d+\s+\w+\s*/, '');
                // 移除 "用途:" 前缀（保留用途内容）
                cleanedDescription = cleanedDescription.replace(/^用途:\s*/, '');
                
                // 生成友好的显示名称：优先使用 messageDisplayNames 映射（Protocol.md），否则使用清理后的描述或消息名
                const displayName = MESSAGE_DISPLAY_NAMES[currentMessage] || cleanedDescription || currentMessage;

                this.messageMetadata[currentMessage] = {
                    type: type,
                    description: cleanedDescription,
                    displayName: displayName,
                    fields: {},
                    comments: [...messageComments],
                    enumComments: {}  // 存储字段的枚举注释
                };
                
                messageComments = [];
                fieldComments = [];
                continue;
            }
            
            // 解析字段
            if (currentMessage) {
                const fieldMatch = line.match(/^\s*(repeated\s+)?(\w+)\s+(\w+)\s*=\s*(\d+)(?:\s*\[([^\]]+)\])?;(?:\s*\/\/\s*(.*))?/);
                if (fieldMatch) {
                    const [, repeated, fieldType, fieldName, fieldNumber, options, comment] = fieldMatch;
                    
                    // 检查之前的注释中是否有枚举定义
                    let enumComment = null;
                    for (const fc of fieldComments) {
                        if (fc.includes(fieldName) && fc.includes('枚举')) {
                            enumComment = fc;
                            break;
                        }
                    }
                    
                    const fieldDesc = fieldComments.filter(fc => !fc.includes('枚举')).join(' ') || comment || '';
                    
                    this.messageMetadata[currentMessage].fields[fieldName] = {
                        type: fieldType,
                        repeated: !!repeated,
                        number: parseInt(fieldNumber),
                        options: options || '',
                        comment: comment || '',
                        description: fieldDesc,
                        enumComment: enumComment  // 保存枚举注释
                    };
                    
                    // 如果有枚举注释，也存储到消息的enumComments中
                    if (enumComment) {
                        this.messageMetadata[currentMessage].enumComments[fieldName] = enumComment;
                    }
                    
                    fieldComments = [];
                }
                
                // 消息结束
                if (line === '}') {
                    currentMessage = null;
                    fieldComments = [];
                }
            }
        }
    }

    /**
     * 获取消息类型
     */
    getMessageType(messageName) {
        if (!this.protoRoot) {
            throw new Error('Protobuf 未加载');
        }
        return this.protoRoot.lookupType(messageName);
    }

    /**
     * 获取消息元数据
     */
    getMessageMetadata(messageName) {
        return this.messageMetadata[messageName];
    }

    /**
     * 获取所有消息元数据
     */
    getAllMessageMetadata() {
        return this.messageMetadata;
    }

    /**
     * 获取服务器消息列表
     */
    getServerMessages() {
        return this.serverMessageNames;
    }

    /**
     * 获取客户端消息列表
     */
    getClientMessages() {
        return this.clientMessageNames;
    }

    /**
     * 解码消息
     */
    decodeMessage(messageName, buffer) {
        try {
            const MessageType = this.getMessageType(messageName);
            const decoded = MessageType.decode(buffer);
            return MessageType.toObject(decoded, { 
                longs: String, 
                enums: String, 
                bytes: String 
            });
        } catch (error) {
            throw new Error(`解码消息失败 (${messageName}): ${error.message}`);
        }
    }

    /**
     * 编码消息
     */
    encodeMessage(messageName, data) {
        try {
            const MessageType = this.getMessageType(messageName);
            const message = MessageType.create(data);
            return MessageType.encode(message).finish();
        } catch (error) {
            throw new Error(`编码消息失败 (${messageName}): ${error.message}`);
        }
    }

    /**
     * 验证消息数据
     */
    verifyMessage(messageName, data) {
        try {
            const MessageType = this.getMessageType(messageName);
            return MessageType.verify(data);
        } catch (error) {
            return `验证消息失败: ${error.message}`;
        }
    }
}

module.exports = ProtoLoader;