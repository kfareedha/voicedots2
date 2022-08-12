const mongoose=require('mongoose')
const categorySchema= new mongoose.Schema({
    categoryname:{
        type:String,
        required:true
    },
    categorydescription:{
        type:String,
        required:true
    },
    categoryimage:{
        type:String,
    }
    
})
module.exports=mongoose.model("Category",categorySchema)
