class PromQLFormatter {
    constructor() {
        this.indentSize = 2;
    }

    format(query) {
        if (!query.trim()) {
            return '';
        }

        let formatted = '';
        let indentLevel = 0;
        let inString = false;
        let stringChar = '';
        let lastChar = '';
        let nextChar = '';

        for (let i = 0; i < query.length; i++) {
            const char = query[i];
            nextChar = i + 1 < query.length ? query[i + 1] : '';

            // 处理字符串
            if ((char === '"' || char === "'") && lastChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                }
                formatted += char;
                lastChar = char;
                continue;
            }

            if (inString) {
                formatted += char;
                lastChar = char;
                continue;
            }

            // 处理括号和缩进
            switch (char) {
                case '(':
                case '{':
                case '[':
                    formatted += char;
                    if (nextChar !== ')' && nextChar !== '}' && nextChar !== ']') {
                        indentLevel = Math.max(0, indentLevel + 1); // 确保缩进级别不小于0
                        formatted += '\n' + ' '.repeat(indentLevel * this.indentSize);
                    }
                    break;

                case ')':
                case '}':
                case ']':
                    if (lastChar !== '(' && lastChar !== '{' && lastChar !== '[') {
                        indentLevel = Math.max(0, indentLevel - 1); // 确保缩进级别不小于0
                        formatted += '\n' + ' '.repeat(indentLevel * this.indentSize);
                    }
                    formatted += char;
                    break;

                case ',':
                    formatted += char;
                    if (nextChar !== ' ' && nextChar !== '\n') {
                        formatted += '\n' + ' '.repeat(indentLevel * this.indentSize);
                    }
                    break;

                default:
                    // 处理运算符周围的空格
                    if ('+-*/=!<>'.includes(char)) {
                        // 确保运算符前后有空格
                        if (lastChar !== ' ' && lastChar !== '\n' && formatted.length > 0) {
                            formatted += ' ';
                        }
                        formatted += char;
                        if (nextChar !== ' ' && nextChar !== '\n' && nextChar) {
                            formatted += ' ';
                        }
                    } else {
                        formatted += char;
                    }
            }

            lastChar = char;
        }

        return formatted;
    }
} 