"use strict";

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

/*<replacement>*/
var bufferShim = require('safe-buffer').Buffer;
/*</replacement>*/


require('../common');
var queueMicrotask = require('../../lib/internal/streams/queue-microtask');

var R = require('../../lib/_stream_readable');

var W = require('../../lib/_stream_writable');

var assert = require('assert/');

var src = new R({
  encoding: 'base64'
});
var dst = new W();
var hasRead = false;
var accum = [];

src._read = function (n) {
  if (!hasRead) {
    hasRead = true;
    queueMicrotask(function () {
      src.push(bufferShim.from('1'));
      src.push(null);
    });
  }
};

dst._write = function (chunk, enc, cb) {
  accum.push(chunk);
  cb();
};

src.on('end', function () {
  assert.strictEqual(String(Buffer.concat(accum)), 'MQ==');
  clearTimeout(timeout);
});
src.pipe(dst);
var timeout = setTimeout(function () {
  assert.fail('timed out waiting for _write');
}, 100);
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