// 简化的 PromQL 模式定义
CodeMirror.defineMode("promql", function() {
    return {
        token: function(stream, state) {
            if (stream.eatSpace()) return null;

            // 处理字符串
            if (stream.match(/^"(?:[^"\\]|\\.)*"/) || 
                stream.match(/^'(?:[^'\\]|\\.)*'/)) {
                return "string";
            }

            // 处理数字
            if (stream.match(/^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/)) {
                return "number";
            }

            // 处理运算符
            if (stream.match(/^([\+\-\*\/\%\^]=?|[!=<>]=|&&|\|\||==|!=|=~|!~)/)) {
                return "operator";
            }

            // 处理关键字
            if (stream.match(/^(sum|rate|irate|by|without|offset|bool|and|or|unless)\b/)) {
                return "keyword";
            }

            // 处理标签
            if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
                return "variable";
            }

            // 处理其他字符
            stream.next();
            return null;
        }
    };
});

// 注册 MIME 类型
CodeMirror.defineMIME("text/x-promql", "promql"); 