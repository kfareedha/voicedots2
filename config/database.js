const mongoose = require( 'mongoose')
const mongourl="mongodb://127.0.0.1:27017/voicedots"
const mongoconnect=mongoose.connect(mongourl,()=>console.log("database connected"))

module.exports={
    mongoconnect
}