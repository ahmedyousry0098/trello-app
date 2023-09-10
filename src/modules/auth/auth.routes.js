import {Router} from 'express'
import { register, confirmEmail, logIn, forgetPassword } from './auth.controller.js'
import { registerSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema, confirmAccSchema } from './auth.validation.js'
import { asyncHandler } from '../../utils/ErrorHandling.js'
import { isValid } from '../../middlewares/validation.js'
import { resetPassword } from './auth.controller.js'

const router = Router()

router.post('/register', isValid(registerSchema), asyncHandler(register))

router.get('/:token/confirm-email', isValid(confirmAccSchema), asyncHandler(confirmEmail))

router.post('/login', asyncHandler(logIn))

router.post('/forget-password', isValid(forgetPasswordSchema), asyncHandler(forgetPassword))

router.patch('/reset-password', isValid(resetPasswordSchema), asyncHandler(resetPassword))

export default router