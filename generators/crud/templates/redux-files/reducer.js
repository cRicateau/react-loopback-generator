import cst from '../../constants/models/<%= constantFileName %>.json';

const initialState = {
  loading: false,
  error: null,
  list: [],
  errorPopinIsOpen: false,
  errorImportList: [],
  count: 0,
  countLoading: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case cst.FIND_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case cst.FIND_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        list: action.payload,
      };
    case cst.FIND_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case cst.DELETE_ELEMENT:
      return {
        ...state,
        list: state.list.filter(
          el => el[action.payload.modelKeyId] !== action.payload.id,
        ),
      };
    case cst.ERROR_POPIN:
      return {
        ...state,
        errorPopinIsOpen: true,
        errorImportList: action.payload.message,
      };
    case cst.CANCEL_ERROR_POPIN:
      return {
        ...state,
        errorPopinIsOpen: false,
      };
    case cst.LOADING_ON:
      return {
        ...state,
        loading: true,
      };
    case cst.LOADING_OFF:
      return {
        ...state,
        loading: false,
      };
    case cst.COUNT_REQUEST:
      return {
        ...state,
        countLoading: true,
      };
    case cst.COUNT_SUCCESS:
      return {
        ...state,
        count: action.count,
        countLoading: false,
      };
    default:
      return state;
  }
}
