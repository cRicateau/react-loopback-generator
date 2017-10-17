import cst from '../constants/notification';

export const openWithMessage = (message, notificationType) => ({
  type: cst.OPEN,
  payload: {
    message,
    notificationType,
  },
});

export const close = () => ({ type: cst.CLOSE });
