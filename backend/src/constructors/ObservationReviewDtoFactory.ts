export const createObservationReviewDto = (overrides = {}) => ({
  reviewer_id: 2,
  approved: true,
  review_comment: "换人复核通过，恢复稳定",
  ...overrides
});
