
export const generalMsgs = Object.freeze({
    SERVER_ERROR: 'SomeThing Went Wrong Please Try Again',
    INVALID_TOKEN: 'Please Provide Valid Authorization Key',
    CANNOT_ACCESS: 'Cannot Access Other User\'s Profile',
    NOT_FOUND: "Not Found",
})

export class ResponseError extends Error {
    constructor (message, code) {
        super(message)
        this.code = code
    }
}

export const asyncHandler = (API) => {
    return (req, res, next) => {
        API(req, res, next).catch(error => (
            next(error)
        ))
    }
}

export const globalErrorHandling = (err, req, res, next) => {
    if (err) {
        return process.env.MODE === 'dev' 
            ? res.status(err.code || 500).json({message: err.message, stack: err.stack})
            : res.status(err.code || 500).json({message: err.message})
    }
}