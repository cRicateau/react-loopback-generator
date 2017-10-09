const generators = require('yeoman-generator');
const moment = require('moment');
const {
  assign,
  kebabCase,
  camelCase,
  snakeCase,
  capitalize,
  lowerCase,
  isEmpty,
  pick,
  find
} = require('lodash');


const { validateCrudJSON } = require('./validation.js');

module.exports = generators.Base.extend({
  prompting: {
    pathToConfig: function () {
      return this.prompt([
        {
          type: 'input',
          name: 'configFile',
          message: 'Enter the path to the JSON file describing all your models:',
        },
      ]).then(userPrompt => {
        const file = this.fs.readJSON(userPrompt.configFile);
        const errors = validateCrudJSON(file);
        if (!isEmpty(errors)) {
          this.log('----------INVALID JSON-----------');
          this.log(errors.join('\n'));
          return;
        }
        this.options.models = file;
      })
    },
  },

  writing: {
    writeYorc: function() {
      let entities = this.config.get('generated_models');
      if(entities === undefined)
        entities = [];
      entities.push(pick(this.options, ['name', 'plural', 'properties']));
      this.config.set('generated_models', entities);
      this.config.save();
    },
    copyLoopbackModelJS: function () {
      this.options.models.map(model => {
        const modelFileName = kebabCase(model.name);
        return this.fs.copyTpl(
          this.templatePath('model/model.tmpl.js'),
          this.destinationPath(`server/models/${modelFileName}.js`),
          {}
        );
      })
    },
    createLoopbackModel: function () {
      this.options.models.map(model => {
        const modelFileName = kebabCase(model.name);
        const jsonPath = `server/models/${modelFileName}.json`;
        const modelConfig = this.fs.readJSON(jsonPath);
        const modelDefinition = {
          name: capitalize(camelCase(model.name)),
          plural: kebabCase(model.plural),
          base: "PersistedModel",
          mixins: {
            DisableRemoteMethods: {},
            ExcelExport: {},
            ExcelImport: {}
          },
          options: {
            validateUpsert: true,
            postgresql: {
              table: snakeCase(model.name)
            }
          },
          properties: {},
        }

        for (const property of model.properties) {
          modelDefinition.properties[property.name]={
            type: property.type,
            required: property.required
          }
        }

        const updatedModel = Object.assign({}, modelConfig, modelDefinition)
        this.fs.writeJSON(this.destinationPath(jsonPath), updatedModel);
      });
    },
    activateModelInLoopbackConfig: function(){
      this.options.models.map(model => {
        const modelFileName = kebabCase(model.name);
        const LoopbackModelsConfigPath = 'server/model-config.json'
        const modelConfig = this.fs.readJSON(LoopbackModelsConfigPath);
        const newModel = {
          [capitalize(camelCase(model.name))]:{
            "dataSource": "db",
            "public": true
          }
        }

        const newModelConfig = Object.assign({}, modelConfig, newModel);
        this.fs.writeJSON(this.destinationPath(LoopbackModelsConfigPath), newModelConfig);
      });
    },
    createMigration: function() {
      this.options.models.map(model => {
        const migrationName = `${moment().format('YYYYMMDDHHmmSS')}-create-${kebabCase(model.name)}`;
        return Promise.all([
          'up',
          'down',
          'general',
        ].map(file => {
          if (file === 'up' || file === 'down') {
            const sqlProperties = model.properties.map((property) => {
              let sqlType;
              switch (property.type) {
                case 'number':
                  sqlType = 'integer';
                  break;
                case 'string':
                  sqlType = 'text';
                  break;
                case 'date':
                  sqlType = 'timestamp with time zone';
                  break;
                case 'json':
                  sqlType = 'json';
                  break;
                case 'boolean':
                  sqlType = 'boolean';
                  break;
                default:
                  sqlType = null;
                  break;
              }
              return {
                name: property.name,
                type: sqlType,
                required: property.required,
              };
            });
            const filePath = `migrations/sqls/${migrationName}-${file}.sql`;
            return this.fs.copyTpl(
              this.templatePath(`model/migration-${file}.sql`),
              this.destinationPath(filePath),
              {
                tableName: camelCase(model.name),
                properties: sqlProperties || [],
              }
            );
          } else {
            const fileNameMigrationUp = `${migrationName}-up.sql`;
            const fileNameMigrationDown = `${migrationName}-down.sql`;
            const filePath = `migrations/${migrationName}.js`;
            return this.fs.copyTpl(
              this.templatePath(`model/migration-${file}.js`),
              this.destinationPath(filePath),
              {
                fileNameMigrationDown,
                fileNameMigrationUp,
              }
            );
          }
        }));
      });
    },
    createServices: function () {
      this.fs.copyTpl(
        this.templatePath('services/access-control.js'),
        this.destinationPath(`client/source/services/access-control.js`)
      );

      return this.fs.copyTpl(
        this.templatePath('selectors/user-perimeters.js'),
        this.destinationPath(`client/source/selectors/user-perimeters.js`)
      );
    },
    createConstant: function () {
      this.options.models.map(model => {
        const constantFileName = kebabCase(model.name);
        return this.fs.copyTpl(
          this.templatePath('redux-files/constant.json'),
          this.destinationPath(`client/source/constants/models/${constantFileName}.json`),
          {
            actionPrefix: model.name.toUpperCase(),
          }
        );
      })
    },
    createAction: function () {
      this.options.models.map(model => {
        const actionFileName = kebabCase(model.name);
        const constantFileName = kebabCase(model.name);
        const apiUrl = `api/${kebabCase(model.plural)}`;
        const templateVariables = {
          constantFileName,
          apiUrl,
          actionFileName
        };

        this.fs.copyTpl(
          this.templatePath('redux-files/action.js'),
          this.destinationPath(`client/source/actions/models/${actionFileName}.js`),
          templateVariables
        );
        return this.fs.copyTpl(
          this.templatePath('redux-files/action.test.js'),
          this.destinationPath(`client/source/actions/models/${actionFileName}.test.js`),
          templateVariables
        );
      });
    },
    createReducer: function () {
      this.options.models.map(model => {
        const reducerFileName = kebabCase(model.name);
        const constantFileName = kebabCase(model.name);
        const actionReduxName = model.name.toUpperCase();
        const templateVariables = {
          constantFileName,
          actionReduxName,
          reducerFileName
        };

        this.fs.copyTpl(
          this.templatePath('redux-files/reducer.js'),
          this.destinationPath(`client/source/reducers/models/${reducerFileName}.js`),
          templateVariables
        )
        return this.fs.copyTpl(
          this.templatePath('redux-files/reducer.test.js'),
          this.destinationPath(`client/source/reducers/models/${reducerFileName}.test.js`),
          templateVariables
        );
      });
    },
    listView: function(){
      this.options.models.map(model => {
        const containerFolder = kebabCase(model.name);
        return Promise.all([
          this.fs.copyTpl(
            this.templatePath('crud-views/list-view.tmpl.js'),
            this.destinationPath(`client/source/containers/models/${containerFolder}/list-view/index.jsx`),
            {
              modelName: kebabCase(model.name),
              modelTitleName: capitalize(lowerCase(model.name)),
              actionPrefix: model.name.toUpperCase(),
            }
          ),
          this.fs.copy(
            this.templatePath('components/list-view/styles.css'),
            this.destinationPath(`client/source/components/crud-view/list-view/styles.css`)
          ),
          this.fs.copy(
            this.templatePath('components/list-view/index.jsx'),
            this.destinationPath(`client/source/components/crud-view/list-view/index.jsx`)
          ),
          this.fs.copy(
            this.templatePath('components/list-view/index.test.js'),
            this.destinationPath(`client/source/components/crud-view/list-view/index.test.js`)
          ),
        ]);
      });
    },
    editView: function() {
      this.options.models.map(model => {
        const containerFolder = kebabCase(model.name);
        const apiUrl = `api/${kebabCase(model.plural)}`;
        return Promise.all([
          this.fs.copyTpl(
            this.templatePath('crud-views/edit-view.tmpl.js'),
            this.destinationPath(`client/source/containers/models/${containerFolder}/edit-view/index.jsx`),
            {
              modelName: kebabCase(model.name),
              apiUrl,
            }
          ),
          this.fs.copy(
            this.templatePath('components/edit-view/styles.css'),
            this.destinationPath(`client/source/components/crud-view/edit-view/styles.css`)
          ),
          this.fs.copy(
            this.templatePath('components/edit-view/index.jsx'),
            this.destinationPath(`client/source/components/crud-view/edit-view/index.jsx`)
          ),
          this.fs.copy(
            this.templatePath('components/edit-view/index.test.js'),
            this.destinationPath(`client/source/components/crud-view/edit-view/index.test.js`)
          ),
        ]);
      });
    },
    createView: function() {
      this.options.models.map(model => {
        const containerFolder = kebabCase(model.name);
        const apiUrl = `api/${kebabCase(model.plural)}`;
        return Promise.all([
          this.fs.copyTpl(
            this.templatePath('crud-views/create-view.tmpl.js'),
            this.destinationPath(`client/source/containers/models/${containerFolder}/create-view/index.jsx`),
            {
              modelName: kebabCase(model.name),
              apiUrl,
            }
          ),
          this.fs.copy(
            this.templatePath('components/create-view/styles.css'),
            this.destinationPath(`client/source/components/crud-view/create-view/styles.css`)
          ),
          this.fs.copy(
            this.templatePath('components/create-view/index.jsx'),
            this.destinationPath(`client/source/components/crud-view/create-view/index.jsx`)
          ),
          this.fs.copy(
            this.templatePath('components/create-view/index.test.js'),
            this.destinationPath(`client/source/components/crud-view/create-view/index.test.js`)
          ),
        ]);
      });
    },
    addCrudToJSON: function () {
      this.options.models.map(model => {
        const jsonPath = 'client/source/crud-routes/crud-routes.json';
        const routes = this.fs.readJSON(jsonPath) || { active: [], inactive: [] };
        const name = kebabCase(model.name);
        const routeName = capitalize(lowerCase(model.name));
        const newCrudEntry = {
          path: `/${name}`,
          componentName: name,
          name: routeName,
        }
        if (!find(routes.active, route => route.name === routeName)) {
          routes.active.push(newCrudEntry);
        };
        return this.fs.writeJSON(this.destinationPath(jsonPath), routes);
      })
    },
  },
});
