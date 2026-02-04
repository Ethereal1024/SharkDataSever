/**
 * 测试模块化重构后的代码
 */

const VisualMQTTServer = require('./server');

async function testModularServer() {
    console.log('🧪 测试模块化重构后的 MQTT 服务器...\n');
    
    // 创建服务器实例
    const server = new VisualMQTTServer(3335, 2028, '127.0.0.1');
    
    try {
        // 1. 测试 Protobuf 加载
        console.log('1. 测试 Protobuf 加载...');
        const protoLoader = require('./proto-loader');
        const loader = new protoLoader();
        const loaded = await loader.loadProto();
        
        if (!loaded) {
            throw new Error('Protobuf 加载失败');
        }
        console.log('   ✅ Protobuf 加载成功');
        
        // 2. 测试消息列表获取
        console.log('2. 测试消息列表获取...');
        const serverMessages = loader.getServerMessages();
        const clientMessages = loader.getClientMessages();
        
        console.log(`   ✅ 下行消息: ${serverMessages.length} 个`);
        console.log(`   ✅ 上行消息: ${clientMessages.length} 个`);
        
        // 3. 测试消息元数据获取
        console.log('3. 测试消息元数据获取...');
        if (serverMessages.length > 0) {
            const metadata = loader.getMessageMetadata(serverMessages[0]);
            if (metadata && metadata.fields) {
                console.log(`   ✅ 消息 "${serverMessages[0]}" 元数据获取成功`);
                console.log(`      字段数量: ${Object.keys(metadata.fields).length}`);
            } else {
                throw new Error('消息元数据获取失败');
            }
        }
        
        // 4. 测试字段解析器
        console.log('4. 测试字段解析器...');
        const fieldParser = require('./field-parser');
        const parser = new fieldParser();
        
        // 测试字段解析功能
        const testData = { testField: 123 };
        const testMetadata = {
            fields: {
                testField: {
                    type: 'uint32',
                    description: '测试字段'
                }
            }
        };
        
        const parsed = parser.parseFieldValues('TestMessage', testData, { TestMessage: testMetadata });
        console.log(`   ✅ 字段解析成功: ${JSON.stringify(parsed)}`);
        
        // 5. 测试服务器启动
        console.log('5. 测试服务器启动...');
        await server.start();
        console.log('   ✅ 服务器启动成功');
        
        // 6. 测试服务器状态获取
        console.log('6. 测试服务器状态获取...');
        const status = server.getStatus();
        console.log(`   ✅ MQTT 状态: ${status.mqtt.isRunning ? '运行中' : '已停止'}`);
        console.log(`   ✅ HTTP 状态: ${status.http.isRunning ? '运行中' : '已停止'}`);
        
        // 7. 测试消息发布
        console.log('7. 测试消息发布...');
        if (serverMessages.length > 0) {
            const testMessage = serverMessages[0];
            const testData = {};
            
            // 获取消息字段并设置测试值
            const msgMetadata = loader.getMessageMetadata(testMessage);
            for (const [fieldName, fieldMeta] of Object.entries(msgMetadata.fields)) {
                if (fieldMeta.type === 'uint32' || fieldMeta.type === 'int32') {
                    testData[fieldName] = 100;
                } else if (fieldMeta.type === 'bool') {
                    testData[fieldName] = true;
                } else if (fieldMeta.type === 'float' || fieldMeta.type === 'double') {
                    testData[fieldName] = 1.0;
                }
            }
            
            const result = await server.publishMessage(testMessage, testData);
            console.log(`   ✅ 消息 "${testMessage}" 发布成功`);
            console.log(`      主题: ${result.topic}, 大小: ${result.size} 字节`);
        }
        
        // 8. 测试自动发布
        console.log('8. 测试自动发布...');
        if (serverMessages.length > 1) {
            const autoMessage = serverMessages[1];
            server.startAutoPublish(autoMessage, 1000); // 1秒间隔
            
            const isAutoPublishing = server.isAutoPublishing(autoMessage);
            console.log(`   ✅ 自动发布 "${autoMessage}": ${isAutoPublishing ? '已启动' : '未启动'}`);
            
            // 停止自动发布
            server.stopAutoPublish(autoMessage);
            console.log(`   ✅ 自动发布 "${autoMessage}" 已停止`);
        }
        
        // 9. 测试消息历史
        console.log('9. 测试消息历史...');
        const history = server.getReceivedMessages(5);
        console.log(`   ✅ 消息历史记录: ${history.length} 条`);
        
        // 10. 测试服务器停止
        console.log('10. 测试服务器停止...');
        await server.stop();
        console.log('   ✅ 服务器停止成功');
        
        console.log('\n🎉 所有测试通过！模块化重构成功！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error(error.stack);
        
        // 确保服务器停止
        try {
            await server.stop();
        } catch (e) {
            // 忽略停止错误
        }
        
        process.exit(1);
    }
}

// 运行测试
if (require.main === module) {
    testModularServer().catch(error => {
        console.error('❌ 测试运行出错:', error);
        process.exit(1);
    });
}

module.exports = testModularServer;