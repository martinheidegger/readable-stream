"use strict";

/*<replacement>*/
var bufferShim = require('safe-buffer').Buffer;
/*</replacement>*/


var common = require('../common');
var queueMicrotask = require('../../lib/internal/streams/queue-microtask');

var assert = require('assert/');

var stream = require('../../');

var state = 0;
/*
What you do
var stream = new stream.Transform({
  transform: function transformCallback(chunk, _, next) {
    // part 1
    this.push(chunk);
    //part 2
    next();
  },
  final: function endCallback(done) {
    // part 1
    queueMicrotask(function () {
      // part 2
      done();
    });
  },
  flush: function flushCallback(done) {
    // part 1
    queueMicrotask(function () {
      // part 2
      done();
    });
  }
});
t.on('data', dataListener);
t.on('end', endListener);
t.on('finish', finishListener);
t.write(1);
t.write(4);
t.end(7, endMethodCallback);

The order things are called

1. transformCallback part 1
2. dataListener
3. transformCallback part 2
4. transformCallback part 1
5. dataListener
6. transformCallback part 2
7. transformCallback part 1
8. dataListener
9. transformCallback part 2
10. finalCallback part 1
11. finalCallback part 2
12. flushCallback part 1
13. finishListener
14. endMethodCallback
15. flushCallback part 2
16. endListener
*/

var t = new stream.Transform({
  objectMode: true,
  transform: common.mustCall(function (chunk, _, next) {
    // transformCallback part 1
    assert.strictEqual(++state, chunk);
    this.push(state); // transformCallback part 2

    assert.strictEqual(++state, chunk + 2);
    queueMicrotask(next);
  }, 3),
  final: common.mustCall(function (done) {
    state++; // finalCallback part 1

    assert.strictEqual(state, 10);
    state++; // finalCallback part 2

    assert.strictEqual(state, 11);
    done();
  }, 1),
  flush: common.mustCall(function (done) {
    state++; // fluchCallback part 1

    assert.strictEqual(state, 12);
    queueMicrotask(function () {
      state++; // fluchCallback part 2

      assert.strictEqual(state, 15);
      done();
    });
  }, 1)
});
t.on('finish', common.mustCall(function () {
  state++; // finishListener

  assert.strictEqual(state, 13);
}, 1));
t.on('end', common.mustCall(function () {
  state++; // endEvent

  assert.strictEqual(state, 16);
}, 1));
t.on('data', common.mustCall(function (d) {
  // dataListener
  assert.strictEqual(++state, d + 1);
}, 3));
t.write(1);
t.write(4);
t.end(7, common.mustCall(function () {
  state++; // endMethodCallback

  assert.strictEqual(state, 14);
}, 1));
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