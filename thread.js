require('./extend-json')
const EE = require('events')
const { fork } = require('child_process')
const createUnique = require('./unique')

const unique = createUnique()

class Thread extends EE {

  constructor (thread = null) {
    super()
    this.thread = typeof thread === 'string' ? fork(thread) : process
    this.routes = {}
    this.thread.on('message', ([rid, route, data]) => {
      if(typeof data === 'string') data = JSON.parse(data)
      if(Thread.debug) console.log(`[${process.title}] thread:`, [rid, route, data].join(', '))
      if(rid !== 'send'){
        this.emit(rid, data)
        const response = (data) => {
          // console.log('thread:', data, JSON.stringify(data))
          if(typeof data === 'undefined') {
            return this.thread.send([rid, route])
          } else {
            return this.thread.send([rid, route, JSON.stringify(data)])
          }
        }
        this.routes[route] && this.routes[route].forEach(cb => {
          const ret = typeof data !== 'undefined' ? cb(data, response) : cb(response)
          if(ret instanceof Promise) ret.catch(console.log)
        })
      } else {
        this.routes[route] && this.routes[route].forEach(cb => cb(data))
      }
    })
  }

  async request (route, data) {
    return new Promise((ok, fail) => {
      const rid = unique('RID')
      const listener = data => {
        this.off(rid, listener)
        ok(data)
      }
      this.on(rid, listener)
      if(typeof data === 'undefined') {
        this.thread.send([rid, route])
      } else {
        this.thread.send([rid, route, JSON.stringify(data)])
      }
    })
  }

  route (route, cb) {
    this.routes[route] = this.routes[route] || []
    this.routes[route].push(cb)
  }

  send (route, data) {

    if(typeof data === 'undefined') {
      this.thread.send(['send', route])
    } else {
      this.thread.send(['send', route, JSON.stringify(data)])
    }
  }

}

Thread.debug = false

module.exports = Thread
