"use strict";

/*<replacement>*/
var bufferShim = require('safe-buffer').Buffer;
/*</replacement>*/


var common = require('../common');
var queueMicrotask = require('../../lib/internal/streams/queue-microtask');

var assert = require('assert/');

var stream = require('../../');

var shutdown = false;
var w = new stream.Writable({
  final: common.mustCall(function (cb) {
    assert.strictEqual(this, w);
    setTimeout(function () {
      shutdown = true;
      cb();
    }, 100);
  }),
  write: function write(chunk, e, cb) {
    queueMicrotask(cb);
  }
});
w.on('finish', common.mustCall(function () {
  assert(shutdown);
}));
w.write(bufferShim.allocUnsafe(1));
w.end(bufferShim.allocUnsafe(0));
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