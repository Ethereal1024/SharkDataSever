/**
 * HTML 界面生成模块 - 使用模板文件
 */

const fs = require('fs');
const path = require('path');

class HTMLGenerator {
    constructor() {
        this.templatesDir = path.join(__dirname, 'templates');
    }

    /**
     * 读取模板文件
     */
    readTemplateFile(filename) {
        const filePath = path.join(this.templatesDir, filename);
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error(`❌ 读取模板文件失败: ${filename}`, error.message);
            return '';
        }
    }

    /**
     * 生成完整的 HTML 页面
     */
    generateHTML() {
        // 读取模板文件
        const htmlTemplate = this.readTemplateFile('html-template.html');
        const cssContent = this.readTemplateFile('css-styles.css');
        const jsContent = this.readTemplateFile('javascript-code.js');

        // 替换模板中的占位符
        let html = htmlTemplate
            .replace('{{CSS_CONTENT}}', cssContent)
            .replace('{{JAVASCRIPT_CONTENT}}', jsContent);

        return html;
    }

    /**
     * 获取 CSS 样式（向后兼容）
     */
    getCSS() {
        return this.readTemplateFile('css-styles.css');
    }

    /**
     * 获取 JavaScript 代码（向后兼容）
     */
    getJavaScript() {
        return this.readTemplateFile('javascript-code.js');
    }
}

module.exports = HTMLGenerator;