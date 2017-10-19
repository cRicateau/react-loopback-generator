import React, { Component } from 'react';
import PropTypes from 'prop-types';

import IconButton from 'material-ui/IconButton';
import ActionList from 'material-ui/svg-icons/action/list';

import ModelForm from '../model-form';

import styles from './styles.css';

export default class EditView extends Component {
  componentWillMount() {
    const id = this.props.params.id;
    this.props.findEntry(id);
  }

  submitModelEdit = values => {
    const updatedModel = { ...values };
    delete updatedModel[this.props.modelKeyIds[0]]; // you cannot try to modify the primary key
    this.props.editEntry(updatedModel, this.props.params.id);
  };

  returnToList = () => {
    this.props.navigateToList();
  };

  render() {
    const { formatMessage } = this.props.intl;
    const { modelKeyIds, model, userHasEditRights } = this.props;

    if (!userHasEditRights) return <div />;

    return (
      <div className={styles.container}>
        <div className={styles.headerTitle}>
          <IconButton
            tooltip={formatMessage({ id: 'edit.view.back-to-list' })}
            onClick={this.returnToList}
          >
            <ActionList />
          </IconButton>
          <h2>{`${formatMessage({ id: 'edit.view.title' })} ${model.name}`}</h2>
        </div>
        <div>
          <ModelForm
            modelProperties={model.properties}
            onSubmit={this.submitModelEdit}
            modelKeyIds={modelKeyIds}
            disableModelKeyId={true}
          />
        </div>
      </div>
    );
  }
}

EditView.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  navigateToList: PropTypes.func.isRequired,
  editEntry: PropTypes.func.isRequired,
  findEntry: PropTypes.func.isRequired,
  modelKeyIds: PropTypes.arrayOf(PropTypes.string),
  model: PropTypes.object, // eslint-disable-line
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  userHasEditRights: PropTypes.bool.isRequired,
};
