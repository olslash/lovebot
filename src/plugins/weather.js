'use strict';

process.send({message: 'hello from the weather plugin'});

process.send({
  register: { 
    // moduleName: 'weatherman',
    commands: ['weather', 'we', 'wea'],
    accessLevel: 3 // for future auth layer
  }
});

process.send({message: 'hi'});

process.on('message', function(message) {
  console.log('weather plugin recieved message', message);
  process.send({
    messageId: message.messageId,
    replyText: 'this is a reply from weather'
  });
});