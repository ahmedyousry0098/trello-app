import {UserModel} from '../../../db/models/user.model.js'
import jwt from 'jsonwebtoken'
import {sendEmail} from '../../utils/sendEmail.js'
import {confirmEmailTamp} from '../../utils/templates/confirmEmail.js'
import { ResponseError } from '../../utils/ErrorHandling.js'
import { resetPasswordTemp } from '../../utils/templates/resetPasswordEmail.js'
import {customAlphabet} from 'nanoid'
import {OAuth2Client} from 'google-auth-library'

export const register = async (req, res, next) => {
    const {email} = req.body
    if (await UserModel.findOne({email})) {
        return next(new ResponseError('Email Already Exist', 409))
    }
    const user = new UserModel({...req.body, email: email.toLowerCase()})
    const token = jwt.sign(
        {
            id: user._id, 
            email: user.email, 
            role: user.role
        }, 
        process.env.TOKEN_SIGNATURE, 
        {expiresIn: 60*60*24}
    )
    const confirmationLink = `${req.protocol}://${req.headers.host}/${token}/confirm-email`
    const emailInfo = await sendEmail({
        to: user.email, 
        subject: 'Confirm Your Email', 
        html: confirmEmailTamp({userName: user.username, confirmationLink})
    })
    if (!emailInfo.accepted.length) {
        return next(new ResponseError('Cannot Send Email', 503))
    }
    const savedUser = await user.save()
    if (!savedUser) {
        return next(new ResponseError(`something went wrong please try again`, 500))
    }
    return res.status(201).json({message: 'Success, please check your email to confirm your account!'})
}

export const continueWithGoogle = async (req, res, next) => {
    const {credintial} = req.body
    const client = new OAuth2Client(process.env.G_CLIENT_ID);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: credintial,
            audience: process.env.G_CLIENT_ID,
        });
        const payload = ticket.getPayload()
        return payload
    }
    const {email_verified, email, name} = await verify()
    if (!email_verified) {
        return next(new ResponseError('Google Email is Not Verified', 400))
    }
    const user = await UserModel.findOne({email})
    if (user && !user.isDeleted) {
        if (!user.isConfirmed) {
            await UserModel.findOneAndUpdate({email}, {isConfirmed: true})
        }
        const token = jwt.sign(
            {
                id: user._id, 
                email: user.email,
                role: user.id
            }, 
            process.env.TOKEN_SIGNATURE, 
            {expiresIn: 60*60*24}
        )
        return res.status(200).json({message: 'Logged In Successfully', token})
    }
    const newPass = customAlphabet('abcdefghijklmnopqrstuvwxyz123456789!@#$%^&')

    const newUser = await UserModel.create({
        email,
        username: name,
        password: newPass(),
        isConfirmed: true,
        role: "employee",
        isLoggedIn: true,
        isDeleted: false
    })
    if (!newUser) return next(new ResponseError('Something went wrong please try again'))
    const token = jwt.sign(
        {
            id: newUser._id, 
            email: newUser.email,
            role: newUser.id
        }, 
        process.env.TOKEN_SIGNATURE, 
        {expiresIn: 60*60*24}
    )
    return res.status(200).json({message: 'Account Created & logged In Successfully', token})
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
        const token = jwt.sign(
            {
                id: user._id, 
                email: user.email,
                role: user.id
            }, 
            process.env.TOKEN_SIGNATURE, 
            {expiresIn: 60*60*24}
        )
        const confirmationLink = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/${token}/confirm-email`
        const emailInfo = await sendEmail({
            to: user.email, 
            subject: 'Confirm Your Email', 
            html: confirmEmailTamp({userName: user.username, confirmationLink})
        })
        if (!emailInfo.accepted.length) {
            return next(new ResponseError('Email isn\'t confirmed and Cannot Send Email', 503))
        }
        return next(new ResponseError('sorry account is not verified, Please check your mail and confirm your account first', 403))
    }
    const logIn = await UserModel.findByIdAndUpdate(user._id, {isLoggedIn: true})
    if (!logIn) return next(new ResponseError('something went wrong please try again', 500))
    const token = jwt.sign(
        {
            id: user._id, 
            email: user.email,
            role: user.id
        }, 
        process.env.TOKEN_SIGNATURE, 
        {expiresIn: 60*60*24}
    )
    return res.status(201).json({message: 'Logged In Successfully', token})
}

export const forgetPassword = async (req, res, next) => {
    const {email} = req.body;
    const user = await UserModel.findOne({email})
    if (!user) return next(new ResponseError('User Not Found', 400))
    const genVerificationCode = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 5)
    const verificationCode = genVerificationCode()
    await UserModel.findOneAndUpdate({email}, {verificationCode})
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
    const user = await UserModel.findOne({email})
    if (!user) return next(new ResponseError('user not found', 404))
    if (user.verificationCode != code) {
        return next(new ResponseError('invalid verification code, Please try to send forget password req again', 400))
    }
    user.password = password
    user.verificationCode = undefined
    if (!await user.save()) return next(new ResponseError('something went wrong please try again', 500))
    return res.status(202).json({message: 'Password Changed Successfully'})
}