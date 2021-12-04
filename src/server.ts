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

// Database Connections
const admin = require('firebase-admin');
const serviceAccount = require('../admin.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://forward-robot-321816-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = admin.database();
const databaseRef = db.ref("database");

//models
const usersRef = databaseRef.child("users");
const transactionsRef = databaseRef.child('transactions');

// Functions
function generateAccessToken(username: string) {
    return jwt.sign(username, process.env.ACCESS_TOKEN_SECRET)
}
function authenticateToken(req: IGetUserAuthInfoRequest, res: Response, next: () => void) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, username: string) => {
        if (err)
            return res.sendStatus(403);
        req.username = username
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
        var oneUser = usersRef.child(localObj.username);
        oneUser.update(localObj, (err: any) => {
            if (err) {
                throw new Error();
            }
        }).catch((err: any) => {
            throw new Error();
        })
        res.status(200).json({ "msg": "user created sucessfully" });
    }
    catch (err: any) {
        res.status(500).json({ "msg": "Something went wrong", "error": err });
    }

})

app.post('/transaction', authenticateToken, async (req, res) => {
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
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password)
        return res.sendStatus(400).json('Incomplete request')
    try {
        const localUser = usersRef.child(username);
        localUser.once('value', function (snap: any) {
            const isValid = bcrypt.compareSync(password, snap.val().password);
            //console.log(isValid, password, snap.val().password);
            if (isValid) {
                const accessToken = generateAccessToken(username);
                //console.log(accessToken);
                res.status(200).json({ accessToken: accessToken });
            }
            else {
                res.status(400).json({ "msg": "wrong credentials" });
            }
        })
    }
    catch (err: any) {
        console.log(err);
        res.status(500).json({ "msg": "Something went wrong", "error": err });
    }
})
app.listen(port, () => console.log(`Running on port ${port}`))