// 简化的 PromQL 模式定义
CodeMirror.defineMode("promql", function() {
    // 内建函数列表（这个是固定的）
    const builtinFunctions = [
        'sum', 'rate', 'irate', 'by', 'without', 'avg', 'count', 'min', 'max',
        'stddev', 'stdvar', 'count_values', 'bottomk', 'topk', 'quantile',
        'increase', 'delta', 'idelta', 'avg_over_time', 'min_over_time',
        'max_over_time', 'sum_over_time', 'count_over_time'
    ];

    // PromQL 规范的正则表达式
    const patterns = {
        // 指标名：必须包含至少一个下划线，字母数字组合
        metric: /^[a-zA-Z_][a-zA-Z0-9_]*(_[a-zA-Z0-9_]+)+/,
        
        // 标签名：字母开头，可包含字母数字下划线
        label: /^[a-zA-Z_][a-zA-Z0-9_]*/,
        
        // 运算符
        operator: /^(==|!=|=~|!~|>=|<=|>|<|\+|-|\*|\/|\%|\^|and|or|unless)/,
        
        // 数字（支持科学计数法）
        number: /^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/,
        
        // 时间单位
        duration: /^[0-9]+[smhdwy]/
    };

    return {
        token: function(stream, state) {
            if (stream.eatSpace()) return null;

            // 处理字符串
            if (stream.match(/^"(?:[^"\\]|\\.)*"/) || 
                stream.match(/^'(?:[^'\\]|\\.)*'/)) {
                return "string";
            }

            // 处理注释
            if (stream.match(/^#.*/)) {
                return "comment";
            }

            // 处理数字
            if (stream.match(patterns.number)) {
                return "number";
            }

            // 处理时间单位
            if (stream.match(patterns.duration)) {
                return "duration";
            }

            // 处理运算符
            if (stream.match(patterns.operator)) {
                return "operator";
            }

            // 处理括号
            if (stream.match(/^[{}\[\]()]/)) {
                return "bracket";
            }

            // 处理内建函数
            const word = stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
            if (word) {
                const token = word[0];
                
                // 检查是否是内建函数
                if (builtinFunctions.includes(token.toLowerCase())) {
                    return "builtin";
                }

                // 检查是否是指标名（包含下划线）
                if (patterns.metric.test(token)) {
                    return "metric";
                }

                // 其他标识符作为标签名处理
                if (patterns.label.test(token)) {
                    return "label";
                }
            }

            stream.next();
            return null;
        }
    };
});

// 注册 MIME 类型
CodeMirror.defineMIME("text/x-promql", "promql"); 