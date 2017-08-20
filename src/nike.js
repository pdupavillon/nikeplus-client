export default class NikeClient {
    constructor(httpClient){
        this.loginData = null;
        this.httpClient = httpClient;
        this.refreshTokenAsked = false;
    }
    _shouldBeLogged(){
        if (this.loginData === null){
            throw 'You are not logged in';
        }
    }
    _handleRefreshToken(err, cb){
        if (err.statusCode === 401 && !this.refreshTokenAsked){
            return this.refresh_token().then(cb);
        }
        return Promise.reject({error: err, data:null});
    }
    _handleResponse(data){
        this.refreshTokenAsked = false;
        return Promise.resolve({error:null, data:JSON.parse(data)});
    }
    _Get(path, headers = null, queryString = ''){
        const cb = this._Get.bind(this, path,headers, queryString);
        
        return this.httpClient.Get(uri, headers)
        .then((data) => this._handleResponse(data))
        .catch((err) => this._handleRefreshToken(err, cb));        
    }
    _GetWithAuthQueryString(path, queryString = ''){
        const uri = 'https://api.nike.com'+path+'?access_token='+this.loginData.access_token+'&app=FUELBAND&format=json'+queryString; //locale=en_FR
        
        return this._Get(uri, null, queryString);
    }
    _GetWithAuthInHeader(path, queryString = ''){
        const headers = { 'Authorization': 'Bearer ' + this.loginData.access_token };
        const uri = 'https://api.nike.com'+path+'?format=json' + queryString;

        return this._Get(uri, headers, queryString);
    }

    /**
     * @param {string} email 
     * @param {string} password 
     * @memberof NikeClient
     */
    login(email, password){
        const uri = 'https://unite.nike.com/loginWithSetCookie?appVersion=295'+
                    '&experienceVersion=256&uxid=com.nike.commerce.nikedotcom.web'+
                    '&locale=en_US&backendEnvironment=identity&browser=Google%20Inc.&os=undefined'+
                    '&mobile=false&native=false&visit=1';
        const data = {
            "username": email,
            "password": password,
            "keepMeLoggedIn":true,
            "client_id":"HlHa2Cje3ctlaOqnxvgZXNaAs7T9nAuH",
            "ux_id":"com.nike.commerce.nikedotcom.web",
            "grant_type":"password"
        };
        let that = this;
        
        return this.httpClient.Post(uri, null, data)        
        .then((data) => {
            that.loginData = JSON.parse(data);
        })
        .catch((err) => {
            that.loginData = null;
            throw 'Can\'t log in ' + err;
        });
    }
    refresh_token(){
        const uri = 'https://unite.nike.com/tokenRefresh?appVersion=296&experienceVersion=257&uxid=com.nike.commerce.nikedotcom.web&backendEnvironment=identity&browser=Google%20Inc.&os=undefined&mobile=false&native=false&visit=&visitor='; //locale=en_US
        const data = {
            client_id: 'HlHa2Cje3ctlaOqnxvgZXNaAs7T9nAuH',
            grant_type: 'refresh_token',
            refresh_token: this.loginData.refresh_token
        };
        this.refreshTokenAsked = true;        
        return this.httpClient.Post(uri, null, data)
                .then((data) => this.loginData = JSON.parse(data));
    }
    me_summary(){
        this._shouldBeLogged();
        return this._GetWithAuthInHeader('/plus/v3/lifetimeaggs/me/summary');
    }
    me_detail(){
        this._shouldBeLogged();
        return this._GetWithAuthQueryString('/nsl/user/get');
    }
    me_snapshot(){
        this._shouldBeLogged();
        return this._GetWithAuthQueryString('/v2.0/me/snapshot');
    }
    me_achievements(){
        this._shouldBeLogged();
        return this._GetWithAuthQueryString('/v3.0/me/achievements');
    }
    user_infos(upmIds){
        this._shouldBeLogged();
        return this._GetWithAuthQueryString('/plus/v3/userlookup/users', '&upmIds='+upmIds);
    }
    me_activities_year(startTime, endTime){
        this._shouldBeLogged();
        return this._GetWithAuthQueryString('/v3.0/me/activities', '&startTime='+startTime+'&endTime'+endTime);//1501459200000  1503100194141 //&isStream=0
    }
    me_activities_run_daily(fromDate, toDate){ //2017-08-14   2017-08-21
        this._shouldBeLogged();
        return this._GetWithAuthInHeader('/plus/v3/historicalaggregates/aggregates/batch/daily/'+fromDate+'/'+toDate, '&metric_type=distance&activity_type=jogging&activity_type=run');
    }
    me_activity_detail(id){
        this._shouldBeLogged();
        return this._GetWithAuthInHeader('/sport/v3/me/activity/'+id, '&metrics=ALL');
    }
    me_activity_to_gpx(id){
        const xml_tpl =
        `<?xml version="1.0" encoding="UTF-8"?>
            <gpx
            version="1.1"
            creator="Paul du Pavillon - https://nikeplus.bullrox.net"
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
            let lines = '';
            const elevations = res.data.metrics.filter((val, index)=> val.type === 'elevation')[0];
            const latitudes = res.data.metrics.filter((val, index)=> val.type === 'latitude')[0];
            const longitudes = res.data.metrics.filter((val, index)=> val.type === 'longitude')[0];

            elevations.values.forEach((val, index) => {
                lines +=    line_tpl
                            .replace('{LAT}', latitudes.values[index].value)
                            .replace('{LNG}', longitudes.values[index].value)
                            .replace('{ELE}', val.value)
                            .replace('{TIME_UTC}', new Date(val.end_epoch_ms).toISOString()); //TODO Convert to UTC;
            });
            return  xml_tpl
                    .replace('{RUNNING_DATE_TIME_HUM}', new Date(res.data.start_epoch_ms).toString())
                    .replace('{LINES}', lines);
        });
    }
}