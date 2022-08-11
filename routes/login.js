const express = require("express")
const router = express.Router()

router.get("/",(req, res) => {
    res.status(200).render('login', {'title':'Login',isLoggedIn:false})
})

module.exports = router