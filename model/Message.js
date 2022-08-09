const mongoose = require("mongoose")
const messageSchema = new mongoose.Schema({
    chatroom:{
        type:mongoose.Schema.Types.ObjectId,
        required:"Chat Room Id is required",
        ref:"Chatroom"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required: "User is required",
        ref:"User"
    },
    message:String
},{timestamps:true})

export default mongoose.model('Message',messageSchema)