const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({

    createDate: { type: String, required: true },
    error: { type: Object },
    type:{type:String}


});

const logModal = mongoose.model('logs', logsSchema);

module.exports = logModal;