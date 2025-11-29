#!/bin/bash

# 完整的安装和测试脚本 (Linux/macOS)
# 使用方法: chmod +x install-and-run.sh && ./install-and-run.sh

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印函数
print_header() {
    clear
    echo -e "${MAGENTA}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║       🚀 SharkDataServer 完整安装和运行脚本 🚀           ║"
    echo "║                                                           ║"
    echo "║    UDP 视频流 + MQTT 数据发送模拟服务器                   ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}━━━ $1 ━━━${NC}"
}

# 检查操作系统
check_os() {
    print_step "检查操作系统"
    
    OS_TYPE=$(uname -s)
    case "$OS_TYPE" in
        Linux*)
            print_success "操作系统: Linux"
            ;;
        Darwin*)
            print_success "操作系统: macOS"
            ;;
        *)
            print_warning "未识别的操作系统: $OS_TYPE"
            ;;
    esac
    echo ""
}

# 检查 Node.js
check_nodejs() {
    print_step "检查 Node.js"
    
    if ! command -v node &> /dev/null; then
        print_error "未安装 Node.js"
        echo ""
        print_info "请访问以下网址安装 Node.js (建议 v14 或更高版本):"
        print_info "https://nodejs.org/"
        echo ""
        print_info "Linux 用户可以使用以下命令安装:"
        echo "  Ubuntu/Debian: sudo apt-get install nodejs npm"
        echo "  CentOS/RHEL:   sudo yum install nodejs npm"
        echo "  Arch:          sudo pacman -S nodejs npm"
        echo ""
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    
    print_success "Node.js: $NODE_VERSION"
    print_success "npm: $NPM_VERSION"
    echo ""
}

# 安装依赖
install_dependencies() {
    print_step "安装依赖"
    
    if [ -d "node_modules" ]; then
        print_info "node_modules 已存在"
        read -p "是否重新安装依赖? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "删除旧的 node_modules..."
            rm -rf node_modules package-lock.json
        else
            print_success "跳过依赖安装"
            echo ""
            return
        fi
    fi
    
    print_info "正在安装依赖包..."
    print_warning "这可能需要几分钟时间，请耐心等待..."
    echo ""
    
    npm install
    
    if [ $? -ne 0 ]; then
        print_error "依赖安装失败"
        echo ""
        print_info "常见解决方案:"
        echo "  1. 检查网络连接"
        echo "  2. 尝试使用淘宝镜像: npm install --registry=https://registry.npmmirror.com"
        echo "  3. 清除缓存: npm cache clean --force"
        echo ""
        exit 1
    fi
    
    print_success "依赖安装完成"
    echo ""
}

# 检查视频源
check_video_source() {
    print_step "检查视频源"
    
    if [ ! -d "VideoSource" ]; then
        print_warning "VideoSource 文件夹不存在，正在创建..."
        mkdir -p VideoSource
    fi
    
    VIDEO_COUNT=$(find VideoSource -type f \( -name "*.mp4" -o -name "*.avi" -o -name "*.mov" \) 2>/dev/null | wc -l)
    
    if [ $VIDEO_COUNT -eq 0 ]; then
        print_warning "VideoSource 文件夹中没有视频文件"
        print_info "建议添加至少一个视频文件到 VideoSource 文件夹"
        print_info "支持的格式: .mp4, .avi, .mov"
    else
        print_success "找到 $VIDEO_COUNT 个视频文件"
    fi
    echo ""
}

# 设置脚本权限
set_permissions() {
    print_step "设置脚本执行权限"
    
    chmod +x start.sh test-mqtt.sh test-udp.sh install-and-run.sh 2>/dev/null
    
    print_success "执行权限设置完成"
    echo ""
}

# 显示菜单
show_menu() {
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    请选择操作                         ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "  1) 启动服务器"
    echo "  2) 测试 MQTT 客户端"
    echo "  3) 测试 UDP 视频流客户端"
    echo "  4) 同时启动服务器和测试客户端 (已废弃，客户端都被我删了)"
    echo "  5) 查看使用说明"
    echo "  6) 退出"
    echo ""
    echo -n "请输入选项 [1-6]: "
}

# 启动服务器
start_server() {
    print_step "启动服务器"
    echo ""
    
    trap 'echo ""; print_info "服务器已停止"; return' INT TERM
    
    node server.js
}

# 测试 MQTT
test_mqtt() {
    print_step "启动 MQTT 测试客户端"
    echo ""
    
    trap 'echo ""; print_info "MQTT 客户端已停止"; return' INT TERM
    
    node test-mqtt-client.js
}

# 测试 UDP
test_udp() {
    print_step "启动 UDP 测试客户端"
    echo ""
    
    trap 'echo ""; print_info "UDP 客户端已停止"; return' INT TERM
    
    node test-udp-client.js
}

# 同时启动服务器和测试
start_all() {
    print_step "同时启动服务器和测试客户端"
    echo ""
    
    print_info "提示: 这将打开多个终端窗口"
    print_info "如果失败，请手动在不同终端窗口中运行:"
    print_info "  终端1: ./start.sh"
    print_info "  终端2: ./test-mqtt.sh"
    print_info "  终端3: ./test-udp.sh"
    echo ""
    
    # 检测终端类型并启动
    if command -v gnome-terminal &> /dev/null; then
        # GNOME Terminal
        gnome-terminal -- bash -c "./start.sh; exec bash" &
        sleep 2
        gnome-terminal -- bash -c "./test-mqtt.sh; exec bash" &
        gnome-terminal -- bash -c "./test-udp.sh; exec bash" &
        print_success "已在新终端窗口中启动服务"
    elif command -v xterm &> /dev/null; then
        # xterm
        xterm -e "./start.sh" &
        sleep 2
        xterm -e "./test-mqtt.sh" &
        xterm -e "./test-udp.sh" &
        print_success "已在新终端窗口中启动服务"
    elif command -v konsole &> /dev/null; then
        # KDE Konsole
        konsole -e "./start.sh" &
        sleep 2
        konsole -e "./test-mqtt.sh" &
        konsole -e "./test-udp.sh" &
        print_success "已在新终端窗口中启动服务"
    else
        print_warning "未检测到支持的终端模拟器"
        print_info "请手动在不同终端窗口中运行上述命令"
    fi
    
    echo ""
    read -p "按任意键继续..." -n 1
}

# 显示使用说明
show_help() {
    clear
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}           SharkDataServer 使用说明${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo "📋 项目简介:"
    echo "  集成 UDP 视频流发送和 MQTT 数据发送的 Node.js 模拟服务器"
    echo ""
    echo "🎯 主要功能:"
    echo "  • UDP 视频流 (端口 3334): 发送 HEVC 格式视频流"
    echo "  • MQTT 服务 (端口 3333): 发送 Protobuf 序列化的机器人数据"
    echo ""
    echo "🚀 快速启动:"
    echo "  1. 确保 VideoSource 文件夹中有视频文件"
    echo "  2. 运行 ./start.sh 启动服务器"
    echo "  3. 在新终端中运行 ./test-mqtt.sh 测试 MQTT"
    echo "  4. 在新终端中运行 ./test-udp.sh 测试 UDP"
    echo ""
    echo "📁 重要文件:"
    echo "  • server.js - 主服务器"
    echo "  • proto/messages.proto - Protobuf 消息定义"
    echo "  • VideoSource/ - 视频源文件夹"
    echo "  • README.md - 详细文档"
    echo ""
    echo "🔧 配置端口:"
    echo "  编辑 server.js 中的 CONFIG 对象修改端口"
    echo ""
    echo "❓ 常见问题:"
    echo "  • 端口被占用: 修改配置中的端口号"
    echo "  • 找不到视频: 添加视频文件到 VideoSource 文件夹"
    echo "  • FFmpeg 错误: 检查视频文件格式是否支持"
    echo ""
    echo "📖 详细文档: cat README.md"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    read -p "按任意键返回菜单..." -n 1
}

# 主循环
main_loop() {
    while true; do
        clear
        print_header
        show_menu
        
        read -r choice
        
        case $choice in
            1)
                clear
                start_server
                ;;
            2)
                clear
                test_mqtt
                ;;
            3)
                clear
                test_udp
                ;;
            4)
                clear
                start_all
                ;;
            5)
                show_help
                ;;
            6)
                print_info "退出程序"
                exit 0
                ;;
            *)
                print_error "无效的选项"
                sleep 1
                ;;
        esac
    done
}

# 主函数
main() {
    print_header
    
    # 执行检查
    check_os
    check_nodejs
    install_dependencies
    check_video_source
    set_permissions
    
    print_success "环境检查和依赖安装完成！"
    echo ""
    sleep 2
    
    # 进入主循环
    main_loop
}

# 运行主函数
main
