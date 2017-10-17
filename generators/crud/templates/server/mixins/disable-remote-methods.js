const relationMethodPrefixes = [
  'prototype.__findById__',
  'prototype.__destroyById__',
  'prototype.__updateById__',
  'prototype.__exists__',
  'prototype.__link__',
  'prototype.__get__',
  'prototype.__create__',
  'prototype.__update__',
  'prototype.__destroy__',
  'prototype.__unlink__',
  'prototype.__count__',
  'prototype.__delete__'
];

const disableAllExcept = (model, methodsToExpose) => {
  const excludedMethods = methodsToExpose || [];
  const hiddenMethods = [];

  const disableMethod = method => {
    const methodName = method.name;

    if (excludedMethods.indexOf(methodName) < 0) {
      model.disableRemoteMethodByName(methodName);
      hiddenMethods.push(methodName);
    }
  };

  const disableRelatedMethods = relation => {
    relationMethodPrefixes.forEach(prefix => {
      const methodName = prefix + relation;
      disableMethod({ name: methodName });
    });
  };

  if (model && model.sharedClass) {
    // Hack for patch method, using deprecated disableRemoteMethod
    model.disableRemoteMethod('patchAttributes');
    model.sharedClass.methods().forEach(disableMethod);
    Object.keys(model.definition.settings.relations).forEach(
      disableRelatedMethods
    );
  }
};

module.exports = function(Model, options) {
  const except = options && options.except ? options.except : [];
  disableAllExcept(Model, except);
};
