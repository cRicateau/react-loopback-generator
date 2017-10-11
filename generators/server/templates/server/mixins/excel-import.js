const Promise = require('bluebird');
const { map, findKey, intersection } = require('lodash');
const importService = require('../services/excel-import');
const fileUploadService = require('../services/file-upload');

module.exports = function(Model) {
  const successHttpCode = 200;
  const badRequestHttpCode = 400;
  const unprocessableHttpCode = 422;

  Model.getModelKeyId = function () {
    const primaryKey = findKey(Model.definition.properties, property => {
      return property.id !== undefined;
    });

    return primaryKey || 'id';
  };

  // This method is not a promise because we need to control
  // the error data which is sent to the user
  Model.importExcelFile = function (req, res) {
    let file = null;

    importService
      .getFileFromRequest(req, res)
      .then(() => {
        file = req.file;
        return fileUploadService.rejectIfFileIsNotValid(file);
      })
      .then(() => fileUploadService.rejectIfMimetypeIsNotAuthorized(file.buffer))
      .then(() => Model.handleFile(file.buffer))
      .then(() => res.send(successHttpCode))
      .catch(error => {
        if (error.errorList) {
          return res.status(error.status).send(error.errorList);
        }
        if (!error.status) {
          error.status = unprocessableHttpCode;
        }
        return res.status(error.status).send({ error });
      });
  };

  Model.remoteMethod('importExcelFile', {
    http: { verb: 'post', path: '/import' },
    accessType: 'WRITE',
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'res', type: 'object', http: { source: 'res' } }
    ],
    returns: { type: 'object', root: true }
  });

  Model.isValidFile = function(rows) {
    if (rows.length === 0) return false;

    const rowHeader = Object.keys(rows[0]);
    const targetHeader = Object.keys(Model.definition.properties);
    const isValidHeader = intersection(rowHeader, targetHeader).length === targetHeader.length;
    if (rowHeader.length !== targetHeader.length || !isValidHeader) {
      return false;
    }

    return true;
  };

  Model.isRowInvalid = (key, row) => {
    return Model.getPropertyType(key) === 'Number' &&
      !importService.isNumeric(row[key]);
  };

  Model.validateData = function(rows) {
    const errorList = [];
    rows.forEach((row, lineIndex) => {
      for (const key of Object.keys(row)) {
        if (Model.isRowInvalid(key, row)) {
          const offset = 2;
          const userFriendlyRowIndex = lineIndex + offset;
          errorList.push({ type: 'Format', line: userFriendlyRowIndex, column: key });
        }
      }
    });
    return errorList;
  };

  Model.handleFile = function(data) {
    let transactionOptions;

    const excelRows = importService.extractRowsFromExcel(data);
    if (!Model.isValidFile(excelRows)) {
      const error = new Error('Invalid excel file');
      error.status = unprocessableHttpCode;
      return Promise.reject(error);
    }

    const errorList = Model.validateData(excelRows);

    if (errorList.length > 0) {
      const validationError = new Error();
      validationError.status = badRequestHttpCode;
      validationError.errorList = errorList;
      return Promise.reject(validationError);
    }

    return Model.beginTransaction({ isolationLevel: Model.Transaction.READ_COMMITTED })
      .then(tx => {
        transactionOptions = { transaction: tx };
        return Promise.mapSeries(excelRows, row =>
          Model.updateOrCreateRow(row, transactionOptions)
        );
      })
      .then(() => Model.deleteUnimportedRows(excelRows, transactionOptions))
      .then(() => transactionOptions.transaction.commit())
      .catch(() => {
        transactionOptions.transaction.rollback();
        const error = new Error('Import failed');
        throw error;
      });
  };

  Model.updateOrCreateRow = function(row, transactionOptions) {
    return Model.upsert(row, transactionOptions);
  };

  Model.deleteUnimportedRows = function (rows, transactionOptions) {
    const modelKeyId = Model.getModelKeyId();
    const importedRowIds = map(rows, modelKeyId);

    return Model.destroyAll({
      [modelKeyId]: {
        nin: importedRowIds
      }
    },
      transactionOptions
    );
  };
};
