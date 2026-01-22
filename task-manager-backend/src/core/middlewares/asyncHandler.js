export default function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage in controllers => Example: router.post('/', asyncHandler(async (req, res) => { ... }))