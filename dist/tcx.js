'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xmlHelper = require('./xmlHelper');

var _xmlHelper2 = _interopRequireDefault(_xmlHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _getMetric = function _getMetric(data, name) {
  var result = data.metrics.filter(function (val) {
    return val.type === name;
  });
  return result && result.length === 1 && result[0].values && result[0].values.length > 0 ? result[0].values : null;
};
var _getSummary = function _getSummary(data, name) {
  var result = data.summaries.filter(function (s) {
    return s.metric === name;
  });
  return result && result.length === 1 && result[0] ? result[0] : null;
};

var Tcx = function () {
  function Tcx() {
    _classCallCheck(this, Tcx);
  }

  _createClass(Tcx, null, [{
    key: 'ConvertFromNikeActivity',
    value: function ConvertFromNikeActivity(res) {
      var data = res.data;
      var elevations = _getMetric(data, 'elevation');
      var latitudes = _getMetric(data, 'latitude');
      var longitudes = _getMetric(data, 'longitude');
      var speeds = _getMetric(data, 'speed');
      var distances = _getMetric(data, 'distance');
      var heartRates = _getMetric(data, 'heart_rate');

      var result = {
        TrainingCenterDatabase: {
          '@xsi:schemaLocation': 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd',
          '@xmlns:ns5': 'http://www.garmin.com/xmlschemas/ActivityGoals/v1',
          '@xmlns:ns4': 'http://www.garmin.com/xmlschemas/ProfileExtension/v1',
          '@xmlns:ns3': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2',
          '@xmlns:ns2': 'http://www.garmin.com/xmlschemas/UserProfile/v2',
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xmlns': 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2',
          Activities: {
            Activity: {
              '@Sport': 'Running',
              'Notes': 'Generated on : nike.bullrox.net',
              Id: new Date(data.start_epoch_ms).toISOString(),
              Lap: {
                '@StartTime': new Date(data.start_epoch_ms).toISOString(),
                TotalTimeSeconds: data.active_duration_ms,
                DistanceMeters: _getSummary(data, 'distance').value * 1000,
                MaximumSpeed: speeds ? speeds.map(function (s) {
                  return s.value;
                }).reduce(function (prev, next) {
                  return Math.max(prev, next);
                }) * 0.277778 : null, //km/h --> m/s
                Calories: _getSummary(data, 'calories').value,
                Intensity: 'Active',
                TriggerMethod: 'Manual',
                AverageHeartRateBpm: null,
                MaximumHeartRateBpm: null,
                Track: {
                  Trackpoint: []
                }
              }
            }
          },
          Author: {
            '@xsi:type': 'Application_t',
            Name: 'Paul du Pavillon - https://nike.bullrox.net',
            Build: {
              Version: {
                VersionMajor: 1,
                VersionMinor: 0,
                BuildMajor: 1,
                BuildMinor: 0
              }
            },
            LangID: 'en'
          }
        }
      };
      var trackPoints = [];

      if (_getSummary(data, 'heart_rate')) {
        result.TrainingCenterDatabase.Activities.Activity.Lap.AverageHeartRateBpm = { Value: _getSummary(data, 'heart_rate').value };
      }
      if (heartRates) {
        result.TrainingCenterDatabase.Activities.Activity.Lap.MaximumHeartRateBpm = { Value: heartRates.map(function (h) {
            return h.value;
          }).reduce(function (prev, next) {
            return Math.max(prev, next);
          }) };
      }

      latitudes.forEach(function (item, index) {
        return trackPoints.push({
          Time: item.end_epoch_ms,
          Position: {
            LatitudeDegrees: latitudes[index].value,
            LongitudeDegrees: longitudes[index].value
          },
          AltitudeMeters: elevations && elevations.length > 0 && elevations.length > index ? elevations[index].value : null
        });
      });

      (distances || []).forEach(function (d) {
        var matches = trackPoints.filter(function (t) {
          return t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms;
        });
        matches.forEach(function (m) {
          return m.DistanceMeters = d.value / matches.length * 1000;
        });
      });

      // cumulated Distance
      trackPoints.forEach(function (t, i) {
        return !!t.DistanceMeters ? t.DistanceMeters += i > 0 ? trackPoints[i - 1].DistanceMeters : 0 : null;
      });

      (speeds || []).forEach(function (d) {
        var matches = trackPoints.filter(function (t) {
          return t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms;
        });
        matches.forEach(function (m) {
          return m.Extensions = {
            TPX: {
              '@xmlns': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2',
              Speed: d.value * 0.277778 //km/h --> m/s
            }
          };
        });
      });

      (heartRates || []).forEach(function (d) {
        var matches = trackPoints.filter(function (t) {
          return t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms;
        });
        matches.forEach(function (m) {
          return m.HeartRateBpm = { Value: d.value };
        });
      });

      trackPoints.forEach(function (t) {
        return t.Time = new Date(t.Time).toISOString();
      });
      result.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint = trackPoints;
      return _xmlHelper2.default.ConvertFromObj(result);
    }
  }]);

  return Tcx;
}();

exports.default = Tcx;