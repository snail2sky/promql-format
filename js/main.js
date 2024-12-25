// 声明全局变量
let formatter;
let inputEditor;
let outputEditor;

// 初始化工具
function initTools() {
    if (!formatter) {
        formatter = new PromQLFormatter();
    }
}

// 初始化编辑器
function initEditors() {
    // 输入编辑器
    inputEditor = CodeMirror.fromTextArea(document.getElementById('input'), {
        mode: 'promql',
        theme: 'github',
        lineNumbers: true,
        lineWrapping: true,
        autofocus: true,
        tabSize: 2,
        indentWithTabs: false,
        extraKeys: {
            'Ctrl-Enter': formatPromQL,
            'Cmd-Enter': formatPromQL
        }
    });

    // 输出编辑器
    outputEditor = CodeMirror.fromTextArea(document.getElementById('output'), {
        mode: 'promql',
        theme: 'github',
        lineNumbers: true,
        lineWrapping: true,
        readOnly: true,
        tabSize: 2
    });

    // 添加输入变化监听器
    inputEditor.on('change', debounce(autoFormat, 500));
}

// 自动格式化函数
function autoFormat() {
    const query = inputEditor.getValue().trim();
    console.log(query);
    if (query) {
        try {
            const formatted = formatter.format(query);
            outputEditor.setValue(formatted);
        } catch (error) {
            console.error('格式化错误:', error);
        }
    } else {
        outputEditor.setValue('');
    }
}

// 手动格式化函数
function formatPromQL() {
    const query = inputEditor.getValue().trim();
    if (!query) {
        showNotification('请输入 PromQL 查询语句', 'error');
        return;
    }

    try {
        const formatted = formatter.format(query);
        outputEditor.setValue(formatted);
    } catch (error) {
        console.error('格式化错误:', error);
        showNotification('格式化失败: ' + error.message, 'error');
    }
}

// 复制到剪贴板
function copyToClipboard() {
    const content = outputEditor.getValue();
    if (!content) {
        showNotification('没有可复制的内容', 'error');
        return;
    }
    
    navigator.clipboard.writeText(content).then(() => {
        showNotification('复制成功！');
    }).catch(err => {
        showNotification('复制失败: ' + err.message, 'error');
    });
}

// 显示通知
function showNotification(message, type = 'success') {
    // 移除已存在的通知
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 创建新通知
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    notification.textContent = message;
    document.body.appendChild(notification);

    // 显示通知
    notification.style.display = 'block';

    // 3秒后淡出
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 确保在 DOM 加载完成后再初始化
document.addEventListener('DOMContentLoaded', () => {
    initTools();
    initEditors();
}); 