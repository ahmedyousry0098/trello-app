import joi from 'joi'
import { GENERAL_FIELDS } from '../../middlewares/validation.js'

export const registerSchema = joi.object({
    email: GENERAL_FIELDS.email.required(),
    password: GENERAL_FIELDS.password.required().messages({
        "any.required": "Password is Required",
        "string.pattern.base": "Minimum five characters, at least one letter and one number"
    }),
    username: joi.string().required(),
    phone: joi.string().regex(/^(002)?(01)[0125][0-9]{8}$/),
    age: joi.number().positive().min(8).max(80),
    gender: joi.string().valid('male', 'female'),
    role: joi.string().valid('employee', 'team-leader'),
}).required()

export const loginSchema = joi.object({
    email: GENERAL_FIELDS.email.required(),
    password: GENERAL_FIELDS.password.required().messages({
        "any.required": "Password is Required",
        "string.pattern.base": "In-valid Password"
    })
}).required()

export const confirmAccSchema = joi.object({
    token: joi.string().required()
}).required()

export const forgetPasswordSchema = joi.object({
    email: GENERAL_FIELDS.email.required()
}).required()

export const resetPasswordSchema = joi.object({
    email: GENERAL_FIELDS.email.required(),
    code: joi.string().length(5).required().messages({
        "any.required": "Code is Required",
        "string.base": "In-valid Code",
        "string.length": "In-valid Verification Code"
    }),
    password: GENERAL_FIELDS.password.required().messages({
        "any.required": "Password is Required",
        "string.pattern.base": "In-valid Password"
    })
}).required()

