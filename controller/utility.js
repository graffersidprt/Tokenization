const contactModel = require('../modal/contact')
const logModel = require('../modal/log')
const mailService = require('./mailService')
const json2csv = require('json2csv')
const sftp = require('./sftpServer')
const fs = require('fs');
const csv2=require('csvtojson')
const nameEncodeModal = require('../modal/nameEncode')
const SFTPClient = require("ssh2-sftp-client") 
let dir =__dirname.split("\\")
dir.length = dir.length-1
dir = dir.join("/")
let now = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Calcutta'
}).split(" ")
now = now.join("-")
now = now.replaceAll(":","-")
now = now.replaceAll("/","-")
now = now.replaceAll(",","")
const  jsontocsv=async(colums,json)=>{
    const csv = await json2csv.parse(json, colums);
    let fileName = `file.csv`
    console.log("jsontocsv",now)
    fs.writeFile(fileName, csv, function(err) {
        if (err) ;
        {
            console.log(err)
        }
        console.log('file saved');
      
       setTimeout(async()=>{
        
        const localFilePath = `${dir}/file.csv`
        const remoteFilePath = `/Client Machine/contact${now}.csv`
        const config = {
         host: "13.94.147.175",
        port:22,
        username: "zillsftpuser",
        password: "Mahavir357",}
        const sftp = new SFTPClient();

        try {
            await sftp.connect(config);
            await sftp.put(localFilePath,remoteFilePath , { force: true })
            // await sftp.put(localFilePath,remoteFilePath , { force: true })
            console.log('CSV file uploaded successfully.');
          } catch (err) {
            saveErrorLogsToDatabase("Error uploading CSV file:"+String(err.message))
            csv2()
            .fromFile(process.cwd()+"/"+fileName).then(json=>{
                saveToDatabase(json)
                console.log(json.length)
            })
            console.error('Error uploading CSV file:', err.message);
          } 
           await sftp.end();
            console.log('SFTP connection closed.');
          
       },1000)
      });
   
}

const  getencryptName=async()=>{
    return await nameEncodeModal.find({})
 }

const  saveEncryption=async(contact)=>{
    console.log(JSON.stringify(contact))
    nameEncodeModal.insertMany(contact).then(()=>{
        console.log("Data inserted")  // Success
    }).catch((error)=>{
        console.log(error)      // Failure
    });
}

const saveEncryptTransactionData=async(data,email)=>{
        
    let update = {[email]:data}
    // console.log(email)
    let doc =await nameEncodeModal.findOneAndUpdate({contactEmail:email},{email:update},{returnOriginal: false} )
    console.log("Data inserted",doc)
}

const saveErrorLogsToDatabase=(data,type="")=>{
    // console.log(data)
    let obj = {
        createDate : String(new Date().toISOString()),
        error :data.response?data.response.data:data,
        type:type
    }
    // console.log(obj)
    mailService.mailer(obj)
    logModel.create(obj).then(()=>{
        console.log("Data inserted")  // Success
    }).catch((error)=>{
        console.log(error)      // Failure
    });
}
const saveToDatabase = (contacts)=>{
    console.log("insertMany",contacts.length)
    contactModel.insertMany(contacts).then(()=>{
        console.log("Data inserted")  // Success
    }).catch((error)=>{
        console.log(error)      // Failure
    });
   
}
module.exports={
   
    jsontocsv,getencryptName,saveEncryption,saveEncryptTransactionData,saveErrorLogsToDatabase,saveToDatabase

}