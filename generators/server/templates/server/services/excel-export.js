/*
* The following file is a simplified verion from Global-resource project https://github.com/theodo/pepiniere-global-resources/blob/4c4eb24d55c8e71690ae0f74d3eebdc987be0b5b/server/services/excel-writer.coffee
* The goal is to format the excel to use the librairy xlsx https://github.com/SheetJS/js-xlsx
*/

const _ = require('lodash');
const xlsx = require('xlsx');

const checkRange = (range, r, c) => {
  if (range.s.r > r) {
    range.s.r = r;
  }
  if (range.s.c > c) {
    range.s.c = c;
  }
  if (range.e.r < r) {
    range.e.r = r;
  }
  if (range.e.c < c) {
    range.e.c = c;
    return;
  }
};

const getCellType = (cell) => {
  const type = {
    'number': 'n',
    'boolean': 'b'
  }[typeof cell.v] || 's';
  return {
    t: type
  };
};

const formatRow = (row, header) => (header.map(columnName => row[columnName]));

const formatRows = (rows, header) => {
  if (rows.length === 0) {
    return [header];
  }

  const formatedRows = rows.map(row => (formatRow(row, header)));

  // Add header as the first line of the excel sheet
  const rowsWithHeader = [header].concat(formatedRows);

  return rowsWithHeader;
};

const writeWorkbook = (workbook) => {
  const options = {
    bookType: 'xlsx',
    bookSST: false,
    type: 'buffer'
  };
  return xlsx.write(workbook, options);
};

class Workbook {
  constructor(SheetNames) { // eslint-disable-line
    this.SheetNames = SheetNames;
    this.Sheets = {};
  }

  setCellValuesForSheet(sheetName, rows) { // eslint-disable-line
    let c, cell, cellRef, i, j, len, len1, r, row, value; // eslint-disable-line
    const range = {
      s: { c: 0, r: 0 },
      e: { c: 0, r: 0 }
    };
    const sheet = {};
    for (r = i = 0, len = rows.length; i < len; r = ++i) {
      row = rows[r];
      for (c = j = 0, len1 = row.length; j < len1; c = ++j) {
        value = row[c];
        checkRange(range, r, c);
        if (value) {
          cell = {
            v: value
          };
          cellRef = xlsx.utils.encode_cell({
            c,
            r
          });
          _.merge(cell, getCellType(cell));
          sheet[cellRef] = cell;
        }
      }
    }
    if (range.s.c < 10000000) { // eslint-disable-line
      sheet['!ref'] = xlsx.utils.encode_range(range);
    }
    this.Sheets[sheetName] = sheet;
    return;
  }
}

const getWorkbook = (rows) => {
  const sheetName = 'Sheet 1';
  const workbook = new Workbook([sheetName]);
  workbook.setCellValuesForSheet(sheetName, rows);
  return workbook;
};

const excelExport = (res, fileName, rows, header) => { // eslint-disable-line
  const formattedRows = formatRows(rows, header);
  const workbook = getWorkbook(formattedRows);
  res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.set('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
  return res.send(writeWorkbook(workbook));
};

module.exports = {
  excelExport,
  getWorkbook,
  getCellType,
  writeWorkbook,
  formatRows,
  checkRange
};
