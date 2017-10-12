import React, { Component, PropTypes } from 'react';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import { List, ListItem } from 'material-ui/List';
import { FormattedMessage } from 'react-intl';
import { getUserRoutes } from '../../services/access-control';

export default class SideBar extends Component {
  getRoutes() {
    const { userPerimeters } = this.props;
    return getUserRoutes(userPerimeters);
  }

  closeSideBar = () => {
    this.props.onCloseSideBar();
  };

  render() {
    const routes = this.getRoutes();

    return (
      <Drawer
        open={this.props.open}
        docked={false}
        onRequestChange={this.closeSideBar}
      >
        <AppBar
          onLeftIconButtonTouchTap={this.props.onCloseSideBar}
          title="Menu"
        />
        <List>
          {routes.map(crudRoute => (
            <ListItem
              key={crudRoute.name}
              onTouchTap={() => this.props.navigateTo(`${crudRoute.path}/list`)}
              primaryText={crudRoute.name}
            />
          ))}
          <ListItem
            onTouchTap={this.props.onLogout}
            primaryText={<FormattedMessage id="authentication.logout" />}
          />
        </List>
      </Drawer>
    );
  }
}

SideBar.propTypes = {
  open: PropTypes.bool,
  onCloseSideBar: PropTypes.func,
  onLogout: PropTypes.func,
  navigateTo: PropTypes.func.isRequired,
  userPerimeters: PropTypes.arrayOf(PropTypes.string),
};
