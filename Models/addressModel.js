const mongoose = require('mongoose');
const addressSchema= new mongoose.Schema({
User:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
 },
 name:{
    type:String,
   },
   email:{
    type:String,
   },
   mobile:{
    type:String,
   },
address1:{
    type:String,
},
address2:{
    type:String,
},
country:{
    type: String,
},
city:{
    type: String,
},
state:{
    type: String,
},

pincode:{
    type: Number,
},


defaultAddress:{
    type: Boolean,
},






})
module.exports = mongoose.model('Address',addressSchema);