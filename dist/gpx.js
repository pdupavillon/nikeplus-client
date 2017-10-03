'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xmlHelper = require('./xmlHelper');

var _xmlHelper2 = _interopRequireDefault(_xmlHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Gpx = function () {
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
            var elevations = res.data.metrics.filter(function (val, index) {
                return val.type === 'elevation';
            })[0];
            var latitudes = res.data.metrics.filter(function (val, index) {
                return val.type === 'latitude';
            })[0];
            var longitudes = res.data.metrics.filter(function (val, index) {
                return val.type === 'longitude';
            })[0];

            latitudes.values.forEach(function (item, index) {
                return def.gpx.trk.trkseg.trkpt.push({
                    '@lat': item.value,
                    '@lon': longitudes.values[index].value,
                    ele: elevations && elevations.values && elevations.values.length > index ? elevations.values[index].value : null,
                    time: new Date(item.end_epoch_ms).toISOString()
                });
            });

            return _xmlHelper2.default.ConvertFromObj(def);
        }
    }]);

    return Gpx;
}();

exports.default = Gpx;