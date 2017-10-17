import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as reduxForm from 'redux-form';

import modelActions from './<%= actionFileName %>';
import * as networking from '../networking';
import cst from '../../constants/models/<%= constantFileName %>.json';
import notificationCst from '../../constants/notification.json';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('[actions] <%= actionFileName %>.js', () => {
  it('findRequest', () => {
    const expectedAction = { type: cst.FIND_REQUEST };
    expect(modelActions.findRequest()).toEqual(expectedAction);
  });

  it('findSuccess', () => {
    const payload = [{ index: 0, libelle: 'libelle' }];
    const expectedAction = { type: cst.FIND_SUCCESS, payload };
    expect(modelActions.findSuccess(payload)).toEqual(expectedAction);
  });

  it('findError', () => {
    const payload = 'error message !';
    const expectedAction = { type: cst.FIND_ERROR, payload };
    expect(modelActions.findError(payload)).toEqual(expectedAction);
  });

  it('deleteSuccess', () => {
    const payload = { id: 1, modelKeyId: 'modelKeyId' };
    const expectedAction = { type: cst.DELETE_ELEMENT, payload };
    expect(modelActions.deleteSuccess(payload.id, payload.modelKeyId)).toEqual(
      expectedAction,
    );
  });

  it('notifySuccess', () => {
    const message = 'Notification success';
    const payload = { message, notificationType: notificationCst.success };
    const expectedAction = { type: notificationCst.OPEN, payload };
    expect(modelActions.notifySuccess(message)).toEqual(expectedAction);
  });

  it('notifyError', () => {
    const message = 'Notification error';
    const payload = { message, notificationType: notificationCst.error };
    const expectedAction = { type: notificationCst.OPEN, payload };
    expect(modelActions.notifyError(message)).toEqual(expectedAction);
  });

  it('setLoading', () => {
    const expectedAction = { type: cst.LOADING_ON };
    expect(modelActions.setLoading()).toEqual(expectedAction);
  });

  it('unsetLoading', () => {
    const expectedAction = { type: cst.LOADING_OFF };
    expect(modelActions.unsetLoading()).toEqual(expectedAction);
  });

  it('countSuccess', () => {
    const count = 10;
    const expectedAction = { type: cst.COUNT_SUCCESS, count };
    expect(modelActions.countSuccess(10)).toEqual(expectedAction);
  });

  it('countRequest', () => {
    const expectedAction = { type: cst.COUNT_REQUEST };
    expect(modelActions.countRequest()).toEqual(expectedAction);
  });

  it('errorPopIn', () => {
    const message = 'Message !';
    const expectedAction = { type: cst.ERROR_POPIN, payload: { message } };
    expect(modelActions.errorPopIn(message)).toEqual(expectedAction);
  });

  it('cancelErrorPopIn', () => {
    const expectedAction = { type: cst.CANCEL_ERROR_POPIN };
    expect(modelActions.cancelErrorPopin()).toEqual(expectedAction);
  });
});

describe('[async actions] <%= actionFileName %>.js', () => {
  describe('find', () => {
    it('should call find and dispatch FIND_REQUEST and FIND_SUCCESS', () => {
      networking.request = jest.fn(() => () =>
        Promise.resolve({
          status: 200,
          data: [{ id: 1 }, { id: 2 }],
        }),
      );
      const store = mockStore({});
      const expectedActions = [
        { type: cst.FIND_REQUEST },
        { type: cst.FIND_SUCCESS, payload: [{ id: 1 }, { id: 2 }] },
      ];
      return store.dispatch(modelActions.find()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('should call find and dispatch FIND_REQUEST and FIND_ERROR', () => {
      networking.request = jest.fn(() => () =>
        Promise.reject({
          status: 500,
          error: 'failed',
        }),
      );

      const store = mockStore({});
      const expectedActions = [
        { type: cst.FIND_REQUEST },
        {
          type: notificationCst.OPEN,
          payload: {
            message: 'notification.list.error',
            notificationType: notificationCst.error,
          },
        },
        { type: cst.FIND_ERROR, payload: { status: 500, error: 'failed' } },
      ];
      return store.dispatch(modelActions.find()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('findOne', () => {
    it('should call findOne and dispatch a success', () => {
      networking.request = jest.fn(() => () =>
        Promise.resolve({
          status: 200,
          data: { id: 1 },
        }),
      );

      reduxForm.initialize = jest.fn((modelForm, data) => ({
        type: 'initialize',
        payload: { data, modelForm },
      }));

      const store = mockStore({});
      const expectedActions = [
        {
          type: 'initialize',
          payload: { data: { id: 1 }, modelForm: 'model_form' },
        },
      ];
      return store.dispatch(modelActions.findOne('2')).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('should call findOne and dispatch an error', () => {
      networking.request = jest.fn(() => () =>
        Promise.reject({
          status: 500,
          error: 'failed',
        }),
      );

      const store = mockStore({});
      const expectedActions = [
        {
          type: notificationCst.OPEN,
          payload: {
            message: 'notification.error.not_found',
            notificationType: notificationCst.error,
          },
        },
      ];
      return store.dispatch(modelActions.findOne('3')).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('create', () => {
    it('should call create and dispatch a success', () => {
      networking.request = jest.fn(() => () =>
        Promise.resolve({
          status: 200,
          data: { id: 1 },
        }),
      );

      reduxForm.reset = jest.fn(modelForm => ({
        type: 'reset',
        payload: { modelForm },
      }));

      const store = mockStore({});
      const expectedActions = [
        {
          type: 'reset',
          payload: { modelForm: 'model_form' },
        },
        {
          type: notificationCst.OPEN,
          payload: {
            message: 'notification.create.success',
            notificationType: '#28B463',
          },
        },
      ];
      return store.dispatch(modelActions.create()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('should call create and dispatch an error', () => {
      networking.request = jest.fn(() => () =>
        Promise.reject({
          status: 500,
          error: 'failed',
        }),
      );

      const store = mockStore({});
      const expectedActions = [
        {
          type: notificationCst.OPEN,
          payload: {
            message: 'notification.create.error',
            notificationType: notificationCst.error,
          },
        },
      ];
      return store.dispatch(modelActions.create()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('edit', () => {
    it('should call edit and dispatch a success', () => {
      networking.request = jest.fn(() => () =>
        Promise.resolve({
          status: 200,
          data: { id: 1 },
        }),
      );

      const store = mockStore({});
      const expectedActions = [
        {
          type: notificationCst.OPEN,
          payload: {
            message: 'notification.edit.success',
            notificationType: '#28B463',
          },
        },
      ];
      return store.dispatch(modelActions.edit()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('should call edit and dispatch an error', () => {
      networking.request = jest.fn(() => () =>
        Promise.reject({
          status: 500,
          error: 'failed',
        }),
      );

      const store = mockStore({});
      const expectedActions = [
        {
          type: notificationCst.OPEN,
          payload: {
            message: 'notification.edit.error',
            notificationType: notificationCst.error,
          },
        },
      ];
      return store.dispatch(modelActions.edit()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('delete', () => {
    it('should call delete and dispatch a success', () => {
      networking.request = jest.fn(() => () =>
        Promise.resolve({
          status: 200,
        }),
      );

      const store = mockStore({});
      const expectedActions = [
        {
          type: cst.DELETE_ELEMENT,
          payload: {
            id: 0,
            modelKeyId: 'modelKeyId',
          },
        },
        {
          type: notificationCst.OPEN,
          payload: {
            message: 'notification.delete.success',
            notificationType: notificationCst.success,
          },
        },
      ];
      return store.dispatch(modelActions.delete(0, 'modelKeyId')).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('should call delete and dispatch an error', () => {
      networking.request = jest.fn(() => () =>
        Promise.reject({
          status: 500,
          error: 'failed',
        }),
      );

      const store = mockStore({});
      const expectedActions = [
        {
          type: notificationCst.OPEN,
          payload: {
            message: 'notification.delete.error',
            notificationType: notificationCst.error,
          },
        },
      ];
      return store.dispatch(modelActions.delete(0, 'modelKeyId')).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('export', () => {
    Object.defineProperty(window.location, 'href', {
      writable: true,
      value: 'baseUrl',
    });

    it('should call export', () => {
      const id = 1;
      const url = `<%= apiUrl %>/export?access_token=${id}`;
      const store = mockStore({});
      return store.dispatch(modelActions.export({ id })).then(() => {
        expect(window.location.href).toEqual(url);
      });
    });
  });

  describe('count', () => {
    it('should call count and dispatch COUNT_REQUEST and COUNT_SUCCESS', () => {
      const count = 10;
      networking.request = jest.fn(() => () =>
        Promise.resolve({
          status: 200,
          data: { count },
        }),
      );
      const store = mockStore({});
      const expectedActions = [
        { type: cst.COUNT_REQUEST },
        { type: cst.COUNT_SUCCESS, count },
      ];
      return store.dispatch(modelActions.count()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
