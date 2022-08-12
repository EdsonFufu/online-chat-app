const express = require("express")
const auth = require("../middleware/auth")
const router = express.Router()

router.get("/",auth,(req,res) => {
    res.status(200).render("profile",{title:"Your Profile",id:req.session.user._id,isLoggedIn:true,data:req.session.user})
})

module.exports = router