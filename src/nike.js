import {Gpx} from './gpx'
import {Tcx} from './tcx'
import {HttpClient} from './httpClient'
import Uuid from 'uuid/v1'
import * as Errors from './exceptions'

export class NikeClient {
  constructor(auth) {
    this._httpClient = new HttpClient()
    this._refreshTokenAsked = false
    this._tokenRefreshed = false
    this.authData = auth || null
  }
  _shouldBeLogged() {
    if (this.authData === null) {
      throw new Errors.NikeError('You are not logged in');
    }
    this._tokenRefreshed = false;
  }
  _handleRefreshToken(err, cb) {
    if (err.statusCode === 401 && !this._refreshTokenAsked) {
      return this.refresh_token().then(cb);
    }
    return Promise.reject({
      error: err,
      data: null
    });
  }
  _handleResponse(data) {
    const response = {
      error: null,
      data: JSON.parse(data)
    }
    this._refreshTokenAsked = false
    if (response.data && response.data && response.data.errors){
      if (response.data.errors.filter((err)=> err.code === 35).length > 0){return Promise.reject({statusCode:401})}
      response.error = data.errors[0]
      response.data = null
    }
    return Promise.resolve(response)
  }
  _Get(uri, headers = null) {
    return this._httpClient
      .Get(uri, headers)
      .then((data) => this._handleResponse(data));
  }
  _GetWithAuthQueryString(path, queryString = '') {
    const uri = 'https://api.nike.com' + path + '?access_token=' + this.authData.access_token + '&app=FUELBAND&format=json' + queryString; //locale=en_FR
    const cb = this._GetWithAuthQueryString.bind(this, path, queryString)

    return this._Get(uri)
      .catch((err) => this._handleRefreshToken(err, cb))
  }
  _GetWithAuthInHeader(path, queryString = '') {
    const headers = {
      'Authorization': 'Bearer ' + this.authData.access_token
    };
    const uri = 'https://api.nike.com' + path + '?format=json' + queryString
    const cb = this._GetWithAuthInHeader.bind(this, path, queryString)

    return this._Get(uri, headers)
      .catch((err) => this._handleRefreshToken(err, cb))
  }
  login(email, password) {
    const uri = 'https://unite.nike.com/loginWithSetCookie?appVersion=315' +
      '&experienceVersion=276&uxid=com.nike.commerce.nikedotcom.web' +
      '&locale=en_US&backendEnvironment=identity&browser=Google%20Inc.&os=undefined' +
      '&mobile=false&native=false&visit=1&visitor='+Uuid()
    const data = {
      'username': email,
      'password': password,
      'keepMeLoggedIn': true,
      'client_id': 'HlHa2Cje3ctlaOqnxvgZXNaAs7T9nAuH',
      'ux_id': 'com.nike.commerce.nikedotcom.web',
      'grant_type': 'password'
    };
    let that = this;
    return this._httpClient.Post(uri, null, data)
      .then((data) => {
        that.authData = JSON.parse(data)
        return Promise.resolve(that.authData)
      })
      .catch((err) => {
        that.authData = null
        let body = err.response.headers && err.response.headers['content-type'] === 'application/json' ? JSON.parse(err.response.body.trim().replace('\n', '')) : err.response.body
        let data = {code:err.statusCode,uri:err.response.request.uri.href,body: body}
        if (err.statusCode === 400 && body.error === 'InvalidRequest'){ throw new Errors.NikeApiChange(data) }
        throw new Errors.NikeLoginError(data)
      });
  }
  set_auth(data) {
    if (!data || !data.access_token || !data.refresh_token) {
      throw new Errors.NikeError('Invalid login data')
    }
    this.authData = data
  }
  refresh_token() {
    const uri = 'https://unite.nike.com/tokenRefresh?appVersion=296&experienceVersion=257&uxid=com.nike.commerce.nikedotcom.web&backendEnvironment=identity&browser=Google%20Inc.&os=undefined&mobile=false&native=false&visit=&visitor='; //locale=en_US
    const data = {
      client_id: 'HlHa2Cje3ctlaOqnxvgZXNaAs7T9nAuH',
      grant_type: 'refresh_token',
      refresh_token: this.authData.refresh_token
    };
    let that = this
    this._refreshTokenAsked = true

    return this._httpClient
      .Post(uri, null, data)
      .then((data) => {
        that._tokenRefreshed = true
        that.authData = JSON.parse(data)
        return Promise.resolve()
      })
  }
  me_summary() {
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/plus/v3/lifetimeaggs/me/summary')
  }
  me_detail() {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/nsl/user/get')
  }
  me_snapshot() {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/v2.0/me/snapshot')
  }
  me_achievements() {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/v3.0/me/achievements')
  }
  user_infos(upmIds) {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/plus/v3/userlookup/users', '&upmIds=' + upmIds)
  }
  me_activities_year(startTime, endTime) {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/v3.0/me/activities', '&startTime=' + startTime + '&endTime=' + endTime) //1501459200000  1503100194141 //&isStream=0
  }
  me_activities_run_daily(fromDate, toDate) { //2017-08-14   2017-08-21
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/plus/v3/historicalaggregates/aggregates/batch/daily/' + fromDate + '/' + toDate, '&metric_type=distance&activity_type=jogging&activity_type=run')
  }
  me_activities_before_id(id, limit, metrics, types) { //metrics=distance,pace
    limit = limit ||  10
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/sport/v3/me/activities/before_id/' + id, '&limit=' + limit + '&metrics=distance&types=jogging,run')
  }
  me_activities_before_time(time, limit, metrics, types) { //time = 1503507694194, types = jogging,run
    limit = limit ||  1
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/sport/v3/me/activities/before_time/' + time, '&limit=' + limit + '&types=jogging,run')
  }
  me_activity_detail(id) {
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/sport/v3/me/activity/' + id, '&metrics=ALL')
  }
  me_activity_to_gpx(id) {
    return  this.me_activity_detail(id)
                .then((run) => Promise.resolve(Gpx.ConvertFromNikeActivity(run)))
  }
  me_activity_to_tcx(id) {
    return  this.me_activity_detail(id)
                .then((run) => Promise.resolve(Tcx.ConvertFromNikeActivity(run)))
  }
}
