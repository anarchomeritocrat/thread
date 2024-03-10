const randomString = (length, base = 16) => {
  if(base > 36 || base < 2) throw new Error('Random string base must be in range 2 - 36')
  var result = '';
  while((result += Math.random().toString(base).slice(2)).length < length );
  return result.slice(0, length)
}

const createUnique = () => {
  counter = 0
  return (prefix = '') => {
    const uid = `${
      prefix ? prefix + '-' : ''
    }${
      randomString(6, 36)
    }-${
      counter.toString(36).padStart(4, '0')
    }-${
      Date.now().toString(36)
    }`
    counter = counter < parseInt('zzzz', 36) ? counter + 1 : 0
    return uid
  }
}

module.exports = createUnique
