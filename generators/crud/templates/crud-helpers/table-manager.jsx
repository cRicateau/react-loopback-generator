import React, { Component, PropTypes } from 'react';

import { injectIntl } from 'react-intl';

import RaisedButton from 'material-ui/RaisedButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ExportIcon from 'material-ui/svg-icons/file/cloud-download';
import ImportIcon from 'material-ui/svg-icons/file/cloud-upload';

import style from './table-manager.css';

export class TableManager extends Component {
  navigateToCreationView = () => {
    this.props.navigateTo(`${this.props.modelBasePath}/create`);
  };

  // event.target.value is reset to fire the onChange when the same file is uploaded
  handleImportChange = event => {
    this.props.onImportChange(event);
    event.target.value = null; // eslint-disable-line
  };

  render() {
    const { formatMessage } = this.props.intl;
    const { hasEditRights } = this.props;
    return (
      <div className={style.tableManagerWrapper}>
        <h2>{`${formatMessage({ id: 'list.table-manager.title' })} ${this.props
          .modelBaseName}`}</h2>
        {hasEditRights && (
          <RaisedButton
            label={formatMessage({ id: 'list.table-manager.create' })}
            primary={true}
            icon={<ContentAdd />}
            style={{ float: 'right' }}
            onClick={this.navigateToCreationView}
          />
        )}
        <RaisedButton
          label={formatMessage({ id: 'list.table-manager.export' })}
          primary={true}
          icon={<ExportIcon />}
          style={{ float: 'right', marginRight: 10 }}
          onClick={this.props.export}
        />
        {hasEditRights && (
          <RaisedButton
            label={formatMessage({ id: 'list.table-manager.import' })}
            containerElement="label"
            primary={true}
            icon={<ImportIcon />}
            style={{ float: 'right', marginRight: 10 }}
          >
            <input
              style={{ display: 'none' }}
              type="file"
              accept=".xls,.xlsx"
              onChange={this.handleImportChange}
            />
          </RaisedButton>
        )}
      </div>
    );
  }
}

TableManager.propTypes = {
  export: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
  onImportChange: PropTypes.func.isRequired,
  hasEditRights: PropTypes.bool,
  modelBasePath: PropTypes.string,
  modelBaseName: PropTypes.string,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(TableManager);
