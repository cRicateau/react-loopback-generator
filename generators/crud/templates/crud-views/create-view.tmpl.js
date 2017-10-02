import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { findKey } from 'lodash';

import CreateView from '../../../../components/crud-view/create-view';
import model from '../../../../../../server/models/<%= modelName %>.json';
import modelActions from '../../../../actions/models/<%= modelName %>';

const modelKeyId = findKey(
  model.properties,
  property => property.id !== undefined,
);

const mapStateToProps = state => ({
  authentication: state.authentication,
  modelKeyId,
  model,
});

const mapDispatchToProps = dispatch => ({
  navigateToList: () => {
    dispatch(push('/<%= apiUrl %>/list'));
  },
  createNewEntry: formValues => {
    dispatch(modelActions.create(formValues));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(CreateView),
);

