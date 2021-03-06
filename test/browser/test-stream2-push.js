'use strict';
var common = require('../common');
var nextTick = require('../../lib/internal/streams/next-tick') 
var stream = require('../../');
var Readable = stream.Readable;
var Writable = stream.Writable;


var inherits = require('inherits');
var EE = require('events').EventEmitter;
module.exports = function (t) {

// a mock thing a bit like the net.Socket/tcp_wrap.handle interaction
  t.test('push', function (t) {
    var stream = new Readable({
      highWaterMark: 16,
      encoding: 'utf8'
    });

    var source = new EE();

    stream._read = function() {
      //console.error('stream._read');
      readStart();
    };

    var ended = false;
    stream.on('end', function() {
      ended = true;
    });

    source.on('data', function(chunk) {
      var ret = stream.push(chunk);
      //console.error('data', stream._readableState.length);
      if (!ret)
        readStop();
    });

    source.on('end', function() {
      stream.push(null);
    });

    var reading = false;

    function readStart() {
      //console.error('readStart');
      reading = true;
    }

    function readStop() {
      //console.error('readStop');
      reading = false;
      nextTick(function() {
        var r = stream.read();
        if (r !== null)
          writer.write(r);
      });
    }

    var writer = new Writable({
      decodeStrings: false
    });

    var written = [];

    var expectWritten =
      [ 'asdfgasdfgasdfgasdfg',
        'asdfgasdfgasdfgasdfg',
        'asdfgasdfgasdfgasdfg',
        'asdfgasdfgasdfgasdfg',
        'asdfgasdfgasdfgasdfg',
        'asdfgasdfgasdfgasdfg' ];

    writer._write = function(chunk, encoding, cb) {
      //console.error('WRITE %s', chunk);
      written.push(chunk);
      nextTick(cb);
    };

    writer.on('finish', finish);


    // now emit some chunks.

    var chunk = 'asdfg';

    var set = 0;
    readStart();
    data();
    function data() {
      t.ok(reading);
      source.emit('data', chunk);
      t.ok(reading);
      source.emit('data', chunk);
      t.ok(reading);
      source.emit('data', chunk);
      t.ok(reading);
      source.emit('data', chunk);
      t.notOk(reading);
      if (set++ < 5)
        setTimeout(data, 10);
      else
        end();
    }

    function finish() {
      //console.error('finish');
      t.deepEqual(written, expectWritten);
      t.end();
    }

    function end() {
      source.emit('end');
      t.notOk(reading);
      writer.end(stream.read());
      setTimeout(function() {
        t.ok(ended);
      });
    }
  });
};
