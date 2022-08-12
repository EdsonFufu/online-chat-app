const express = require("express")
const auth = require("../middleware/auth")
const router = express.Router()
const User = require("../model/User")
const Message = require("../model/Message");

router.get("/",auth,(req, res) => {
    const id = req.session.user._id
    const name = req.session.user.firstName + " " + req.session.user.lastName
    User.find({'_id':{'$ne':id+''}}).lean().then(users => {
        Message.find({}).lean().then(messages => {
            res.status(200).render('chatting', {'title':'Chatting',id,isLoggedIn:true,name,users,messageUrl:process.env.MESSAGE_URL,messages})
        }).catch(err => {
            console.log(err)
            console.log("Error on Fetching Messages")
        })
    }).catch(err => {
        console.log("No other users")
        res.status(200).render('chatting', {'title':'Chatting',id,isLoggedIn:true,name,users:{}})
    });

})

module.exports = router