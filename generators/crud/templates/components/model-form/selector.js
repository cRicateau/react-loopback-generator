export const formErrorSelector = state => {
  if (!state.form || !state.form.model_create) {
    return {};
  }
  return state.form.model_create.syncErrors;
};

export default {
  formErrorSelector,
};
