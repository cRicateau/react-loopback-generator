const Promise = require('bluebird');
const { map, findKey, intersection } = require('lodash');
const importService = require('../services/excel-import');
const fileUploadService = require('../services/file-upload');
const logger = require('../services/winston-config')();

module.exports = function(Model) { // eslint-disable-line
  const successHttpCode = 204;
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
      .then(() => Model.handleFile(file.buffer, req.sgUser.id))
      .then(() => res.status(successHttpCode).send())
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

  Model.isRowInvalidType = (key, row) => {
    if (!row[key]) return false;
    return Model.getPropertyType(key).toLowerCase() === 'number' &&
    !importService.isNumeric(row[key]);
  };

  Model.isRowInvalidLength = (key, row) => {
    if (!row[key]) return false;
    return (row[key].length > Model.definition.properties[key].length);
  };

  Model.isCellEmptyButRequired = (key, row) => {
    if (!Model.definition.properties[key].required) {
      return false;
    }
    return !row[key];
  };

  if (!Model.validateData) {
    Model.validateData = function(rows) {
      const errorList = [];
      const targetHeader = Object.keys(Model.definition.properties);
      rows.forEach((row, lineIndex) => {
        const offset = 2;
        const userFriendlyRowIndex = lineIndex + offset;
        for (const key of targetHeader) {
          if (Model.isCellEmptyButRequired(key, row)) {
            errorList.push({ type: 'required', line: userFriendlyRowIndex, column: key });
            return;
          }
          if (Model.isRowInvalidType(key, row)) {
            errorList.push({ type: 'format', line: userFriendlyRowIndex, column: key });
            return;
          }
          if (Model.isRowInvalidLength(key, row)) {
            errorList.push({ type: 'length', line: userFriendlyRowIndex, column: key });
            return;
          }
        }
      });
      return errorList;
    };
  }

  Model.handleFile = function(data, userId) {
    let options;

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

    return Model.beginTransaction({ isolationLevel: Model.Transaction.SERIALIZABLE })
      .then(tx => {
        options = { transaction: tx, excelImport: true, accessToken: { userId } };
        return Promise.mapSeries(excelRows, row =>
          Model.updateOrCreateRow(row, options)
        );
      })
      .then(() => Model.deleteUnimportedRows(excelRows, options))
      .then(() => options.transaction.commit())
      .catch(err => {
        logger.error(err);
        options.transaction.rollback();
        const error = new Error('Import failed');
        throw error;
      });
  };

  if (!Model.updateOrCreateRow) {
    Model.updateOrCreateRow = function(row, options) {
      return Model.upsert(row, options);
    };
  }

  if (!Model.deleteUnimportedRows) {
    Model.deleteUnimportedRows = function (rows, transactionOptions) {
      const modelKeyId = Model.getModelKeyId();
      const importedRowIds = map(rows, modelKeyId);

      return Model.find({
        where: {
          [modelKeyId]: {
            nin: importedRowIds
          }
        }
      })
      .then(data => {
          return Promise.mapSeries(data, row => {
            return Model.destroyAll(row, transactionOptions);
          });
        }
      );
    };
  }
};
