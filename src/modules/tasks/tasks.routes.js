import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuth.js";
import { asyncHandler } from "../../utils/ErrorHandling.js";
import { addTask, deleteTask, getAllTasks, getAssignedTasks, getUserTasks, overduseTasks, updateTask } from "./tasks.controller.js";
import { isValid } from "../../middlewares/validation.js";
import { addTaskSchema, deleteTaskSchema, updateTaskSchema } from "./tasks.validation.js";
import { isLeader } from "../../middlewares/isLeader.js";

const router = Router()

router.post('/', isValid(addTaskSchema), isAuthenticated, asyncHandler(addTask))

router.put('/:taskId', isValid(updateTaskSchema), isAuthenticated, asyncHandler(updateTask))

router.delete('/:taskId', isValid(deleteTaskSchema), isAuthenticated, asyncHandler(deleteTask))

router.get('/all', isAuthenticated, asyncHandler(getAllTasks))

router.get('/overdue', isAuthenticated, asyncHandler(overduseTasks))

router.get('/get-user-tasks', isAuthenticated, asyncHandler(getUserTasks))

router.get('get-assigned-tasks', isAuthenticated, asyncHandler(getAssignedTasks))

export default router