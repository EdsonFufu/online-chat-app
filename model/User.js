const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    firstName:String,
    lastName:String,
    status:Boolean
},{timestamps:true})

export default mongoose.model('User',userSchema);