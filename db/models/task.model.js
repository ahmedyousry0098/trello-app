import mongoose, {Schema} from 'mongoose'

const tasksSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    status: {
        type: String,
        enum: ['todo', 'doing', 'done'],
        default: "todo",
        lowercase: true
    },
    createdBy: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    assignTo: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    deadline: {type: Date}
}, {
    timestamps: true,
})

export const TaskModel = mongoose.model('Task', tasksSchema)