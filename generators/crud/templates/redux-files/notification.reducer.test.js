import expect from 'expect';
import reducer from './notification';
import * as cst from '../constants/notification';

describe('[Reducer] notification', () => {
  describe('[Initial] State', () => {
    it('should return the default state if unknown action', () => {
      const action = { type: 'NOTHING' };
      const expectedState = {
        open: false,
        message: 'notification.no_message',
        backgroundColor: '#FFFFFF',
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
  });

  describe('[Changes] action ', () => {
    it('should return a state with a "success" background color', () => {
      const action = {
        type: cst.OPEN,
        payload: { message: 'Hello world!', notificationType: cst.success },
      };

      const expectedState = {
        open: true,
        message: 'Hello world!',
        backgroundColor: '#28B463',
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('should return a state with an "error" background color', () => {
      const action = {
        type: cst.OPEN,
        payload: {
          message: 'Hello world!',
          notificationType: cst.error,
        },
      };

      const expectedState = {
        open: true,
        message: 'Hello world!',
        backgroundColor: '#E74C3C',
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('should return a state with a "warning" background color', () => {
      const action = {
        type: cst.OPEN,
        payload: {
          message: 'Hello world!',
          notificationType: cst.warning,
        },
      };

      const expectedState = {
        open: true,
        message: 'Hello world!',
        backgroundColor: '#F1C40F',
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('should return a state with open set to false', () => {
      const action = {
        type: cst.CLOSE,
      };

      const expectedState = {
        open: false,
        message: 'notification.no_message',
        backgroundColor: '#FFFFFF',
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
  });
});
