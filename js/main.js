/**
 * 主入口文件
 * 用于启动 MQTT 服务器可视化控制台
 */

const VisualMQTTServer = require('./server');

/**
 * 启动服务器
 */
async function startServer() {
    const server = new VisualMQTTServer();
    
    try {
        await server.start();
        
        // 处理进程退出信号
        process.on('SIGINT', async () => {
            console.log('\n🛑 收到退出信号，正在关闭服务器...');
            await server.stop();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n🛑 收到终止信号，正在关闭服务器...');
            await server.stop();
            process.exit(0);
        });
        
        // 处理未捕获的异常
        process.on('uncaughtException', (error) => {
            console.error('❌ 未捕获的异常:', error);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ 未处理的 Promise 拒绝:', reason);
        });
        
    } catch (err) {
        console.error('❌ 启动失败:', err.message);
        process.exit(1);
    }
}

/**
 * 命令行参数处理
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const config = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--mqtt-port' && i + 1 < args.length) {
            config.mqttPort = parseInt(args[++i]);
        } else if (arg === '--http-port' && i + 1 < args.length) {
            config.httpPort = parseInt(args[++i]);
        } else if (arg === '--host' && i + 1 < args.length) {
            config.host = args[++i];
        } else if (arg === '--help' || arg === '-h') {
            showHelp();
            process.exit(0);
        }
    }
    
    return config;
}

/**
 * 显示帮助信息
 */
function showHelp() {
    console.log(`
MQTT 服务器可视化控制台 - RoboMaster 2026 自定义客户端通信协议

用法: node main.js [选项]

选项:
  --mqtt-port <port>    MQTT 服务器端口 (默认: 3333)
  --http-port <port>    HTTP 服务器端口 (默认: 2026)
  --host <host>         服务器主机地址 (默认: 127.0.0.1)
  --help, -h            显示此帮助信息

示例:
  node main.js --mqtt-port 3333 --http-port 2026 --host 127.0.0.1
  node main.js --mqtt-port 1883 --http-port 8080
    `);
}

/**
 * 主函数
 */
async function main() {
    const config = parseArguments();
    
    console.log(`
    ╔══════════════════════════════════════════════════════════╗
    ║      MQTT 服务器可视化控制台 - RoboMaster 2026           ║
    ║           江南大学霞客湾校区 MeroT 制作                  ║
    ╚══════════════════════════════════════════════════════════╝
    `);
    
    console.log('📋 配置信息:');
    console.log(`   MQTT 端口: ${config.mqttPort || 3333}`);
    console.log(`   HTTP 端口: ${config.httpPort || 2026}`);
    console.log(`   主机地址: ${config.host || '127.0.0.1'}`);
    console.log('');
    
    // 创建服务器实例
    const server = new VisualMQTTServer(
        config.mqttPort,
        config.httpPort,
        config.host
    );
    
    try {
        await server.start();
        
        // 显示启动成功信息
        console.log(`
    🚀 服务器启动成功！
    
    访问地址:
      📡 MQTT: mqtt://${config.host || '127.0.0.1'}:${config.mqttPort || 3333}
      🌐 Web 界面: http://${config.host || '127.0.0.1'}:${config.httpPort || 2026}
    
    按 Ctrl+C 停止服务器
        `);
        
        // 处理进程退出信号
        setupSignalHandlers(server);
        
    } catch (err) {
        console.error('❌ 启动失败:', err.message);
        process.exit(1);
    }
}

/**
 * 设置信号处理器
 */
function setupSignalHandlers(server) {
    process.on('SIGINT', async () => {
        console.log('\n🛑 收到退出信号，正在关闭服务器...');
        await gracefulShutdown(server);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 收到终止信号，正在关闭服务器...');
        await gracefulShutdown(server);
    });
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
        console.error('❌ 未捕获的异常:', error);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ 未处理的 Promise 拒绝:', reason);
    });
}

/**
 * 优雅关闭服务器
 */
async function gracefulShutdown(server) {
    try {
        await server.stop();
        console.log('✅ 服务器已安全关闭');
        process.exit(0);
    } catch (error) {
        console.error('❌ 关闭服务器时出错:', error);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 程序运行出错:', error);
        process.exit(1);
    });
}

// 导出模块
module.exports = {
    VisualMQTTServer,
    startServer,
    main
};