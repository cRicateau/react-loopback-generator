import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import ActionList from 'material-ui/svg-icons/action/list';

import ModelForm from '../model-form';

import styles from './styles.css';

export default class CreateView extends Component {
  submitModelCreate = values => {
    this.props.createNewEntry(values);
  };

  returnToList = () => {
    this.props.navigateToList();
  };

  render() {
    const { formatMessage } = this.props.intl;
    const { model, modelKeyIds, userHasEditRights } = this.props;

    if (!userHasEditRights) return <div />;

    return (
      <div className={styles.container}>
        <div className={styles.headerTitle}>
          <IconButton
            tooltip={formatMessage({ id: 'create.view.back-to-list' })}
            onClick={this.returnToList}
          >
            <ActionList />
          </IconButton>
          <h2>
            {`${formatMessage({ id: 'create.view.title' })} ${model.name}`}
          </h2>
        </div>
        <div>
          <ModelForm
            modelProperties={model.properties}
            onSubmit={this.submitModelCreate}
            modelKeyIds={modelKeyIds}
            disableModelKeyIds={false}
          />
        </div>
      </div>
    );
  }
}

CreateView.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  navigateToList: PropTypes.func.isRequired,
  createNewEntry: PropTypes.func.isRequired,
  modelKeyIds: PropTypes.arrayOf(PropTypes.string),
  model: PropTypes.object, // eslint-disable-line
  userHasEditRights: PropTypes.bool.isRequired,
};
