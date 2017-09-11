import XmlHelper from './xmlHelper'

export default class Gpx {
    static ConvertFromNikeActivity(res){
        let def = {
            gpx:{
                '@version':'1.1',
                '@creator':'Paul du Pavillon - https://nike.bullrox.net',
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@xmlns':'http://www.topografix.com/GPX/1/1',
                '@xsi:schemaLocation':'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd',
                '@xmlns:gpxtpx':'http://www.garmin.com/xmlschemas/TrackPointExtension/v1',
                trk:{
                    '#cdata#name':'Running '+new Date(res.data.start_epoch_ms).toString(),
                    trkseg:{
                        trkpt:[]
                    }
                }
            }
        }
        let lines = ''
        const elevations = res.data.metrics.filter((val, index) => val.type === 'elevation')[0]
        const latitudes = res.data.metrics.filter((val, index) => val.type === 'latitude')[0]
        const longitudes = res.data.metrics.filter((val, index) => val.type === 'longitude')[0]

        elevations.values.forEach((val, index) => def.gpx.trk.trkseg.trkpt
        .push({
            '@lat':latitudes.values[index].value,
            '@lon':longitudes.values[index].value,
            ele: val.value,
            time: new Date(val.end_epoch_ms).toISOString()
        }))

        return XmlHelper.ConvertFromObj(def)
    }
}