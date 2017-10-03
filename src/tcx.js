import XmlHelper from './xmlHelper'

const _getMetric = (data, name) => {
  let result = data.metrics.filter((val) => val.type === name)
  return (result && result.length === 1 && result[0].values && result[0].values.length > 0) ? result[0].values : null
}
const _getSummary = (data, name) => {
  let result = data.summaries.filter((s) => s.metric === name)
  return (result && result.length === 1 && result[0]) ? result[0] : null
}

export default class Tcx {
  static ConvertFromNikeActivity(res) {
    const data = res.data
    const elevations = _getMetric(data, 'elevation')
    const latitudes = _getMetric(data, 'latitude')
    const longitudes = _getMetric(data, 'longitude')
    const speeds = _getMetric(data, 'speed')
    const distances = _getMetric(data, 'distance')
    const heartRates = _getMetric(data, 'heart_rate')
    
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
              TotalTimeSeconds: data.active_duration_ms,
              DistanceMeters: _getSummary(data, 'distance').value * 1000,
              MaximumSpeed: speeds ? speeds.map((s) => s.value).reduce((prev, next) => Math.max(prev, next)) * 0.277778 : null, //km/h --> m/s
              Calories: _getSummary(data,'calories').value,
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

    if (_getSummary(data, 'heart_rate')){
      result.TrainingCenterDatabase.Activities.Activity.Lap.AverageHeartRateBpm = {Value: _getSummary(data, 'heart_rate').value}
    }
    if (heartRates){
      result.TrainingCenterDatabase.Activities.Activity.Lap.MaximumHeartRateBpm = {Value: heartRates.map((h) => h.value).reduce((prev, next) => Math.max(prev, next))}
    }

    latitudes.forEach((item, index) => trackPoints.push({
          Time: item.end_epoch_ms,
          Position: {
            LatitudeDegrees: latitudes[index].value,
            LongitudeDegrees: longitudes[index].value,
          },
          AltitudeMeters: elevations ? elevations[index].value : null
    }));

    (distances || []).forEach((d)=> {
      const matches = trackPoints.filter((t)=> t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms)
      matches.forEach((m) => m.DistanceMeters = (d.value / matches.length) * 1000)
    });
    
    // cumulated Distance
    trackPoints.forEach((t,i)=> ((!!t.DistanceMeters) ? t.DistanceMeters += (i > 0 ? trackPoints[i-1].DistanceMeters : 0) : null));

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
      const matches = trackPoints.filter((t)=> t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms)
      matches.forEach((m) => m.HeartRateBpm = {Value:d.value})
    });

    trackPoints.forEach((t) => t.Time = new Date(t.Time).toISOString())
    result.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint = trackPoints
    return XmlHelper.ConvertFromObj(result)
  }
}