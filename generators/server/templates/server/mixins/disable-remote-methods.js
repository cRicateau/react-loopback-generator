const disableAllExcept = require('../services/disable-remote-methods.js').disableAllExcept;

module.exports = function (Model) {
  disableAllExcept(Model, [
    'find', 'findById', 'create', 'deleteById', 'replaceById', 'count'
  ]);
};
