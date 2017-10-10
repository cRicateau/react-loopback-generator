import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { findKey } from 'lodash';

import CreateView from '../../../../components/crud-view/create-view';
import model from '../../../../../../server/models/<%= modelName %>.json';
import modelActions from '../../../../actions/models/<%= modelName %>';
import getModelsIds from '../../../../services/modelKeyIds';

import { canWrite } from '../../../../services/access-control.js';
import { getUserPerimeters } from '../../../../selectors/user-perimeters.js';

const routeName = '<%= modelName %>';

const modelKeyIds = getModelsIds(model.properties);

const mapStateToProps = state => {
  const userPerimeters = getUserPerimeters(state);
  const userHasEditRights = canWrite(userPerimeters, routeName);
  return {
    authentication: state.authentication,
    modelKeyIds,
    model,
    userHasEditRights,
  };
};

const mapDispatchToProps = dispatch => ({
  navigateToList: () => {
    dispatch(push('/<%= modelName %>/list'));
  },
  createNewEntry: formValues => {
    dispatch(modelActions.create(formValues));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(CreateView),
);
