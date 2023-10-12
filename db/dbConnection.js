const mongoose = require("mongoose");
var mysql = require('mysql');

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tokenization"
})
const connectDatabase = () => {
  mongoose
    .connect('', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
        
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    });
//   connection.connect(function (err) {
//     if (err) {
//         console.log("Error in the connection")
//         console.log(err)
//     }
//     else {
//         console.log(`Database Connected`)
//         connection.query(`SHOW DATABASES`,
//             function (err, result) {
//                 if (err)
//                     console.log(`Error executing the query - ${err}`)
//                 else
//                     console.log("Result: ", result)
//             })
//     }
// })
};


module.exports = connectDatabase;

