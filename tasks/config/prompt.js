'use strict';
module.exports = {
  vcodes: {
    options: {
      questions: [
        {
          config: 'vcodes.options.statuscode',
          type: 'input',
          message: 'HTTP status code (e.g., 400, 401, 500):'
        },
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
