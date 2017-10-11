const expect = require('expect');
const excelExport = require('./excel-export');

describe('[Service] excelExport', () => {
  describe('getWorkbook', () => {
    it('should return buffer of an excel file content', () => {
      const numberValue = 42;
      const matrixValues = [['dummyValue', numberValue]];
      const workbook = excelExport.getWorkbook(matrixValues);
      const worksheet = workbook.Sheets['Sheet 1'];
      expect(worksheet.A1.v).toEqual('dummyValue');
      expect(worksheet.B1.v).toEqual(numberValue);
    });
  });

  describe('formatRows', () => {
    it('should return a header and rows', () => {
      const header = ['title1', 'title2'];
      const rows = [
        { title1: 'dummyValue', title2: 'dummyValue2' },
        { title1: 'dummyValue3', title2: 'dummyValue4' }
      ];
      const formattedRows = excelExport.formatRows(rows, header);
      expect(formattedRows).toEqual([
        header,
        ['dummyValue', 'dummyValue2'],
        ['dummyValue3', 'dummyValue4']
      ]);
    });

    it('should return a header even if rows are empty', () => {
      const header = ['title1', 'title'];
      const rows = [];
      const formattedRows = excelExport.formatRows(rows, header);
      expect(formattedRows).toEqual([
        header
      ]);
    });
  });
});
