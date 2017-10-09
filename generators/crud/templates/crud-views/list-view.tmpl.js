import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { findKey } from 'lodash';
import { push } from 'react-router-redux';

import ListView from '../../../../components/crud-view/list-view';
import modelActions from '../../../../actions/models/<%= modelName %>';
import model from '../../../../../../server/models/<%= modelName %>.json';

import { canWrite } from '../../../../services/access-control.js';
import { getUserPerimeters } from '../../../../selectors/user-perimeters.js';

const routeName = '<%= modelName %>';
const modelName = '<%= modelTitleName %>';

const modelKeyId = findKey(
  model.properties,
  property => property.id !== undefined,
);

const mapStateToProps = state => {
  const userPerimeters = getUserPerimeters(state);
  const userHasEditRights = canWrite(userPerimeters, routeName);
  return {
    authentication: state.authentication,
    data: state.models[routeName].list,
    loading: state.models[routeName].loading,
    errorPopinIsOpen: state.models[routeName].errorPopinIsOpen,
    errorImportList: state.models[routeName].errorImportList,
    routeName,
    modelName,
    model,
    modelKeyId,
    userHasEditRights,
  };
};

const mapDispatchToProps = dispatch => ({
  getList: () => {
    dispatch(modelActions.find());
  },
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
    dispatch({ type: '<%= actionPrefix %>/CANCEL_ERROR_POPIN' });
  },
  navigateTo: path => {
    dispatch(push(path));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(ListView),
);
