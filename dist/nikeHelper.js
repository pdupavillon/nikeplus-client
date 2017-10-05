"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NikeHelper = exports.NikeHelper = function () {
    function NikeHelper() {
        _classCallCheck(this, NikeHelper);
    }

    _createClass(NikeHelper, null, [{
        key: "GetSummary",
        value: function GetSummary(data, name) {
            var result = data.summaries.filter(function (s) {
                return s.metric === name;
            });
            return result && result.length === 1 && result[0] ? result[0] : null;
        }
    }, {
        key: "GetMetric",
        value: function GetMetric(data, name) {
            var result = data.metrics.filter(function (val) {
                return val.type === name;
            });
            return result && result.length === 1 && result[0].values && result[0].values.length > 0 ? result[0].values : null;
        }
    }]);

    return NikeHelper;
}();