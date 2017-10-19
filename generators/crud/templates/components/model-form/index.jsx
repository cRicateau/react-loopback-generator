import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { TextField } from 'redux-form-material-ui';
import RaisedButton from 'material-ui/RaisedButton';
import { map } from 'lodash';

import styles from './styles.css';
import { formErrorSelector } from './selector';

export class GenericModelForm extends Component {
  required = value => {
    const errorMessage = this.props.intl.formatMessage({ id: 'form.required' });
    return value ? undefined : errorMessage;
  };

  render() {
    /*
      redux-form injects handleSubmit into the form and relays
      a values object back to the parent's onSubmit function
    */
    const {
      handleSubmit,
      modelProperties,
      modelKeyIds,
      disableModelKeyId,
    } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <form onSubmit={handleSubmit}>
        {map(Object.keys(modelProperties), propertyName => {
          const property = modelProperties[propertyName];
          const validate = property.required ? [this.required] : null;
          let disabled = false;
          if (modelKeyIds.includes(propertyName) && disableModelKeyId) {
            disabled = true;
          }
          switch (property.type.toLowerCase()) {
            case 'string':
              return (
                <div key={propertyName} className={styles.textField}>
                  <label htmlFor={propertyName} className={styles.label}>
                    {propertyName}
                  </label>
                  <Field
                    name={propertyName}
                    component={TextField}
                    type="text"
                    validate={validate}
                    disabled={disabled}
                  />
                </div>
              );
            case 'number':
              return (
                <div key={propertyName} className={styles.textField}>
                  <label htmlFor={propertyName} className={styles.label}>
                    {propertyName}
                  </label>
                  <Field
                    name={propertyName}
                    component={TextField}
                    type="number"
                    validate={validate}
                    disabled={disabled}
                  />
                </div>
              );
            default:
              return <p>{formatMessage({ id: 'form.no_field' })}</p>;
          }
        })}
        <RaisedButton
          type="submit"
          label={formatMessage({ id: 'form.createSubmit' })}
          backgroundColor="#FFFFFF"
          disabledBackgroundColor="#EEEEEE"
        />
      </form>
    );
  }
}

GenericModelForm.propTypes = {
  modelProperties: PropTypes.object.isRequired, // eslint-disable-line
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  formErrorList: PropTypes.object, // eslint-disable-line
  modelKeyIds: PropTypes.arrayOf(PropTypes.string),
  disableModelKeyId: PropTypes.bool,
};

const mapStateToProps = state => ({
  formErrorList: formErrorSelector(state),
});

const TranslatedGenericModelForm = injectIntl(GenericModelForm);
const ReduxFormGeneralCreateForm = reduxForm({ form: 'model_form' })(
  TranslatedGenericModelForm,
);
export default connect(mapStateToProps)(ReduxFormGeneralCreateForm);
