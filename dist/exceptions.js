'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NikeLoginError = function (_Error) {
    _inherits(NikeLoginError, _Error);

    function NikeLoginError(data) {
        _classCallCheck(this, NikeLoginError);

        var _this = _possibleConstructorReturn(this, (NikeLoginError.__proto__ || Object.getPrototypeOf(NikeLoginError)).call(this, 'Can\'t login'));

        _this.name = 'NikeLoginError';
        _this.data = data;
        Error.captureStackTrace(_this, NikeLoginError);
        return _this;
    }

    return NikeLoginError;
}(Error);

var NikeError = function (_Error2) {
    _inherits(NikeError, _Error2);

    function NikeError(message) {
        _classCallCheck(this, NikeError);

        var _this2 = _possibleConstructorReturn(this, (NikeError.__proto__ || Object.getPrototypeOf(NikeError)).call(this, message));

        _this2.name = 'NikeError';
        Error.captureStackTrace(_this2, NikeError);
        return _this2;
    }

    return NikeError;
}(Error);

var NikeApiChange = function (_Error3) {
    _inherits(NikeApiChange, _Error3);

    function NikeApiChange(data) {
        _classCallCheck(this, NikeApiChange);

        var _this3 = _possibleConstructorReturn(this, (NikeApiChange.__proto__ || Object.getPrototypeOf(NikeApiChange)).call(this, 'Api url or result change'));

        _this3.name = 'NikeApiChange';
        _this3.data = data;
        Error.captureStackTrace(_this3, NikeApiChange);
        return _this3;
    }

    return NikeApiChange;
}(Error);

exports.NikeLoginError = NikeLoginError;
exports.NikeError = NikeError;
exports.NikeApiChange = NikeApiChange;