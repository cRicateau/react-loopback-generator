const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

const modelBuilder = require('./excel-import');
const importService = require('../services/excel-import');

let sandbox = null;
let transaction = null;
const data = [{ id: 1 }, { id: 2 }];
let Model = null;

describe('[Mixin] Excel import', () => {
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    transaction = {
      commit: sandbox.stub().returns(Promise.resolve()),
      rollback: sandbox.stub().returns(Promise.resolve())
    };

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
      find: sandbox.stub().returns(Promise.resolve(data)),
      destroyAll: sandbox.stub().returns(Promise.resolve()),
      upsert: sandbox.stub().returns(Promise.resolve()),
      beginTransaction: sandbox.stub().returns(Promise.resolve(transaction)),
      Transaction: {
        READ_COMMITED: 'READ_COMMITED'
      }
    };
    modelBuilder(Model);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('deleteUnimportedRows', () => {
    it('should call Model.destroyAll with the unimported rows', () => {
      const rows = [
        { NUM_BCE: 'test', column: 'hello' },
        { NUM_BCE: 'test2', column: 'hello2' },
        { NUM_BCE: 'test3', column: 'hello3' }
      ];

      const transactionOptions = {};
      return Model.deleteUnimportedRows(rows, transactionOptions)
      .then(() => {
        Model.destroyAll.should.have.been.calledWithExactly({ id: 1 }, transactionOptions);
        Model.destroyAll.should.have.been.calledWithExactly({ id: 2 }, transactionOptions);
      });
    });
  });

  describe('updateOrCreateRow', () => {
    it('should call Model.upsert with the row object', () => {
      const row = { NUM_BCE: 'test', column: 'hello' };
      const transactionOptions = {};

      return Model.updateOrCreateRow(row, transactionOptions)
      .then(() => {
        Model.upsert.should.have.been.calledWithExactly(row, transactionOptions);
      });
    });
  });

  describe('handleFile', () => {
    const excelRows = [
      { id: 1, label: 1 },
      { id: 2, label: 2 },
      { id: 3, label: 3 }
    ];

    const userId = 9;

    beforeEach(() => {
      sandbox.stub(importService, 'extractRowsFromExcel').returns(excelRows);
      sandbox.stub(Model, 'isValidFile').returns(true);
      sandbox.stub(Model, 'validateData').returns([]);
      sandbox.stub(Model, 'deleteUnimportedRows').returns(Promise.resolve());
    });

    it('should validate data and iterate over every row to upsert them in the db', () => {
      sandbox.stub(Model, 'updateOrCreateRow').returns(Promise.resolve());
      const dataMock = { someData: 'fake' };

      return Model.handleFile(dataMock, userId)
      .then(() => {
        importService.extractRowsFromExcel.should.have.been.calledWithExactly(dataMock);
        Model.updateOrCreateRow.should.have.been.calledThrice;
        Model.deleteUnimportedRows.should.have.been.calledWithExactly(
          excelRows,
          { transaction, excelImport: true, accessToken: { userId } }
        );
        transaction.commit.should.have.been.calledWithExactly();
        transaction.rollback.should.not.have.been.called;
      });
    });

    it('should rollback the transaction if an insert fails', () => {
      sandbox.stub(Model, 'updateOrCreateRow').returns(Promise.reject());
      const dataMock = { someData: 'fake' };
      return Model.handleFile(dataMock, userId)
      .then(() => {
        true.should.be.false;
      })
      .catch(() => {
        importService.extractRowsFromExcel.should.have.been.calledWithExactly(dataMock);
        Model.updateOrCreateRow.should.have.been.calledOnce;
        Model.deleteUnimportedRows.should.not.have.been.called;
        transaction.rollback.should.have.been.calledWithExactly();
        transaction.commit.should.not.have.been.called;
      });
    });
  });
});
