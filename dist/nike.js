'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NikeClient = function () {
    function NikeClient(httpClient) {
        _classCallCheck(this, NikeClient);

        this.loginData = null;
        this.httpClient = httpClient;
        this.refreshTokenAsked = false;
    }

    _createClass(NikeClient, [{
        key: '_shouldBeLogged',
        value: function _shouldBeLogged() {
            if (this.loginData === null) {
                throw 'You are not logged in';
            }
        }
    }, {
        key: '_handleRefreshToken',
        value: function _handleRefreshToken(err, cb) {
            if (err.statusCode === 401 && !this.refreshTokenAsked) {
                return this.refresh_token().then(cb);
            }
            return Promise.reject({ error: err, data: null });
        }
    }, {
        key: '_handleResponse',
        value: function _handleResponse(data) {
            this.refreshTokenAsked = false;
            return Promise.resolve({ error: null, data: JSON.parse(data) });
        }
    }, {
        key: '_Get',
        value: function _Get(uri) {
            var _this = this;

            var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var cb = this._Get.bind(this, uri, headers);

            return this.httpClient.Get(uri, headers).then(function (data) {
                return _this._handleResponse(data);
            }).catch(function (err) {
                return _this._handleRefreshToken(err, cb);
            });
        }
    }, {
        key: '_GetWithAuthQueryString',
        value: function _GetWithAuthQueryString(path) {
            var queryString = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            var uri = 'https://api.nike.com' + path + '?access_token=' + this.loginData.access_token + '&app=FUELBAND&format=json' + queryString; //locale=en_FR

            return this._Get(uri);
        }
    }, {
        key: '_GetWithAuthInHeader',
        value: function _GetWithAuthInHeader(path) {
            var queryString = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            var headers = { 'Authorization': 'Bearer ' + this.loginData.access_token };
            var uri = 'https://api.nike.com' + path + '?format=json' + queryString;

            return this._Get(uri, headers);
        }

        /**
         * @param {string} email 
         * @param {string} password 
         * @memberof NikeClient
         */

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

            return this.httpClient.Post(uri, null, data).then(function (data) {
                that.loginData = JSON.parse(data);
            }).catch(function (err) {
                that.loginData = null;
                throw 'Can\'t log in ' + err;
            });
        }
    }, {
        key: 'login_data',
        value: function login_data(data) {
            if (!data || !data.access_token || !data.refresh_token) {
                throw 'Invalid login data';
            }
            this.login_data = data;
        }
    }, {
        key: 'refresh_token',
        value: function refresh_token() {
            var _this2 = this;

            var uri = 'https://unite.nike.com/tokenRefresh?appVersion=296&experienceVersion=257&uxid=com.nike.commerce.nikedotcom.web&backendEnvironment=identity&browser=Google%20Inc.&os=undefined&mobile=false&native=false&visit=&visitor='; //locale=en_US
            var data = {
                client_id: 'HlHa2Cje3ctlaOqnxvgZXNaAs7T9nAuH',
                grant_type: 'refresh_token',
                refresh_token: this.loginData.refresh_token
            };
            this.refreshTokenAsked = true;
            return this.httpClient.Post(uri, null, data).then(function (data) {
                return _this2.loginData = JSON.parse(data);
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
            return this._GetWithAuthQueryString('/v3.0/me/activities', '&startTime=' + startTime + '&endTime' + endTime); //1501459200000  1503100194141 //&isStream=0
        }
    }, {
        key: 'me_activities_run_daily',
        value: function me_activities_run_daily(fromDate, toDate) {
            //2017-08-14   2017-08-21
            this._shouldBeLogged();
            return this._GetWithAuthInHeader('/plus/v3/historicalaggregates/aggregates/batch/daily/' + fromDate + '/' + toDate, '&metric_type=distance&activity_type=jogging&activity_type=run');
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
            var xml_tpl = '<?xml version="1.0" encoding="UTF-8"?>\n            <gpx\n            version="1.1"\n            creator="Paul du Pavillon - https://nikeplus.bullrox.net"\n            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n            xmlns="http://www.topografix.com/GPX/1/1"\n            xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"\n            xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">\n                <trk>\n                    <name><![CDATA[Running {RUNNING_DATE_TIME_HUM}]]></name>\n                    <trkseg>\n                        {LINES}\n                    </trkseg>\n                </trk>\n            </gpx>\n        ';
            var line_tpl = '<trkpt lat="{LAT}" lon="{LNG}"><ele>{ELE}</ele><time>{TIME_UTC}</time></trkpt>\r\n';

            return this.me_activity_detail(id).then(function (res) {
                var lines = '';
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
                    lines += line_tpl.replace('{LAT}', latitudes.values[index].value).replace('{LNG}', longitudes.values[index].value).replace('{ELE}', val.value).replace('{TIME_UTC}', new Date(val.end_epoch_ms).toISOString()); //TODO Convert to UTC;
                });
                return xml_tpl.replace('{RUNNING_DATE_TIME_HUM}', new Date(res.data.start_epoch_ms).toString()).replace('{LINES}', lines);
            });
        }
    }]);

    return NikeClient;
}();

exports.default = NikeClient;
