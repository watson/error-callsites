'use strict'

const fallback = Error.prepareStackTrace || require('./lib/node-0.10-formatter')

let lastPrepareStackTrace = fallback

Object.defineProperty(Error, 'prepareStackTrace', {
  configurable: true,
  enumerable: true,
  get: function () {
    return prepareStackTrace
  },
  set: function (fn) {
    // Don't set `lastPrepareStackTrace` to ourselves. If we did, we'd end up
    // throwing a RangeError (Maximum call stack size exceeded).
    lastPrepareStackTrace = fn === prepareStackTrace
      ? fallback
      : fn
  }
})

module.exports = function (err) {
  err.stack // eslint-disable-line no-unused-expressions
  return err.__error_callsites
}

function prepareStackTrace (err, callsites) {
  Object.defineProperty(err, '__error_callsites', {
    enumerable: false,
    configurable: true,
    writable: false,
    value: callsites
  })
  return lastPrepareStackTrace(err, callsites)
}
