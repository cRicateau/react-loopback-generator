import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import 'flexboxgrid';
import './main.css';

import routes from './routes';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#FFFFFF',
    textColor: '#000000',
    alternateTextColor: '#000000',
    disabledColor: '#EEEEEE',
  },
  appBar: {
    height: 60,
  },
  button: {
    display: 'inline-block',
  },
});

class AppRoot extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired, // eslint-disable-line
    history: React.PropTypes.object.isRequired, // eslint-disable-line
  };

  constructor(props) {
    super(props);
    this.routes = routes;
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <Router history={this.props.history} routes={this.routes} />
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default AppRoot;
