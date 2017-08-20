import request from 'request-promise-native';

class HttpClient{
    constructor(){
    }
    _call(method, uri, headers, data){
        let params = {
            method: method,
            uri: uri
        };
        if (headers){
            params.headers = headers;
        }
        if (data){
            params.body = JSON.stringify(data);
        }
        return request(params);
    }

    Get = (uri, headers = null) => this._call('GET', uri, headers, null);
    Post = (uri, headers = null, data = null) => this._call('POST',uri, headers, data);
}

export default new HttpClient();