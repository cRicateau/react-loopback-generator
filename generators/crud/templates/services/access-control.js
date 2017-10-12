import { intersection, find, filter } from 'lodash';
import crudRoutes from '../crud-routes/crud-routes.json';

export const canWrite = (userPerimeters, componentName) => {
  const route = find(
    crudRoutes,
    crudRoute => crudRoute.componentName === componentName,
  );

  if (!route || !route.ACL || !route.ACL.WRITE) return false;

  return intersection(route.ACL.WRITE, userPerimeters).length > 0;
};

export const canRead = (userPerimeters, componentName) => {
  const route = find(
    crudRoutes,
    crudRoute => crudRoute.componentName === componentName,
  );

  if (!route || !route.ACL || !route.ACL.READ) return false;

  return intersection(route.ACL.READ, userPerimeters).length > 0;
};

export const getUserRoutes = userPerimeters => {
  const routes = filter(crudRoutes, route => {
    if (!route.ACL) return false;
    const _canRead = intersection(route.ACL.READ, userPerimeters).length > 0;
    const _canWrite = intersection(route.ACL.WRITE, userPerimeters).length > 0;

    return _canRead || _canWrite;
  });

  return routes;
};

export default { canWrite, canRead, getUserRoutes };
