import {Router} from 'express'
import { isValid } from '../../middlewares/validation.js'
import { isAuthenticated } from '../../middlewares/isAuth.js'
import { deleteProfileSchema, logOutSchema, updateProfileSchema } from './profile.validation.js'
import { asyncHandler } from '../../utils/ErrorHandling.js'
import { PermanentDeletion, deleteProfile, logOut, updateProfile } from './profile.controller.js'

const router = Router()

router.put('/:profileId', isValid(updateProfileSchema), isAuthenticated, asyncHandler(updateProfile))

router.patch('/:profileId/delete', isValid(deleteProfileSchema), isAuthenticated, asyncHandler(deleteProfile))

router.delete('/:profileId/Permanent-deletion', isValid(deleteProfileSchema), isAuthenticated, asyncHandler(PermanentDeletion))

router.patch('/:profileId/logout', isValid(logOutSchema), isAuthenticated, asyncHandler(logOut))

export default router