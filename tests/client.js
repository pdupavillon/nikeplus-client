import NikeClient from '../src/nike';
import HttpClient from '../httpClient';

let client = new NikeClient(HttpClient);
client.login('----email----', '---password---')
.then(client.me_summary.bind(client))
//.then(client.me_summary.bind(client))
//.then(client.me_detail.bind(client))
//.then(client.me_snapshot.bind(client))
//.then(client.user_infos.bind(client, 'xxxxxx'))
//.then(client.me_activity_to_gpx.bind(client, 'xxxxxxx'))
.then(function(data){
    console.log(data);
})
.catch(function(err){
    console.error(err);
});