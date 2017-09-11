'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xmlHelper = require('./xmlHelper');

var _xmlHelper2 = _interopRequireDefault(_xmlHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tcx = function () {
  function Tcx() {
    _classCallCheck(this, Tcx);
  }

  _createClass(Tcx, null, [{
    key: 'ConvertFromNikeActivity',
    value: function ConvertFromNikeActivity(res) {
      var elevations = res.data.metrics.filter(function (val, index) {
        return val.type === 'elevation';
      })[0];
      var latitudes = res.data.metrics.filter(function (val, index) {
        return val.type === 'latitude';
      })[0];
      var longitudes = res.data.metrics.filter(function (val, index) {
        return val.type === 'longitude';
      })[0];
      var speeds = res.data.metrics.filter(function (val, index) {
        return val.type === 'speed';
      })[0];
      var distances = res.data.metrics.filter(function (val, index) {
        return val.type === 'distance';
      })[0];

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
              'Notes': 'Uploaded by : nike.bullrox.net',
              Id: new Date(res.data.start_epoch_ms).toISOString(),
              Lap: {
                TotalTimeSeconds: res.data.active_duration_ms,
                DistanceMeters: res.data.summaries.filter(function (s) {
                  return s.metric === 'distance';
                })[0].value * 1000,
                MaximumSpeed: speeds.values.map(function (s) {
                  return s.value;
                }).reduce(function (prev, next) {
                  return Math.max(prev, next);
                }) * 1000,
                Calories: res.data.summaries.filter(function (s) {
                  return s.metric === 'calories';
                })[0].value * 1000,
                Intensity: 'Active',
                TriggerMethod: 'Manual',
                Track: {
                  Trackpoint: []
                }
              }
            }
          },
          Author: {
            '@xsi:type=': 'Application_t',
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
      elevations.values.forEach(function (val, index) {
        return trackPoints.push({
          Time: val.end_epoch_ms,
          Position: {
            LatitudeDegrees: latitudes.values[index].value,
            LongitudeDegrees: longitudes.values[index].value
          },
          AltitudeMeters: val.value
        });
      });

      distances.values.forEach(function (d) {
        var matches = trackPoints.filter(function (t) {
          return t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms;
        });
        matches.forEach(function (m) {
          return m.DistanceMeters = d.value / matches.length * 1000;
        });
      });

      speeds.values.forEach(function (d) {
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