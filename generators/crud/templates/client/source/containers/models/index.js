import { reduce } from 'lodash';
import crudRoutes from '../../crud-routes/crud-routes.json';

const modelViews = reduce(
  crudRoutes,
  (componentIndex, crudRoute) => {
  componentIndex[crudRoute.componentName] = ['list', 'create', 'edit'].reduce((view, viewType) => { // eslint-disable-line
    view[viewType] = require(`./${crudRoute.componentName}/${viewType}-view/index.jsx`).default; // eslint-disable-line
      return view;
    }, {});
    return componentIndex;
  },
  {},
);

export default modelViews;
