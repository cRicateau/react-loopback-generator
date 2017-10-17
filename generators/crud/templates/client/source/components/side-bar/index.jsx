import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import { List, ListItem } from 'material-ui/List';

import SideBar from './index';
import crudRoutes from '../../crud-routes/crud-routes.json';

describe('[Component] SideBar', () => {
  const defaultProps = {
    open: true,
    onCloseSideBar: () => {},
    onLogout: () => {},
    navigateTo: () => {},
    userPerimeters: [
      'RBDF',
      'IBFS',
      'GBIS',
      'RISQ',
      'DTO',
      'DFIN',
      'COM',
      'REG',
    ],
  };

  const setup = propsOverride => {
    const finalProps = Object.assign(defaultProps, propsOverride);
    const shallowWrapper = shallow(<SideBar {...finalProps} />);
    return {
      shallowWrapper,
    };
  };

  it('should exist', () => {
    const { shallowWrapper } = setup();
    expect(shallowWrapper.exists()).to.be.true; // eslint-disable-line
  });

  describe('[UI]', () => {
    it('should render a drawer', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.find(Drawer).length).to.equal(1);
    });

    it('should render a drawer containing a list and an app bar', () => {
      const { shallowWrapper } = setup();
      const drawerComponent = shallowWrapper.find(Drawer);

      expect(drawerComponent.find(AppBar).length).to.equal(1);
      expect(drawerComponent.find(List).length).to.equal(1);
    });

    it('should render a list of items matching what is available in crudRoutes.json', () => {
      const { shallowWrapper } = setup();
      const listComponent = shallowWrapper.find(List);

      // Add a logout button as a list item
      expect(listComponent.find(ListItem).length).to.equal(
        crudRoutes.length + 1,
      );
    });
  });

  describe('[Event]', () => {
    it('should call logout if the logout item is clicked', () => {
      const logoutSpy = sinon.spy();
      const { shallowWrapper } = setup({ onLogout: logoutSpy });

      shallowWrapper
        .find(ListItem)
        .last()
        .simulate('touchTap');
      expect(logoutSpy.calledOnce).to.be.true; // eslint-disable-line
    });

    it('should call the close side bar function if the appBar menu button is clicked', () => {
      const closeSpy = sinon.spy();
      const { shallowWrapper } = setup({ onCloseSideBar: closeSpy });

      shallowWrapper
        .find(AppBar)
        .first()
        .simulate('leftIconButtonTouchTap');
      expect(closeSpy.calledOnce).to.be.true; // eslint-disable-line
    });

    it('should call the navigation prop if a crud item is clicked', () => {
      const crudSpy = sinon.spy();
      const { shallowWrapper } = setup({ navigateTo: crudSpy });

      shallowWrapper
        .find(ListItem)
        .first()
        .simulate('touchTap');
      expect(crudSpy.calledOnce).to.be.true; // eslint-disable-line
    });
  });
});
