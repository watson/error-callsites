'use strict'

var test = require('tape')
var callsites = require('./')

test('return non-empty array', function (t) {
  var err = new Error('foo')
  var arr = callsites(err)
  t.ok(Array.isArray(arr))
  t.ok(arr.length > 0)
  t.end()
})

test('return array of callsites', function (t) {
  var err = new Error('foo')
  var arr = callsites(err)
  t.equal(typeof arr[0], 'object')
  t.equal(typeof arr[0].getFileName, 'function')
  t.equal(arr[0].getFileName(), __filename)
  t.end()
})

test('error should have stack string', function (t) {
  var err = new Error('foo')
  callsites(err)
  t.equal(typeof err.stack, 'string')
  t.equal(err.stack.split('\n')[0], 'Error: foo')
  t.end()
})
