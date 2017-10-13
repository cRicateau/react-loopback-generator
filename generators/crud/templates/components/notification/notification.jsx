import React, { Component, PropTypes } from 'react';
import SnackBar from 'material-ui/Snackbar';
import { injectIntl } from 'react-intl';

import { connect } from 'react-redux';

import * as NotificationAction from '../../actions/notification';

export class Notification extends Component {
  closeNotification = () => {
    this.props.closeGlobalNotification();
  };

  render() {
    const { formatMessage } = this.props.intl;
    return (
      <SnackBar
        open={this.props.notification.open}
        message={formatMessage({ id: this.props.notification.message })}
        bodyStyle={{ backgroundColor: this.props.notification.backgroundColor }}
        contentStyle={{ color: '#FFFFFF' }}
        autoHideDuration={2000}
        onRequestClose={this.closeNotification}
      />
    );
  }
}

Notification.propTypes = {
  notification: PropTypes.shape({
    open: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
  }).isRequired,
  closeGlobalNotification: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    notification: state.notification,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    closeGlobalNotification: () => {
      dispatch(NotificationAction.close());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(Notification),
);
