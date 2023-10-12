const SFTPClient = require("ssh2-sftp-client") 
const { readFileSync } = require('fs');

const { Client } = require('ssh2');
let dir =__dirname.split("\\")
dir.length = dir.length-1
dir = dir.join("/")
console.log("dir",dir)
const path = process.cwd()
const fs = require('fs')
const utility = require('./utility')
const uploadFileToSFTP=async()=>{
    // upload the local file "${process.cwd()}/filee.csv"
    // to store it to the remote file "/Client Machine/data.csv"
        const localFilePath = `${dir}/file.csv`
        const remoteFilePath = "/Client Machine/data.csv"
        console.log("run")
        const config = { host: "13.94.147.175",
        port:22,
        username: "zillsftpuser",
        password: "Mahavir357",}
        const sftp = new SFTPClient();

        try {
            await sftp.connect(config);
            await sftp.put(localFilePath,remoteFilePath , { force: true })
            await sftp.put(localFilePath,remoteFilePath , { force: true })
            console.log('CSV file uploaded successfully.');
          } catch (err) {
            utility.saveErrorLogsToDatabase("Error uploading CSV file:"+String(err.message))
            console.error('Error uploading CSV file:', err.message);
          } 
           await sftp.end();
            console.log('SFTP connection closed.');
      
    }

const  downloadFileFromSFTP=async()=>{
    const sftp = new SFTPClient()
    const remoteFile = "/Client Machine/ExampleContacts.csv"
    const localFile =`${process.cwd()}/ExampleContacts.csv`
    try {
        await sftp.connect({
            host: "13.94.147.175",
            username: "zillsftpuser",
            password: "Mahavir357",
            
        })

        // download the file located in remotePath
        // to localFile
        return sftp.get(remoteFile, localFile);        
    } catch(e) {
        utility.saveErrorLogsToDatabase("Error download CSV file:"+String(e.message))
        console.log(e)
    }
    
    // close the client connection
    await sftp.end()
}
module.exports={
   
    uploadFileToSFTP,downloadFileFromSFTP   
}

