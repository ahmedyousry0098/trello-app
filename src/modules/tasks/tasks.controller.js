import { TaskModel } from "../../../db/models/task.model.js"
import { UserModel } from "../../../db/models/user.model.js"
import { ResponseError } from "../../utils/ErrorHandling.js"

export const addTask = async (req, res, next) => {
    const {title, description, assignTo, deadline} = req.body
    const {id} = req.user
    const assigedTo = await UserModel.findById(assignTo)
    if (!assigedTo) return next(new ResponseError('Assigned To User is not exist', 400))
    const task = new TaskModel({
        title, 
        description,
        assignTo, 
        deadline: new Date(deadline),
        createdBy: id
    })
    if (!await task.save()) return next(new ResponseError('Something went wrong please try again'))
    return res.status(201).json({message: 'Done', task})
}

export const updateTask = async (req, res, next) => {
    const {taskId} = req.params;
    const {id} = req.user
    const task = await TaskModel.findById(taskId)
    if (!task) {
        return next(new ResponseError('In-valid task id'))
    }
    if (task.createdBy.toString() != id.toString()) {
        return next(new ResponseError('This Task Only Modifiable by it\'s Creator'))
    }
    if (req.body.assignTo) {
        const assignedTo = await UserModel.findById(req.body.assignTo)
        if (!assignedTo) {
            return next(new ResponseError('assigned to user not found', 400))
        }
    }
    const updatedTask = await TaskModel.updateOne({_id: taskId}, req.body)
    if (!updatedTask.modifiedCount) {
        return next(new ResponseError('Something went wrong please try again'))
    }
    return res.status(200).json({message: 'Updated Successfully'})
}

export const deleteTask = async (req, res, next) => {
    const {taskId} = req.params;
    const {id} = req.user
    const task = await TaskModel.findById(taskId)
    if (!task) {
        return next(new ResponseError('In-valid task id'))
    }
    if (task.createdBy.toString() != id.toString()) {
        return next(new ResponseError('This Task Only Modifiable by it\'s Creator'))
    }
    const updatedTask = await TaskModel.deleteOne({_id: taskId})
    if (!updatedTask.deletedCount) {
        return next(new ResponseError('Something went wrong please try again'))
    }
    return res.status(200).json({message: 'Deleted Successfully'})
}

export const getAllTasks = async (req, res, next) => {
    const tasks = await TaskModel.find().populate([
        {
            path: 'createdBy',
            select: "username email phone"
        },
        {
            path: 'assignTo',
            select: 'username email phone'
        }
    ])
    if (!tasks) {
        return next(new ResponseError('Something Went Wrong Please Try Again'))
    }

    return res.status(200).json({tasks})
}

export const overduseTasks = async (req, res, next) => {
    const tasks = await TaskModel.find({
        $and:[
            {deadline: {$lt: Date.now()}},
            {status: {$neq: 'done'}}
        ]
    })
    return res.status(200).json(tasks)
}