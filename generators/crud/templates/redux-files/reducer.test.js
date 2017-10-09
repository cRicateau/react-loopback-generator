import expect from 'expect';
import cst from '../../constants/models/<%= constantFileName %>.json';
import reducer from './<%= reducerFileName %>.js';

describe('[Reducer] <%= reducerFileName %> Reducer', () => {
  it('should set the default state', () => {
    const newState = reducer(undefined, { type: 'test' });
    expect(newState).toEqual({
      loading: false,
      isLoaded: false,
      error: null,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
    });
  });

  it('should set "loading: true" and "error: null"', () => {
    const newState = reducer(undefined, { type: cst.FIND_REQUEST });
    expect(newState).toEqual({
      loading: true,
      isLoaded: false,
      error: null,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
    });
  });

  it('should set "loading: false" and "error: null and isLoaded: true"', () => {
    const newState = reducer(undefined, { type: cst.FIND_SUCCESS });
    expect(newState).toEqual({
      loading: false,
      isLoaded: true,
      error: null,
      list: undefined,
      errorPopinIsOpen: false,
      errorImportList: [],
    });
  });

  it('should set "loading: false" and "error"', () => {
    const newState = reducer(undefined, { type: cst.FIND_ERROR });
    expect(newState).toEqual({
      loading: false,
      isLoaded: false,
      error: undefined,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
    });
  });

  it('should remove one item of the list', () => {
    const newState = reducer(
      { list: [{ IDENTIFIER: 1 }, { IDENTIFIER: 2 }] },
      {
        type: cst.DELETE_ELEMENT,
        payload: { id: 1, modelKeyId: 'IDENTIFIER' },
      },
    );
    expect(newState).toEqual({ list: [{ IDENTIFIER: 2 }] });
  });

  it('should remove no item of the list', () => {
    const newState = reducer(
      { list: [{ IDENTIFIER: 1 }, { IDENTIFIER: 2 }] },
      {
        type: cst.DELETE_ELEMENT,
        payload: { id: 3, modelKeyId: 'IDENTIFIER' },
      },
    );
    expect(newState).toEqual({ list: [{ IDENTIFIER: 1 }, { IDENTIFIER: 2 }] });
  });
});
