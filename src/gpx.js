import XmlHelper from './xmlHelper'
import {NikeHelper} from './nikeHelper'

export class Gpx {
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
        const elevations = NikeHelper.GetMetric(res.data,'elevation')
        const latitudes = NikeHelper.GetMetric(res.data,'latitude')
        const longitudes = NikeHelper.GetMetric(res.data,'longitude')

        latitudes.forEach((item, index) => def.gpx.trk.trkseg.trkpt
        .push({
            '@lat':item.value,
            '@lon':longitudes[index].value,
            ele: elevations && elevations.length > index ? elevations[index].value : null,
            time: new Date(item.end_epoch_ms).toISOString()
        }))

        return XmlHelper.ConvertFromObj(def)
    }
}