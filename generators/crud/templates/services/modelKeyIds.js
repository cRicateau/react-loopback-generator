const getModelsIds = function(modelProperties) {  
  const modelKeyIds = Object.keys(
    modelProperties,
  ).reduce((acc, propertyKey) => {
    if (modelProperties[propertyKey].id !== undefined) {
      return [...acc, propertyKey];
    }
    return acc;
  }, []);

  if (modelKeyIds.length === 0) {
    return ['id'];
  }

  return modelKeyIds;
};

export default getModelsIds;
