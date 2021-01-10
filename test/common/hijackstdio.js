"use strict";

/*<replacement>*/
require('@babel/polyfill');

var util = require('util');
var queueMicrotask = require('../../lib/internal/streams/queue-microtask')

for (var i in util) {
  exports[i] = util[i];
}
/*</replacement>*/

/* eslint-disable node-core/required-modules */


'use strict';
/*<replacement>*/


var objectKeys = objectKeys || function (obj) {
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  }

  return keys;
};
/*</replacement>*/
// Hijack stdout and stderr


var stdWrite = {};

function hijackStdWritable(name, listener) {
  var stream = process[name];

  var _write = stdWrite[name] = stream.write;

  stream.writeTimes = 0;

  stream.write = function (data, callback) {
    try {
      listener(data);
    } catch (e) {
      queueMicrotask(function () {
        throw e;
      });
    }

    _write.call(stream, data, callback);

    stream.writeTimes++;
  };
}

function restoreWritable(name) {
  process[name].write = stdWrite[name];
  delete process[name].writeTimes;
}

module.exports = {
  hijackStdout: hijackStdWritable.bind(null, 'stdout'),
  hijackStderr: hijackStdWritable.bind(null, 'stderr'),
  restoreStdout: restoreWritable.bind(null, 'stdout'),
  restoreStderr: restoreWritable.bind(null, 'stderr')
};

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}