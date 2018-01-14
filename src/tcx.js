import XmlHelper from './xmlHelper'
import { NikeHelper } from './nikeHelper'
import GeoLib from 'geolib'

export class Tcx {
  static ConvertFromNikeActivity(res) {
    const data = res.data
    const elevations = NikeHelper.GetMetric(data, 'elevation')
    const latitudes = NikeHelper.GetMetric(data, 'latitude')
    const longitudes = NikeHelper.GetMetric(data, 'longitude')
    const speeds = NikeHelper.GetMetric(data, 'speed')
    const distances = NikeHelper.GetMetric(data, 'distance')
    const heartRates = NikeHelper.GetMetric(data, 'heart_rate')
    
    let result = {
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
            'Notes': 'Generated on : nike.bullrox.net',
            Id: new Date(data.start_epoch_ms).toISOString(),
            Lap: {
              '@StartTime':new Date(data.start_epoch_ms).toISOString(),
              TotalTimeSeconds: (data.active_duration_ms / 1000.0).toString(),
              DistanceMeters: !!NikeHelper.GetSummary(data, 'distance') ? NikeHelper.GetSummary(data, 'distance').value * 1000 : null,
              MaximumSpeed: !!speeds ? speeds.map((s) => s.value).reduce((prev, next) => Math.max(prev, next)) * 0.277778 : null, //km/h --> m/s
              Calories: !!NikeHelper.GetSummary(data,'calories') ? NikeHelper.GetSummary(data,'calories').value : null,
              Intensity: 'Active',
              TriggerMethod: 'Manual',
              AverageHeartRateBpm:null,
              MaximumHeartRateBpm:null,
              Track: {
                Trackpoint: []
              }
            }
          }
        },
        Author:{
          '@xsi:type':'Application_t',
          Name:'Paul du Pavillon - https://nike.bullrox.net',
          Build:{
            Version: {
              VersionMajor:1,
              VersionMinor:0,
              BuildMajor:1,
              BuildMinor:0
            }
          },
          LangID:'en'
        }
      }
    }
    let trackPoints = []

    if (!!NikeHelper.GetSummary(data, 'heart_rate')){
      result.TrainingCenterDatabase.Activities.Activity.Lap.AverageHeartRateBpm = {Value: NikeHelper.GetSummary(data, 'heart_rate').value}
    }
    if (heartRates){
      result.TrainingCenterDatabase.Activities.Activity.Lap.MaximumHeartRateBpm = {Value: heartRates.map((h) => h.value).reduce((prev, next) => Math.max(prev, next))}
    }

    (latitudes||[]).forEach((item, index) => trackPoints.push({
          Time: item.end_epoch_ms,
          Position: {
            LatitudeDegrees: latitudes[index].value,
            LongitudeDegrees: longitudes[index].value,
          }
          //AltitudeMeters: elevations && elevations.length > 0 && elevations.length > index ? elevations[index].value : null //Elevation is not altitude
    }));

    // (distances || []).forEach((d)=> {
    //   const matches = trackPoints.filter((t)=> t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms && t.DistanceMeters === undefined)
    //   matches.forEach((m) => m.DistanceMeters = ((d.value * 1000) / matches.length))
    // });

    trackPoints.forEach((t, i) => {
      if (i-1 >= 0){
        t.DistanceMeters = GeoLib.getDistance({latitude:trackPoints[i-1].Position.LatitudeDegrees, longitude:trackPoints[i-1].Position.LongitudeDegrees},{latitude:t.Position.LatitudeDegrees, longitude:t.Position.LongitudeDegrees}, 1, 3)
      }
    });

    //cumulative distance
    let sum = 0;
    trackPoints.forEach((t) => {
      sum += t.DistanceMeters >= 0 ? t.DistanceMeters : 0
      t.DistanceMeters = t.DistanceMeters >= 0 ? sum : null
    });

    (speeds || []).forEach((d)=> {
      const matches = trackPoints.filter((t)=> t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms)
      matches.forEach((m) => m.Extensions = {
            TPX: {
              '@xmlns': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2',
              Speed: d.value * 0.277778 //km/h --> m/s
            }        
      })
    });

    (heartRates || []).forEach((d)=> {
      let matches = trackPoints.filter((t)=> (t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms) ||
                                              (t.Time <= d.end_epoch_ms && t.HeartRateBpm === undefined))//sometimes heartRates datetime are out of bound of lat/lng records
      matches.forEach((m) => m.HeartRateBpm = {Value:d.value})
    });

    trackPoints.forEach((t) => t.Time = new Date(t.Time).toISOString())
    result.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint = trackPoints
    return XmlHelper.ConvertFromObj(result)
  }
}