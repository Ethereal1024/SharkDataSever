let messagesData = null;
let selectedMessages = {
    uplink: null,
    downlink: null
};
        
async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        messagesData = await response.json();
        populateMessageSelectors();
        populateManualSelect();
        
        // 更新消息计数
        document.getElementById('uplinkCount').textContent = messagesData.clientMessages.length;
        document.getElementById('downlinkCount').textContent = messagesData.serverMessages.length;
        
        // 如果有消息，默认选择第一个
        if (messagesData.clientMessages.length > 0) {
            selectUplinkMessage(messagesData.clientMessages[0].name);
        }
        if (messagesData.serverMessages.length > 0) {
            selectDownlinkMessage(messagesData.serverMessages[0].name);
        }
    } catch (error) {
        console.error('加载消息定义失败:', error);
    }
}

function populateMessageSelectors() {
    const uplinkSelector = document.getElementById('uplinkMessageSelector');
    const downlinkSelector = document.getElementById('downlinkMessageSelector');
    
    // 清空现有选项（保留第一个提示选项）
    while (uplinkSelector.options.length > 1) uplinkSelector.remove(1);
    while (downlinkSelector.options.length > 1) downlinkSelector.remove(1);
    
    if (!messagesData) return;
    
    // 添加上行消息选项
    messagesData.clientMessages.forEach(msg => {
        const option = document.createElement('option');
        option.value = msg.name;
        option.textContent = msg.name + (messagesData.messageDisplayNames?.[msg.name] ? ` (${messagesData.messageDisplayNames[msg.name]})` : '');
        uplinkSelector.appendChild(option);
    });
    
    // 添加下行消息选项
    messagesData.serverMessages.forEach(msg => {
        const option = document.createElement('option');
        option.value = msg.name;
        option.textContent = msg.name + (messagesData.messageDisplayNames?.[msg.name] ? ` (${messagesData.messageDisplayNames[msg.name]})` : '');
        downlinkSelector.appendChild(option);
    });
}

function selectUplinkMessage(messageName) {
    if (!messageName) {
        showNoMessage('uplink');
        return;
    }
    
    const msg = messagesData.clientMessages.find(m => m.name === messageName);
    if (!msg) return;
    
    selectedMessages.uplink = messageName;
    document.getElementById('uplinkMessageSelector').value = messageName;
    renderUplinkMessageDetail(msg);
}

function selectDownlinkMessage(messageName) {
    if (!messageName) {
        showNoMessage('downlink');
        return;
    }
    
    const msg = messagesData.serverMessages.find(m => m.name === messageName);
    if (!msg) return;
    
    selectedMessages.downlink = messageName;
    document.getElementById('downlinkMessageSelector').value = messageName;
    renderDownlinkMessageDetail(msg);
}

function showNoMessage(type) {
    const noMessageEl = document.getElementById(`${type}NoMessage`);
    const detailEl = document.getElementById(`${type}MessageDetail`);
    
    noMessageEl.style.display = 'flex';
    detailEl.style.display = 'none';
}

function showMessageDetail(type) {
    const noMessageEl = document.getElementById(`${type}NoMessage`);
    const detailEl = document.getElementById(`${type}MessageDetail`);
    
    noMessageEl.style.display = 'none';
    detailEl.style.display = 'block';
}

function renderUplinkMessageDetail(msg) {
    const container = document.getElementById('uplinkMessageDetail');
    const meta = msg.metadata;
    
    container.innerHTML = '';
    
    // 创建消息头部
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'message-title';
    titleDiv.textContent = msg.name;
    
    const descDiv = document.createElement('div');
    descDiv.className = 'message-description';
    descDiv.textContent = meta.displayName || meta.description || '无描述';
    
    headerDiv.appendChild(titleDiv);
    headerDiv.appendChild(descDiv);
    container.appendChild(headerDiv);
    
    // 创建字段容器
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'fields-container';
    
    // 字段组
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group uplink';
    
    const groupHeader = document.createElement('div');
    groupHeader.className = 'field-group-header';
    
    const groupTitle = document.createElement('div');
    groupTitle.className = 'field-group-title';
    groupTitle.textContent = '字段列表';
    
    const groupCount = document.createElement('div');
    groupCount.className = 'field-group-count';
    groupCount.textContent = Object.keys(meta.fields).length + ' 个字段';
    
    groupHeader.appendChild(groupTitle);
    groupHeader.appendChild(groupCount);
    fieldGroup.appendChild(groupHeader);
    
    // 创建字段内容容器
    const fieldContent = document.createElement('div');
    fieldContent.className = 'field-group-content';
    
    // 添加每个字段
    Object.entries(meta.fields).forEach(([fieldName, field]) => {
        const fieldItem = document.createElement('div');
        fieldItem.className = 'field-item-expanded';
        
        // 左侧区域：字段信息
        const leftSection = document.createElement('div');
        leftSection.className = 'field-left-section';
        
        // 字段头部：名称和类型
        const fieldHeader = document.createElement('div');
        fieldHeader.className = 'field-header';
        
        const nameSpan = document.createElement('div');
        nameSpan.className = 'field-name';
        nameSpan.textContent = fieldName;
        
        const typeSpan = document.createElement('div');
        typeSpan.className = 'field-type';
        typeSpan.textContent = (field.repeated ? 'repeated ' : '') + field.type;
        
        fieldHeader.appendChild(nameSpan);
        fieldHeader.appendChild(typeSpan);
        leftSection.appendChild(fieldHeader);
        
        // 字段描述
        if (field.description || field.comment) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'field-comment-expanded';
            commentDiv.textContent = field.description || field.comment || '无说明';
            leftSection.appendChild(commentDiv);
        }
        
        // 右侧区域：接收值
        const rightSection = document.createElement('div');
        rightSection.className = 'field-right-section';
        
        const valueSection = document.createElement('div');
        valueSection.className = 'field-value-section';
        
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'field-value-display';
        valueDisplay.id = `value-${msg.name}-${fieldName}`;
        
        const emptyValue = document.createElement('span');
        emptyValue.textContent = '暂无数据';
        emptyValue.style.color = '#94a3b8';
        emptyValue.style.fontStyle = 'italic';
        valueDisplay.appendChild(emptyValue);
        
        valueSection.appendChild(valueDisplay);
        rightSection.appendChild(valueSection);
        
        fieldItem.appendChild(leftSection);
        fieldItem.appendChild(rightSection);
        fieldContent.appendChild(fieldItem);
    });
    
    fieldGroup.appendChild(fieldContent);
    
    fieldsContainer.appendChild(fieldGroup);
    container.appendChild(fieldsContainer);
    
    showMessageDetail('uplink');
}

function renderDownlinkMessageDetail(msg) {
    const container = document.getElementById('downlinkMessageDetail');
    const meta = msg.metadata;
    
    container.innerHTML = '';
    
    // 创建消息头部
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'message-title';
    titleDiv.textContent = msg.name;
    
    const descDiv = document.createElement('div');
    descDiv.className = 'message-description';
    descDiv.textContent = messagesData.messageDisplayNames?.[msg.name] || meta.displayName || meta.description || '无描述';
    
    headerDiv.appendChild(titleDiv);
    headerDiv.appendChild(descDiv);
    container.appendChild(headerDiv);
    
    // 创建字段容器
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'fields-container';
    
    // 字段组
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group downlink';
    
    const groupHeader = document.createElement('div');
    groupHeader.className = 'field-group-header';
    
    const groupTitle = document.createElement('div');
    groupTitle.className = 'field-group-title';
    groupTitle.textContent = '字段配置';
    
    const groupCount = document.createElement('div');
    groupCount.className = 'field-group-count';
    groupCount.textContent = Object.keys(meta.fields).length + ' 个字段';
    
    groupHeader.appendChild(groupTitle);
    groupHeader.appendChild(groupCount);
    fieldGroup.appendChild(groupHeader);
    
    // 创建字段内容容器
    const fieldContent = document.createElement('div');
    fieldContent.className = 'field-group-content';
    
    // 添加每个字段
    Object.entries(meta.fields).forEach(([fieldName, field]) => {
        const fieldItem = document.createElement('div');
        fieldItem.className = 'field-item-expanded';
        
        // 左侧区域：字段信息
        const leftSection = document.createElement('div');
        leftSection.className = 'field-left-section';
        
        // 字段头部：名称和类型
        const fieldHeader = document.createElement('div');
        fieldHeader.className = 'field-header';
        
        const nameSpan = document.createElement('div');
        nameSpan.className = 'field-name';
        nameSpan.textContent = fieldName;
        
        const typeSpan = document.createElement('div');
        typeSpan.className = 'field-type';
        typeSpan.textContent = (field.repeated ? 'repeated ' : '') + field.type;
        
        fieldHeader.appendChild(nameSpan);
        fieldHeader.appendChild(typeSpan);
        leftSection.appendChild(fieldHeader);
        
        // 字段描述
        if (field.description || field.comment) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'field-comment-expanded';
            commentDiv.textContent = field.description || field.comment || '无说明';
            leftSection.appendChild(commentDiv);
        }
        
        // 右侧区域：输入控件
        const rightSection = document.createElement('div');
        rightSection.className = 'field-right-section';
        
        const inputSection = document.createElement('div');
        inputSection.className = 'field-value-section';
        
        const inputElement = createFieldInput(msg.name, fieldName, field);
        inputSection.appendChild(inputElement);
        rightSection.appendChild(inputSection);
        
        fieldItem.appendChild(leftSection);
        fieldItem.appendChild(rightSection);
        fieldContent.appendChild(fieldItem);
    });
    
    fieldGroup.appendChild(fieldContent);
    
    // 添加发送按钮区域
    const sendArea = document.createElement('div');
    sendArea.style.marginTop = '20px';
    sendArea.style.paddingTop = '15px';
    sendArea.style.borderTop = '1px solid #334155';
    
    const controlRow = document.createElement('div');
    controlRow.style.display = 'flex';
    controlRow.style.gap = '15px';
    controlRow.style.alignItems = 'center';
    controlRow.style.flexWrap = 'wrap';
    
    const sendBtn = document.createElement('button');
    sendBtn.className = 'send-message-btn';
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 发送此消息';
    sendBtn.onclick = () => sendDownlinkMessage(msg.name);
    sendBtn.style.width = 'auto';
    sendBtn.style.padding = '8px 15px';
    sendBtn.style.flexShrink = '0';
    
    const freqLabel = document.createElement('label');
    freqLabel.className = 'form-label';
    freqLabel.textContent = '频率(Hz)';
    freqLabel.style.marginBottom = '0';
    freqLabel.style.flexShrink = '0';
    
    const freqInput = document.createElement('input');
    freqInput.type = 'number';
    freqInput.className = 'form-input';
    freqInput.id = 'autoFreq-' + msg.name;
    freqInput.value = messagesData.messageDefaultFrequencies?.[msg.name] || 1;
    freqInput.min = 0.1;
    freqInput.step = 0.1;
    freqInput.style.width = '80px';
    freqInput.style.flexShrink = '0';
    
    const checkLabel = document.createElement('label');
    checkLabel.style.display = 'flex';
    checkLabel.style.gap = '6px';
    checkLabel.style.alignItems = 'center';
    checkLabel.style.fontSize = '12px';
    checkLabel.style.color = '#e2e8f0';
    checkLabel.style.flexShrink = '0';
    
    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.id = 'autoEnable-' + msg.name;
    checkBox.onclick = (e) => {
        e.stopPropagation();
        toggleAutoPublish(msg.name);
    };
    
    checkLabel.appendChild(checkBox);
    checkLabel.appendChild(document.createTextNode('自动发送'));
    
    controlRow.appendChild(sendBtn);
    controlRow.appendChild(freqLabel);
    controlRow.appendChild(freqInput);
    controlRow.appendChild(checkLabel);
    
    sendArea.appendChild(controlRow);
    
    fieldsContainer.appendChild(fieldGroup);
    fieldsContainer.appendChild(sendArea);
    container.appendChild(fieldsContainer);
    
    showMessageDetail('downlink');
}

function createFieldInput(messageName, fieldName, fieldMeta) {
    const inputId = `input-${messageName}-${fieldName}`;
    const description = fieldMeta.description || fieldMeta.comment || '';
    
    let mappingKey = fieldName;
    if (messageName === 'DeployModeStatusSync' && fieldName === 'status') {
        mappingKey = 'deploy_mode_status';
    } else if (messageName === 'TechCoreMotionStateSync' && fieldName === 'status') {
        mappingKey = 'core_status';
    }
    
    const statusOptions = messagesData.statusMappings?.[mappingKey];
    if (statusOptions && statusOptions.length > 0) {
        const select = document.createElement('select');
        select.className = 'field-input-expanded';
        select.id = inputId;
        select.setAttribute('data-type', fieldMeta.type);
        
        statusOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = `${opt.value}: ${opt.label}`;
            select.appendChild(option);
        });
        
        return select;
    }
    
    if (fieldMeta.type === 'bool') {
        const select = document.createElement('select');
        select.className = 'field-input-expanded';
        select.id = inputId;
        select.setAttribute('data-type', 'bool');
        
        let falseText = '抬起/否';
        let trueText = '按下/是';
        
        if (description.includes('false') || description.includes('true')) {
            const match = description.match(/(false|抬起|否)[^a-zA-Z]*[:：=]?([^,，)]+).*?(true|按下|是)[^a-zA-Z]*[:：=]?([^,，)]+)/i);
            if (match) {
                falseText = match[2]?.trim() || '抬起/否';
                trueText = match[4]?.trim() || '按下/是';
            }
        }
        
        const falseOption = document.createElement('option');
        falseOption.value = 'false';
        falseOption.textContent = `false: ${falseText}`;
        select.appendChild(falseOption);
        
        const trueOption = document.createElement('option');
        trueOption.value = 'true';
        trueOption.textContent = `true: ${trueText}`;
        select.appendChild(trueOption);
        
        return select;
    }
    
    const enumComment = fieldMeta.enumComment;
    if (enumComment || (fieldMeta.type === 'uint32' && description.includes('枚举'))) {
        const enumOptions = parseEnumOptions(enumComment || description);
        if (enumOptions.length > 0) {
            const select = document.createElement('select');
            select.className = 'field-input-expanded';
            select.id = inputId;
            select.setAttribute('data-type', 'uint32');
            
            enumOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = `${opt.value}: ${opt.label}`;
                select.appendChild(option);
            });
            
            return select;
        }
    }
    
    if (fieldMeta.repeated) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'field-input-expanded';
        input.id = inputId;
        input.setAttribute('data-type', fieldMeta.type);
        input.setAttribute('data-repeated', 'true');
        input.placeholder = '[1, 2, 3]';
        input.value = '[]';
        return input;
    }
    
    if (fieldMeta.type === 'uint32' || fieldMeta.type === 'int32') {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'field-input-expanded';
        input.id = inputId;
        input.setAttribute('data-type', fieldMeta.type);
        input.placeholder = '0';
        input.value = '0';
        return input;
    }
    
    if (fieldMeta.type === 'float' || fieldMeta.type === 'double') {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.className = 'field-input-expanded';
        input.id = inputId;
        input.setAttribute('data-type', fieldMeta.type);
        input.placeholder = '0.0';
        input.value = '0.0';
        return input;
    }
    
    if (fieldMeta.type === 'string') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'field-input-expanded';
        input.id = inputId;
        input.setAttribute('data-type', 'string');
        input.placeholder = '文本内容';
        input.value = '';
        return input;
    }
    
    if (fieldMeta.type === 'bytes') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'field-input-expanded';
        input.id = inputId;
        input.setAttribute('data-type', 'bytes');
        input.placeholder = '文本内容或Base64';
        input.value = '';
        return input;
    }
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'field-input-expanded';
    input.id = inputId;
    input.setAttribute('data-type', fieldMeta.type);
    input.placeholder = '值';
    input.value = '';
    return input;
}

function parseEnumOptions(description) {
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

// 以下函数保持原有功能，但需要适配新UI
async function sendDownlinkMessage(messageType) {
    try {
        const msg = messagesData.serverMessages.find(m => m.name === messageType);
        if (!msg) return;
        
        const data = {};
        
        for (const [fieldName, fieldMeta] of Object.entries(msg.metadata.fields)) {
            const inputId = 'input-' + messageType + '-' + fieldName;
            const inputElement = document.getElementById(inputId);
            
            if (!inputElement) continue;
            
            const dataType = inputElement.getAttribute('data-type');
            const isRepeated = inputElement.getAttribute('data-repeated') === 'true';
            let value = inputElement.value;
            
            if (isRepeated) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = [];
                }
            } else if (dataType === 'bool') {
                value = value === 'true';
            } else if (dataType === 'uint32' || dataType === 'int32') {
                value = parseInt(value) || 0;
            } else if (dataType === 'float' || dataType === 'double') {
                value = parseFloat(value) || 0.0;
            }
            
            data[fieldName] = value;
        }
        
        const response = await fetch('/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messageType: messageType,
                topic: messageType,
                data: data
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ 发送成功！\n主题: ' + result.topic + '\n大小: ' + result.size + ' 字节');
        } else {
            alert('❌ 发送失败: ' + result.error);
        }
    } catch (error) {
        alert('❌ 错误: ' + error.message);
    }
}

function collectMessageData(messageType) {
    const msg = messagesData.serverMessages.find(m => m.name === messageType);
    if (!msg) return {};
    const data = {};
    for (const [fieldName, fieldMeta] of Object.entries(msg.metadata.fields)) {
        const inputId = 'input-' + messageType + '-' + fieldName;
        const inputElement = document.getElementById(inputId);
        if (!inputElement) continue;
        const dataType = inputElement.getAttribute('data-type');
        const isRepeated = inputElement.getAttribute('data-repeated') === 'true';
        let value = inputElement.value;
        if (isRepeated) {
            try { value = JSON.parse(value); } catch (e) { value = []; }
        } else if (dataType === 'bool') { value = value === 'true'; }
        else if (dataType === 'uint32' || dataType === 'int32') { value = parseInt(value) || 0; }
        else if (dataType === 'float' || dataType === 'double') { value = parseFloat(value) || 0.0; }
        data[fieldName] = value;
    }
    return data;
}

async function toggleAutoPublish(messageType) {
    try {
        const checkbox = document.getElementById('autoEnable-' + messageType);
        const freqInput = document.getElementById('autoFreq-' + messageType);
        const enabled = checkbox.checked;
        const freqHz = parseFloat(freqInput.value) || messagesData.messageDefaultFrequencies?.[messageType] || 1;
        const intervalMs = Math.round(1000 / freqHz);
        const data = collectMessageData(messageType);

        const response = await fetch('/api/auto-publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageType, enabled, intervalMs: intervalMs, topic: messageType, data })
        });
        const result = await response.json();
        if (!result.success) {
            alert('自动发送失败: ' + (result.error || 'unknown'));
            checkbox.checked = !enabled;
        }
    } catch (error) {
        alert('自动发送发生错误: ' + error.message);
    }
}

function updateUplinkReceivedData(messageType, parsedData) {
    // 获取消息的元数据，以便知道所有字段及其类型
    const messageMeta = messagesData?.clientMessages?.find(m => m.name === messageType)?.metadata;
    
    // 如果没有元数据，使用默认逻辑
    if (!messageMeta || !messageMeta.fields) {
        console.warn(`未找到消息 ${messageType} 的元数据，使用默认更新逻辑`);
        updateUplinkReceivedDataFallback(messageType, parsedData);
        return;
    }
    
    // 获取所有字段的默认值
    const fieldDefaults = {};
    Object.entries(messageMeta.fields).forEach(([fieldName, fieldMeta]) => {
        // 根据字段类型设置默认值
        if (fieldMeta.type === 'bool') {
            fieldDefaults[fieldName] = false;
        } else if (fieldMeta.type === 'uint32' || fieldMeta.type === 'int32' || 
                   fieldMeta.type === 'float' || fieldMeta.type === 'double') {
            fieldDefaults[fieldName] = 0;
        } else if (fieldMeta.type === 'string') {
            fieldDefaults[fieldName] = '';
        } else if (fieldMeta.type === 'bytes') {
            fieldDefaults[fieldName] = '';
        } else {
            fieldDefaults[fieldName] = '';
        }
    });
    
    // 合并接收到的数据（覆盖默认值）
    const allFieldData = { ...fieldDefaults };
    for (const [fieldName, fieldInfo] of Object.entries(parsedData)) {
        if (fieldInfo.value !== undefined) {
            allFieldData[fieldName] = fieldInfo.value;
        }
    }
    
    // 更新所有字段
    for (const [fieldName, fieldValue] of Object.entries(allFieldData)) {
        // 用户观察到通信历史中的字段名使用的是小驼峰命名法(camelCase)
        // 上行消息界面期望的可能是snake_case（因为Protobuf原始定义是snake_case）
        // 我们需要将camelCase转换为snake_case
        
        // 将camelCase转换为snake_case
        const snakeCaseFieldName = camelToSnake(fieldName);
        
        // 尝试多种可能的ID格式（优先尝试snake_case，因为上行消息界面可能使用原始Protobuf字段名）
        const possibleIds = [
            'value-' + messageType + '-' + snakeCaseFieldName,      // snake_case（最可能）
            'value-' + messageType + '-' + fieldName,               // 原始camelCase
            'value-' + messageType.toLowerCase() + '-' + snakeCaseFieldName,  // 消息类型小写 + snake_case
            'value-' + messageType.toLowerCase() + '-' + fieldName,           // 消息类型小写 + camelCase
            // 尝试其他可能的变体
            'value-' + messageType + '-' + fieldName.toLowerCase(),           // 全小写
            'value-' + messageType + '-' + fieldName.toUpperCase(),           // 全大写
            // 尝试消息类型的不同变体
            'value-' + messageType.toUpperCase() + '-' + snakeCaseFieldName,  // 消息类型大写 + snake_case
            'value-' + messageType.toUpperCase() + '-' + fieldName            // 消息类型大写 + camelCase
        ];
        
        let valueEl = null;
        let foundId = null;
        for (const id of possibleIds) {
            valueEl = document.getElementById(id);
            if (valueEl) {
                foundId = id;
                console.log(`找到元素ID: ${id} (原始字段名: ${fieldName}, 转换后: ${snakeCaseFieldName})`);
                break;
            }
        }
        
        if (valueEl) {
            valueEl.innerHTML = '';
            
            // 只显示字段值，不显示描述和时间戳
            const valueDiv = document.createElement('div');
            valueDiv.className = 'field-value-received';
            
            // 显示字段值（包括默认值）
            valueDiv.textContent = String(fieldValue);
            valueEl.appendChild(valueDiv);
        } else {
            console.warn(`未找到字段元素: ${fieldName} (camelCase), 尝试的ID: ${possibleIds.join(', ')}`);
            
            // 调试：输出页面上所有相关的元素ID
            const allElements = document.querySelectorAll('[id^="value-' + messageType + '-"]');
            if (allElements.length > 0) {
                console.log(`页面上存在的相关元素ID:`);
                allElements.forEach(el => console.log(`  ${el.id}`));
            }
        }
    }
}

// 备用更新逻辑（当没有元数据时使用）
function updateUplinkReceivedDataFallback(messageType, parsedData) {
    for (const [fieldName, fieldInfo] of Object.entries(parsedData)) {
        // 将camelCase转换为snake_case
        const snakeCaseFieldName = camelToSnake(fieldName);
        
        // 尝试多种可能的ID格式
        const possibleIds = [
            'value-' + messageType + '-' + snakeCaseFieldName,
            'value-' + messageType + '-' + fieldName,
            'value-' + messageType.toLowerCase() + '-' + snakeCaseFieldName,
            'value-' + messageType.toLowerCase() + '-' + fieldName,
            'value-' + messageType + '-' + fieldName.toLowerCase(),
            'value-' + messageType + '-' + fieldName.toUpperCase(),
            'value-' + messageType.toUpperCase() + '-' + snakeCaseFieldName,
            'value-' + messageType.toUpperCase() + '-' + fieldName
        ];
        
        let valueEl = null;
        for (const id of possibleIds) {
            valueEl = document.getElementById(id);
            if (valueEl) {
                console.log(`找到元素ID: ${id} (原始字段名: ${fieldName}, 转换后: ${snakeCaseFieldName})`);
                break;
            }
        }
        
        if (valueEl) {
            valueEl.innerHTML = '';
            const valueDiv = document.createElement('div');
            valueDiv.className = 'field-value-received';
            valueDiv.textContent = fieldInfo.value !== undefined ? String(fieldInfo.value) : '';
            valueEl.appendChild(valueDiv);
        } else {
            console.warn(`未找到字段元素: ${fieldName}, 尝试的ID: ${possibleIds.join(', ')}`);
        }
    }
}

// 辅助函数：camelCase 转 snake_case（主要转换函数）
function camelToSnake(str) {
    // 将camelCase转换为snake_case
    // 例如：mouseX → mouse_x, leftButtonDown → left_button_down
    // 注意：处理连续大写字母的情况，如 "RFID" → "rfid"
    return str
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')  // 处理连续大写，如 "RFIDModule" → "RFID_Module"
        .replace(/([a-z])([A-Z])/g, '$1_$2')        // 处理小写后跟大写，如 "mouseX" → "mouse_X"
        .toLowerCase();                             // 全部转为小写
}

// 辅助函数：snake_case 转 camelCase（备用）
function snakeToCamel(str) {
    // 将snake_case转换为camelCase
    // 例如：mouse_x → mouseX, left_button_down → leftButtonDown
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

async function refreshHistory() {
    try {
        const response = await fetch('/api/uplink-history');
        const history = await response.json();
        
        const container = document.getElementById('historyPanel');
        
        if (history.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无消息</p>';
            return;
        }
        
        let html = '';
        history.forEach(item => {
            let dataDisplay = '';
            if (item.parsedData && Object.keys(item.parsedData).length > 0) {
                // 使用网格布局显示字段
                dataDisplay = '<div class="field-grid-compact">';
                for (const [fieldName, fieldInfo] of Object.entries(item.parsedData)) {
                    dataDisplay += `
                        <div class="field-grid-item">
                            <div class="field-grid-name">${fieldName}</div>
                            <div class="field-grid-value">${fieldInfo.display}</div>
                            ${fieldInfo.description ? `<div class="field-grid-desc">💡 ${fieldInfo.description}</div>` : ''}
                        </div>
                    `;
                }
                dataDisplay += '</div>';
            } else {
                dataDisplay = `<div class="history-data">${JSON.stringify(item.data, null, 2)}</div>`;
            }
            
            html += `
                <div class="history-item">
                    <div class="history-header">
                        <div>
                            <span class="history-type">${item.messageType}</span>
                            <span style="color: #999; font-size: 12px;">客户端: ${item.clientId}</span>
                        </div>
                        <span class="history-time">${new Date(item.timestamp).toLocaleString('zh-CN')}</span>
                    </div>
                    ${dataDisplay}
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('刷新历史记录失败:', error);
    }
}

// 更新上行消息界面数据（使用最新消息API）
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 13; // 13ms ≈ 75Hz，匹配RemoteControl消息频率

async function updateUplinkMessages() {
    const now = Date.now();
    
    // 限制更新频率
    if (now - lastUpdateTime < UPDATE_INTERVAL) {
        return;
    }
    
    lastUpdateTime = now;
    
    try {
        const response = await fetch('/api/uplink-latest');
        const latestMessages = await response.json();
        
        for (const item of latestMessages) {
            if (item.parsedData) {
                updateUplinkReceivedData(item.messageType, item.parsedData);
            }
        }
    } catch (error) {
        console.error('更新上行消息失败:', error);
    }
}

// 使用requestAnimationFrame进行平滑更新
function startUplinkMessageUpdates() {
    function updateLoop() {
        updateUplinkMessages();
        requestAnimationFrame(updateLoop);
    }
    requestAnimationFrame(updateLoop);
}

// 填充手动发送下拉框
function populateManualSelect() {
    const select = document.getElementById('manualMessageType');
    
    if (!messagesData || !select) return;
    
    select.innerHTML = '<option value="">请选择消息类型</option>';
    
    messagesData.serverMessages.forEach(msg => {
        const option = document.createElement('option');
        option.value = msg.name;
        option.textContent = msg.name + (messagesData.messageDisplayNames?.[msg.name] ? ` (${messagesData.messageDisplayNames[msg.name]})` : '');
        select.appendChild(option);
    });
}

// 更新手动发送模板
function updateManualTemplate() {
    const select = document.getElementById('manualMessageType');
    const textarea = document.getElementById('manualData');
    const topicInput = document.getElementById('manualTopic');
    const msgType = select.value;
    
    if (!msgType || !messagesData) return;
    
    topicInput.value = msgType;
    
    const msg = messagesData.serverMessages.find(m => m.name === msgType);
    if (!msg) return;
    
    // 生成示例数据
    const template = {};
    Object.entries(msg.metadata.fields).forEach(([fieldName, field]) => {
        if (field.repeated) {
            template[fieldName] = [];
        } else if (field.type === 'uint32' || field.type === 'int32') {
            template[fieldName] = 0;
        } else if (field.type === 'float') {
            template[fieldName] = 0.0;
        } else if (field.type === 'bool') {
            template[fieldName] = false;
        } else if (field.type === 'string') {
            template[fieldName] = "";
        } else {
            template[fieldName] = null;
        }
    });
    
    textarea.value = JSON.stringify(template, null, 2);
}

// 手动发送消息
async function publishManual() {
    const msgType = document.getElementById('manualMessageType').value;
    const topic = document.getElementById('manualTopic').value;
    const dataText = document.getElementById('manualData').value;
    const resultDiv = document.getElementById('publishResult');
    
    if (!msgType) {
        resultDiv.innerHTML = '<p style="color: #dc3545;">请选择消息类型</p>';
        return;
    }
    
    try {
        const data = JSON.parse(dataText);
        
        const response = await fetch('/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messageType: msgType,
                topic: topic || msgType,
                data: data
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            resultDiv.innerHTML = `<p style="color: #28a745;">✅ 发送成功！主题: ${result.topic}, 大小: ${result.size} 字节</p>`;
        } else {
            resultDiv.innerHTML = `<p style="color: #dc3545;">❌ 发送失败: ${result.error}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: #dc3545;">❌ 错误: ${error.message}</p>`;
    }
}

// 清除历史记录
async function clearHistory() {
    try {
        const response = await fetch('/api/clear-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ 历史记录已清除');
            refreshHistory(); // 刷新历史面板
        } else {
            alert('❌ 清除失败: ' + result.error);
        }
    } catch (error) {
        alert('❌ 错误: ' + error.message);
    }
}

// 分页控制
let currentPage = 1;
let isScrolling = false;

function initPageNavigation() {
    // 检查页面元素是否存在
    const page1 = document.querySelector('.page-1');
    const page2 = document.querySelector('.page-2');
    
    if (!page1 || !page2) {
        console.warn('页面导航元素未找到，跳过分页初始化');
        return;
    }
    
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    // 初始化页面状态
    updatePageVisibility();
}

function handleWheel(event) {
    if (isScrolling) return;
    
    // 检查页面元素是否存在
    const page1 = document.querySelector('.page-1');
    const page2 = document.querySelector('.page-2');
    
    if (!page1 || !page2) return;
    
    // 阻止默认滚动行为
    event.preventDefault();
    
    // 检测滚动方向
    const delta = Math.sign(event.deltaY);
    
    if (delta > 0 && currentPage === 1) {
        // 向下滚动，从第一页切换到第二页
        switchToPage(2);
    } else if (delta < 0 && currentPage === 2) {
        // 向上滚动，从第二页切换回第一页
        switchToPage(1);
    }
}

function switchToPage(pageNumber) {
    if (isScrolling) return;
    
    // 检查页面元素是否存在
    const page1 = document.querySelector('.page-1');
    const page2 = document.querySelector('.page-2');
    
    if (!page1 || !page2) return;
    
    isScrolling = true;
    currentPage = pageNumber;
    
    // 更新页面可见性
    updatePageVisibility();
    
    // 重置滚动锁定
    setTimeout(() => {
        isScrolling = false;
    }, 500);
}

function updatePageVisibility() {
    const page1 = document.querySelector('.page-1');
    const page2 = document.querySelector('.page-2');
    
    if (!page1 || !page2) return;
    
    if (currentPage === 1) {
        page1.classList.add('active');
        page2.classList.remove('active');
    } else {
        page1.classList.remove('active');
        page2.classList.add('active');
    }
}

// 初始化
loadMessages();
setInterval(refreshHistory, 2000);
startUplinkMessageUpdates(); // 使用requestAnimationFrame进行75Hz更新
initPageNavigation();
