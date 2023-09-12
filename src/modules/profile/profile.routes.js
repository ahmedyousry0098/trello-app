import {Router} from 'express'
import { isValid } from '../../middlewares/validation.js'
import { isAuthenticated } from '../../middlewares/isAuth.js'
import { deleteProfileSchema, logOutSchema, updateProfileSchema } from './profile.validation.js'
import { asyncHandler } from '../../utils/ErrorHandling.js'
import { PermanentDeletion, deleteProfile, logOut, updateProfile } from './profile.controller.js'

const router = Router()

router.put('/:profileId', isAuthenticated, isValid(updateProfileSchema), asyncHandler(updateProfile))

router.patch('/:profileId/delete', isAuthenticated, isValid(deleteProfileSchema), asyncHandler(deleteProfile))

router.delete('/:profileId/Permanent-deletion', isAuthenticated, isValid(deleteProfileSchema), asyncHandler(PermanentDeletion))

router.patch('/:profileId/logout', isAuthenticated, isValid(logOutSchema), asyncHandler(logOut))

export default router