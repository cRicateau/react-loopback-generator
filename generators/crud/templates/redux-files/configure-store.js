import { applyMiddleware, createStore, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';

export default function configureStore(history) {
  const reduxRouterMiddleware = routerMiddleware(history);
  const reducers = compose()(rootReducer);

  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;
  /* eslint-enable */

  let createCustomStore = composeEnhancers()(createStore);

  const middlewares = [reduxRouterMiddleware, thunk];

  createCustomStore = applyMiddleware(...middlewares)(createCustomStore);

  const store = createCustomStore(reducers);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default; // eslint-disable-line
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
