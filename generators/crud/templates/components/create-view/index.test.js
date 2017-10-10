import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import IconButton from 'material-ui/IconButton';

import CreateView from './index';
import ModelForm from '../model-form';

describe('[Component] CreateView', () => {
  const defaultProps = {
    userHasEditRights: true,
    navigateToList: () => {},
    intl: {
      formatMessage: obj => obj.id,
    },
    createNewEntry: () => {},
    modelKeyIds: [],
    model: {
      name: 'modelMock',
      properties: [],
    },
  };

  const setup = propsOverride => {
    const finalProps = Object.assign(defaultProps, propsOverride);
    const shallowWrapper = shallow(<CreateView {...finalProps} />);
    return {
      shallowWrapper,
    };
  };

  it('should exist', () => {
    const { shallowWrapper } = setup();
    expect(shallowWrapper.exists()).to.be.true; // eslint-disable-line
  });

  it('should return a div if user cannot use form', () => {
    const { shallowWrapper } = setup();
    shallowWrapper.setProps({ userHasEditRights: false });
    expect(shallowWrapper.find(ModelForm).length).to.equal(0);
    expect(shallowWrapper.find(IconButton).length).to.equal(0);
  });

  describe('[UI]', () => {
    it('should render a return to model list button', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.find(IconButton).length).to.equal(1);
    });

    it('should render a h2 tag as a bloc title', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.find('h2').length).to.equal(1);
    });

    it('should render a ModelForm component', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.find(ModelForm).length).to.equal(1);
    });
  });

  describe('[Event]', () => {
    it('should navigate to the list route of a given model when the return button is clicked', () => {
      const routeSpy = sinon.spy();
      const { shallowWrapper } = setup({
        navigateToList: routeSpy,
      });

      shallowWrapper.find(IconButton).simulate('click');
      expect(routeSpy.calledWith()).to.be.true; // eslint-disable-line
    });
  });
});
