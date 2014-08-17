'use strict';

// helpers for:
// registration
// handling process message events.
// // abstract away the message token?

module.exports.register = function(commands) {
  process.send({
    register: {
      commands: commands
    }
  });
};
