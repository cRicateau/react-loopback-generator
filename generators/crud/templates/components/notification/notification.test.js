import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import SnackBar from 'material-ui/Snackbar';

import { Notification } from './notification';

describe('[Component] Notification', () => {
  const defaultProps = {
    notification: {
      open: true,
      message: 'Hello world!',
      backgroundColor: '#0000FF',
    },
    closeGlobalNotification: () => {},
    intl: {
      formatMessage: () => 'Hello World!',
    },
  };

  const setup = propsOverride => {
    const finalProps = { ...defaultProps, propsOverride };
    const shallowWrapper = shallow(<Notification {...finalProps} />);
    return {
      shallowWrapper,
    };
  };

  it('should exist', () => {
    const { shallowWrapper } = setup();
    expect(shallowWrapper.exists()).to.be.true; // eslint-disable-line
  });

  describe('[UI]', () => {
    it('should render a snackbar to inform users of the completion of events', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.find(SnackBar).length).to.equal(1);
    });
  });
});
