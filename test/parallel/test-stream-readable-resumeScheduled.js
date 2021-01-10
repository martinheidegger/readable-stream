"use strict";

/*<replacement>*/
var bufferShim = require('safe-buffer').Buffer;
/*</replacement>*/


var common = require('../common'); // Testing Readable Stream resumeScheduled state
var queueMicrotask = require('../../lib/internal/streams/queue-microtask');


var assert = require('assert/');

var _require = require('../../'),
    Readable = _require.Readable,
    Writable = _require.Writable;

{
  // pipe() test case
  var r = new Readable({
    read: function read() {}
  });
  var w = new Writable(); // resumeScheduled should start = `false`.

  assert.strictEqual(r._readableState.resumeScheduled, false); // calling pipe() should change the state value = true.

  r.pipe(w);
  assert.strictEqual(r._readableState.resumeScheduled, true);
  queueMicrotask(common.mustCall(function () {
    assert.strictEqual(r._readableState.resumeScheduled, false);
  }));
}
{
  // 'data' listener test case
  var _r = new Readable({
    read: function read() {}
  }); // resumeScheduled should start = `false`.


  assert.strictEqual(_r._readableState.resumeScheduled, false);

  _r.push(bufferShim.from([1, 2, 3])); // adding 'data' listener should change the state value


  _r.on('data', common.mustCall(function () {
    assert.strictEqual(_r._readableState.resumeScheduled, false);
  }));

  assert.strictEqual(_r._readableState.resumeScheduled, true);
  queueMicrotask(common.mustCall(function () {
    assert.strictEqual(_r._readableState.resumeScheduled, false);
  }));
}
{
  // resume() test case
  var _r2 = new Readable({
    read: function read() {}
  }); // resumeScheduled should start = `false`.


  assert.strictEqual(_r2._readableState.resumeScheduled, false); // Calling resume() should change the state value.

  _r2.resume();

  assert.strictEqual(_r2._readableState.resumeScheduled, true);

  _r2.on('resume', common.mustCall(function () {
    // The state value should be `false` again
    assert.strictEqual(_r2._readableState.resumeScheduled, false);
  }));

  queueMicrotask(common.mustCall(function () {
    assert.strictEqual(_r2._readableState.resumeScheduled, false);
  }));
}
;

(function () {
  var t = require('tap');

  t.pass('sync run');
})();

var _list = process.listeners('uncaughtException');

process.removeAllListeners('uncaughtException');

_list.pop();

_list.forEach(function (e) {
  return process.on('uncaughtException', e);
});