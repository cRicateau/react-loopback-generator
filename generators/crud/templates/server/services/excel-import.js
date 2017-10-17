const XLS = require('xlsx');
const multer = require('multer');
const upload = multer();

module.exports = {
  extractRowsFromExcel (data) {
    const workbook = XLS.read(data);
    const sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]];
    return XLS.utils.sheet_to_json(sheet);
  },
  getFileFromRequest (req, res) {
    return new Promise((resolve, reject) => {
      upload.single('file')(req, res, (err) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    });
  },
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
};
