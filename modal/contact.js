const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({

    // contactId: { type: String, required: true },
    // transactionId: { type: String, required: true },
    link: { type: String, required: true },
    exceededContactFrequency: { type: String, required: true },
    linkExpiration: { type: String, required: true },
    // status: { type: String, required: true },
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    email: { type: String, required: true },
    externalDataReference: { type: String, required: true },
    unsubscribed: { type: String, required: true },
    firstNameHash: { type: String, required: true },
    lastNameHash: { type: String, required: true },
    emailHash: { type: String, required: true },
    externalDataReferenceHash: { type: String, required: true },
    createDate: { type: String,  },
    surveyId: { type: String },
    Phone_Number:{type:String}


});

const contactModal = mongoose.model('contact', contactSchema);

module.exports = contactModal;