jtoh = (function(){
    "use strict";

    var emptyTagNames = ['area', 'base', 'br', 'col', 'hr', 'img', 'input', 'link', 'meta', 'param'];

    function precompile(json){
        var tagNameRaw = json.tagName,
            // FIXME What if a function?
            isEmptyTagName = emptyTagNames.indexOf(tagNameRaw) !== -1,
            attributes = json.attributes,
            htmlTokens, _htmlTokens, attrName, attrValRaw, attrsTokens = [];

        if (Array.isArray(json)) {
            htmlTokens = json.map(function(json){
                return precompile(json);
            });
        } else if (typeof json === 'object') {
            if (json.className) {
                attributes = attributes || {};
                attributes['class'] = json.className;
            }

            if (isEmptyTagName) {
                htmlTokens = ['<', tagNameRaw, '/>'];
                if (typeof tagNameRaw === 'function') {
                    _htmlTokens = [function() {
                        var tagName = htmlTokens.tagNameRaw.apply(this, arguments);
                        htmlTokens[1] = tagName;
                        return tagName? htmlTokens:[];
                    }]
                }
            } else {
                htmlTokens = ['<', tagNameRaw, '>', '</', tagNameRaw, '>'];
                htmlTokens.splice.apply(htmlTokens, [3, 0].concat(precompile(json.innerHTML)));
                if (typeof tagNameRaw === 'function') {
                    _htmlTokens = [function() {
                        var tagName = tagNameRaw.apply(this, arguments);
                        htmlTokens[1] = tagName;
                        htmlTokens[htmlTokens.length - 2] = tagName;
                        return tagName? htmlTokens:[];
                    }]
                }

            }

            for (attrName in attributes) {
                var attrValRaw = attributes[attrName];
                if (typeof attrValRaw === 'function') {
                    attrsTokens = attrsTokens.concat(function(attrValRaw) {
                        var attrVal = attrValRaw.apply(this, [].slice.call(arguments, 1));
                        // TODO escape double quotes
                        return attrVal? [' ', attrName, '="', attrVal, '"']:[];
                    }.bind(this, attrValRaw));
                } else {
                    // TODO escape double quotes
                    attrsTokens = attrsTokens.concat([' ', attrName, '="', attrValRaw, '"']);
                }
            }
            htmlTokens.splice.apply(htmlTokens, [2, 0].concat(attrsTokens));
        } else {
            htmlTokens = [json];
        }

        return _htmlTokens || htmlTokens;
    };
    function compile(json) {
        var precompiled = precompile(json);
        return function build(precompiled, data){
            var compiled = precompiled.map(function(strRaw){
                return (typeof strRaw === 'function')?build(strRaw.apply(this, data), data):strRaw;
            });
            return compiled.join('');
        }.bind(this, precompiled);
    }

    return {
        compile: compile
    };
})();
console.log(jtoh.compile({
    tagName: function(){return 'img'},
    attributes: {
        zz: 123,
        yy: function() {return 0;}
    },
    innerHTML: 'uuuuu'
})());
