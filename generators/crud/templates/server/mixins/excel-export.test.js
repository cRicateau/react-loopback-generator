const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

const modelBuilder = require('./excel-export');
const exportService = require('../services/excel-export');

let sandbox = null;
const data = [{ id: 1 }, { id: 2 }];
let Model = null;

describe('[Mixin] Excel export', () => {
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    Model = {
      definition: {
        name: 'ModelMock',
        properties: {
          NUM_BCE: {
            type: 'number',
            required: true,
            id: true
          }
        }
      },
      remoteMethod: () => {},
      find: sandbox.stub().returns(Promise.resolve(data))
    };
    modelBuilder(Model);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('export', () => {
    it('should call Model.find and exportService.excelExport', () => {
      sandbox.stub(exportService, 'excelExport');
      const res = {};
      return Model.export(res)
      .then(() => {
        Model.find.should.have.been.calledWithExactly();
        exportService.excelExport.should.have.been.calledWithExactly(
          res, Model.definition.name, data, ['NUM_BCE']
        );
      });
    });
  });
});
