import Joi from "joi";

export const validateTask = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    dueDate: Joi.date().required(),
    priority: Joi.string().valid("low", "medium", "high"),
    recurrence: Joi.object({
      type: Joi.string().valid("none", "daily", "weekly", "monthly"),
      endDate: Joi.date(),
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};
