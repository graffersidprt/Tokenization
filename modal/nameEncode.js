const mongoose = require('mongoose');

const nameEncodeSchema = new mongoose.Schema({

   email:{type:Object,default:{}},
   contactEmail:{type:Object,default:""}

});

const nameEncodeModal = mongoose.model('contactHash', nameEncodeSchema);

module.exports = nameEncodeModal;