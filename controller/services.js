let axios = require('axios')
let now = new Date().toISOString().split(".")[0]
let CryptoJS = require('crypto-js')
var contact =[]
const csvFilePath=process.cwd()+'/ExampleContacts.csv'
let processedContact = []
let rawData = []
const csv=require('csvtojson')
const sftp = require('./sftpServer')
let surveyId= ""// from csv
const utility = require('./utility')
const fs = require('fs')
let encryptContact = []
let newEncrypt =false
let allEncrypt =[]
let cb
let retry=0 // 4 times


  let headers = { headers :
    { 'X-API-TOKEN': 'NJDFwTeBGmRcr9tauhb3azWTVe2lD8BTdE5Y1Pm5' } 
  }

let bt ="" //batch transaction id

//error objects [ 'message', 'name', 'code', 'config', 'request', 'response' ]
module.exports={

    
    userData:async(callback)=>{
        
        let count = 0
        expirationDate = new Date()
        expirationDate = expirationDate.setDate(expirationDate.getDate()+3)
        expirationDate = new Date(expirationDate).toISOString().split("T")[0]+"T00:00:00Z"
        console.log("expirationDate",expirationDate)
        console.log(now+"Z")
        allEncrypt =await utility.getencryptName()
        console.log(allEncrypt[0])
        sftp.downloadFileFromSFTP().then(res=>{
            csv()
            .fromFile(csvFilePath)
            .then((jsonObj)=>{
                if(jsonObj.length>0)
               {
                    jsonObj.length=400
                    contact=jsonObj
                    surveyId = jsonObj[0]['SurveyId']
                    console.log(jsonObj[0]); 
                    step1().then(res=>{
                        console.log(res.data.result.id)
                        bt =res.data.result.id
                        step2(res.data.result.id,count).
                        then(res=>{
                        step3(res.data,count)     
                        })
                        .catch(err=>utility.saveErrorLogsToDatabase(err,"2nd API call"))
                    }).catch(err=>{
                        console.log(err)
                        utility.saveErrorLogsToDatabase(err,"1st API call")
                    })
               }
            })
        }).catch(err=>utility.saveErrorLogsToDatabase(err,"file download from SFTP"))
        
           
   callback("ok")
    }
}

const step1=()=>{
    processedContact=[]

    console.log("step1 run",processedContact.length)
    return  axios.post(`https://yul1.qualtrics.com/API/v3/directories/${process.env.directoryId}/transactionbatches`,
    {
       "transactionIds": [
         "CTR_3DzxXfwKBBkAbLT"
       ],
       "creationDate": now+"Z"
     },
     headers
   )
}

const step2=(id,count)=> {
    retry =0
    let limit = contact[count+process.env.numberOfcontact]?count+process.env.numberOfcontact:contact.length
    console.log("limit",limit,"count",count,"rawData",rawData.length)
    // console.log("allEncrypt",allEncrypt)
    let columnName = Object.keys(contact[0])
    let hashColumn = columnName.filter(v=>(v.indexOf("Hash_")!==-1))
    let transactionColumn = columnName.filter(v=>(v.indexOf("Transaction_")!==-1))// data may be change 
    let transactionData =  {"ABC":"test"}
    let body={
            "transactionMeta": {
                "batchId": bt,
                "fields": [
                    "ABC",
                    ...hashColumn.map(v=>(v.split("_")[1])),
                    ...transactionColumn.map(v=>(v.split("_")[1]))
                ]
                },
            "contacts": [ ]
            }
    body.contacts=[]
    encryptContact=allEncrypt// replace it with [] if you want to create new hash every time
    let hashToBeStore=[]
    
    for(let i=count; i<limit;i++)
    {
       
       
        let obj={ "language": "EN",
        "unsubscribed": false,
        "transactionData":  {"ABC":"test"}, // do not remove {"ABC":"test"}  
        // read more value from csv file like hash_prefix
        // "hash_age" prefix for hashing and "transaction_location" prefix will be normal 
        // "ExceededContactFrequency":true
          }
       
    
            let contHash={}
            let existHash = encryptContact.find(v=>(v.email[contact[i].Email]))
            if(!existHash)
            {
                hashColumn.forEach(v=>{
                    if(contact[i][v])
                    {
                     transactionData = {...transactionData,[v.split("_")[1]]:CryptoJS.AES.encrypt(contact[i][v], 'secret').toString()}
                    }
                 })
                 transactionColumn.forEach(v=>{
                    if(contact[i][v])
                    {
                     transactionData = {...transactionData,[v.split("_")[1]]:contact[i][v]}
                    }
                 })

                obj.embeddedData= {
                    "department":contact[i]['Department'],//normal string
                    "city":contact[i].City,//normal string
                    "country":contact[i].Country,//normal string
                    "Phone Number" : CryptoJS.AES.encrypt(contact[i]['Phone Number'], 'secret').toString()
                }
                obj.firstName = CryptoJS.AES.encrypt(contact[i].FirstName, 'secret').toString()
                obj.lastName= CryptoJS.AES.encrypt(contact[i].LastName, 'secret').toString()
                obj.email = CryptoJS.AES.encrypt(contact[i].Email, 'secret').toString()+`@test.com`
                obj.extRef = CryptoJS.AES.encrypt(contact[i].ExternalDataReference, 'secret').toString()
                newEncrypt = true
             contHash=  {
                     [contact[i].Email]: 
                     {
                        [contact[i].FirstName] : obj.firstName,
                        [contact[i].LastName]: obj.lastName,
                        [contact[i].Email]:obj.email,
                        [contact[i].ExternalDataReference]:obj.extRef,
                        phone:obj.embeddedData['Phone Number'],
                        // department:obj.embeddedData.department,
                        // city:obj.embeddedData.city,
                        // country:obj.embeddedData.country,
                        ...transactionData
                    },
               
            }
                encryptContact.push({email:contHash,contactEmail:contact[i].Email})
                hashToBeStore.push({email:contHash,contactEmail:contact[i].Email})
            }
            else{
                hashColumn.forEach(v=>{
                    if(contact[i][v])
                    {
                        if(existHash.email[contact[i].Email][v])
                        {
                            transactionData = {...transactionData,[v.split("_")[1]]:existHash.email[contact[i].Email][v]}

                        }
                        else{
                            transactionData = {...transactionData,[v.split("_")[1]]:CryptoJS.AES.encrypt(contact[i][v], 'secret').toString()}
                            existHash.email[contact[i].Email][v] =CryptoJS.AES.encrypt(contact[i][v], 'secret').toString()
                            utility.saveEncryptTransactionData(existHash.email[contact[i].Email],existHash.contactEmail)
                        }
                    }
                 })
                 transactionColumn.forEach(v=>{
                    if(contact[i][v])
                    {
                     transactionData = {...transactionData,[v.split("_")[1]]:contact[i][v]}
                    }
                 })
                // console.log("existHash",JSON.stringify(existHash.email[contact[i].Email][contact[i].FirstName]))
                obj.firstName = existHash.email[contact[i].Email][contact[i].FirstName]
                obj.lastName= existHash.email[contact[i].Email][contact[i].LastName]
                obj.email = existHash.email[contact[i].Email][contact[i].Email]
                obj.extRef = existHash.email[contact[i].Email][contact[i].ExternalDataReference]
                // console.log("run", obj.firstName)
                obj.embeddedData= {
                    "department":contact[i]['Department'],//normal string
                    "city":contact[i].City,//normal string
                    "country":contact[i].Country,//normal string
                    "Phone Number" : existHash.email[contact[i].Email].phone?existHash.email[contact[i].Email].phone:CryptoJS.AES.encrypt(contact[i]['Phone Number'], 'secret').toString()
                }
            }
        obj.transactionData = transactionData
           
        body.contacts.push(obj)
        
    }
    if(newEncrypt)
    { 
       
        utility.saveEncryption(hashToBeStore)//commment it if you want to create new hash every time
        newEncrypt=false
    }
    body.transactionMeta.batchId=id
    console.log("body.contacts",JSON.stringify(body.transactionMeta))
   return  axios.post(`https://yul1.qualtrics.com/API/v3/directories/${process.env.directoryId}/mailinglists/${process.env.mailingListID}/transactioncontacts`,
                    body , headers
            )
}

const step3 = (data,count)=>{
    console.log("count",count)
    retry+=1
     axios.get(`https://yul1.qualtrics.com/API/v3/directories/${process.env.directoryId}/mailinglists/${process.env.mailingListID}/transactioncontacts/${data.result.id}`,
        
    headers
        ).then(res=>{
            console.log("step3",JSON.stringify(res.data))
            if(res.data.result.percentComplete===100)//stop calling next api 
           {
                retry=0
                if(count<contact.length-process.env.numberOfcontact)// to call next batch of contact(like next 1000 contact)
                {
                    count+=process.env.numberOfcontact
                    step2(bt,count).then(res=>{
                        step3(res.data,count)
                    }).catch(err=>utility.saveErrorLogsToDatabase(err,"2rd API call"))
                }
                else
                {// if we have processed all contacts then it will call 4th API
                    step4().then(res=>{
                    step5(res.data,count)
                    }).catch(err=>utility.saveErrorLogsToDatabase(err,"4rd API call"))
                }
        }
            else{
                setTimeout(()=>{
                    if(retry<5)// if it will take to much time to complete 100% so we will end the process and send a mail
                    {step3(data,count)} // call 3rd api again
                    else{
                        utility.saveErrorLogsToDatabase("taking to much time to complete","3rd API call")
                    }
                },100000) // hold for 100 seconds
            }
        }).catch(err=>utility.saveErrorLogsToDatabase(err,"3rd API call"))
}

const step4 = ()=>{
    return  axios.post(`https://yul1.qualtrics.com/API/v3/distributions`,
        { "action": "CreateTransactionBatchDistribution",      
            "surveyId": surveyId,
            "linkType": "Individual",
            "description": "distribution"+now,
            "action": "CreateTransactionBatchDistribution",
            "expirationDate": expirationDate,
            "transactionBatchId": bt
        }
        ,     
        headers
)
}

const step5 = (data,count)=>{
      axios.get(`https://yul1.qualtrics.com/API/v3/distributions/${data.result.id}/links?surveyId=${surveyId}&skipToken=0`,   
     headers
    ).then(res=>{
        console.log("step5",res.data.result.elements.length)
        if(res.data.result.nextPage)//if third party have some remaining contact to be fatch 
        {
           rawData = [...rawData,...res.data.result.elements]//fetch remaining data and put into it
            nextLink(res.data.result.nextPage,count)//if it has nextpage url so we will call it
        }
       else{
            dataConversion(res.data.result.elements,count)// after fatching all contact from quatrics server we will start data conversion
            rawData.length=0
           
       }
    }).catch(err=>{
        utility.saveErrorLogsToDatabase(err,"5th API calling")
        console.log('step5 api error',err.response.data)})
}


const nextLink = (url,count)=>{// to get all contact from trird party server which we have passed into 2nd API
    console.log("calling url",url)
    console.log("rawData",rawData.length)
      axios.get(url,   
     headers
    ).then(res=>{
        // console.log("step5",res.data.result.nextPage)
        if(res.data.result.nextPage)//if third party have some remaining contact to be fatch 
        {
            rawData = [...rawData,...res.data.result.elements]//fetch remaining data and put into it
            
            nextLink(res.data.result.nextPage,count)// fetching remaining contact
        }
       else{
             rawData = [...rawData,...res.data.result.elements]
            // console.log("rawData",rawData.length)
            dataConversion(rawData,count)
            rawData.length=0
          
       }
    }).catch(err=>{
        if(err.response){utility.saveErrorLogsToDatabase(err,"nextLink API calling")}
        console.log('step5 api error',err,count)
       
       
    })
}

const dataConversion = (contacts,count)=>{ // It will run after fetching all contacts from 5th API
    console.log("dataConversion",contacts.length)
    let today = String(new Date().toISOString()).split("T")[0]
    for(let i =0; i<contacts.length;i++)
    {
       try{           
          
            contacts[i]['externalDataReferenceHash'] = contacts[i]['externalDataReference']
            contacts[i]['externalDataReference'] = CryptoJS.AES.decrypt(contacts[i]['externalDataReference'], 'secret').toString(CryptoJS.enc.Utf8);;
            contacts[i]['createDate']= today
            
            contacts[i]['lastNameHash'] = contacts[i]['lastName']
            contacts[i]['lastName'] = CryptoJS.AES.decrypt(contacts[i]['lastName'], 'secret').toString(CryptoJS.enc.Utf8);
            contacts[i]['firstNameHash'] = contacts[i]['firstName']
            contacts[i]['firstName'] = CryptoJS.AES.decrypt(contacts[i]['firstName'], 'secret').toString(CryptoJS.enc.Utf8);

            contacts[i]['emailHash'] = contacts[i]['email']
            contacts[i]['email'] = CryptoJS.AES.decrypt(contacts[i]['email'].split("@")[0], 'secret').toString(CryptoJS.enc.Utf8);
            contacts[i]['surveyId']=surveyId
            let phone = contact.find(v=>(v.Email===contacts[i].email))
            let existHash = encryptContact.find(v=>(v.email[contacts[i].email]))
            contacts[i]['Phone_Number'] = phone?phone['Phone Number']:""
            if(existHash)
            {
                contacts[i]['Phone_NumberHash'] = existHash.email[contacts[i].email].phone
            }
            delete contacts[i]['status']
            delete contacts[i]['contactId']
            delete contacts[i]['transactionId']
            // delete contacts[i][`Department`]
            // delete contacts[i]['`City`']
            // delete contacts[i]['`Country`']
            // delete contacts[i]['`Hash_Age`']
      
       }
       catch{
         console.log("dataConversion error")
         utility.saveErrorLogsToDatabase("Failed in Data Conversion","Data Conversion error")
         return 0
       }
    }
    rawData = []
    contacts = contacts.filter(val=>(val.ExceededContactFrequency!==true))// to remove ExceededContactFrequency = true
    console.log(contacts,"count",count,"contact",contact.length)
   // if we have processed all contacts then we will convert into csv 
    // ["lastName","firstName","surveyId","Phone_Number","email","link","exceededContactFrequency","linkExpiration","externalDataReference","unsubscribed","externalDataReferenceHash","firstNameHash","lastNameHash","emailHash"]
        let colums = Object.keys(contacts[0])
        colums = ["firstName","lastName","surveyId","Phone_Number","email","link","exceededContactFrequency","linkExpiration","externalDataReference","unsubscribed","externalDataReferenceHash","firstNameHash","lastNameHash","emailHash",'Phone_NumberHash']
        utility.jsontocsv(colums,contacts)
        // utility.saveToDatabase(contacts)
       
}


