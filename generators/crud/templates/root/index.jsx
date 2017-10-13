import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { isEmpty } from 'lodash';

import { IntlProvider, addLocaleData } from 'react-intl';
import fr from 'react-intl/locale-data/fr';

import HeaderBar from '../../components/header-bar';
import SideBar from '../../components/side-bar';
import frMessages from '../../locale/locale-fr.json';

import { getUserPerimeters } from '../../selectors/user-perimeters.js';
import Notification from '../../components/root/notification';

import * as AuthenticationEffect from '../../effects/authentication';
import * as SideBarAction from '../../actions/side-bar';

const locales = {
  fr: frMessages,
};

addLocaleData([...fr]);

export class Root extends Component {
  componentWillMount() {
    this.props.authenticationEffects.login().catch(() => {
      // To avoid 401 error when page loaded from cache
      window.location.reload(true);
    });
  }

  doLogout() {
    this.props.authenticationEffects.logout();
  }

  render() {
    if (isEmpty(this.props.authentication)) return <div />;

    return (
      <IntlProvider
        locale={this.props.languageSelected}
        messages={locales[this.props.languageSelected]}
      >
        <div>
          <HeaderBar onOpenSideBar={this.props.sideBarActions.open} />
          <SideBar
            open={this.props.sideBar.open}
            onCloseSideBar={this.props.sideBarActions.close}
            onLogout={this.props.authenticationEffects.logout}
            navigateTo={this.props.navigateTo}
            userPerimeters={this.props.userPerimeters}
          />
          {this.props.children}
          <Notification />
        </div>
      </IntlProvider>
    );
  }
}

Root.propTypes = {
  languageSelected: PropTypes.string,
  authentication: PropTypes.shape({
    id: PropTypes.string,
  }),
  authenticationEffects: PropTypes.shape({
    login: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
  }).isRequired,
  sideBar: PropTypes.shape({
    open: PropTypes.bool,
  }),
  sideBarActions: PropTypes.shape({
    open: PropTypes.func,
    close: PropTypes.func,
  }),
  children: PropTypes.element,
  navigateTo: PropTypes.func.isRequired,
  userPerimeters: PropTypes.arrayOf(PropTypes.string),
};

function mapStateToProps(state) {
  return {
    languageSelected: state.language.selected,
    authentication: state.authentication,
    userPerimeters: getUserPerimeters(state),
    sideBar: state['side-bar'],
  };
}

function mapDispatchToProps(dispatch) {
  return {
    authenticationEffects: bindActionCreators(AuthenticationEffect, dispatch),
    sideBarActions: bindActionCreators(SideBarAction, dispatch),
    navigateTo: path => {
      dispatch(push(path));
      dispatch(SideBarAction.close());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);
