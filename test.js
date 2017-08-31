import NikeClient from './src/nike';
import HttpClient from './httpClient';

var fs = require('fs');
var dateFormat = require('dateformat');

function fillCodes(client, dl) {
  client.me_activities_before_time(dl, 100, 'all').then(function(data) {

      if (data.data.activities) {
        data.data.activities.forEach(function(val, i) {
          var code = val.id;
          var dateStr = dateFormat(new Date(val.start_epoch_ms), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'");
          //-------------------------------------

          client.me_activity_detail(code)
            .then(function(data) {

                console.log(dateStr+"_"+code+".json");
              fs.writeFile("----base_dir----"+dateStr+"_"+code+".json", JSON.stringify(data), function(err) {
                if (err) {
                  return console.log(err);
                }
                console.log("The file was saved!");
              })
            })
            .catch(function(err) {
              console.error(err);
            });
          //-------------------------------------
          client.me_activity_to_tcx(code)
            .then(function(data) {
              console.log(dateStr+"_"+code+".tcx");

              fs.writeFile("----base_dir----"+dateStr+"_"+code+".tcx", data, function(err) {
                if (err) {
                  return console.log(err);
                }
                console.log("The file was saved!");
              })
            })
            .catch(function(err) {
              console.error(err);
            });
          //-------------------------------------

        });
      }

      if (data.data.paging && data.data.paging.before_time) {
        fillCodes(client, data.data.paging.before_time);
      }

    })
    .catch(function(err) {
      console.error(err);
    });
}
let client = new NikeClient(HttpClient);
client.login('----email----', '---password---')
  .then(function() {
    fillCodes(client, new Date(new Date().getFullYear(), 11, 31).valueOf());
  })
  .catch(function(err) {
    console.error(err);
  });

