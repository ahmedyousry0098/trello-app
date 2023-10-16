import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuth.js";
import { asyncHandler } from "../../utils/ErrorHandling.js";
import { addTask, deleteTask, getAllTasks, overduseTasks, updateTask } from "./tasks.controller.js";
import { isValid } from "../../middlewares/validation.js";
import { addTaskSchema, deleteTaskSchema, updateTaskSchema } from "./tasks.validation.js";
import { isLeader } from "../../middlewares/isLeader.js";

const router = Router()

router.post('/', isValid(addTaskSchema), isAuthenticated, isLeader, asyncHandler(addTask))

router.put('/:taskId', isValid(updateTaskSchema), isAuthenticated, isLeader, asyncHandler(updateTask))

router.delete('/:taskId', isValid(deleteTaskSchema), isAuthenticated, isLeader, asyncHandler(deleteTask))

router.get('/all', asyncHandler(getAllTasks))

router.get('/overdue', asyncHandler(overduseTasks))

export default router