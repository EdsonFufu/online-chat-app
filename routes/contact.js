const express = require("express")
const auth = require('../middleware/auth');
const contactRouter = express.Router()

contactRouter.get('/',auth,(req,res) => {
    res.status(200).render('contact',{'title':'Contacts',id: req.session.user.id,isLoggedIn:true})
})

module.exports = contactRouter