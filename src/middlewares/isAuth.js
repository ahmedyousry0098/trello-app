import {UserModel} from '../../db/models/user.model.js'
import jwt from 'jsonwebtoken'
import { ResponseError, generalMsgs, asyncHandler } from '../utils/ErrorHandling.js'

export const isAuthenticated = asyncHandler(async (req, res, next) => {
    const {authorization} = req.headers
    if (!authorization || !authorization.startsWith(process.env.TOKEN_PREFIX)) {
        return next(new ResponseError('in-valid token', 400))
    }
    const token = authorization.replace(process.env.TOKEN_PREFIX, "")
    const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
    if (!decoded || !decoded.id) {
        return next(new ResponseError(generalMsgs.INVALID_TOKEN, 400))
    }
    const user = await UserModel.findById(decoded.id).select("-password")
    if (!user) (next(new ResponseError('User Not Found, Please Try To Sign Up First', 400)))
    req.user = user
    next()
})