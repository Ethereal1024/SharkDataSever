/**
 * 字段值解析和转换模块
 */

const { STATUS_MAPPINGS } = require('./constants');

class FieldParser {
    constructor() {
        this.statusMappings = STATUS_MAPPINGS;
    }

    /**
     * 解析字段值
     */
    parseFieldValues(messageType, data, messageMetadata) {
        const metadata = messageMetadata[messageType];
        if (!metadata || !metadata.fields) return {};

        const parsed = {};
        
        for (const [fieldName, value] of Object.entries(data)) {
            // 尝试查找字段元数据（支持camelCase和snake_case）
            let fieldMeta = metadata.fields[fieldName];
            if (!fieldMeta) {
                // 尝试转换为snake_case
                const snakeName = fieldName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
                fieldMeta = metadata.fields[snakeName];
            }
            if (!fieldMeta) {
                // 尝试转换为camelCase
                const camelName = fieldName.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                fieldMeta = metadata.fields[camelName];
            }
            
            if (!fieldMeta) {
                parsed[fieldName] = { value, display: String(value) };
                continue;
            }

            let display = String(value);
            let description = fieldMeta.description || fieldMeta.comment || '';
            
            // 优先使用 Protocol.md 的状态映射
            const statusMapping = this.statusMappings[fieldName];
            if (statusMapping && Array.isArray(statusMapping)) {
                const mapping = statusMapping.find(m => m.value === value);
                if (mapping) {
                    display = `${value} (${mapping.label})`;
                }
            }
            // 解析布尔值
            else if (fieldMeta.type === 'bool') {
                // 根据字段名称推断含义
                if (fieldName.includes('button') || fieldName.includes('down')) {
                    display = value ? '按下' : '抬起';
                } else if (fieldName.includes('is_') || fieldName.includes('can_')) {
                    display = value ? '是' : '否';
                } else if (fieldName.includes('open')) {
                    display = value ? '开启' : '关闭';
                } else if (description.includes('false') || description.includes('true')) {
                    const match = description.match(/(false|抬起|否)[^a-zA-Z]*[:：=]?([^,，)]+).*?(true|按下|是)[^a-zA-Z]*[:：=]?([^,，)]+)/i);
                    if (match) {
                        const falseText = match[2]?.trim() || '否';
                        const trueText = match[4]?.trim() || '是';
                        display = value ? trueText : falseText;
                    } else {
                        display = value ? '是' : '否';
                    }
                } else {
                    display = value ? '是' : '否';
                }
            }
            // 解析数值（带方向或状态说明）
            else if ((fieldMeta.type === 'int32' || fieldMeta.type === 'float') && description) {
                display = String(value);
                
                // 检查是否有方向说明
                if (fieldName.toLowerCase().includes('mouse')) {
                    if (value < 0) {
                        if (description.includes('向左') || fieldName.includes('_x')) display += ' (向左)';
                        else if (description.includes('向下') || fieldName.includes('_y')) display += ' (向下)';
                        else if (description.includes('向后') || fieldName.includes('_z')) display += ' (向后滚动)';
                    } else if (value > 0) {
                        if (description.includes('向左') || fieldName.includes('_x')) display += ' (向右)';
                        else if (description.includes('向下') || fieldName.includes('_y')) display += ' (向上)';
                        else if (description.includes('向后') || fieldName.includes('_z')) display += ' (向前滚动)';
                    }
                }
            }
            // 解析枚举值（作为fallback）
            else if (fieldMeta.type === 'uint32' && description) {
                const enumComment = this.findEnumComment(metadata, fieldName);
                if (enumComment) {
                    const enumValue = this.parseEnumValue(enumComment, value);
                    if (enumValue) {
                        display = `${value} (${enumValue})`;
                    }
                }
            }

            parsed[fieldName] = {
                value: value,
                display: display,
                description: description,
                type: fieldMeta.type
            };
        }

        return parsed;
    }

    /**
     * 查找枚举注释
     */
    findEnumComment(metadata, fieldName) {
        // 优先使用解析时存储的枚举注释映射
        if (metadata.enumComments && metadata.enumComments[fieldName]) {
            return metadata.enumComments[fieldName];
        }
        // 兼容性：在消息级注释中查找枚举定义（老 proto 的注释可能写在消息上方）
        if (Array.isArray(metadata.comments)) {
            for (const comment of metadata.comments) {
                if (comment.includes(fieldName) && comment.includes('枚举')) {
                    return comment;
                }
            }
        }
        return null;
    }

    /**
     * 解析枚举值
     */
    parseEnumValue(enumComment, value) {
        // 解析枚举注释，格式如: "枚举值: 0:未开始, 1:准备, 2:自检, 3:倒计时, 4:比赛中, 5:结算"
        const match = enumComment.match(/枚举[^:]*:\s*(.+)/);
        if (!match) return null;

        const enumPart = match[1];
        const pairs = enumPart.split(/[,，、]/);
        
        for (const pair of pairs) {
            const pairMatch = pair.trim().match(/^(\d+)\s*[:：]\s*(.+)/);
            if (pairMatch) {
                const enumKey = parseInt(pairMatch[1]);
                const enumValue = pairMatch[2].trim();
                if (enumKey === value) {
                    return enumValue;
                }
            }
        }
        
        return null;
    }

    /**
     * 转换键名为驼峰命名
     */
    convertKeysToCamel(value) {
        if (Array.isArray(value)) {
            return value.map(v => this.convertKeysToCamel(v));
        }
        if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
            const newObj = {};
            for (const [k, v] of Object.entries(value)) {
                const camelKey = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                newObj[camelKey] = this.convertKeysToCamel(v);
            }
            return newObj;
        }
        return value;
    }

    /**
     * 转换键名为下划线命名
     */
    convertKeysToSnake(value) {
        if (Array.isArray(value)) {
            return value.map(v => this.convertKeysToSnake(v));
        }
        if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
            const newObj = {};
            for (const [k, v] of Object.entries(value)) {
                const snakeKey = k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
                newObj[snakeKey] = this.convertKeysToSnake(v);
            }
            return newObj;
        }
        return value;
    }

    /**
     * 生成字段输入HTML
     */
    generateFieldInputHtml(messageName, fieldName, fieldMeta, statusMappings) {
        const inputId = `input-${messageName}-${fieldName}`;
        const description = fieldMeta.description || fieldMeta.comment || '';
        
        // 特殊映射：DeployModeStatusSync的status字段使用deploy_mode_status映射
        let mappingKey = fieldName;
        if (messageName === 'DeployModeStatusSync' && fieldName === 'status') {
            mappingKey = 'deploy_mode_status';
        } else if (messageName === 'TechCoreMotionStateSync' && fieldName === 'status') {
            mappingKey = 'core_status';
        }
        
        // 检查是否有状态映射（优先使用 Protocol.md 定义）
        const statusOptions = statusMappings[mappingKey];
        if (statusOptions && statusOptions.length > 0) {
            const optionsHtml = statusOptions.map(opt => 
                `<option value="${opt.value}">${opt.value}: ${opt.label}</option>`
            ).join('');
            
            return `
                <div class="field-input-section" onclick="event.stopPropagation()">
                    <div class="field-input-label">✏️ 选择状态</div>
                    <select class="field-select" id="${inputId}" data-type="${fieldMeta.type}">
                        ${optionsHtml}
                    </select>
                </div>
            `;
        }
        
        // 布尔类型 - 使用下拉框
        if (fieldMeta.type === 'bool') {
            let options = '';
            if (description.includes('false') || description.includes('true')) {
                const match = description.match(/(false|抬起|否)[^a-zA-Z]*[:：=]?([^,，)]+).*?(true|按下|是)[^a-zA-Z]*[:：=]?([^,，)]+)/i);
                if (match) {
                    const falseText = match[2]?.trim() || '抬起/否';
                    const trueText = match[4]?.trim() || '按下/是';
                    options = `
                        <option value="false">false: ${falseText}</option>
                        <option value="true">true: ${trueText}</option>
                    `;
                } else {
                    options = `
                        <option value="false">false</option>
                        <option value="true">true</option>
                    `;
                }
            } else {
                options = `
                    <option value="false">false</option>
                    <option value="true">true</option>
                `;
            }
            
            return `
                <div class="field-input-section" onclick="event.stopPropagation()">
                    <div class="field-input-label">✏️ 设置值</div>
                    <select class="field-select" id="${inputId}" data-type="bool">
                        ${options}
                    </select>
                </div>
            `;
        }
        
        // 枚举类型 - 检查是否有枚举注释（作为fallback）
        const enumComment = fieldMeta.enumComment;
        
        if (enumComment || (fieldMeta.type === 'uint32' && description.includes('枚举'))) {
            const enumOptions = this.parseEnumOptions(enumComment || description);
            if (enumOptions.length > 0) {
                const optionsHtml = enumOptions.map(opt => 
                    `<option value="${opt.value}">${opt.value}: ${opt.label}</option>`
                ).join('');
                
                return `
                    <div class="field-input-section" onclick="event.stopPropagation()">
                        <div class="field-input-label">✏️ 选择值</div>
                        <select class="field-select" id="${inputId}" data-type="uint32">
                            ${optionsHtml}
                        </select>
                    </div>
                `;
            }
        }
        
        // 数组类型 - 使用文本框，提示输入JSON数组
        if (fieldMeta.repeated) {
            return `
                <div class="field-input-section" onclick="event.stopPropagation()">
                    <div class="field-input-label">✏️ 输入值 (数组，如: [1,2,3])</div>
                    <input type="text" class="field-input" id="${inputId}" 
                           data-type="${fieldMeta.type}" data-repeated="true"
                           placeholder="[1, 2, 3]" value="[]">
                </div>
            `;
        }
        
        // 数值类型 - 使用数字输入框
        if (fieldMeta.type === 'uint32' || fieldMeta.type === 'int32') {
            return `
                <div class="field-input-section" onclick="event.stopPropagation()">
                    <div class="field-input-label">✏️ 输入值</div>
                    <input type="number" class="field-input" id="${inputId}" 
                           data-type="${fieldMeta.type}"
                           placeholder="0" value="0">
                </div>
            `;
        }
        
        // 浮点数类型
        if (fieldMeta.type === 'float' || fieldMeta.type === 'double') {
            return `
                <div class="field-input-section" onclick="event.stopPropagation()">
                    <div class="field-input-label">✏️ 输入值</div>
                    <input type="number" step="0.01" class="field-input" id="${inputId}" 
                           data-type="${fieldMeta.type}"
                           placeholder="0.0" value="0.0">
                </div>
            `;
        }
        
        // 字符串类型
        if (fieldMeta.type === 'string') {
            return `
                <div class="field-input-section" onclick="event.stopPropagation()">
                    <div class="field-input-label">✏️ 输入值</div>
                    <input type="text" class="field-input" id="${inputId}" 
                           data-type="string"
                           placeholder="文本内容" value="">
                </div>
            `;
        }
        
        // bytes类型
        if (fieldMeta.type === 'bytes') {
            return `
                <div class="field-input-section" onclick="event.stopPropagation()">
                    <div class="field-input-label">✏️ 输入值 (文本或Base64)</div>
                    <input type="text" class="field-input" id="${inputId}" 
                           data-type="bytes"
                           placeholder="文本内容" value="">
                </div>
            `;
        }
        
        // 默认文本输入框
        return `
            <div class="field-input-section" onclick="event.stopPropagation()">
                <div class="field-input-label">✏️ 输入值</div>
                <input type="text" class="field-input" id="${inputId}" 
                       data-type="${fieldMeta.type}"
                       placeholder="值" value="">
            </div>
        `;
    }

    /**
     * 解析枚举选项
     */
    parseEnumOptions(description) {
        const match = description.match(/枚举[^:]*:\s*(.+)/);
        if (!match) return [];
        
        const enumPart = match[1];
        const pairs = enumPart.split(/[,，、]/);
        const options = [];
        
        for (const pair of pairs) {
            const pairMatch = pair.trim().match(/^(\d+)\s*[:：]\s*(.+)/);
            if (pairMatch) {
                options.push({
                    value: parseInt(pairMatch[1]),
                    label: pairMatch[2].trim()
                });
            }
        }
        
        return options;
    }
}

module.exports = FieldParser;