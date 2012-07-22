jtoh = (function(){
    "use strict";

    var emptyTagNames = ['area', 'base', 'br', 'col', 'hr', 'img', 'input', 'link', 'meta', 'param'];

    function build(json){
        var tagName = json.tagName,
            isEmptyTagName = emptyTagNames.indexOf(tagName) !== -1,
            attributes = json.attributes,
            htmlTokens, attrName, attrsTokens = [];

        if (Array.isArray(json)) {
            htmlTokens = json.map(function(json){
                return build(json);
            });
        } else {
            if (json.className) {
                attributes = attributes || {};
                attributes['class'] = json.className;
            }

            if (isEmptyTagName) {
                htmlTokens = ['<', tagName, '/>'];
            } else {
                htmlTokens = ['<', tagName, '>', '</', tagName, '>'];
                htmlTokens.splice(3, 0, build(json.innerHTML));
            }

            for (attrName in attributes) {
                // TODO escape double quotes
                attrsTokens = attrsTokens.concat([' ', attrName, '="', attributes[attrName], '"']);
            }
            htmlTokens.splice.apply(htmlTokens, [2, 0].concat(attrsTokens));
        }

        return htmlTokens.join('');

    };

    return {
        build: build
    };
})();
