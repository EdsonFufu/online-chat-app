const express = require("express")
const auth = require("../middleware/auth")
const router = express.Router()
const User = require("../model/User")
const chunks = require("chunk")

router.get("/",auth,(req,res) => {
    User.find({}).lean().then(usersBeforeChunck => {
        const users = chunks(usersBeforeChunck, 3)
        res.status(200).render("users",{title:"Users",id:req.session.user._id,isLoggedIn:true,users})
    })

})

module.exports = router