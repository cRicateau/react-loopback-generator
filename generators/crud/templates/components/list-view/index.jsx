import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { map, debounce } from 'lodash';

import ReactTable from 'react-table';
import 'react-table/react-table.css';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import TableManager from '../table-manager';
import TableActionCell from '../table-action-cell';
import styles from './styles.css';

export default class ListView extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      deletePopinIsOpen: false,
      elementIdToDelete: null,
      pageSize: -1,
    };

    const properties = Object.keys(this.props.model.properties);
    const modelColumns = map(properties, property => ({
      Header: property,
      accessor: property,
    }));
    let customColumns = [
      {
        Header: props.intl.formatMessage({ id: 'list.header.actions' }),
        accessor: props.modelKeyId,
        Cell: row => (
          <TableActionCell
            row={row}
            navigateTo={props.navigateTo}
            deleteElement={this.setElementToDelete}
            modelBasePath={props.routeName}
          />
        ),
      },
    ];

    if (!this.props.userHasEditRights) {
      customColumns = [];
    }

    this.tableColumns = [...modelColumns, ...customColumns];

  }

  setElementToDelete = id => {
    this.setState({
      elementIdToDelete: id,
      deletePopinIsOpen: true,
    });
  };

  export = () => {
    this.props.export(this.props.authentication);
  };

  import = uploadEvent => {
    const file = uploadEvent.target.files[0];
    this.props.import(file);
  };

  handleCloseErrorPopin = () => {
    this.props.cancelErrorPopin();
  }

  fetchData = reactTableState => {
    const { sorted, filtered } = reactTableState;
    let params = {
      'filter[limit]': reactTableState.pageSize,
      'filter[skip]': reactTableState.page * reactTableState.pageSize,
    };

    let propertyName, order, customSort, value, customFilter;

    if (sorted.length !== 0) {
      reactTableState.sorted.forEach((filter, index) => {
        propertyName = filter.id;
        order = filter.desc ? 'DESC' : 'ASC';
        customSort = `${propertyName} ${order}`;
        params = { ...params, [`filter[order][${index}]`]: customSort };
      });
    }

    if (filtered.length !== 0) {
      reactTableState.filtered.forEach(filter => {
        propertyName = filter.id;
        value = filter.value;
        params = {
          ...params,
          [`filter[where][${propertyName}][regexp]`]: `/${value}.?/`,
        };
        customFilter = {
          [`where[${propertyName}][regexp]`]: `/${value}.?/`,
        };
      });
    }

    this.props.getList(params);
    this.props.count(customFilter || '');
    this.setState({
      pageSize: reactTableState.pageSize,
    });
  };

  render() {
    const pages = Math.ceil(this.props.dataCount / this.state.pageSize);
    const formatMessage = this.props.intl.formatMessage;
    const actions = [
      <FlatButton
        label={formatMessage({ id: 'common.action.confirm' })}
        style={{ color: 'red' }}
        onClick={() => {
          this.props.deleteItem(
            this.state.elementIdToDelete,
            this.props.modelKeyId,
          );
          this.setState({ deletePopinIsOpen: false, elementIdToDelete: null });
        }}
      />,
      <FlatButton
        label={formatMessage({ id: 'common.action.cancel' })}
        onClick={() => {
          this.setState({ deletePopinIsOpen: false, elementIdToDelete: null });
        }}
      />,
    ];

    const errorPopinActions = [
      <FlatButton
        label={formatMessage({ id: 'common.action.ok' })}
        onClick={this.handleCloseErrorPopin}
        keyboardFocused={true}
      />,
    ];

    const listOfErrorForPopinDisplay = function(ErrorArray) {
      return ErrorArray.map(el => (
        <li key={el.id}>
          {formatMessage({ id: 'error.import.type' })} {el.type}
          {formatMessage({ id: 'error.import.line' })} {el.line}
        </li>
      ));
    };

    return (
      <div className={styles.container}>
        <TableManager
          navigateTo={this.props.navigateTo}
          export={this.export}
          onImportChange={this.import}
          modelBasePath={this.props.routeName}
          hasEditRights={this.props.userHasEditRights}
          modelBaseName={this.props.modelName}
        />
        <ReactTable
          className={`${styles.table} -highlight -striped`}
          data={this.props.data}
          pages={pages}
          loading={this.props.loading}
          manual
          onFetchData={debounce(this.fetchData, 300)}
          columns={this.tableColumns}
          filterable
          defaultPageSize={15}
          pageSizeOptions={[5, 15, 25, 50, 100]}
          previousText={formatMessage({ id: 'list.previous' })}
          nextText={formatMessage({ id: 'list.next' })}
          loadingText={formatMessage({ id: 'list.loading' })}
          noDataText={formatMessage({ id: 'list.no_data' })}
          pageText={formatMessage({ id: 'list.page' })}
          ofText={formatMessage({ id: 'list.of' })}
          rowsText={formatMessage({ id: 'list.rows' })}
          getTrProps={() => ({ style: { height: '35px' } })}
        />
        <Dialog
          title={formatMessage({ id: 'list.delete_popin.title' })}
          actions={actions}
          modal={true}
          open={this.state.deletePopinIsOpen}
        >
          {formatMessage({ id: 'list.delete_popin.warning_text' })}
        </Dialog>
        <Dialog
          title={formatMessage({ id: 'list.error_popin.title' })}
          actions={errorPopinActions}
          modal={false}
          onRequestClose={this.handleCloseErrorPopin}
          open={this.props.errorPopinIsOpen}
          autoScrollBodyContent={true}
        >
          <b>{formatMessage({ id: 'list.error_popin.text' })}</b>
          {listOfErrorForPopinDisplay(this.props.errorImportList)}
        </Dialog>
      </div>
    );
  }
}

ListView.propTypes = {
  data: PropTypes.array, // eslint-disable-line
  authentication: PropTypes.object, // eslint-disable-line
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  errorPopinIsOpen: PropTypes.bool.isRequired,
  errorImportList: PropTypes.array.isRequired, // eslint-disable-line
  navigateTo: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  cancelErrorPopin: PropTypes.func.isRequired,
  export: PropTypes.func.isRequired,
  import: PropTypes.func.isRequired,
  getList: PropTypes.func.isRequired,
  count: PropTypes.func.isRequired,
  dataCount: PropTypes.number.isRequired,
  model: PropTypes.object, // eslint-disable-line
  modelKeyId: PropTypes.string,
  routeName: PropTypes.string.isRequired,
  modelName: PropTypes.string.isRequired,
  userPerimeters: PropTypes.arrayOf(PropTypes.string),
};
