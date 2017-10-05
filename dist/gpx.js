'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Gpx = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xmlHelper = require('./xmlHelper');

var _xmlHelper2 = _interopRequireDefault(_xmlHelper);

var _nikeHelper = require('./nikeHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Gpx = exports.Gpx = function () {
    function Gpx() {
        _classCallCheck(this, Gpx);
    }

    _createClass(Gpx, null, [{
        key: 'ConvertFromNikeActivity',
        value: function ConvertFromNikeActivity(res) {
            var def = {
                gpx: {
                    '@version': '1.1',
                    '@creator': 'Paul du Pavillon - https://nike.bullrox.net',
                    '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    '@xmlns': 'http://www.topografix.com/GPX/1/1',
                    '@xsi:schemaLocation': 'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd',
                    '@xmlns:gpxtpx': 'http://www.garmin.com/xmlschemas/TrackPointExtension/v1',
                    trk: {
                        '#cdata#name': 'Running ' + new Date(res.data.start_epoch_ms).toString(),
                        trkseg: {
                            trkpt: []
                        }
                    }
                }
            };
            var elevations = _nikeHelper.NikeHelper.GetMetric(res.data, 'elevation');
            var latitudes = _nikeHelper.NikeHelper.GetMetric(res.data, 'latitude');
            var longitudes = _nikeHelper.NikeHelper.GetMetric(res.data, 'longitude');

            latitudes.forEach(function (item, index) {
                return def.gpx.trk.trkseg.trkpt.push({
                    '@lat': item.value,
                    '@lon': longitudes[index].value,
                    ele: elevations && elevations.length > index ? elevations[index].value : null,
                    time: new Date(item.end_epoch_ms).toISOString()
                });
            });

            return _xmlHelper2.default.ConvertFromObj(def);
        }
    }]);

    return Gpx;
}();