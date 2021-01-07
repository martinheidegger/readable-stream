'use strict';

module.exports = function (cb) { 
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
        }
    }

    // Base on https://github.com/feross/queue-microtask/blob/master/index.js by feross
    if(typeof queueMicrotask === 'function') {
        queueMicrotask(function () {
            cb.apply(null, args)
        }); 
    } else if (global.Promise !== undefined) {
        Promise.resolve()
            .then(function () {
                cb.apply(null, args);
            })
            .catch(function (err) {
                setTimeout(function () { throw err }, 0);
            });
    } else {
        setTimeout(function () {
            cb.apply(null, args);
        }, 0);
    }
};