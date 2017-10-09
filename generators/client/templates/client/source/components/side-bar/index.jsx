import React, { Component, PropTypes } from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import { List, ListItem } from 'material-ui/List';
import { FormattedMessage } from 'react-intl';
import { getUserRoutes } from '../../services/access-control';


export default class SideBar extends Component {
  getRoutes = () => {
    const { userPerimeters } = this.props;
    return getUserRoutes(userPerimeters);
  }

  navigateTo = path => {
    this.props.navigateTo(`${path}/list`);
  }

  render() {
    const routes = this.getRoutes();
    return (
      <Drawer open={this.props.open}>
        <AppBar
          onLeftIconButtonTouchTap={this.props.onCloseSideBar}
          title="<%= applicationName %>"
        />
        <List>
          {routes.map(crudRoute => (
            <ListItem
              key={crudRoute.name}
              onTouchTap={() => this.navigateTo(crudRoute.path)}
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
