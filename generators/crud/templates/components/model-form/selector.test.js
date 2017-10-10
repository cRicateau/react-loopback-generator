import expect from 'expect';

import { formErrorSelector } from './selector';

describe('[Selector]', () => {
  it('should return the syncErrors list', () => {
    const state = {
      form: {
        model_create: {
          syncErrors: {
            error: 'error',
          },
        },
      },
    };
    const formErrorList = formErrorSelector(state);
    expect(formErrorList).toEqual({ error: 'error' });
  });

  it('should return an empty object if no form', () => {
    const state = {};
    const formErrorList = formErrorSelector(state);
    expect(formErrorList).toEqual({});
  });

  it('should return an empty object if no form model_create', () => {
    const state = {
      form: {},
    };
    const formErrorList = formErrorSelector(state);
    expect(formErrorList).toEqual({});
  });
});
