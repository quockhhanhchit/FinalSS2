function formatZodErrors(error) {
  const fieldErrors = {};

  for (const issue of error.issues || []) {
    const key = issue.path.join(".") || "root";

    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: formatZodErrors(result.error),
      });
    }

    req.body = result.data;
    next();
  };
}

module.exports = {
  validateBody,
};
