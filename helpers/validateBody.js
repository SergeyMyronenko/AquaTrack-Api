import HttpError from "./HttpError.js";

const validateBody = (schema) => {
  const func = (req, _, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(HttpError(400, error.message));
    }
    next();
  };

  return func;
};

export default validateBody;

export const joiValidateDataMiddleware = (JoiSchema) => {
  return (req, res, next) => {
    let schema;
    if (typeof JoiSchema === "function") {
      schema = JoiSchema();
    } else {
      schema = JoiSchema;
    }

    const { error } = schema.validate(req.body);
    if (error)
      throw new HttpError(400, `Joi validator: ${error.details[0].message}`);
    next();
  };
};
