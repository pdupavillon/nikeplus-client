export default class XmlHelper {
    static _node(name, value, deep){
        let node = ''
        if (value instanceof Array){
            value.forEach((v,i) => node+= '\n'.repeat(i>0?1:0)+XmlHelper._node(name, v,deep))            
        }
        else if (value instanceof Object){
            const attributes = Object.keys(value).filter((k) => k.startsWith('@'))
            const childs = Object.keys(value).filter((k) => !k.startsWith('@'))
            let content = ''
            node = '\t'.repeat(deep)+'<'+name
            attributes.forEach((k) => node += ' '+k.substr(1)+'="'+value[k]+'"')
            childs.forEach((k,i) => content+= '\n'+XmlHelper._node(k, value[k],deep+1)+'\n'.repeat(i+1==childs.length?1:0))
            node += (childs.length === 0 || content.replace(/\s|\n|\t/gm,'').length === 0) ? '/>' : '>'+content
            node += (childs.length > 0 && content.replace(/\s|\n|\t/gm,'').length > 0) ? '\t'.repeat(deep)+'</'+name+'>' : ''
        }
        else if (value !== null && value !== undefined){
            if (name.startsWith('#cdata#')){
                name = name.replace('#cdata#','')
                value = '<![CDATA['+value+']]>'
            }
            node += '\t'.repeat(deep)+'<'+name+'>'+value.toString() +'</'+name+'>'
        }
        return node
    }
    static ConvertFromObj(jsonObj) {
        let xml = '<?xml version="1.0" encoding="UTF-8" ?>\r\n'
        Object.keys(jsonObj).forEach((k) => xml += XmlHelper._node(k, jsonObj[k],0))
        return xml
    }
}