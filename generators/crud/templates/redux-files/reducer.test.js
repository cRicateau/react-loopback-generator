import cst from '../../constants/models/<%= constantFileName %>.json';
import reducer from './<%= reducerFileName %>.js';

describe('[Reducers] <%= reducerFileName %>', () => {
  it('should set the default state', () => {
    const newState = reducer(undefined, { type: 'test' });
    expect(newState).toEqual({
      loading: false,
      error: null,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
      count: 0,
      countLoading: false,
    });
  });

  it('should set "loading: true" and "error: null"', () => {
    const newState = reducer(undefined, { type: cst.FIND_REQUEST });
    expect(newState).toEqual({
      loading: true,
      error: null,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
      count: 0,
      countLoading: false,
    });
  });

  it('should set "loading: false" and "error: null and isLoaded: true"', () => {
    const newState = reducer(undefined, { type: cst.FIND_SUCCESS });
    expect(newState).toEqual({
      loading: false,
      error: null,
      list: undefined,
      errorPopinIsOpen: false,
      errorImportList: [],
      count: 0,
      countLoading: false,
    });
  });

  it('should set "loading: false" and "error"', () => {
    const newState = reducer(undefined, { type: cst.FIND_ERROR });
    expect(newState).toEqual({
      loading: false,
      error: undefined,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
      count: 0,
      countLoading: false,
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

  it('should set "loading: true"', () => {
    const action = { type: cst.LOADING_ON };
    const expectedState = {
      loading: true,
      error: null,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
      count: 0,
      countLoading: false,
    };
    expect(reducer(undefined, action)).toEqual(expectedState);
  });

  it('should set "loading: false"', () => {
    const action = { type: cst.LOADING_OFF };
    const expectedState = {
      loading: false,
      error: null,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
      count: 0,
      countLoading: false,
    };
    expect(reducer(undefined, action)).toEqual(expectedState);
  });

  it('should set "errorPopinIsOpen: true" and errorImportList', () => {
    const message = [];
    const action = { type: cst.ERROR_POPIN, payload: message };
    const expectedState = {
      loading: false,
      error: null,
      list: [],
      errorPopinIsOpen: true,
      errorImportList: action.payload.message,
      count: 0,
      countLoading: false,
    };
    expect(reducer(undefined, action)).toEqual(expectedState);
  });

  it('shoud set "errorPopinIsOpen: false', () => {
    const action = { type: cst.CANCEL_ERROR_POPIN };
    const expectedState = {
      loading: false,
      error: null,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
      count: 0,
      countLoading: false,
    };
    expect(reducer(undefined, action)).toEqual(expectedState);
  });

  it('should set "countLoading: true"', () => {
    const action = { type: cst.COUNT_REQUEST };
    const expectedState = {
      loading: false,
      error: null,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
      count: 0,
      countLoading: true,
    };
    expect(reducer(undefined, action)).toEqual(expectedState);
  });

  it('should set "countLoading: false" and count', () => {
    const count = 10;
    const action = { type: cst.COUNT_SUCCESS, count };
    const expectedState = {
      loading: false,
      error: null,
      list: [],
      errorPopinIsOpen: false,
      errorImportList: [],
      count,
      countLoading: false,
    };
    expect(reducer(undefined, action)).toEqual(expectedState);
  });
});
