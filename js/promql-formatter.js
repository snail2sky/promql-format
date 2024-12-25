class PromQLFormatter {
    constructor() {
        this.indentSize = 2;
        // 定义 PromQL 内建函数列表
        this.builtinFunctions = [
            'sum', 'rate', 'irate', 'by', 'without',
            'avg', 'count', 'min', 'max', 'stddev',
            'stdvar', 'count_values', 'bottomk', 'topk',
            'quantile', 'increase', 'delta', 'idelta',
            'avg_over_time', 'min_over_time', 'max_over_time',
            'sum_over_time', 'count_over_time', 'stddev_over_time',
            'stdvar_over_time', 'last_over_time', 'present_over_time'
        ];
    }

    format(query, useHighlight = false) {
        query = query.replace(/\s+/g, ' ').trim();
        
        if (!query) {
            return '';
        }

        let formatted = '';
        let indentLevel = 0;
        let inString = false;
        let stringChar = '';
        let lastChar = '';
        let nextChar = '';
        let buffer = '';

        const wrapMetric = (text) => useHighlight ? `<span class="metric">${text}</span>` : text;
        const wrapFunction = (text) => useHighlight ? `<span class="function">${text}</span>` : text;
        const wrapLabel = (text) => useHighlight ? `<span class="label">${text}</span>` : text;
        const wrapOperator = (text) => useHighlight ? `<span class="operator">${text}</span>` : text;
        const wrapBracket = (text) => useHighlight ? `<span class="bracket">${text}</span>` : text;

        const flushBuffer = () => {
            if (buffer) {
                if (this.builtinFunctions.includes(buffer.toLowerCase())) {
                    // 内建函数
                    formatted += wrapFunction(buffer);
                } else if (buffer.includes('_')) {
                    // 指标名
                    formatted += wrapMetric(buffer);
                } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(buffer)) {
                    // 标签名
                    formatted += wrapLabel(buffer);
                } else {
                    formatted += buffer;
                }
                buffer = '';
            }
        };

        for (let i = 0; i < query.length; i++) {
            const char = query[i];
            nextChar = i + 1 < query.length ? query[i + 1] : '';

            if ((char === '"' || char === "'") && lastChar !== '\\') {
                flushBuffer();
                if (!inString) {
                    inString = true;
                    stringChar = char;
                    formatted += char;
                } else if (char === stringChar) {
                    inString = false;
                    formatted += char;
                }
                lastChar = char;
                continue;
            }

            if (inString) {
                formatted += char;
                lastChar = char;
                continue;
            }

            // 处理特殊操作符
            if (char === '=' && nextChar === '~') {
                flushBuffer();
                if (lastChar !== ' ' && lastChar !== '\n') {
                    formatted += ' ';
                }
                formatted += wrapOperator('=~');
                i++;
                if (i + 1 < query.length && query[i + 1] !== ' ' && query[i + 1] !== '\n') {
                    formatted += ' ';
                }
                lastChar = '~';
                continue;
            }

            switch (char) {
                case '(':
                case '{':
                case '[':
                    flushBuffer();
                    formatted += wrapBracket(char) + '\n';
                    indentLevel++;
                    formatted += ' '.repeat(indentLevel * this.indentSize);
                    break;

                case ')':
                case '}':
                case ']':
                    flushBuffer();
                    if (lastChar !== '(' && lastChar !== '{' && lastChar !== '[') {
                        indentLevel = Math.max(0, indentLevel - 1);
                        formatted += '\n' + ' '.repeat(indentLevel * this.indentSize);
                    }
                    formatted += wrapBracket(char);
                    break;

                case ',':
                    flushBuffer();
                    formatted += wrapOperator(char) + '\n' + ' '.repeat(indentLevel * this.indentSize);
                    break;

                case ' ':
                    flushBuffer();
                    if (lastChar !== ' ' && lastChar !== '\n' && lastChar !== '(' && 
                        nextChar !== ')' && nextChar !== '}' && nextChar !== ']' && 
                        nextChar !== ',' && lastChar !== ',') {
                        formatted += char;
                    }
                    break;

                case '/':
                case '*':
                case '+':
                case '-':
                case '<':
                case '>':
                    flushBuffer();
                    if (lastChar !== ' ' && lastChar !== '\n') {
                        formatted += ' ';
                    }
                    formatted += wrapOperator(char);
                    if (nextChar !== ' ' && nextChar !== '\n' && nextChar) {
                        formatted += ' ';
                    }
                    break;

                default:
                    if (formatted.endsWith('\n')) {
                        formatted += ' '.repeat(indentLevel * this.indentSize);
                    }
                    buffer += char;
            }

            lastChar = char;
        }

        flushBuffer();

        let lines = formatted.split('\n');
        lines = lines
            .map(line => line.trimRight())
            .filter(line => line.trim() !== '');

        return lines.join('\n').trim();
    }
} 