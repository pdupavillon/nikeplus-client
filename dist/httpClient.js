'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpClient = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _requestPromiseNative = require('request-promise-native');

var _requestPromiseNative2 = _interopRequireDefault(_requestPromiseNative);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HttpClient = exports.HttpClient = function () {
    function HttpClient() {
        var _this = this;

        _classCallCheck(this, HttpClient);

        this.Get = function (uri) {
            var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            return _this._call('GET', uri, headers, null);
        };

        this.Post = function (uri) {
            var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            return _this._call('POST', uri, headers, data);
        };
    }

    _createClass(HttpClient, [{
        key: '_call',
        value: function _call(method, uri, headers, data) {
            var params = {
                method: method,
                uri: uri
            };
            if (headers) {
                params.headers = headers;
            }
            if (data) {
                params.body = JSON.stringify(data);
            }
            return (0, _requestPromiseNative2.default)(params);
        }
    }]);

    return HttpClient;
}();