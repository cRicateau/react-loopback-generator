import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

  render() {
    const { formatMessage } = this.props.intl;
    return (
      <div className={style.tableManagerWrapper}>
        <h2>
          {`${formatMessage({ id: 'list.table-manager.title' })} ${this.props
            .modelBasePath}`}
        </h2>
        <RaisedButton
          label={formatMessage({ id: 'list.table-manager.create' })}
          primary={true}
          icon={<ContentAdd />}
          style={{ float: 'right' }}
          onClick={this.navigateToCreationView}
        />
        <RaisedButton
          label={formatMessage({ id: 'list.table-manager.export' })}
          primary={true}
          icon={<ExportIcon />}
          style={{ float: 'right', marginRight: 10 }}
          onClick={this.props.export}
        />
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
            onChange={this.props.onImportChange}
          />
        </RaisedButton>
      </div>
    );
  }
}

TableManager.propTypes = {
  export: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
  onImportChange: PropTypes.func.isRequired,
  modelBasePath: PropTypes.string,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(TableManager);
