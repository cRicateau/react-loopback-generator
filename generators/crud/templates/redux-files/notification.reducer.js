import cst from '../constants/notification';

const defaultState = {
  open: false,
  message: 'notification.no_message',
  backgroundColor: '#FFFFFF',
};

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case cst.OPEN:
      return {
        open: true,
        message: action.payload.message,
        backgroundColor: action.payload.notificationType,
      };
    case cst.CLOSE:
      return Object.assign({}, state, { open: false });
    default:
      return state;
  }
}
