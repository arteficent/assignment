# assignment

A simple express app based on simple transaction model

clone repo with `https://github.com/arteficent/assignment.git`  
open terminal in repo destination  
run command `npm run dev`

API routes

<------------------------------------------->

`http://localhost:5000/register`

method: POST

authorization: none

Request Payload (raw json)  
{  
"name": "sample",  
"username": "sample",  
"password": "sample"  
}

Response  
200 (user created sucessfully)  
400 (Incomplete request)  
500 (Database error)

<------------------------------------------->

`http://localhost:5000/login`

method: GET

authorization: none

Request Payload (raw json)  
{  
"username": "sample",  
"password": "sample"  
}

Response  
200 (ACCESS_TOKEN)  
400 (Incomplete request | wrong credentials)  
500 (Database error)

<------------------------------------------->

`http://localhost:5000/transaction`

method: POST

authorization: Bearer Token = ACCESS_TOKEN

Request Payload (raw json)  
{  
"username":"sample",  
"type": "DEBIT" | "CREDIT",  
"amount":100,  
"currency": "USD" | "INR" | "EURO",  
"status": "INPROGRESS" | "COMPLETED",  
"timestamp": 1214134141  
}

Response  
200 (Transaction completed sucessfully)  
400 (Incomplete request | Improper form submission | Insufficient Net Balance )  
500 (Database error)

<------------------------------------------->

`http://localhost:5000/statistic`

method: GET

authorization: Bearer Token = ACCESS_TOKEN

Request Payload (raw json)  
{  
"username": "sample"  
}

Response  
200 (net_balance, amount_credited, amount_debited)  
400 (Incomplete request)  
500 (Database error)

<------------------------------------------->
