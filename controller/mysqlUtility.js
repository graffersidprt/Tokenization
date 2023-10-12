const dbConn = require('../db/mysqlConnection')

const saveEncryption = (contact)=>{
    let obj = ["email","contactEmail"]
    let value =[]
    console.log("contact",contact)
    for(let i =0; i<contact.length;i++){
        let row = obj.map(v=>(JSON.stringify(contact[i][v])))
        // row = [...row,contact[i]['contactEmail']]
        value.push(row)
    }
    console.log("value",value)
    dbConn.query('INSERT INTO hashcontact VALUES ?', [value], function(err, result) {
        //if(err) throw err
        if (err) {
            console.log(err)
        } else {                
            console.log('success', 'successfully added');
            
        }
    })
}

const updateEncryption = (data,where)=>{
    let update = JSON.stringify(data)
    dbConn.query('UPDATE hashcontact SET ? WHERE ?',[{email:update},{contactEmail:where}],function(err, result) {
        //if(err) throw err
        if (err) {
            console.log(err)
        } else {                
            console.log('success', 'successfully updated');
            
        }
    })
}

const savecontacts = (contact)=>{
    let obj = ["link","exceededContactFrequency","linkExpiration","lastName","firstName","email","externalDataReference","unsubscribed","firstNameHash","lastNameHash","emailHash","externalDataReferenceHash","createDate","surveyId","Phone_Number"]
    // let query = obj.reduce((val,str)=>{
    //     if(str.length===0){
    //         return str+val
    //     }
    //     else{return str+","+val}
    // },"")
// console.log(query)
    let value =[]
    for(let i =0; i<contact.length;i++){
        let row = obj.map(v=>(contact[i][v]))
        value.push(row)
    }
    // console.log(JSON.stringify(contact))
    dbConn.query("INSERT INTO contacts VALUES ?", [value], function(err, result) {
        //if(err) throw err
        if (err) {
            console.log(err)
        } else {                
            console.log("Number of records inserted: " + result.affectedRows);
            console.log('success', 'User successfully added');
            
        }
    })
}

const fecthContact = ()=>{
    dbConn.query('SELECT * FROM hashcontact where contactEmail= "john_doe@email.com" ',function(err,rows)     {
        if(err) {
            console.log('error', err);
            // render to views/users/index.ejs
            
        } else {
            // render to views/users/index.ejs
            rows.length=1
            console.log('users',rows);
        }
    });
}

const innerJoin = ()=>{
    let query = "SELECT * FROM ?? JOIN ?? ON ??.?? = ??.??"
    let value = ["hashcontact","contacts","hashcontact","contactEmail","contacts","email"]
    dbConn.query(query,value,function(err,rows)     {
        if(err) {
            console.log('error', err);
            // render to views/users/index.ejs
            
        } else {
            // render to views/users/index.ejs
            console.log('users',JSON.stringify(rows));
        }
    });
}



module.exports = {saveEncryption,savecontacts,fecthContact,updateEncryption,innerJoin}