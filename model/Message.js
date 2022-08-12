const mongoose = require("mongoose")
const messageSchema = new mongoose.Schema({
    idFrom:{
        type:mongoose.Schema.Types.ObjectId,
        required:"User From Id is required",
        ref:"User"
    },
    idTo:{
        type:mongoose.Schema.Types.ObjectId,
        required: "User To Id is required",
        ref:"User"
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