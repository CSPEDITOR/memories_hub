/**
 * Wraps async route handlers so Express catches rejected promises.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
