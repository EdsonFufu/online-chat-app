const express = require("express")
const router = express.Router()

router.get('/', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/');
});

module.exports = router