const express = require("express")
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jwt-then");
const router = express.Router()

router.get("/",(req,res) =>{
    res.status(200).render("signup",{isLoggedIn:false})
})



router.post('/', async function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.status("400");
        res.render("signup", {"message": "Invalid details!"});
    } else {

        User.find({}, {"username": req.body.username}).then(usr => {
            console.log("Fetched user", usr)
            if (usr.username === req.body.username) {
                res.render('signup', {
                    message: "User Already Exists! Login or choose another user id"
                });
            }
        }).catch(err => {
            console.error(err);
            res.render("signup", {"message": "Sign Up Failed"})
        })
        const salt = await bcrypt.genSalt(10)
        var newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, salt)
        });

        newUser.save().then(user => {
            const payload = {
                user: {
                    id: user._id
                }
            };

            jwt.sign(
                payload,
                "randomString", {
                    expiresIn: 10000
                },
                token => {
                    res.status(200).header("Authorization","Bearer " + token).json({});
                }
            );

            req.session.user = newUser;
            res.redirect('/chatting');

        }).catch(err => {
            console.error(err);
            res.render("signup", {"message": "Sign Up Failed"})
        })
    }
});


module.exports = router