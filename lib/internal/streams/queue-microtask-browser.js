'use strict';
var promise;

function throwError (err) {
    setTimeout(function () { throw err }, 0)
}

module.exports = typeof queueMicrotask === 'function'
    ? queueMicrotask.bind(globalThis)
    : typeof Promise === 'function'
        ? function (cb) {
            (promise || (promise = Promise.resolve()))
                .then(cb)
                .catch(throwError)
        }
        : function (cb) {
            setTimeout(cb, 0)
        };
