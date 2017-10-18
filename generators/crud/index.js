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
            DisableRemoteMethods: {
              'except': ['find', 'findById', 'create', 'deleteById', 'replaceById', 'count']
            },
            ExcelExport: {},
            ExcelImport: {}
          },
          options: {
            validateUpsert: true,
            postgresql: {
              table: snakeCase(model.name)
            }
          },
          relations: {},
          properties: {},
        }

        for (const property of model.properties) {
          modelDefinition.properties[property.name]={
            type: property.type,
            required: property.required
          }
          if (modelConfig && modelConfig.properties && modelConfig.properties[property.name]) {
            modelDefinition.properties[property.name] = Object.assign(
              modelDefinition.properties[property.name],
              modelConfig.properties[property.name]
            )
          }

          if (modelConfig && modelConfig.mixins) {
            modelDefinition.mixins = Object.assign(
              modelDefinition.mixins,
              modelConfig.mixins
            )
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
    installServerTemplate: function () {
      Promise.all([
        'server/services/excel-export.js',
        'server/services/excel-export.test.js',
        'server/services/excel-import.js',
        'server/services/file-upload.js',
        'server/mixins/disable-remote-methods.js',
        'server/mixins/excel-export.js',
        'server/mixins/excel-export.test.js',
        'server/mixins/excel-import.js',
        'server/mixins/excel-import.test.js',
        'server/mixins/fullsearch.js',
      ].map(file => {
        return this.fs.copyTpl(
          this.templatePath(file),
          this.destinationPath(file));
      }));
    },
    createServices: function () {
      this.fs.copyTpl(
        this.templatePath('services/access-control.js'),
        this.destinationPath(`client/source/services/access-control.js`)
      );

      this.fs.copyTpl(
        this.templatePath('services/modelKeyIds.js'),
        this.destinationPath(`client/source/services/modelKeyIds.js`)
      );

      return this.fs.copyTpl(
        this.templatePath('selectors/user-perimeters.js'),
        this.destinationPath(`client/source/selectors/user-perimeters.js`)
      );
    },
    createModelForm: function() {
      return Promise.all([
        { src: 'components/model-form/index.jsx', dest: 'client/source/components/crud-view/model-form/index.jsx'},
        { src: 'components/model-form/model-form.test.js', dest: 'client/source/components/crud-view/model-form/model-form.test.js'},
        { src: 'components/model-form/selector.js', dest: 'client/source/components/crud-view/model-form/selector.js'},
        { src: 'components/model-form/selector.test.js', dest: 'client/source/components/crud-view/model-form/selector.test.js'},
        { src: 'components/model-form/styles.css', dest: 'client/source/components/crud-view/model-form/styles.css'},
      ].map(file => {
        return this.fs.copyTpl(this.templatePath(file.src), this.destinationPath(file.dest));
      }));
    },
    createTableComponents: function () {
      return Promise.all([
        { src: 'crud-helpers/table-action-cell.jsx', dest: 'client/source/components/crud-view/table-action-cell.jsx' },
        { src: 'crud-helpers/table-action-cell.test.js', dest: 'client/source/components/crud-view/table-action-cell.test.js'},
        { src: 'crud-helpers/table-manager.jsx', dest: 'client/source/components/crud-view/table-manager.jsx'},
        { src: 'crud-helpers/table-manager.test.js', dest: 'client/source/components/crud-view/table-manager.test.js'},
        { src: 'crud-helpers/table-manager.css', dest: 'client/source/components/crud-view/table-manager.css'},
      ].map(file => {
        return this.fs.copyTpl(this.templatePath(file.src), this.destinationPath(file.dest));
      }));
    },
    createSideBar: function() {
      return Promise.all([
        this.fs.copyTpl(
          this.templatePath('components/side-bar/index.jsx'),
          this.destinationPath('client/source/components/side-bar/index.jsx')
        ),
        this.fs.copyTpl(
          this.templatePath('components/side-bar/index.test.js'),
          this.destinationPath('client/source/components/side-bar/index.test.js')
        )
      ]);
    },
    createNetworking: function(){
      return Promise.all([
        { src: 'redux-files/networking.js', dest: 'client/source/actions/networking.js' },
        { src: 'redux-files/networking.test.js', dest: 'client/source/actions/networking.test.js'}
      ].map(file => {
        return this.fs.copyTpl(this.templatePath(file.src), this.destinationPath(file.dest));
      })); 
    },
    createRootFiles: function() {
      return Promise.all([
          { src: 'routes.jsx', dest: 'client/source/routes.jsx'},
          { src: 'crud-views/index.tmpl.js', dest: 'client/source/containers/models/index.js' },
          { src: 'redux-files/index.js', dest: 'client/source/reducers/index.js'},
          { src: 'root/index.jsx' , dest: 'client/source/containers/root/index.jsx'},
          { src: 'root/root.test.jsx', dest: 'client/source/containers/root/root.test.js' },
          { src: 'root/main.css', dest: 'client/source/main.css'}
        ].map(file => this.fs.copyTpl(this.templatePath(file.src), this.destinationPath(file.dest)))
      )
    },
    createNotificationFiles: function() {
      return Promise.all([
          { src: 'components/notification/notification.jsx', dest: 'client/source/components/root/notification.jsx'},
          { src: 'components/notification/notification.test.js', dest: 'client/source/components/root/notification.test.js' },
          { src: 'redux-files/notification.action.js', dest: 'client/source/actions/notification.js' },
          { src: 'redux-files/notification.action.test.js', dest: 'client/source/actions/notification.test.js' },
          { src: 'constants/notification.json', dest: 'client/source/constants/notification.json'},
          { src: 'redux-files/notification.reducer.js', dest: 'client/source/reducers/notification.js'},
          { src: 'redux-files/notification.reducer.test.js', dest: 'client/source/reducers/notification.test.js'},
          { src: 'redux-files/reducers.json', dest: 'client/source/reducers/reducers.json'}
        ].map(file => this.fs.copyTpl(this.templatePath(file.src), this.destinationPath(file.dest)))
      )
    },
    createLocaleFiles: function(){
      Promise.all([
        { src: 'locale/locale-en.json', dest: 'client/source/locale/locale-en.json'},
        { src: 'locale/locale-fr.json', dest: 'client/source/locale/locale-fr.json'},
      ].map(file => {
      return this.fs.copyTpl(
        this.templatePath(file.src),
        this.destinationPath(file.dest),
        {
          applicationName: this.config.get('applicationName')
        }
      );
    }));
    },
    createDocs: function(){
      Promise.all([
        { src: 'doc/installation.md', dest: 'doc/installation.md'},
      ].map(file => {
      return this.fs.copyTpl(
        this.templatePath(file.src),
        this.destinationPath(file.dest),
        {
          applicationName: this.config.get('applicationName')
        }
      );
    }));
    },
    configureStore: function() {
      return this.fs.copyTpl(
        this.templatePath('redux-files/configure-store.js'),
        this.destinationPath('client/source/stores/configure-store.js')
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
    createModelsActions: function () {
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
          {
            src: 'crud-views/list-view.tmpl.js',
            dest: `client/source/containers/models/${containerFolder}/list-view/index.jsx`
          },
          {
            src: 'components/list-view/styles.css',
            dest: 'client/source/components/crud-view/list-view/styles.css'
          },
          {
            src: 'components/list-view/index.jsx',
            dest: 'client/source/components/crud-view/list-view/index.jsx'
          },
          {
            src: 'components/list-view/index.test.js',
            dest: 'client/source/components/crud-view/list-view/index.test.js'
          },
          {
            src: 'client/source/services/find-filter-service.js',
            dest: 'client/source/services/find-filter-service.js'
          }
        ].map(file => {
            return this.fs.copyTpl(
              this.templatePath(file.src),
              this.destinationPath(file.dest),
              {
                modelName: kebabCase(model.name),
                modelTitleName: model.title,
                actionPrefix: model.name.toUpperCase(),
              }
            );
          })
        );
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
        const routes = this.fs.readJSON(jsonPath) || [] ;
        const name = kebabCase(model.name);
        const routeName = capitalize(lowerCase(model.name));
        const newCrudEntry = {
          path: `/${name}`,
          componentName: name,
          name: routeName,
        }
        if (!find(routes, route => route.componentName === name)) {
          routes.push(newCrudEntry);
        };
        return this.fs.writeJSON(this.destinationPath(jsonPath), routes);
      })
    },
  },
  install: function() {
    this.spawnCommandSync('npm', [
      'install',
      'multer',
      'mmmagic',
      'xlsx',
      'redux-form',
      'redux-form-material-ui',
      'sinon-chai',
      '--save'
    ]);
  }
});
