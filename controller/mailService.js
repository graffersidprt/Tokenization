const nodemailer = require('nodemailer');


module.exports={
    mailer:(data)=>{
    
        console.log("mailer", String(data.error))
        let text = data.error.meta?JSON.stringify(data.error.meta.error):String(data.error)
        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '',
                pass: ''
            }
        });

        let mailDetails = {
            from: '',
            to: '',
            subject: data.type,
            text: text
        };

        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log('Error Occurs',err);
            } else {
                console.log('Email sent successfully');
            }
        });

    }
}