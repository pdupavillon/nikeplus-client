'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var XmlHelper = function () {
    function XmlHelper() {
        _classCallCheck(this, XmlHelper);
    }

    _createClass(XmlHelper, null, [{
        key: '_node',
        value: function _node(name, value, deep) {
            var node = '';
            if (value instanceof Array) {
                value.forEach(function (v, i) {
                    return node += '\n'.repeat(i > 0 ? 1 : 0) + XmlHelper._node(name, v, deep);
                });
            } else if (value instanceof Object) {
                var attributes = Object.keys(value).filter(function (k) {
                    return k.startsWith('@');
                });
                var childs = Object.keys(value).filter(function (k) {
                    return !k.startsWith('@') && !!value[k];
                });
                var content = '';
                node = '\t'.repeat(deep) + '<' + name;
                attributes.forEach(function (k) {
                    return node += ' ' + k.substr(1) + '="' + value[k] + '"';
                });
                childs.forEach(function (k, i) {
                    return content += '\n' + XmlHelper._node(k, value[k], deep + 1) + '\n'.repeat(i + 1 == childs.length ? 1 : 0);
                });
                node += childs.length === 0 || content.replace(/\s|\n|\t/gm, '').length === 0 ? '/>' : '>' + content;
                node += childs.length > 0 && content.replace(/\s|\n|\t/gm, '').length > 0 ? '\t'.repeat(deep) + '</' + name + '>' : '';
            } else if (value !== null && value !== undefined) {
                if (name.startsWith('#cdata#')) {
                    name = name.replace('#cdata#', '');
                    value = '<![CDATA[' + value + ']]>';
                }
                node += '\t'.repeat(deep) + '<' + name + '>' + value.toString() + '</' + name + '>';
            }
            return node;
        }
    }, {
        key: 'ConvertFromObj',
        value: function ConvertFromObj(jsonObj) {
            var xml = '<?xml version="1.0" encoding="UTF-8" ?>\r\n';
            Object.keys(jsonObj).forEach(function (k) {
                return xml += XmlHelper._node(k, jsonObj[k], 0);
            });
            return xml;
        }
    }]);

    return XmlHelper;
}();

exports.default = XmlHelper;