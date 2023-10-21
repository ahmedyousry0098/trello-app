import { UserModel } from "../../../db/models/user.model.js"
import { ResponseError } from "../../utils/ErrorHandling.js"

export const updateProfile = async (req, res, next) => {
    const {profileId} = req.params
    const {id} = req.user
    const profile = await UserModel.findById(profileId)
    if (!profile) return next(new ResponseError('In-valid profile Id', 404))
    if (profile.isDeleted) return next(new ResponseError('Profile has been deleted', 404))
    if (profile._id.toString() != id.toString()) {
        return next(new ResponseError('Cannot update other user profile', 400))
    }
    const updatedProfile = await UserModel.updateOne({_id: id}, req.body)
    if (!updatedProfile.modifiedCount) {
        return next(new ResponseError('Something went wrong please try again', 500))
    }
    return res.status(200).json({message: 'updated Successfully'})
}

export const deleteProfile = async (req, res, next) => {
    const {profileId} = req.params
    const {id} = req.user
    const profile = await UserModel.findById(profileId)
    if (!profile) return next(new ResponseError('In-valid profile Id', 404))
    if (profile.isDeleted) return next(new ResponseError('Profile has been deleted', 404))
    if (profileId.toString() != id.toString()) {
        return next(new ResponseError('Cannot update other user profile', 400))
    }
    const deletedProfile = await UserModel.updateOne({_id: id}, {isDeleted: true})
    if (!deletedProfile.modifiedCount) {
        return next(new ResponseError('Something went wrong please try again', 500))
    }
    return res.status(200).json({message: 'profile deleted Successfully'})
}

export const PermanentDeletion = async (req, res, next) => {
    const {profileId} = req.params
    const {id} = req.user
    const profile = await UserModel.findById(profileId)
    if (!profile) return next(new ResponseError('In-valid profile Id', 404))
    if (profileId.toString() != id.toString()) {
        return next(new ResponseError('Cannot delete other user profile', 400))
    }
    const deletedProfile = await UserModel.deleteOne({_id: id})
    if (!deletedProfile.deletedCount) {
        return next(new ResponseError('Something went wrong please try again', 500))
    }
    return res.status(200).json({message: 'profile deleted Successfully'})
}

export const logOut = async (req, res, next) => {
    const {profileId} = req.params
    const {id} = req.user
    const profile = await UserModel.findById(profileId)
    if (!profile) return next(new ResponseError('In-valid profile Id', 404))
    if (profile.isDeleted) return next(new ResponseError('Profile has been deleted', 404))
    if (profileId.toString() != id.toString()) {
        return next(new ResponseError('Cannot access other user profile', 400))
    }
    if (!profile.isLoggedIn) return next(new ResponseError('already logged out', 400))
    const loggedOut = await UserModel.updateOne({_id: id}, {isLoggedIn: false})
    if (!loggedOut.modifiedCount) {
        return next(new ResponseError('Something went wrong please try again', 500))
    }
    return res.status(200).json({message: 'logged out successfully'})
}

export const whoAmI = async (req, res, next) => {
    const {id} = req.user
    const user = await UserModel.findById(id).select('-password')
    return res.status(200).json({message: 'done', user})
}

export const getAllUsers = async (req, res, next) => {
    const users = await UserModel.find().select('-password')
    if (!users) {
        return next(new ResponseError('something went wrong'))
    }
    if (!users.length) {
        return next(new ResponseError('No users Found', 404))
    }
    return res.status(200).json({message: "done", users})
}