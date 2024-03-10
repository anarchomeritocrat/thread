function extendJSON(){
  const {parse, stringify} = JSON
  JSON.parse = (str) => parse(str, (k, v) => {
    return typeof v === 'string' && /^\-?\d+n$/.test(v) ? BigInt(v.slice(0,-1)) : v
  })

  JSON.stringify = (data, replace, space) => stringify(data, (k, v) => {
    v = typeof v === 'bigint' ? v.toString() + 'n' : v
    if(typeof replace === 'function') return replace(k, v)
    if(replace instanceof Array) return replace.includes(k) ? v : undefined
    return v
  }, space)
}

extendJSON()
