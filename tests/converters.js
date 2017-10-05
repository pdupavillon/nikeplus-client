import {Tcx} from '../src/tcx'
import {Gpx} from '../src/gpx'
import fs from 'fs'
const filePath = ''

let content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
let tcxContent = Tcx.ConvertFromNikeActivity({data:content})
fs.writeFileSync(filePath+'.tcx', tcxContent, {encoding:'utf-8'})

let gpxContent = Gpx.ConvertFromNikeActivity({data:content})
fs.writeFileSync(filePath+'.gpx', gpxContent, {encoding:'utf-8'})