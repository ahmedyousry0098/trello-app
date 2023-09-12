import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuth.js";
import { asyncHandler } from "../../utils/ErrorHandling.js";
import { addTask, deleteTask, getAllTasks, overduseTasks, updateTask } from "./tasks.controller.js";
import { isValid } from "../../middlewares/validation.js";
import { addTaskSchema, deleteTaskSchema, updateTaskSchema } from "./tasks.validation.js";

const router = Router()

router.post('/add', isValid(addTaskSchema), isAuthenticated, asyncHandler(addTask))

router.put('/:taskId', isValid(updateTaskSchema), isAuthenticated, asyncHandler(updateTask))

router.delete(':/taskId', isValid(deleteTaskSchema)), isAuthenticated, asyncHandler(deleteTask)

router.get('/all', asyncHandler(getAllTasks))

router.get('/overdue-tasks', asyncHandler(overduseTasks))

export default router