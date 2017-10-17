import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import expect from 'expect';
import { mount, shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import jsdom from 'jsdom';
import sinon from 'sinon';

import HeaderBar from '../../components/header-bar';
import SideBar from '../../components/side-bar';
import Notification from '../../components/root/notification';

import RootConnected, { Root } from './index';
import * as network from '../../actions/networking';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.document = doc;
global.window = doc.defaultView;

const middleware = [thunk];
const initialState = { language: { selected: 'fr' } };
const mockStore = configureMockStore(middleware);
const store = mockStore(initialState);

injectTapEventPlugin();

describe('[Container] Root', () => {
  const login = sinon.stub();
  login.resolves({});
  const logout = sinon.spy();
  const props = {
    languageSelected: 'fr',
    sideBar: {
      open: false,
    },
    sideBarActions: {
      open: () => {},
      close: () => {},
    },
    authentication: {
      id: '1',
    },
    authenticationEffects: {
      login,
      logout,
    },
    navigateTo: () => {},
    closeGlobalNotification: () => {},
  };

  const authenticationActions = {
    doLogin() {
      return Promise.resolve('mockAuthenticationActions');
    },
    doLogout() {
      return Promise.resolve('mockAuthenticationActions');
    },
  };

  it('should call action doLogin on mounting', () => {
    const request = sinon.spy(network, 'request');
    mount(
      <MuiThemeProvider>
        <RootConnected store={store} />
      </MuiThemeProvider>,
    );

    expect(login.calledOnce);
    expect(request.calledOnce);
  });

  it('should display <div></div> with no authentication', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <RootConnected
          store={store}
          {...props}
          authenticationActions={authenticationActions}
        />
      </MuiThemeProvider>,
    );
    expect(wrapper.html()).toEqual('<div></div>');
  });

  it('should display a headerbar component', () => {
    const wrapper = shallow(
      <Root {...props} authenticationActions={authenticationActions} />,
    );
    expect(wrapper.find(HeaderBar).length).toEqual(1);
  });

  it('should display a sidebar component', () => {
    const wrapper = shallow(
      <Root {...props} authenticationActions={authenticationActions} />,
    );
    expect(wrapper.find(SideBar).length).toEqual(1);
  });

  it('should display a Notification component', () => {
    const wrapper = shallow(
      <Root {...props} authenticationActions={authenticationActions} />,
    );
    expect(wrapper.find(Notification).length).toEqual(1);
  });
});
