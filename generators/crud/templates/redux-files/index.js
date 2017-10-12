import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import { assign, merge } from "lodash";

import { reducer as formReducer } from "redux-form";

import generatedReducers from "./reducers.json";
import crudRoutes from "../crud-routes/crud-routes.json";

const reducers = merge(
  ...generatedReducers.map(name => ({ [name]: require(`./${name}`).default })) // eslint-disable-line
);

const modelReducers = merge(
  ...crudRoutes.map(route => ({
    [route.componentName]: require(`./models/${route.componentName}`).default // eslint-disable-line
  }))
);

const rootReducer = combineReducers(
  assign(reducers, {
    routing: routerReducer,
    models: combineReducers(modelReducers),
    form: formReducer
  })
);

export default rootReducer;
