function json2xml(o, tab) {
  var toXml = function(v, name, ind) {
      var xml = "";
      if (v instanceof Array) {
        for (var i = 0, n = v.length; i < n; i++)
          xml += toXml(v[i], name, ind) + "";
      } else if (typeof(v) == "object") {
        var hasChild = false;
        xml += ind + "<" + name;
        for (var m in v) {
          if (m.charAt(0) == "@")
            xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
          else
            hasChild = true;
        }
        xml += hasChild ? ">\r\n" : "/>";
        if (hasChild) {
          for (var m in v) {
            if (m == "#text")
              xml += v[m];
            else if (m == "#cdata")
              xml += "<![CDATA[" + v[m] + "]]>";
            else if (m.charAt(0) != "@")
              xml += toXml(v[m], m, ind + "\t");
          }
          xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">\r\n";
        }
      } else {
        try {
          xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">\r\n";
        } catch (e) {
          //  console.log('undefined ... ' + name);
        }
      }
      return xml;
    },
    xml = "";
  for (var m in o)
    xml += toXml(o[m], m, "");
  return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}


export default class NikeClient {
  constructor(httpClient) {
    this._httpClient = httpClient
    this._refreshTokenAsked = false
    this._tokenRefreshed = false
    this.authData = null
  }
  _shouldBeLogged() {
    if (this.authData === null) {
      throw 'You are not logged in';
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
    this._refreshTokenAsked = false;
    return Promise.resolve({
      error: null,
      data: JSON.parse(data)
    });
  }
  _Get(uri, headers = null) {
    return this._httpClient
      .Get(uri, headers)
      .then((data) => this._handleResponse(data));
  }
  _GetWithAuthQueryString(path, queryString = '') {
    const uri = 'https://api.nike.com' + path + '?access_token=' + this.authData.access_token + '&app=FUELBAND&format=json' + queryString; //locale=en_FR
    const cb = this._GetWithAuthQueryString.bind(this, path, queryString);

    return this._Get(uri)
      .catch((err) => this._handleRefreshToken(err, cb));
  }
  _GetWithAuthInHeader(path, queryString = '') {
    const headers = {
      'Authorization': 'Bearer ' + this.authData.access_token
    };
    const uri = 'https://api.nike.com' + path + '?format=json' + queryString;
    const cb = this._GetWithAuthInHeader.bind(this, path, queryString);

    return this._Get(uri, headers)
      .catch((err) => this._handleRefreshToken(err, cb));
  }
  login(email, password) {
    const uri = 'https://unite.nike.com/loginWithSetCookie?appVersion=295' +
      '&experienceVersion=256&uxid=com.nike.commerce.nikedotcom.web' +
      '&locale=en_US&backendEnvironment=identity&browser=Google%20Inc.&os=undefined' +
      '&mobile=false&native=false&visit=1';
    const data = {
      "username": email,
      "password": password,
      "keepMeLoggedIn": true,
      "client_id": "HlHa2Cje3ctlaOqnxvgZXNaAs7T9nAuH",
      "ux_id": "com.nike.commerce.nikedotcom.web",
      "grant_type": "password"
    };
    let that = this;

    return this._httpClient.Post(uri, null, data)
      .then((data) => {
        that.authData = JSON.parse(data);
        return Promise.resolve(that.authData);
      })
      .catch((err) => {
        that.authData = null;
        throw 'Can\'t log in ' + err;
      });
  }
  set_auth(data) {
    if (!data || !data.access_token || !data.refresh_token) {
      throw 'Invalid login data';
    }
    this.authData = data;
  }
  refresh_token() {
    const uri = 'https://unite.nike.com/tokenRefresh?appVersion=296&experienceVersion=257&uxid=com.nike.commerce.nikedotcom.web&backendEnvironment=identity&browser=Google%20Inc.&os=undefined&mobile=false&native=false&visit=&visitor='; //locale=en_US
    const data = {
      client_id: 'HlHa2Cje3ctlaOqnxvgZXNaAs7T9nAuH',
      grant_type: 'refresh_token',
      refresh_token: this.authData.refresh_token
    };
    let that = this;
    this._refreshTokenAsked = true;

    return this._httpClient
      .Post(uri, null, data)
      .then((data) => {
        that._tokenRefreshed = true;
        that.authData = JSON.parse(data)
        return Promise.resolve()
      })
  }
  me_summary() {
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/plus/v3/lifetimeaggs/me/summary');
  }
  me_detail() {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/nsl/user/get');
  }
  me_snapshot() {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/v2.0/me/snapshot');
  }
  me_achievements() {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/v3.0/me/achievements');
  }
  user_infos(upmIds) {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/plus/v3/userlookup/users', '&upmIds=' + upmIds);
  }
  me_activities_year(startTime, endTime) {
    this._shouldBeLogged();
    return this._GetWithAuthQueryString('/v3.0/me/activities', '&startTime=' + startTime + '&endTime=' + endTime); //1501459200000  1503100194141 //&isStream=0
  }
  me_activities_run_daily(fromDate, toDate) { //2017-08-14   2017-08-21
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/plus/v3/historicalaggregates/aggregates/batch/daily/' + fromDate + '/' + toDate, '&metric_type=distance&activity_type=jogging&activity_type=run');
  }
  me_activities_before_id(id, limit, metrics, types) { //metrics=distance,pace
    limit = limit ||  10
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/sport/v3/me/activities/before_id/' + id, '&limit=' + limit + '&metrics=distance&types=jogging,run');
  }
  me_activities_before_time(time, limit, metrics, types) { //time = 1503507694194, types = jogging,run
    limit = limit ||  1
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/sport/v3/me/activities/before_time/' + time, '&limit=' + limit + '&types=jogging,run');
  }
  me_activity_detail(id) {
    this._shouldBeLogged();
    return this._GetWithAuthInHeader('/sport/v3/me/activity/' + id, '&metrics=ALL');
  }
  me_activity_to_gpx(id) {
    const xml_tpl =
      `<?xml version="1.0" encoding="UTF-8"?>
            <gpx
            version="1.1"
            creator="Paul du Pavillon - https://nike.bullrox.net"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns="http://www.topografix.com/GPX/1/1"
            xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
            xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
                <trk>
                    <name><![CDATA[Running {RUNNING_DATE_TIME_HUM}]]></name>
                    <trkseg>
                        {LINES}
                    </trkseg>
                </trk>
            </gpx>
        `;
    const line_tpl = `<trkpt lat="{LAT}" lon="{LNG}"><ele>{ELE}</ele><time>{TIME_UTC}</time></trkpt>\r\n`;

    return this.me_activity_detail(id)
      .then((res) => {

        console.log(JSON.stringify(res, null, 6));

        let lines = '';
        const distances = res.data.metrics.filter((val, index) => val.type === 'distance')[0];
        const steps = res.data.metrics.filter((val, index) => val.type === 'steps')[0];
        const speeds = res.data.metrics.filter((val, index) => val.type === 'speed')[0];
        const paces = res.data.metrics.filter((val, index) => val.type === 'pace')[0];
        const calories = res.data.metrics.filter((val, index) => val.type === 'calories')[0];
        const ascents = res.data.metrics.filter((val, index) => val.type === 'ascent')[0];
        const descents = res.data.metrics.filter((val, index) => val.type === 'descents')[0];
        const elevations = res.data.metrics.filter((val, index) => val.type === 'elevation')[0];
        const latitudes = res.data.metrics.filter((val, index) => val.type === 'latitude')[0];
        const longitudes = res.data.metrics.filter((val, index) => val.type === 'longitude')[0];

        elevations.values.forEach((val, index) => {
          lines += line_tpl
            .replace('{LAT}', latitudes.values[index].value)
            .replace('{LNG}', longitudes.values[index].value)
            .replace('{ELE}', val.value)
            .replace('{TIME_UTC}', new Date(val.end_epoch_ms).toISOString()); //TODO Convert to UTC;
        });
        return xml_tpl
          .replace('{RUNNING_DATE_TIME_HUM}', new Date(res.data.start_epoch_ms).toString())
          .replace('{LINES}', lines);
      });
  }

  me_activity_to_tcx(id) {
    return this.me_activity_detail(id)
      .then((res) => {
        var arrTo = [];
        ['distance', 'steps', 'speed', 'pace', 'calories', 'ascent', 'descent', 'elevation', 'latitude', 'longitude', 'heart_rate'].forEach(function(name, i) {
          var arrFrom = res.data.metrics.filter((val, index) => val.type === name)[0];
          if (arrFrom != null) {
            var arrToIndex = 0;
            arrFrom.values.forEach((val, index) => {
              while (arrTo.length > arrToIndex && arrTo[arrToIndex].start_epoch_ms < val.start_epoch_ms) {
                arrToIndex++;
              }
              var obj = null;
              if (arrTo.length > arrToIndex && arrTo[arrToIndex].start_epoch_ms == val.start_epoch_ms) {
                obj = arrTo[arrToIndex];
              }
              if (obj == null) {
                obj = {};
                obj['start_epoch_ms'] = val.start_epoch_ms;
                obj['end_epoch_ms'] = val.end_epoch_ms;
                arrTo.splice(arrToIndex, 0, obj);
              }
              obj[name] = val.value;
            });
          }
        });

        var haltArray = res.data.moments.filter((val, index) => val.key === 'halt');
        var dateFormat = require('dateformat');
        var tcd = {
          TrainingCenterDatabase: {
            '@xsi:schemaLocation': "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd",
            '@xmlns:ns5': "http://www.garmin.com/xmlschemas/ActivityGoals/v1",
            '@xmlns:ns3': "http://www.garmin.com/xmlschemas/ActivityExtension/v2",
            '@xmlns:ns2': "http://www.garmin.com/xmlschemas/UserProfile/v2",
            '@xmlns': "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2",
            '@xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
            '@xmlns:ns4': "http://www.garmin.com/xmlschemas/ProfileExtension/v1",

            Activities: {
              Activity: {
                '@Sport': "Running",
                Id: dateFormat(new Date(res.data.start_epoch_ms), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"),
                Lap: []
              }
            }

          }
        }

        var lastv = null;
        var cummulatedDistance = 0;
        var cummulatedCalories = 0;
        arrTo.forEach(function(obj, i) {
          if (obj.steps != null) {
            obj.cadence = Math.round((60 * obj.steps) / ((obj.end_epoch_ms - obj.start_epoch_ms) / 500)); //csak 1 lábas azért nem 1000
          }
          lastv = obj;
          if (obj.distance) cummulatedDistance += obj.distance * 1000;
          if (obj.calories) cummulatedCalories += obj.calories;
        });


        var laps = [];
        var haltArrayPointer = 0;
        var limitMs = 9999999999999;
        if (haltArray.length > haltArrayPointer) {
          limitMs = haltArray[haltArrayPointer].timestamp;
        }
        var lapObjs = [];
        laps.push(lapObjs);
        arrTo.forEach(function(obj, i) {
          if (obj.start_epoch_ms < limitMs) {
            lapObjs.push(obj);
          } else {
            lapObjs = [];
            laps.push(lapObjs);
            haltArrayPointer++;
            if (haltArray.length > haltArrayPointer) {
              limitMs = haltArray[haltArrayPointer].timestamp;
            } else {
              limitMs = 9999999999999;
            }
          }
        });
        laps.forEach(function(lapPoints, i) {
          if (lapPoints.length > 0) {
            var lastv = null;
            var num = 0;

            let lines = '';
            var maxhr = 0;
            var lap = {
              '@StartTime': dateFormat(new Date(lapPoints[0].start_epoch_ms), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"),
              TotalTimeSeconds: Math.round((lapPoints[lapPoints.length - 1].end_epoch_ms - lapPoints[0].start_epoch_ms) / 1000),
              Intensity: "Active",
              TriggerMethod: "Manual",
              Track: {
                Trackpoint: []
              }
            }
            tcd.TrainingCenterDatabase.Activities.Activity.Lap.push(lap);
            cummulatedDistance = 0;
            cummulatedCalories = 0;
            var hrTime = 0;
            var hrSum = 0;
            lapPoints.forEach(function(obj, i) {
              if (obj.distance) cummulatedDistance += obj.distance * 1000;
              if (obj.calories) cummulatedCalories += obj.calories;
              var Trackpoint = {
                Time: dateFormat(new Date(obj.start_epoch_ms), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"),
                Position: {
                  LatitudeDegrees: obj.latitude,
                  LongitudeDegrees: obj.longitude,
                },
                AltitudeMeters: obj.elevation,
                DistanceMeters: cummulatedDistance,
                Extensions: {
                  'ns3:TPX': {
                    'ns3:RunCadence': obj.cadence,
                  }
                }
              };
              if (obj.speed != null) {
                Trackpoint.Extensions['ns3:TPX']['ns3:Speed'] = obj.speed * 0.277777778; //convert kmh to mps
              }
              if (obj.heart_rate != null) {
                Trackpoint.HeartRateBpm = {
                  Value: obj.heart_rate
                };
                if (obj.heart_rate > maxhr) {
                  maxhr = obj.heart_rate;
                }
                hrTime += 60000;
                hrSum += obj.heart_rate;
              }
              lap.Track.Trackpoint.push(Trackpoint);

            });
            if (maxhr != 0) {
              lap.AverageHeartRateBpm = {
                Value: Math.round((hrSum / (hrTime / 1000)) * 60)
              };
              lap.MaximumHeartRateBpm = {
                Value: maxhr
              }
            }
            lap.DistanceMeters = cummulatedDistance;
            lap.Calories = Math.round(cummulatedCalories);

          }

        });

        return '<?xml version="1.0" encoding="UTF-8" ?>\r\n' + json2xml(tcd, "\t");

      });
  }
}
