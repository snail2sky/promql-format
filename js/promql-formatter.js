class PromQLFormatter {
    constructor() {
        this.indentSize = 2;
    }

    format(query) {
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

        for (let i = 0; i < query.length; i++) {
            const char = query[i];
            nextChar = i + 1 < query.length ? query[i + 1] : '';

            if ((char === '"' || char === "'") && lastChar !== '\\') {
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
                if (lastChar !== ' ' && lastChar !== '\n') {
                    formatted += ' ';
                }
                formatted += '=~';
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
                    formatted += char + '\n';
                    indentLevel++;
                    formatted += ' '.repeat(indentLevel * this.indentSize);
                    break;

                case ')':
                case '}':
                case ']':
                    if (lastChar !== '(' && lastChar !== '{' && lastChar !== '[') {
                        indentLevel = Math.max(0, indentLevel - 1);
                        formatted += '\n' + ' '.repeat(indentLevel * this.indentSize);
                    }
                    formatted += char;
                    break;

                case ',':
                    formatted += ',' + '\n' + ' '.repeat(indentLevel * this.indentSize);
                    break;

                case ' ':
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
                    if (lastChar !== ' ' && lastChar !== '\n') {
                        formatted += ' ';
                    }
                    formatted += char;
                    if (nextChar !== ' ' && nextChar !== '\n' && nextChar) {
                        formatted += ' ';
                    }
                    break;

                default:
                    formatted += char;
            }

            lastChar = char;
        }

        let lines = formatted.split('\n');
        lines = lines
            .map(line => line.trimRight())
            .filter(line => line.trim() !== '');

        return lines.join('\n').trim();
    }
} 