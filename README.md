jToh (Json TO Html)
=========

jToh is a json based template engine. It uses pure javascript syntax, so can be easily embedded in your *.js files.

Features
-
- pure js syntax
- DOM-like naming (e.g. "className" field for className and "innerHTML" field for content)
- precompiling
- AMD loading
- Selectors for json-based template (alpha)


Usage
-
Below is quick example how to use jtoh.js:

    var template = [
        '<!DOCTYPE html>'
        {
            tagName: 'html',
            innerHTML: [
                {tagName: 'head'},
                {tagName: 'body', innerHTML: function (data) {
                    return data.message;
                }}
            ]
        }
    ];
    
    var html = jtoh(template).build({message: 'Hello World');
    
Template system
- 
jToh template is a JSON, which supports:

- Numbers
    
        jtoh(12345).build() === '12345'
    
- Strings

        jtoh('Hello world').build() === 'Hello World'
    
- Arrays

        jtoh([12345, ' Hello world']).build() === '12345 Hello World'
    
- Objects

    jToh's objects represents HTML tags, so it has magic fields: tagName (default value is 'div'), className, innerHTML and attributes.

        jtoh({
            className: ['icon', ' ', 'preload'],
            attributes: {
                'data-src': 'icon.png'
            }
        }).build();

        // outputs
        //<div class="icon preload" data-src="icon.png"></div>

- Functions

    jToh's functions are executed with arguments provided to .build(). If result value is not string or undefined it would be recursevely builded.
    
        jtoh({
            innerHTML: function (data) {
                return data;
            };
        }).build({
            tagName: 'span',
            function () {
                return 'Dynamic value';
            }
        });

        //outputs
        //<div><span>Dynamic value</span></div>

- Undefined
    Undefined value acts as remover. For example if attribute is intentially undefined it would be deleted, if tagName is undefined element would be deleted.

        jtoh([
            {tagName: 'span', attributes:{
                //this attribute would be deleted
                class: undefined
            }},
            {
                tagName: function () {
                    //this element would be deleted
                    return undefined;
                },
                className: 'example-2'
            }
        ]).build();

        //outputs
        //<span></span>

Selectors for JSON (experimental)
-
This is early stage for it. Currently only getElementsByClassName is supported. The main purpes of it is for reusing template parts in another template. Maybe it would be places in separate module.

    jtoh({
        tagName: 'span',
        innerHTML: [
            'Hello',
            {
                tagName: 'span',
                className: 'green',
                innerHTML: 'world'
            }
        }
    }).getElementsByClassName('green');
    
    /*returns object
    {
        tagName: 'span',
        className: 'green',
        innerHTML: 'world'
    }*/

Version
-
0.6


License
-
MIT
