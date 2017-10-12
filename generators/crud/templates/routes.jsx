import React from 'react';
import { IndexRoute, Route } from 'react-router';

import RootConnected from './containers/root';

import modelContainers from './containers/models';

import crudRoutes from './crud-routes/crud-routes.json';

const routes = (
  <Route path="/" component={RootConnected}>
    <IndexRoute
      component={modelContainers[crudRoutes[0].componentName].list}
    />
    {crudRoutes.map(crudRoute => (
      <Route key={crudRoute.name} path={`${crudRoute.path}/`}>
        <Route
          key={crudRoute.name}
          path={`${crudRoute.path}/list`}
          component={modelContainers[crudRoute.componentName].list}
        />
        <Route
          key={crudRoute.name}
          path={`${crudRoute.path}/create`}
          component={modelContainers[crudRoute.componentName].create}
        />
        <Route
          key={crudRoute.name}
          path={`${crudRoute.path}/edit/:id`}
          component={modelContainers[crudRoute.componentName].edit}
        />
      </Route>
    ))}
  </Route>
);

export default routes;
