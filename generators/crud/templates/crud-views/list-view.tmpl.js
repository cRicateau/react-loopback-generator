import React, { Component } from "react";
import PropTypes from "prop-types";

import { injectIntl, intlShape } from "react-intl";
import { connect } from "react-redux";
import { map, findKey } from "lodash";
import { push } from "react-router-redux";

import ReactTable from "react-table";
import "react-table/react-table.css";

import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

import TableManager from "../../../../components/crud-view/table-manager";
import TableActionCell from "../../../../components/crud-view/table-action-cell";
import styles from "./styles.css";

import modelActions from "../../../../actions/models/<%= modelName %>";
import model from "../../../../../../server/models/<%= modelName %>.json";

const modelKeyId = findKey(
  model.properties,
  property => property.id !== undefined
);

export class ListView extends Component {
  constructor(props, context) {
    super(props, context);

    const properties = Object.keys(model.properties);
    const modelColumns = map(properties, property => ({
      Header: property,
      accessor: property
    }));
    const customColumns = [
      {
        Header: this.props.intl.formatMessage({ id: "list.header.actions" }),
        accessor: modelKeyId,
        filterable: false,
        sortable: false,
        headerStyle: { boxShadow: "none" },
        style: { textAlign: "center" },
        Cell: row => (
          <TableActionCell
            row={row}
            navigateTo={this.props.navigateTo}
            deleteElement={this.setElementToDelete}
            modelBasePath="<%= modelName %>"
          />
        )
      }
    ];

    this.tableColumns = [...modelColumns, ...customColumns];

    this.state = {
      deletePopinIsOpen: false,
      elementIdToDelete: null
    };
  }

  componentWillMount() {
    this.props.getList();
  }

  setElementToDelete = id => {
    this.setState({
      elementIdToDelete: id,
      deletePopinIsOpen: true
    });
  };

  export = () => {
    this.props.export(this.props.authentication);
  };

  import = uploadEvent => {
    const file = uploadEvent.target.files[0];
    this.props.import(file);
  };

  render() {
    const formatMessage = this.props.intl.formatMessage;
    const actions = [
      <FlatButton
        label={formatMessage({ id: "common.action.confirm" })}
        style={{ color: "red" }}
        onClick={() => {
          this.props.deleteItem(this.state.elementIdToDelete, modelKeyId);
          this.setState({ deletePopinIsOpen: false, elementIdToDelete: null });
        }}
      />,
      <FlatButton
        label={formatMessage({ id: "common.action.cancel" })}
        onClick={() => {
          this.setState({ deletePopinIsOpen: false, elementIdToDelete: null });
        }}
      />
    ];

    return (
      <div className={styles.container}>
        <TableManager
          navigateTo={this.props.navigateTo}
          export={this.export}
          onImportChange={this.import}
          modelBasePath="<%= modelTitleName %>"
        />
        <ReactTable
          className={`${styles.table} -highlight -striped`}
          data={this.props.data}
          columns={this.tableColumns}
          filterable
          loading={this.props.loading}
          defaultPageSize={15}
          pageSizeOptions={[5, 15, 25, 50, 100]}
          previousText={formatMessage({ id: "list.previous" })}
          nextText={formatMessage({ id: "list.next" })}
          loadingText={formatMessage({ id: "list.loading" })}
          noDataText={formatMessage({ id: "list.no_data" })}
          pageText={formatMessage({ id: "list.page" })}
          ofText={formatMessage({ id: "list.of" })}
          rowsText={formatMessage({ id: "list.rows" })}
          getTrProps={() => ({ style: { height: "35px" } })}
        />
        <Dialog
          title={formatMessage({ id: "list.delete_popin.title" })}
          actions={actions}
          modal={true}
          open={this.state.deletePopinIsOpen}
        >
          {formatMessage({ id: "list.delete_popin.warning_text" })}
        </Dialog>
      </div>
    );
  }
}

ListView.propTypes = {
  data: PropTypes.array, // eslint-disable-line
  authentication: PropTypes.object, // eslint-disable-line
  intl: intlShape.isRequired,
  loading: PropTypes.bool.isRequired,
  navigateTo: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  export: PropTypes.func.isRequired,
  import: PropTypes.func.isRequired,
  getList: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  authentication: state.authentication,
  data: state.models["<%= modelName %>"].list,
  loading: state.models["<%= modelName %>"].loading
});

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
  navigateTo: path => {
    dispatch(push(path));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(ListView)
);
