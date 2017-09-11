import XmlHelper from './xmlHelper'
import dateFormat from 'dateformat'
export default class Tcx {
  static ConvertFromNikeActivity(res) {
    var arrTo = [];
    ['distance', 'steps', 'speed', 'pace', 'calories', 'ascent', 'descent', 'elevation', 'latitude', 'longitude', 'heart_rate'].forEach(function (name, i) {
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
    arrTo.forEach(function (obj, i) {
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
    arrTo.forEach(function (obj, i) {
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
    laps.forEach(function (lapPoints, i) {
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
        lapPoints.forEach(function (obj, i) {
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

    })

    return XmlHelper.ConvertFromObj(tcd)
  }
}