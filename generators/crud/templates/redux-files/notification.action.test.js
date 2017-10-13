import expect from 'expect';
import * as action from './notification';

describe('[Action] Notification', () => {
  it('should dispatch a OPEN_NOTIFICATION action with custom paramaters', () => {
    expect(action.openWithMessage('Hello world!', '#00FF00')).toEqual({
      type: 'OPEN_NOTIFICATION',
      payload: {
        message: 'Hello world!',
        notificationType: '#00FF00',
      },
    });
  });

  it('should dispatch a CLOSE_NOTIFICATION action', () => {
    expect(action.close()).toEqual({
      type: 'CLOSE_NOTIFICATION',
    });
  });
});
