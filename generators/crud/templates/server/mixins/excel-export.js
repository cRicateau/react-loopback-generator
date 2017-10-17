const exportService = require('../services/excel-export');

module.exports = function (Model) {
  Model.export = function (res) {
    return Model.find()
    .then(result => {
      const rows = JSON.parse(JSON.stringify(result));
      const header = Object.keys(Model.definition.properties);
      exportService.excelExport(res, Model.definition.name, rows, header);
    });
  };

  Model.remoteMethod(
    'export',
    {
      http: { verb: 'get', path: '/export' },
      description: 'Excel export',
      accessType: 'READ',
      accepts: [
        { arg: 'res', type: 'object', http: { source: 'res' } }
      ]
    }
  );
};
