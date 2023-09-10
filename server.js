process.on('uncaughtException', (err) => {
    console.error(err)
})

import express from 'express'
import authRouter from './src/modules/auth/auth.routes.js'
import { connectDB } from './db/connection.js'
import {config} from 'dotenv'
import cors from 'cors'
config({path: './config/.env'})

const app = express()
const port = process.env.PORT || 5000

connectDB()
app.use(cors({
    origin: '*'
}))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(`/`, authRouter)

app.use('*', (req, res, next) => {
    return res.status(404).json({message: 'Page Not Found'})
})

process.on('unhandledRejection', (err) => {
    console.error(`${err}`)
})

app.listen(port, () => {
    console.log(`App Running On Port ${port}`)
})