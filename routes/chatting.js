const express = require("express")
const auth = require("../middleware/auth")
const router = express.Router()
const User = require("../model/User")

router.get("/",auth,(req, res) => {
    const id = req.session.user._id
    const name = req.session.user.firstName + " " + req.session.user.lastName
    User.find({'_id':{'$ne':id+''}}).lean().then(users => {
        res.status(200).render('chatting', {'title':'Chatting',id,isLoggedIn:true,name,users})
    }).catch(err => {
        console.log("No other users")
        res.status(200).render('chatting', {'title':'Chatting',id,isLoggedIn:true,name,users:{}})
    });

})

module.exports = router