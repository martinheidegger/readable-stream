'use strict';

module.exports = typeof queueMicrotask === 'function'
  ? queueMicrotask.bind(globalThis)
  : process.nextTick;
