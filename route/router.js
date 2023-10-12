const express = require('express')
const router = express.Router()
const services = require('../controller/services')
const sftp = require('../controller/sftpServer')
const mailService = require('../controller/mailService')
const csv=require('csvtojson')
const csvFilePath=process.cwd()+'/ExampleContacts.csv'
router.get("/api/getUserData",(req,res)=>{
    services.userData((response)=>{
    res.send("ok")
    })
})

router.get("/api/fileUpload",(req,res)=>{
    sftp.uploadFileToSFTP(()=>{
        
    })
    res.send("ok")
})

router.get("/api/hashing",(req,res)=>{
    csv()
    .fromFile(csvFilePath)
    .then(json=>{
        let contact =json
        contact.length = 1000
        let obj = Object.keys(contact[0])
        let hashColumn = obj.filter(v=>(v.indexOf("Hash_")!==-1))
        console.log(contact)
    })
    res.send("ok")
})
router.get("/api/sendmail",(req,res)=>{
    mailService.mailer()
    res.send("ok")
})

module.exports =router
