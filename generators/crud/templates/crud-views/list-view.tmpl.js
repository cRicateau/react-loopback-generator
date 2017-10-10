import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { findKey } from 'lodash';
import { push } from 'react-router-redux';

import ListView from '../../../../components/crud-view/list-view';
import modelActions from '../../../../actions/models/<%= modelName %>';
import model from '../../../../../../server/models/<%= modelName %>.json';
import getModelsIds from '../../../../services/modelKeyIds';

import { canWrite } from '../../../../services/access-control.js';
import { getUserPerimeters } from '../../../../selectors/user-perimeters.js';

const routeName = '<%= modelName %>';
const modelName = '<%= modelTitleName %>';

const modelKeyIds = getModelsIds(model.properties);

const mapStateToProps = state => {
  const userPerimeters = getUserPerimeters(state);
  const userHasEditRights = canWrite(userPerimeters, routeName);
  return {
    authentication: state.authentication,
    data: state.models[routeName].list,
    errorPopinIsOpen: state.models[routeName].errorPopinIsOpen,
    errorImportList: state.models[routeName].errorImportList,
    dataCount: state.models[routeName].count,
    loading:
      state.models[routeName].loading ||
      state.models[routeName].countLoading,
    routeName,
    modelName,
    model,
    modelKeyId,
    userHasEditRights,
  };
};

const mapDispatchToProps = dispatch => ({
  getList: params => dispatch(modelActions.find(params)),
  count: params => dispatch(modelActions.count(params)),
  deleteItem: (id, modelKeyIdentifier) => {
    dispatch(modelActions.delete(id, modelKeyIdentifier));
  },
  export: authentication => {
    dispatch(modelActions.export(authentication));
  },
  import: file => {
    dispatch(modelActions.import(file));
  },
  cancelErrorPopin: () => {
    dispatch(modelActions.cancelErrorPopin());
  },
  navigateTo: path => {
    dispatch(push(path));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(ListView),
);
