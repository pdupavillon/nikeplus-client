import Tcx from '../src/tcx'
import fs from 'fs'
const filePath = ''
let content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
let tcxContent = Tcx.ConvertFromNikeActivity({data:content})
fs.writeFileSync(filePath+'.tcx', tcxContent, {encoding:'utf-8'})