'use strict';

const dateComponent = require('hof-component-date');

module.exports = {
  loanReference: {
    validate: 'required'
  },
  brpNumber: {
   validate: ['required', 'alphanum', {type: 'exactlength', arguments: 9}],
   formatter: ['trim', 'spaces', 'uppercase']
  },
  dateOfBirth: dateComponent('dateOfBirth', {
    validate: ['required', 'before']
  })
};
