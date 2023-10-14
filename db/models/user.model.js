import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    age: {type: String},
    phone: {type: String},
    gender: {type: String, enum: ['male', 'female']},
    isConfirmed: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    isLoggedIn: {type: Boolean, default: false}
}, {
    timestamps: true,
    methods: {
        isPasswordMatch(password) {
            return bcrypt.compareSync(password, this.password)
        }
    }
})

userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUND))
        const hashedPassowrd = bcrypt.hashSync(this.password, salt)
        this.password = hashedPassowrd
        next()
    }
})

export const UserModel = mongoose.model('User', userSchema)
