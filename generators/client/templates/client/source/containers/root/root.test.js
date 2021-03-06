import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import PropTypes from 'prop-types';
import expect from 'expect';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import jsdom from 'jsdom';
import sinon from 'sinon';

import RootConnected, { Root } from './index';
import * as network from '../../actions/networking';
import HeaderBar from '../../components/header-bar';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.document = doc;
global.window = doc.defaultView;

const middleware = [thunk];
const initialState = {
  language: {
    selected: 'en',
  },
};
const mockStore = configureMockStore(middleware);
const store = mockStore(initialState);

injectTapEventPlugin();

describe('<Root/>', () => {
  const login = sinon.stub();
  login.resolves({});
  const logout = sinon.spy();
  const props = {
    languageSelected: 'en',
    sideBar: {
      open: false,
    },
    authenticationEffects: {
      login,
      logout,
    },
    sideBarActions: {
      open() {
        return true;
      },
      close() {
        return false;
      },
    },
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
      <Root {...props} authenticationActions={authenticationActions} />,
    );
    expect(wrapper.html()).toEqual('<div></div>');
  });

  it('should display HeaderBar when connected', () => {
    const muiTheme = getMuiTheme();
    const wrapper = mount(
      <Root
        {...props}
        authenticationActions={authenticationActions}
        authentication={{ authentication: { test: 'noEmpty' } }}
      />,
      {
        context: { muiTheme, store },
        childContextTypes: {
          muiTheme: PropTypes.object,
          store: PropTypes.object,
        },
      },
    );
    wrapper.setProps({
      authentication: {
        user: {
          firstName: 'Test',
        },
      },
    });
    const headerBarWrapper = wrapper.find(HeaderBar);
    expect(headerBarWrapper.length).toEqual(1);
  });
});
