import Joi from "joi";
import { GENERAL_FIELDS } from "../../middlewares/validation.js";

export const addTaskSchema = Joi.object({
    title: Joi.string().min(3).max(3000),
    description: Joi.string().min(10).max(10000),
    assignTo: GENERAL_FIELDS.Id.required(),
    deadline: Joi.date(),
}).required()

export const updateTaskSchema = Joi.object({
    taskId: GENERAL_FIELDS.Id.required(),
    title: Joi.string().min(3).max(3000),
    description: Joi.string().min(10).max(10000),
    assignTo: GENERAL_FIELDS.Id,
    deadline: Joi.date(),
}).required()

export const deleteTaskSchema = Joi.object({
    taskId: GENERAL_FIELDS.Id.required(),
}).required()