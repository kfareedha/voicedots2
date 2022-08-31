const mongoose = require( 'mongoose')
const mongourl="mongodb+srv://kfareedha:lUJs5V8zHGbinvL5@cluster0.ix9d75z.mongodb.net/voicedots?retryWrites=true&w=majority"
const mongoconnect=mongoose.connect(mongourl,()=>console.log("database connected"))

module.exports={
    mongoconnect
}