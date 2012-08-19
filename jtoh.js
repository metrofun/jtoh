jtoh = (function(){
    "use strict";

    var emptyTagNames = ['area', 'base', 'br', 'col', 'hr', 'img', 'input', 'link', 'meta', 'param'];

    function tokenizeElement(tagName, attrsTokens, innerHtmlTokens) {
        var htmlTokens;

        if (emptyTagNames.indexOf(tagName) !== -1) {
            htmlTokens = ['<', tagName, '/>'];
        } else {
            htmlTokens = ['<', tagName, '>', '</', tagName, '>'];
            htmlTokens.splice.apply(htmlTokens, [3, 0].concat(innerHtmlTokens));
        }
        htmlTokens.splice.apply(htmlTokens, [2, 0].concat(attrsTokens));
        return htmlTokens;
    }

    function precompile(json){
        var tagNameRaw = json.tagName,
            attributes = json.attributes, innerHtmlTokens,
            htmlTokens, attrName, attrValRaw, attrsTokens = [];

        if (Array.isArray(json)) {
            htmlTokens = json.map(function(json){
                return precompile(json);
            });
        } else if (typeof json === 'object') {
            if (json.className) {
                attributes = attributes || {};
                attributes['class'] = json.className;
            }

            for (attrName in attributes) {
                attrValRaw = attributes[attrName];
                if (typeof attrValRaw === 'function') {
                    attrsTokens = attrsTokens.concat(function(attrValRaw) {
                        var attrVal = attrValRaw.apply(this, [].slice.call(arguments, 1));
                        // TODO escape double quotes
                        return (typeof attrVal !== 'undefined') ? [' ', attrName, '="', attrVal, '"']:[];
                    }.bind(this, attrValRaw));
                } else {
                    // TODO escape double quotes
                    attrsTokens = attrsTokens.concat([' ', attrName, '="', attrValRaw, '"']);
                }
            }

            if (typeof tagNameRaw === 'function') {
                innerHtmlTokens = precompile(json.innerHTML);
                htmlTokens = [function(){
                    var tagName = tagNameRaw.apply(this, arguments);
                    return (typeof tagName !== 'undefined') ? tokenizeElement(tagName, attrsTokens, innerHtmlTokens) : [];
                }];
            } else {
                htmlTokens = tokenizeElement(tagNameRaw, attrsTokens, precompile(json.innerHTML));
            }
        } else {
            htmlTokens = [json];
        }

        return htmlTokens;
    };
    function compile(json) {
        var precompiled = precompile(json);

        return function process(precompiled){
            var args = [].slice.call(arguments, 1),
                compiled = precompiled.map(function(strOrFunc){
                return (typeof strOrFunc === 'function')?process.apply(this, [strOrFunc.apply(this, args)].concat(args)):strOrFunc;
            });
            return compiled.join('');
        }.bind(this, precompiled);
    }

    return {
        compile: compile
    };
})();
console.log(jtoh.compile({
    tagName: function(){return 'tr'},
    attributes: {
        zz: 123,
        yy: function(a) {return a}
    },
    innerHTML: 'uuuuu'
})('ssssss'));
