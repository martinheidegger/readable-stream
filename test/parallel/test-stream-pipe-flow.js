"use strict";

/*<replacement>*/
var bufferShim = require('safe-buffer').Buffer;
/*</replacement>*/


var common = require('../common');
var queueMicrotask = require('../../lib/internal/streams/queue-microtask');

var _require = require('../../'),
    Readable = _require.Readable,
    Writable = _require.Writable,
    PassThrough = _require.PassThrough;

{
  var ticks = 17;
  var rs = new Readable({
    objectMode: true,
    read: function read() {
      if (ticks-- > 0) return queueMicrotask(function () {
        return rs.push({});
      });
      rs.push({});
      rs.push(null);
    }
  });
  var ws = new Writable({
    highWaterMark: 0,
    objectMode: true,
    write: function write(data, end, cb) {
      return setImmediate(cb);
    }
  });
  rs.on('end', common.mustCall());
  ws.on('finish', common.mustCall());
  rs.pipe(ws);
}
{
  var missing = 8;

  var _rs = new Readable({
    objectMode: true,
    read: function read() {
      if (missing--) _rs.push({});else _rs.push(null);
    }
  });

  var pt = _rs.pipe(new PassThrough({
    objectMode: true,
    highWaterMark: 2
  })).pipe(new PassThrough({
    objectMode: true,
    highWaterMark: 2
  }));

  pt.on('end', function () {
    wrapper.push(null);
  });
  var wrapper = new Readable({
    objectMode: true,
    read: function read() {
      queueMicrotask(function () {
        var data = pt.read();

        if (data === null) {
          pt.once('readable', function () {
            data = pt.read();
            if (data !== null) wrapper.push(data);
          });
        } else {
          wrapper.push(data);
        }
      });
    }
  });
  wrapper.resume();
  wrapper.on('end', common.mustCall());
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