'use strict'

const formatter = require('./lib/node-0.10-formatter')

let lastPrepareStackTrace = Error.prepareStackTrace

Object.defineProperty(Error, 'prepareStackTrace', {
  configurable: true,
  enumerable: true,
  get: function () {
    return prepareStackTrace
  },
  set: function (fn) {
    lastPrepareStackTrace = fn
  }
})

module.exports = function (err) {
  err.stack
  return err.__error_callsites
}

function prepareStackTrace (err, callsites) {
  Object.defineProperty(err, '__error_callsites', {
    enumerable: false,
    configurable: true,
    writable: false,
    value: callsites
  })
  return (lastPrepareStackTrace || formatter)(err, callsites)
}
