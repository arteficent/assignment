import express, { Response } from 'express'
import { IGetUserAuthInfoRequest, transObj, userObj } from './interface'
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
    if (!req.body.username || !req.body.name || !req.body.password)
        return res.status(400).json("Incomplete request")
    const name = req.body.name;
    const username = req.body.username;
    const hash = bcrypt.hashSync(req.body.password);
    const localObj: userObj =
    {
        name: name,
        username: username,
        password: hash,
        net_balance: 0,
        amount_credited: 0,
        amount_debited: 0
    }
    try {
        var localUser = usersRef.child(localObj.username);
        localUser.update(localObj, (err: any) => {
            if (err) {
                throw new Error();
            }
        }).catch((err: any) => {
            throw new Error();
        })
        res.status(200).json({ "msg": "user created sucessfully" });
    }
    catch (err: any) {
        res.status(500).json({ "msg": "Database error", "error": err });
    }

})

app.get('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password)
        return res.status(400).json('Incomplete request')
    try {
        const localUser = usersRef.child(username);
        localUser.once('value', function (snap: any) {
            const isValid = bcrypt.compareSync(password, snap.val().password);
            if (isValid) {
                const accessToken = generateAccessToken(username);
                res.status(200).json({ accessToken: accessToken });
            }
            else {
                res.status(400).json({ "msg": "wrong credentials" });
            }
        })
    }
    catch (err: any) {
        console.log(err);
        res.status(500).json({ "msg": "Database error", "error": err });
    }
})

app.post('/transaction', authenticateToken, async (req, res) => {
    const transObj: transObj = req.body;
    if (!req.body.username || !req.body.type || !req.body.amount || !req.body.currency || !req.body.status || !req.body.timestamp)
        return res.status(400).json("Incomplete request")
    if (req.body.amount <= 0 || !(req.body.type === "CREDIT" || req.body.type === "DEBIT") || !(req.body.currency === "INR" || req.body.currency === "USD" || req.body.currency === "EURO") || !(req.body.status === "INPROGRESS" || req.body.type === "COMPLETED"))
        return res.status(400).json("Improper form Submission")
    try {
        const localUser = usersRef.child(req.body.username);
        localUser.once('value', function (snap: any) {
            if (req.body.type == "DEBIT" && snap.val().net_balance < req.body.amount) {
                res.status(400).json({ "msg": "Insufficient Net Balance" })
            }
            else {
                var credit = snap.val().amount_credited, debit = snap.val().amount_debited, total = snap.val().net_balance;
                if (req.body.type == "DEBIT") {
                    debit += req.body.amount;
                    total -= req.body.amount;
                }
                else {
                    credit += req.body.amount;
                    total += req.body.amount;
                }
                var localObj: userObj =
                {
                    name: snap.val().name,
                    username: snap.val().username,
                    password: snap.val().password,
                    net_balance: total,
                    amount_credited: credit,
                    amount_debited: debit
                }
                localUser.update(localObj, (err: any) => {
                    if (err) {
                        throw new Error();
                    }
                }).catch((err: any) => {
                    throw new Error();
                })
                var temp = transactionsRef.child(localObj.username);
                var transChild = temp.child(uuidv4());
                transChild.update(transObj, (err: any) => {
                    if (err) {
                        console.log(err);
                        throw new Error();
                    }
                }).catch((err: any) => {
                    console.log(err);
                    throw new Error();
                })
                res.status(200).json({ "msg": "Transaction completed sucessfully" });
            }
        })
    }
    catch (err: any) {
        console.log(err);
        res.status(500).json({ "msg": "Database error", "error": err });
    }
})

app.get('/statistic', authenticateToken, async (req, res) => {
    if (!req.body.username)
        return res.status(400).json('Incomplete request')
    try {
        const localUser = usersRef.child(req.body.username);
        localUser.once('value', function (snap: any) {
            res.status(200).json({ net_balance: snap.val().net_balance, amount_credited: snap.val().amount_credited, amount_debited: snap.val().amount_debited });
        })
    }
    catch (err: any) {
        console.log(err);
        res.status(500).json({ "msg": "Database error", "error": err });
    }
})


app.listen(port, () => console.log(`Running on port ${port}`))