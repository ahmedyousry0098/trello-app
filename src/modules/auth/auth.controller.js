import {UserModel} from '../../../db/models/user.model.js'
import jwt from 'jsonwebtoken'
import {sendEmail} from '../../utils/sendEmail.js'
import {confirmEmailTamp} from '../../utils/templates/confirmEmail.js'
import { ResponseError } from '../../utils/ErrorHandling.js'
import { resetPasswordTemp } from '../../utils/templates/resetPasswordEmail.js'

export const register = async (req, res, next) => {
    const {email} = req.body
    if (await UserModel.findOne({email})) {
        return next(new ResponseError('Email Already Exist', 409))
    }
    const user = new UserModel({...req.body, email: email.toLowerCase()})
    const savedUser = await user.save()
    if (!savedUser) {
        return next(new ResponseError(`something went wrong please try again`, 500))
    }
    const token = jwt.sign({id: user._id, email: user.email}, process.env.TOKEN_SIGNATURE, {expiresIn: 60*60*24})
    const confirmationLink = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/${token}/confirm-email`
    const emailInfo = await sendEmail({
        to: user.email, 
        subject: 'Confirm Your Email', 
        html: confirmEmailTamp({userName: user.username, confirmationLink})
    })
    if (!emailInfo.accepted.length) {
        return next(new ResponseError('Cannot Send Email', 503))
    }
    return res.status(201).json({message: 'Success, please check your email to confirm your account!'})
}

export const confirmEmail = async (req, res, next) => {
    const {token} = req.params
    const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
    if (!decoded || !decoded?.id) return next(new ResponseError('Wrong Authorization Key', 400))
    const confirmUser = await UserModel.findByIdAndUpdate(decoded.id, {isConfirmed: true}, {new: true})
    if (!confirmUser) return next(new ResponseError(`something went wrong please try again`, 500))
    return res.status(202).json({message: 'email confirmed successfully'})
}

export const logIn = async (req, res, next) => {
    const {email, password} = req.body
    const user = await UserModel.findOne({email})
    if (!user) {
        return next(new ResponseError('In-valid Login Informations', 400))
    }
    if (!user.isPasswordMatch(password)) {
        return next(new ResponseError('In-valid Login Informations', 400))
    }
    if (user.isDeleted) {
        return next(new ResponseError('Account has been deleted, try to sign up again', 401))
    }
    if (!user.isConfirmed) {
        const token = jwt.sign({id: user._id, email: user.email}, process.env.TOKEN_SIGNATURE, {expiresIn: 60*60*24})
        const confirmationLink = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/${token}/confirm-email`
        const emailInfo = await sendEmail({
            to: user.email, 
            subject: 'Confirm Your Email', 
            html: confirmEmailTamp({userName: user.username, confirmationLink})
        })
        if (!emailInfo.accepted.length) {
            return next(new ResponseError('Email isn\'t confirmed and Cannot Send Email', 503))
        }
        return next(new ResponseError('Please check your mail and confirm your account', 403))
    }
    const logIn = await UserModel.findByIdAndUpdate(user._id, {isLoggedIn: true})
    if (!logIn) return next(new ResponseError('something went wrong please try again', 500))
    const token = jwt.sign({id: user._id, email: user.email}, process.env.TOKEN_SIGNATURE, {expiresIn: 60*60*24*100})
    return res.status(200).json({message: 'Logged In Successfully', token, id: logIn._id})
}

export const forgetPassword = async (req, res, next) => {
    const {email} = req.body;
    const user = await UserModel.findOne({email})
    if (!user) return next(new ResponseError('User Not Found', 400))
    const verificationCode = nanoid(4)
    user.verificationCode = verificationCode
    if (!await user.save()) return next(new ResponseError('something went wrong please try again', 500))
    const emailInfo = await sendEmail({
        to: email, 
        subject: 'verification Code',
        html: resetPasswordTemp({verificationCode})
    })
    if (!emailInfo.accepted.length) return next(new ResponseError('Cannot Send Email', 503))
    return res.status(200).json({message: 'Check Out your email and use verification code to reset your password'})
}

export const resetPassword = async (req, res, next) => {
    const {email, code, password} = req.body
    const user = await UserModel.findOne({verificationCode: code, email})
    if (!user) return next(new ResponseError('user not found', 404))
    user.password = password
    user.verificationCode = undefined
    if (!await user.save()) return next(new ResponseError('something went wrong please try again', 500))
    return res.status(202).json({message: 'Password Changed Successfully'})
}