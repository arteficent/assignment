import { REFUSED } from 'dns';
import express, { Response, ErrorRequestHandler } from 'express'
import { IGetUserAuthInfoRequest, MyObjLayout, userObj } from './interface'
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const app = express()
import { v4 as uuidv4 } from 'uuid';
app.use(express.json())
require('dotenv').config()
const port = 5000

// Database
const admin = require('firebase-admin');
var serviceAccount = require('../admin.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://forward-robot-321816-default-rtdb.asia-southeast1.firebasedatabase.app"
});


var db = admin.database();
var databaseRef = db.ref("database");

//users model
var usersRef = databaseRef.child("users");
var transactionsRef = databaseRef.child('transactions');

function addUser(localUserObj: userObj, res: Response): void {
    var oneUser = usersRef.child(localUserObj.username);
    oneUser.update(localUserObj, (err: any) => {
        if (err) {
            throw new Error();
        }
    }).catch((err: any) => {
        throw new Error();
    })
}

function getUsers(): void {
    usersRef.once('value', function (snap: any) {
        console.log({ "users": snap.val() });
    })
}
// print data




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
app.post('/register', async (req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const hash = bcrypt.hashSync(req.body.password);
    const localObj: userObj =
    {
        name: name,
        username: username,
        password: hash
    }
    try {
        await addUser(localObj, res);
        res.status(200).json({ "msg": "user created sucessfully" });
    }
    catch (err: any) {
        res.status(500).json({ "msg": "Something went wrong", "error": err });
    }

})

app.post('/transaction', async (req, res) => {
    const localObj: userObj = req.body;
    try {
        var temp = transactionsRef.child(localObj.username);
        var transChild = temp.child(uuidv4());
        transChild.update(localObj, (err: any) => {
            if (err) {
                console.log(err);
                throw new Error();
            }
        }).catch((err: any) => {
            console.log(err);
            throw new Error();
        })
        res.status(200).json({ "msg": "user created sucessfully" });
    }
    catch (err: any) {
        console.log(err);
        res.status(500).json({ "msg": "Something went wrong", "error": err });
    }
})

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