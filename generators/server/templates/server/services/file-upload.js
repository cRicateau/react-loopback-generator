let mmm = { detect: () => {} };

// mmmagic has to be compiled, and NODE_ENV test if often used outside docker
if (process.env.NODE_ENV !== 'test') {
  mmm = require('mmmagic'); // eslint-disable-line
}

const { includes } = require('lodash');
const Magic = mmm.Magic;
const Promise = require('bluebird');

const acceptedMimeTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12'
];

// xls and xlsx mimetype are not recognized by mmmagic
// they appear as application/zip or application/CDFV2-unknown or application/octet-stream
const mmmagicAcceptedMimeTypes = acceptedMimeTypes.concat([
  'application/CDFV2-unknown',
  'application/zip',
  'application/octet-stream'
]);


module.exports = {
  rejectIfMimetypeIsNotAuthorized (buffer) {
    const invalidMimetypeError = new Error('Invalid Payload');
    invalidMimetypeError.status = 422;
    const magic = new Magic(mmm.MAGIC_MIME_TYPE);

    return new Promise((resolve, reject) => {
      return magic.detect(buffer, (err, realMimetype) => {
        if (err || !includes(mmmagicAcceptedMimeTypes, realMimetype)) {
          return reject(invalidMimetypeError);
        }

        return resolve();
      });
    });
  },
  rejectIfFileIsNotValid (file) {
    if (!file) {
      const noFileError = new Error('No file given');
      noFileError.status = 422;
      return Promise.reject(noFileError);
    }

    const isFileTooLarge = (file.size > 5 * 1024 * 1024); // eslint-disable-line
    const isMimeTypeAccepted = includes(acceptedMimeTypes, file.mimetype);

    if (!isMimeTypeAccepted) {
      const mimeTypeError = new Error('Invalid mimetype');
      mimeTypeError.status = 422;
      return Promise.reject(mimeTypeError);
    }

    if (isFileTooLarge) {
      const sizeError = new Error('File is larger than 1 mb');
      sizeError.status = 422;
      return Promise.reject(sizeError);
    }

    return Promise.resolve();
  }
};
