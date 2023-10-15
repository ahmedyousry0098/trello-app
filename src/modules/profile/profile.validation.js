import joi from "joi";
import { GENERAL_FIELDS } from "../../middlewares/validation.js";

export const updateProfileSchema = joi.object({
    profileId: GENERAL_FIELDS.Id.required(),
    username: joi.string(),
    phone: joi.string().regex(/^(002)?(01)[0125][0-9]{8}$/),
    age: joi.number().positive().min(8).max(80),
    gender: joi.string().valid('male', 'female')
}).required()

export const deleteProfileSchema = joi.object({
    profileId: GENERAL_FIELDS.Id.required()
}).required()

export const logOutSchema = joi.object({
    profileId: GENERAL_FIELDS.Id.required()
}).required()