const express = require('express')
const cors = require('cors')
const app = express()
const router = require('./route/router') 
const db = require('./db/dbConnection')
const dotenv= require('dotenv')
const {savecontacts,fecthContact,innerJoin} = require('./controller/mysqlUtility')
const { default: axios } = require('axios')
app.use(express.urlencoded({extended:true}))
app.use(express.json({extended:false}))
app.use(cors())
db()
dotenv.config()
// savecontacts([{
//     "link": "https://paneledgesandbox.ca1.qualtrics.com/jfe/form/SV_0rokEwAFI5B7R66?Q_CHL=gl&Q_DL=BsZdxN8PEnCLbz2_0rokEwAFI5B7R66_CTR_1eL69UjcwIWplwu&_g_=g",
//     "exceededContactFrequency": "false",
//     "linkExpiration": "2023-10-13T10:57:00Z",
//     "lastName": "Doe",
//     "firstName": "John",
//     "email": "john_doe@email.com",
//     "externalDataReference": "12345",
//     "unsubscribed": "false",
//     "firstNameHash": "U2FsdGVkX1/SzfeFuNvHPjN8x5jczlg5nt8YfPSkyi0=",
//     "lastNameHash": "U2FsdGVkX18MlK2Xvn6z5h33bHjgeObdXQWjSJeq0F0=",
//     "emailHash": "U2FsdGVkX18E+pN89kNiSLfpVtK/Y7wIZJj1gYFsCkB5hC4oTN7SNO10YAhmshhn@test.com",
//     "externalDataReferenceHash": "U2FsdGVkX1/Chx9Kbu+7L2HhotxBJQKoPOmpaWzaTnY=",
//     "createDate": "2023-08-14",
//     "surveyId": "SV_0rokEwAFI5B7R66",
//     "Phone_Number": "1234567890",
//   }])
fecthContact()
innerJoin()
app.use('/',router)
// console.log(__dirname.split("\\").join("/"))
// console.log(process.cwd())
app.listen(4000,()=>console.log("server started"))