'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gpx = require('./gpx');

var _gpx2 = _interopRequireDefault(_gpx);

var _tcx = require('./tcx');

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