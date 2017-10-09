const { includes, isEmpty, reduce } = require('lodash');

module.exports = {
  validateCrudJSON: (crudObj) => {
    let propertyErrors = []
    if( !crudObj ) {
      propertyErrors.push('File doesn\'t exist');
      return propertyErrors;
    }

    const keysToCheck = [
      "name",
      "plural",
      "properties",
    ];

    const compulsoryKeys = ["name", "type"];
    const propertyCriteria = {
      "name": 'string',
      "type": 'string',
      "required": 'boolean',
    };
  
    crudObj.map(model => {
      const modelKeys = Object.keys(model);
      keysToCheck.forEach((compulsoryKey) => {
        if(!includes(modelKeys, compulsoryKey)){
          propertyErrors.push(`Key missing : ${compulsoryKey}`);
        }

        const crudProperties = model.properties;
        if(!Array.isArray(crudProperties)){
          propertyErrors.push(`Expected 'properties' to be an array, got ${typeof crudProperties} instead`);
        }

        crudProperties.forEach((property, index) => {
          const propertyKeys = Object.keys(property);
    
          // const hasAllCompulsoryKeys = reduce(compulsoryKeys, (truthValue, compulsoryKey) => {
          //   const hasCompulsoryKey = includes(propertyKeys, compulsoryKey);
          //   if(!hasCompulsoryKey){
          //     propertyErrors.push(`Expected ${compulsoryKey} to be part of properties at property of index ${index}`);
          //   }
          //   return truthValue && hasCompulsoryKey;
          // }, true);
    
          // const hasMatchingPropertyTypes = reduce(propertyKeys, (truthValue, propertyKey) => {
          //   const isValidType = (typeof property[propertyKey] == propertyCriteria[propertyKey]);
          //   if(!isValidType){
          //     propertyErrors.push(`Expected ${propertyKey} to be of type ${propertyCriteria[propertyKey]} at property of index ${index}`);
          //   }
          //   return truthValue && isValidType;
          // }, true);
        })
      })
    })

    return propertyErrors;
  }
}