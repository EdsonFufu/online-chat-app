const mongoose = require("mongoose")
const messageSchema = new mongoose.Schema({
    from_id:{
        type:String,
        required:"User From Id is required"
    },
    to_id:{
        type:String,
        required: "User To Id is required"
    },
    from:{
        type:String,
        required:"From Name is required"
    },
    to:{
        type:String,
        required: "To Name is required"
    },
    message:String,
    createdDate:{
        type:Date,
        required:"Date Is Required"
    }
},{timestamps:true})

module.exports = mongoose.model('Message',messageSchema)