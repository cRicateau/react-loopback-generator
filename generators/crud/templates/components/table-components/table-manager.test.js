import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import RaisedButton from 'material-ui/RaisedButton';

import { TableManager } from './table-manager';

describe('[Component] TableManager', () => {
  const defaultProps = {
    navigateTo: () => {},
    modelBasePath: '/model-route-path',
    onImportChange: () => {},
    intl: {
      formatMessage: () => {},
    },
    export: () => {},
    hasEditRights: true,
  };

  const setup = propsOverride => {
    const finalProps = Object.assign(defaultProps, propsOverride);
    const shallowWrapper = shallow(<TableManager {...finalProps} />);
    return {
      shallowWrapper,
    };
  };

  it('should exist', () => {
    const { shallowWrapper } = setup();
    expect(shallowWrapper.exists()).to.be.true; // eslint-disable-line
  });

  describe('[UI]', () => {
    it('should render three buttons for entity creation, export and import', () => {
      const { shallowWrapper } = setup();
      expect(shallowWrapper.find(RaisedButton).length).to.equal(3);
    });
  });

  describe('[Event]', () => {
    it('should navigate to the create route of a given model when the create button is clicked', () => {
      const routeSpy = sinon.spy();
      const { shallowWrapper } = setup({
        navigateTo: routeSpy,
        modelBasePath: '/bce-data',
      });

      shallowWrapper
        .find(RaisedButton)
        .at(0)
        .simulate('click');
      expect(routeSpy.calledWith("/bce-data/create")).to.be.true; // eslint-disable-line
    });

    it('should call the export props when the export button is clicked', () => {
      const exportSpy = sinon.spy();
      const { shallowWrapper } = setup({
        export: exportSpy,
        modelBasePath: '/bce-data',
      });

      shallowWrapper
        .find(RaisedButton)
        .at(1)
        .simulate('click');
      expect(exportSpy.calledWith()).to.be.true; // eslint-disable-line
    });
  });
});
