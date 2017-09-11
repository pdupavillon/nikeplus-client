/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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
                    return !k.startsWith('@');
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nike = __webpack_require__(2);

var _nike2 = _interopRequireDefault(_nike);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _nike2.default;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gpx = __webpack_require__(3);

var _gpx2 = _interopRequireDefault(_gpx);

var _tcx = __webpack_require__(4);

var _tcx2 = _interopRequireDefault(_tcx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NikeClient = function () {
  function NikeClient(httpClient) {
    _classCallCheck(this, NikeClient);

    this._httpClient = httpClient;
    this._refreshTokenAsked = false;
    this._tokenRefreshed = false;
    this.authData = null;
  }

  _createClass(NikeClient, [{
    key: '_shouldBeLogged',
    value: function _shouldBeLogged() {
      if (this.authData === null) {
        throw 'You are not logged in';
      }
      this._tokenRefreshed = false;
    }
  }, {
    key: '_handleRefreshToken',
    value: function _handleRefreshToken(err, cb) {
      if (err.statusCode === 401 && !this._refreshTokenAsked) {
        return this.refresh_token().then(cb);
      }
      return Promise.reject({
        error: err,
        data: null
      });
    }
  }, {
    key: '_handleResponse',
    value: function _handleResponse(data) {
      this._refreshTokenAsked = false;
      return Promise.resolve({
        error: null,
        data: JSON.parse(data)
      });
    }
  }, {
    key: '_Get',
    value: function _Get(uri) {
      var _this = this;

      var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      return this._httpClient.Get(uri, headers).then(function (data) {
        return _this._handleResponse(data);
      });
    }
  }, {
    key: '_GetWithAuthQueryString',
    value: function _GetWithAuthQueryString(path) {
      var _this2 = this;

      var queryString = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var uri = 'https://api.nike.com' + path + '?access_token=' + this.authData.access_token + '&app=FUELBAND&format=json' + queryString; //locale=en_FR
      var cb = this._GetWithAuthQueryString.bind(this, path, queryString);

      return this._Get(uri).catch(function (err) {
        return _this2._handleRefreshToken(err, cb);
      });
    }
  }, {
    key: '_GetWithAuthInHeader',
    value: function _GetWithAuthInHeader(path) {
      var _this3 = this;

      var queryString = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var headers = {
        'Authorization': 'Bearer ' + this.authData.access_token
      };
      var uri = 'https://api.nike.com' + path + '?format=json' + queryString;
      var cb = this._GetWithAuthInHeader.bind(this, path, queryString);

      return this._Get(uri, headers).catch(function (err) {
        return _this3._handleRefreshToken(err, cb);
      });
    }
  }, {
    key: 'login',
    value: function login(email, password) {
      var uri = 'https://unite.nike.com/loginWithSetCookie?appVersion=295' + '&experienceVersion=256&uxid=com.nike.commerce.nikedotcom.web' + '&locale=en_US&backendEnvironment=identity&browser=Google%20Inc.&os=undefined' + '&mobile=false&native=false&visit=1';
      var data = {
        "username": email,
        "password": password,
        "keepMeLoggedIn": true,
        "client_id": "HlHa2Cje3ctlaOqnxvgZXNaAs7T9nAuH",
        "ux_id": "com.nike.commerce.nikedotcom.web",
        "grant_type": "password"
      };
      var that = this;

      return this._httpClient.Post(uri, null, data).then(function (data) {
        that.authData = JSON.parse(data);
        return Promise.resolve(that.authData);
      }).catch(function (err) {
        that.authData = null;
        throw 'Can\'t log in ' + err;
      });
    }
  }, {
    key: 'set_auth',
    value: function set_auth(data) {
      if (!data || !data.access_token || !data.refresh_token) {
        throw 'Invalid login data';
      }
      this.authData = data;
    }
  }, {
    key: 'refresh_token',
    value: function refresh_token() {
      var uri = 'https://unite.nike.com/tokenRefresh?appVersion=296&experienceVersion=257&uxid=com.nike.commerce.nikedotcom.web&backendEnvironment=identity&browser=Google%20Inc.&os=undefined&mobile=false&native=false&visit=&visitor='; //locale=en_US
      var data = {
        client_id: 'HlHa2Cje3ctlaOqnxvgZXNaAs7T9nAuH',
        grant_type: 'refresh_token',
        refresh_token: this.authData.refresh_token
      };
      var that = this;
      this._refreshTokenAsked = true;

      return this._httpClient.Post(uri, null, data).then(function (data) {
        that._tokenRefreshed = true;
        that.authData = JSON.parse(data);
        return Promise.resolve();
      });
    }
  }, {
    key: 'me_summary',
    value: function me_summary() {
      this._shouldBeLogged();
      return this._GetWithAuthInHeader('/plus/v3/lifetimeaggs/me/summary');
    }
  }, {
    key: 'me_detail',
    value: function me_detail() {
      this._shouldBeLogged();
      return this._GetWithAuthQueryString('/nsl/user/get');
    }
  }, {
    key: 'me_snapshot',
    value: function me_snapshot() {
      this._shouldBeLogged();
      return this._GetWithAuthQueryString('/v2.0/me/snapshot');
    }
  }, {
    key: 'me_achievements',
    value: function me_achievements() {
      this._shouldBeLogged();
      return this._GetWithAuthQueryString('/v3.0/me/achievements');
    }
  }, {
    key: 'user_infos',
    value: function user_infos(upmIds) {
      this._shouldBeLogged();
      return this._GetWithAuthQueryString('/plus/v3/userlookup/users', '&upmIds=' + upmIds);
    }
  }, {
    key: 'me_activities_year',
    value: function me_activities_year(startTime, endTime) {
      this._shouldBeLogged();
      return this._GetWithAuthQueryString('/v3.0/me/activities', '&startTime=' + startTime + '&endTime=' + endTime); //1501459200000  1503100194141 //&isStream=0
    }
  }, {
    key: 'me_activities_run_daily',
    value: function me_activities_run_daily(fromDate, toDate) {
      //2017-08-14   2017-08-21
      this._shouldBeLogged();
      return this._GetWithAuthInHeader('/plus/v3/historicalaggregates/aggregates/batch/daily/' + fromDate + '/' + toDate, '&metric_type=distance&activity_type=jogging&activity_type=run');
    }
  }, {
    key: 'me_activities_before_id',
    value: function me_activities_before_id(id, limit, metrics, types) {
      //metrics=distance,pace
      limit = limit || 10;
      this._shouldBeLogged();
      return this._GetWithAuthInHeader('/sport/v3/me/activities/before_id/' + id, '&limit=' + limit + '&metrics=distance&types=jogging,run');
    }
  }, {
    key: 'me_activities_before_time',
    value: function me_activities_before_time(time, limit, metrics, types) {
      //time = 1503507694194, types = jogging,run
      limit = limit || 1;
      this._shouldBeLogged();
      return this._GetWithAuthInHeader('/sport/v3/me/activities/before_time/' + time, '&limit=' + limit + '&types=jogging,run');
    }
  }, {
    key: 'me_activity_detail',
    value: function me_activity_detail(id) {
      this._shouldBeLogged();
      return this._GetWithAuthInHeader('/sport/v3/me/activity/' + id, '&metrics=ALL');
    }
  }, {
    key: 'me_activity_to_gpx',
    value: function me_activity_to_gpx(id) {
      return this.me_activity_detail(id).then(function (run) {
        return Promise.resolve(_gpx2.default.ConvertFromNikeActivity(run));
      });
    }
  }, {
    key: 'me_activity_to_tcx',
    value: function me_activity_to_tcx(id) {
      return this.me_activity_detail(id).then(function (run) {
        return Promise.resolve(_tcx2.default.ConvertFromNikeActivity(run));
      });
    }
  }]);

  return NikeClient;
}();

exports.default = NikeClient;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xmlHelper = __webpack_require__(0);

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

            elevations.values.forEach(function (val, index) {
                return def.gpx.trk.trkseg.trkpt.push({
                    '@lat': latitudes.values[index].value,
                    '@lon': longitudes.values[index].value,
                    ele: val.value,
                    time: new Date(val.end_epoch_ms).toISOString()
                });
            });

            return _xmlHelper2.default.ConvertFromObj(def);
        }
    }]);

    return Gpx;
}();

exports.default = Gpx;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xmlHelper = __webpack_require__(0);

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

/***/ })
/******/ ]);