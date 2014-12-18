'use strict';
module.exports = {
  vcodes: {
    options: {
      questions: [
        {
          config: 'vcodes.options.name',
          type: 'input',
          message: 'Error code name:'
        },
        {
          config: 'vcodes.options.message',
          type: 'input',
          message: 'Human-readable explanation:'
        }
      ]
    }
  }
};
