import { ResponseError, asyncHandler } from "../utils/ErrorHandling.js";

export const isLeader = asyncHandler(async (req, res, next) => {
    const {role} = req.user
    if (role !== 'team-leader') {
        return next(new ResponseError('Sorry, You don\'t have permission'))
    }
    next()
})