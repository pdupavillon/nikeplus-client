import XmlHelper from './xmlHelper'

export default class Tcx {
  static ConvertFromNikeActivity(res) {
    const elevations = res.data.metrics.filter((val, index) => val.type === 'elevation')[0]
    const latitudes = res.data.metrics.filter((val, index) => val.type === 'latitude')[0]
    const longitudes = res.data.metrics.filter((val, index) => val.type === 'longitude')[0]
    const speeds = res.data.metrics.filter((val, index) => val.type === 'speed')[0]
    const distances = res.data.metrics.filter((val, index) => val.type === 'distance')[0]
    
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
            Id: new Date(res.data.start_epoch_ms).toISOString(),
            Lap: {
              TotalTimeSeconds: res.data.active_duration_ms,
              DistanceMeters: res.data.summaries.filter((s) => s.metric === 'distance')[0].value * 1000,
              MaximumSpeed: speeds.values.map((s) => s.value).reduce((prev, next) => Math.max(prev, next)) * 0.277778, //km/h --> m/s
              Calories: res.data.summaries.filter((s) => s.metric === 'calories')[0].value * 1000,
              Intensity: 'Active',
              TriggerMethod: 'Manual',
              Track: {
                Trackpoint: []
              }
            }
          }
        },
        Author:{
          '@xsi:type=':'Application_t',
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
    elevations.values.forEach((val, index) => trackPoints.push({
          Time: val.end_epoch_ms,
          Position: {
            LatitudeDegrees: latitudes.values[index].value,
            LongitudeDegrees: longitudes.values[index].value,
          },
          AltitudeMeters: val.value,
    }))

    distances.values.forEach((d)=> {
      const matches = trackPoints.filter((t)=> t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms)
      matches.forEach((m) => m.DistanceMeters = (d.value / matches.length) * 1000)
    })

    speeds.values.forEach((d)=> {
      const matches = trackPoints.filter((t)=> t.Time >= d.start_epoch_ms && t.Time <= d.end_epoch_ms)
      matches.forEach((m) => m.Extensions = {
            TPX: {
              '@xmlns': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2',
              Speed: d.value * 0.277778 //km/h --> m/s
            }        
      })
    })

    trackPoints.forEach((t) => t.Time = new Date(t.Time).toISOString())
    result.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint = trackPoints
    return XmlHelper.ConvertFromObj(result)
  }
}