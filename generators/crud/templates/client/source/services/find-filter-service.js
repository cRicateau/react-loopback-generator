/* eslint no-param-reassign: 0 */

const moment = require('moment');

moment.locale('fr');

const getDefaultFilter = (page, pageSize) => {
  const findFilter = {
    'filter[limit]': pageSize,
    'filter[skip]': page * pageSize,
  };

  return findFilter;
};

const buildNumberFilter = (findFilter, countFilter, propertyName, filter) => {
  findFilter = {
    ...findFilter,
    [`filter[where][${propertyName}][like]`]: `%${filter.value}%`,
  };
  countFilter = {
    [`where[${propertyName}][like]`]: `%${filter.value}%`,
  };

  return { findFilter, countFilter };
};

const buildStringFilter = (findFilter, countFilter, propertyName, filter) => {
  const filterRegex = `/${filter.value}.?/i`;
  findFilter = {
    ...findFilter,
    [`filter[where][${propertyName}][regexp]`]: filterRegex,
  };
  countFilter = {
    ...countFilter,
    [`where[${propertyName}][regexp]`]: filterRegex,
  };

  return { findFilter, countFilter };
};

export const getFindFilter = (page, pageSize, sorted, filtered) => {
  let findFilter = getDefaultFilter(page, pageSize);

  if (sorted.length !== 0) {
    sorted.forEach((filter, index) => {
      const propertyName = filter.id;
      const order = filter.desc ? 'DESC' : 'ASC';
      const customSort = `${propertyName} ${order}`;
      findFilter = { ...findFilter, [`filter[order][${index}]`]: customSort };
    });
  }

  let countFilter, value, newFilters;
  if (filtered.length !== 0) {
    filtered.forEach(filter => {
      const propertyName = filter.id;

      value = parseFloat(filter.value) || filter.value;
      if (isFinite(value)) {
        newFilters = buildNumberFilter(
          findFilter,
          countFilter,
          propertyName,
          filter,
        );
      } else {
        newFilters = buildStringFilter(
          findFilter,
          countFilter,
          propertyName,
          filter,
        );
      }
      findFilter = newFilters.findFilter;
      countFilter = newFilters.countFilter;
    });
  }

  return { findFilter, countFilter };
};

export default { getFindFilter };
