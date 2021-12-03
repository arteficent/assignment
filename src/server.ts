import express, { Response } from 'express'
import { IGetUserAuthInfoRequest, MyObjLayout } from './interface'
const jwt = require('jsonwebtoken');
const app = express()
app.use(express.json())
require('dotenv').config()
const port = 5000

// Database

const arr = [
    {
        name: 'sourabh',
        title: 'mr'
    },
    {
        name: 'mitshua',
        title: 'ms'
    }
]

// Functions
function generateAccessToken(user: MyObjLayout) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}
function authenticateToken(req: IGetUserAuthInfoRequest, res: Response, next: () => void) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: boolean, user: MyObjLayout) => {
        if (err)
            return res.sendStatus(403);
        req.user = user
        next()
    })
}


// Apis
app.post('/login', (req, res) => {
    //Authentication User
    const username = req.body.username
    const user: MyObjLayout = { name: username }
    const accessToken = generateAccessToken(user)
    res.json({ accessToken: accessToken })
})
app.get('/arr', authenticateToken, (req: IGetUserAuthInfoRequest, res: Response) => {
    res.json(arr.filter(arr => arr.name === req.user.name))
})
app.listen(port, () => console.log(`Running on port ${port}`))