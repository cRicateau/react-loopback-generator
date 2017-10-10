const getModelsIds = function(modelProperties) {
  const modelKeyIds = Object.keys(
    modelProperties,
  ).reduce((acc, propertyKey) => {
    if (modelProperties[propertyKey].id !== undefined) {
      return [...acc, propertyKey];
    }
    return acc;
  }, []);

  return modelKeyIds;
};

export default getModelsIds;
