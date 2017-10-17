module.exports = function (Model) {
  const properties = Object.keys(Model.definition.properties);

  Model.observe('access', (ctx, next) => {
    if (ctx.query.where && ctx.query.where.q) {
      const fullTextSearch = ctx.query.where.q;
      ctx.query.where.or = properties.map(property => ({
        [property]: { ilike: `%${fullTextSearch}%`}
      }));
    }
    next();
  });
};
