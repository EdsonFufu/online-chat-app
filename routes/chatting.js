const express = require("express")
const auth = require("../middleware/auth")
const router = express.Router()

router.get("/",auth,(req, res) => {
    console.log(req.session)
    res.status(200).render('chatting', {'title':'Chatting',id: req.session.user.id,isLoggedIn:true})
})

module.exports = router