export const createSourceCorrectionDto = (overrides = {}) => ({
  patch: {},
  actor: 1,
  note: "",
  ...overrides
});
