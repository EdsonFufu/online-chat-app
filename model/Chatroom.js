const mongoose = require("mongoose")
const chatRoomSchema = new mongoose.Schema({
    name:String,
},{timestamps:true})

export default mongoose.model('Chatroom',chatRoomSchema)