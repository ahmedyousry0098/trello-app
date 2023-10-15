import joi from 'joi'
import mongoose from 'mongoose'

export const GENERAL_FIELDS = {
    Id: joi.string().custom((value, helper) => {
        return mongoose.Types.ObjectId.isValid(value) ? true : helper.message("In-valid Id")
    }),
    email: joi.string().email({maxDomainSegments:2}).min(10).max(50).messages({
        "any.required": "Email is Required",
        "string.email": "Email Not Valid.."
    }),
    password: joi.string().pattern(new RegExp(/^[A-Za-z0-9@-_$%]{5,30}$/)),
}

export const isValid = (schema={}) => {
    return (req, res, next) => {
        const keys = {...req.body, ...req.params, ...req.query}
        const result = schema.validate(keys, {abortEarly: false})
        let messages = []
        if (result?.error?.details) {
            for (let err of result.error.details) {
                messages.push(err.message)
            }
            return res.status(400).json({message: messages})
        }
        next()
    }
}
