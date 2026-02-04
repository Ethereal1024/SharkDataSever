let messagesData = null;
        
async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        messagesData = await response.json();
        renderUplinkMessages();
        renderDownlinkMessages();
        populateManualSelect();
    } catch (error) {
        console.error('加载消息定义失败:', error);
    }
}

function renderUplinkMessages() {
    const container = document.getElementById('uplinkMessages');
    const count = document.getElementById('uplinkCount');
    
    if (!messagesData || messagesData.clientMessages.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无上行消息</p>';
        count.textContent = '0';
        return;
    }
    
    count.textContent = messagesData.clientMessages.length;

    messagesData.clientMessages.forEach(msg => {
        const meta = msg.metadata;
        const item = document.createElement('div');
        item.className = 'message-item';
        item.setAttribute('onclick', 'toggleMessage(this)');

        const nameEl = document.createElement('div');
        nameEl.className = 'message-name';
        nameEl.textContent = msg.name;

        const descEl = document.createElement('div');
        descEl.className = 'message-desc';
        descEl.textContent = meta.displayName || meta.description || '无描述';

        const fieldList = document.createElement('div');
        fieldList.className = 'field-list';

        Object.entries(meta.fields).forEach(([fieldName, field]) => {
            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';

            const left = document.createElement('div');
            left.className = 'field-left';
            const fn = document.createElement('span'); fn.className = 'field-name'; fn.textContent = fieldName;
            const ft = document.createElement('span'); ft.className = 'field-type'; ft.textContent = '(' + (field.repeated ? 'repeated ' : '') + field.type + ')';
            const fc = document.createElement('div'); fc.className = 'field-comment'; fc.textContent = field.description || field.comment || '无说明';
            left.appendChild(fn); left.appendChild(ft); left.appendChild(fc);

            const right = document.createElement('div');
            right.className = 'field-right received';
            right.id = 'value-' + msg.name + '-' + fieldName;
            const empty = document.createElement('div'); empty.className = 'field-value-empty'; empty.textContent = '暂无数据';
            right.appendChild(empty);

            fieldItem.appendChild(left);
            fieldItem.appendChild(right);
            fieldList.appendChild(fieldItem);
        });

        item.appendChild(nameEl);
        item.appendChild(descEl);
        item.appendChild(fieldList);
        container.appendChild(item);
    });
}

function renderDownlinkMessages() {
    const container = document.getElementById('downlinkMessages');
    const count = document.getElementById('downlinkCount');

    container.innerHTML = '';
    if (!messagesData || messagesData.serverMessages.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无下行消息</p>';
        count.textContent = '0';
        return;
    }

    count.textContent = messagesData.serverMessages.length;

    messagesData.serverMessages.forEach(msg => {
        const meta = msg.metadata;
        const item = document.createElement('div');
        item.className = 'message-item';
        item.setAttribute('onclick', 'toggleMessage(this)');

        const nameEl = document.createElement('div');
        nameEl.className = 'message-name';
        nameEl.textContent = msg.name;

        const descEl = document.createElement('div');
        descEl.className = 'message-desc';
        descEl.textContent = messagesData.messageDisplayNames?.[msg.name] || meta.displayName || meta.description || '无描述';

        const fieldList = document.createElement('div');
        fieldList.className = 'field-list';

        Object.entries(meta.fields).forEach(([fieldName, field]) => {
            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';

            const left = document.createElement('div');
            left.className = 'field-left';
            const fn = document.createElement('span');
            fn.className = 'field-name';
            fn.textContent = fieldName;
            const ft = document.createElement('span');
            ft.className = 'field-type';
            ft.textContent = '(' + (field.repeated ? 'repeated ' : '') + field.type + ')';
            const fc = document.createElement('div');
            fc.className = 'field-comment';
            fc.textContent = field.description || field.comment || '无说明';
            left.appendChild(fn);
            left.appendChild(ft);
            left.appendChild(fc);

            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'field-right';
            const inputHtml = generateFieldInput(msg.name, fieldName, field);
            inputWrapper.innerHTML = inputHtml;

            fieldItem.appendChild(left);
            fieldItem.appendChild(inputWrapper);
            fieldList.appendChild(fieldItem);
        });

        const opArea = document.createElement('div');
        opArea.style.display = 'flex';
        opArea.style.gap = '10px';
        opArea.style.alignItems = 'center';
        opArea.style.marginTop = '10px';

        const sendBtn = document.createElement('button');
        sendBtn.className = 'send-message-btn';
        sendBtn.textContent = '📤 发送此消息';
        sendBtn.onclick = (e) => {
            e.stopPropagation();
            sendDownlinkMessage(msg.name);
        };

        const freqLabel = document.createElement('label');
        freqLabel.className = 'form-label';
        freqLabel.textContent = '频率(Hz)';

        const freqInput = document.createElement('input');
        freqInput.type = 'number';
        freqInput.className = 'form-input';
        freqInput.id = 'autoFreq-' + msg.name;
        freqInput.value = messagesData.messageDefaultFrequencies?.[msg.name] || 1;
        freqInput.min = 0.1;
        freqInput.step = 0.1;
        freqInput.style.width = '100px';

        const checkLabel = document.createElement('label');
        checkLabel.style.display = 'flex';
        checkLabel.style.gap = '6px';
        checkLabel.style.alignItems = 'center';
        checkLabel.style.fontSize = '12px';
        checkLabel.style.color = '#e2e8f0';

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.id = 'autoEnable-' + msg.name;
        checkBox.onclick = (e) => {
            e.stopPropagation();
            toggleAutoPublish(msg.name);
        };

        checkLabel.appendChild(checkBox);
        checkLabel.appendChild(document.createTextNode('自动发送'));

        opArea.appendChild(sendBtn);
        opArea.appendChild(freqLabel);
        opArea.appendChild(freqInput);
        opArea.appendChild(checkLabel);

        item.appendChild(nameEl);
        item.appendChild(descEl);
        item.appendChild(fieldList);
        item.appendChild(opArea);
        container.appendChild(item);
    });
}

function generateFieldInput(messageName, fieldName, fieldMeta) {
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
    
    const enumComment = fieldMeta.enumComment;
    
    if (enumComment || (fieldMeta.type === 'uint32' && description.includes('枚举'))) {
        const enumOptions = parseEnumOptions(enumComment || description);
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
    
    return `
        <div class="field-input-section" onclick="event.stopPropagation()">
            <div class="field-input-label">✏️ 输入值</div>
            <input type="text" class="field-input" id="${inputId}" 
                   data-type="${fieldMeta.type}"
                   placeholder="值" value="">
        </div>
    `;
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
    for (const [fieldName, fieldInfo] of Object.entries(parsedData)) {
        const valueEl = document.getElementById('value-' + messageType + '-' + fieldName);
        if (valueEl) {
            valueEl.innerHTML = '';
            
            const valueDiv = document.createElement('div');
            valueDiv.className = 'field-value-received';
            valueDiv.textContent = fieldInfo.display;
            valueEl.appendChild(valueDiv);
            
            if (fieldInfo.description) {
                const descDiv = document.createElement('div');
                descDiv.className = 'field-value-desc';
                descDiv.textContent = '💡 ' + fieldInfo.description;
                valueEl.appendChild(descDiv);
            }
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'field-value-time';
            timeDiv.textContent = new Date().toLocaleTimeString();
            valueEl.appendChild(timeDiv);
        }
    }
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
        
        const latestMessages = {};
        history.forEach(item => {
            if (!latestMessages[item.messageType]) {
                latestMessages[item.messageType] = item;
            }
        });
        
        for (const [messageType, item] of Object.entries(latestMessages)) {
            if (item.parsedData) {
                updateUplinkReceivedData(messageType, item.parsedData);
            }
        }
        
        let html = '';
        history.forEach(item => {
            let dataDisplay = '';
            if (item.parsedData && Object.keys(item.parsedData).length > 0) {
                dataDisplay = '<div style="margin-top: 8px;">';
                for (const [fieldName, fieldInfo] of Object.entries(item.parsedData)) {
                    dataDisplay += `
                        <div class="field-display">
                            <span class="field-display-name">${fieldName}:</span>
                            <span class="field-display-value">${fieldInfo.display}</span>
                            ${fieldInfo.description ? `<div class="field-display-desc">💡 ${fieldInfo.description}</div>` : ''}
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

function toggleMessage(element) {
    const wasActive = element.classList.contains('active');
    
    const parent = element.parentElement;
    parent.querySelectorAll('.message-item.active').forEach(item => {
        item.classList.remove('active');
    });
    
    if (!wasActive) {
        element.classList.add('active');
    }
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

loadMessages();
setInterval(refreshHistory, 2000);
