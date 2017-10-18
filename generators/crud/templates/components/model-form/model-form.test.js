import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import { Field } from 'redux-form';
import RaisedButton from 'material-ui/RaisedButton';

import { GenericModelForm } from './index';

describe('[Component] GenericModelForm', () => {
  const defaultProps = {
    modelProperties: {
      DATA_FIELD1: {
        id: true,
        type: 'string',
        required: 'true',
      },
      DATA_FIELD2: {
        type: 'string',
        required: 'true',
      },
      DATA_FIELD3: {
        type: 'string',
      },
    },
    modelKeyIds: [],
    handleSubmit: () => {},
    intl: {
      formatMessage: sinon.stub().returns('Obligatoire'),
      formatDate: () => {},
    },
  };

  const setup = propsOverride => {
    const finalProps = Object.assign(defaultProps, propsOverride);
    const shallowWrapper = shallow(<GenericModelForm {...finalProps} />);
    return {
      shallowWrapper,
    };
  };

  it('should exist', () => {
    const { shallowWrapper } = setup();
    expect(shallowWrapper.exists()).to.be.true; // eslint-disable-line
  });

  describe('[UI]', () => {
    it('should render a form', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.find('form').length).to.equal(1);
    });

    it('should render three fields', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.find(Field).length).to.equal(3);
      expect(
        shallowWrapper
          .find(Field)
          .at(0)
          .prop('name'),
      ).to.equal('DATA_FIELD1');

      expect(
        shallowWrapper
          .find(Field)
          .at(1)
          .prop('name'),
      ).to.equal('DATA_FIELD2');
      expect(
        shallowWrapper
          .find(Field)
          .at(1)
          .prop('validate').length,
      ).to.equal(1);

      expect(
        shallowWrapper
          .find(Field)
          .at(2)
          .prop('name'),
      ).to.equal('DATA_FIELD3');
      expect(
        shallowWrapper
          .find(Field)
          .at(2)
          .prop('validate'),
      ).to.equal(null);
    });

    it('should render a submit button', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.find(RaisedButton).length).to.equal(1);
    });
  });

  describe('[Class method] required', () => {
    it('should return undefined when no value is passed', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.instance().required()).to.equal('Obligatoire');
    });

    it('should return a translated message when a value is passed', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.instance().required('defined value')).to.equal(
        undefined,
      );
    });
  });
});
