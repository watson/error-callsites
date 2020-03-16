'use strict'

const { EOL } = require('os')
const util = require('util')
const test = require('tape')
const callsites = require('./')
const { callsitesSym } = require('./lib/internal/symbols')

test('return non-empty array', function (t) {
  const err = new Error('foo')
  const arr = callsites(err)
  t.ok(Array.isArray(arr))
  t.ok(arr.length > 0)
  t.end()
})

test('return array of callsites', function (t) {
  const err = new Error('foo')
  const arr = callsites(err)
  t.equal(typeof arr[0], 'object')
  t.equal(typeof arr[0].getFileName, 'function')
  t.equal(arr[0].getFileName(), __filename)
  t.end()
})

test('error should have stack string', function (t) {
  const err = new Error('foo')
  callsites(err)
  t.equal(typeof err.stack, 'string')
  t.equal(err.stack.split('\n')[0], 'Error: foo')
  t.end()
})

test('process same error twice', function (t) {
  const err = new Error('foo')
  callsites(err)
  callsites(err)
  t.equal(typeof err.stack, 'string')
  t.ok(Array.isArray(err[callsitesSym]))
  t.end()
})

// In Node.js v7 this used to throw when using this module because it emits a
// deprecation warning when trying to re-define the callsites symbol property.
// By defining that property as configurable this error goes away.
test('run deprecated function', function (t) {
  util.deprecate(function () {}, 'foo')()
  t.end()
})

test('overwrite Error.prepareStackTrace', function (t) {
  Error.prepareStackTrace = () => 'boom!'
  const err = new Error('foo')
  t.equal(err.stack, 'boom!')
  t.ok(Array.isArray(err[callsitesSym]))
  t.end()
})

test('re-set Error.prepareStackTrace', function (t) {
  const orig = Error.prepareStackTrace
  Error.prepareStackTrace = () => 'boom!'

  const e1 = {}
  Error.captureStackTrace(e1)
  t.equal(e1.stack, 'boom!')
  t.ok(Array.isArray(e1[callsitesSym]))

  Error.prepareStackTrace = orig

  const e2 = {}
  Error.captureStackTrace(e2)
  t.notEqual(e2.stack, 'boom!')
  t.equal(typeof e2.stack, 'string')
  t.ok(Array.isArray(e2[callsitesSym]))

  t.end()
})

// Test that we don't get into an infinite loop in case someone else overwrites
// `Error.prepareStackTrace` while at the same time calling the original value
// of `Error.prepareStackTrace`. This is a problem with, amongst others, the
// stackback module.
test('break infinite loop', function (t) {
  let calls = 0
  const orig = Error.prepareStackTrace

  Error.prepareStackTrace = function (err, callsites) {
    t.equal(++calls, 1, 'should only call the overwritten Error.prepareStackTrace once')
    t.ok(Array.isArray(err[callsitesSym]), 'should have set callsite symbol when calling overwritten Error.prepareStackTrace')

    err.foo = 42

    return orig(err, callsites)
  }

  const err = new Error('foo')
  const stack = err.stack.split(EOL)
  const message = stack.shift()

  Error.prepareStackTrace = orig

  t.equal(err.foo, 42, 'should retain modifications made by overwritten Error.prepareStackTrace')
  t.ok(stack.length >= 3, 'should have a normal stack trace sting with at least two frames')
  t.equal(message, 'Error: foo')
  for (let i = 0; i < stack.length; i++) {
    t.equal(stack[i].indexOf('    at '), 0)
  }
  t.end()
})
