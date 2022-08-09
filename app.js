const express = require("express");
var exphbs  = require('express-handlebars');
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const bcrypt= require("bcrypt")
const jwt = require("jwt-then")
var session = require('express-session');

const app = express();
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret :  process.env.SECRET,
    resave :true,
    saveUninitialized: true,
    cookie : {
        maxAge:(1000 * 60 * 100)
    }
}));

var hbs = exphbs.create({ /* config */ });

// Register `hbs.engine` with the Express app.
// app.engine('hbs', hbs.engine);
// app.set('view engine', 'hbs');

app.set('view engine', 'hbs');

// app.engine('hbs', exphbs.engine({extname: '.hbs', defaultLayout: 'main',layoutsDir: __dirname + '/views/layouts'}));

app.engine('hbs', exphbs.engine({
    layoutsDir: __dirname + '/views/layouts',
    defaultLayout:"main",
    extname: 'hbs'

}));

app.use(express.static('public'))

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.DB_HOST,{ useNewUrlParser: true });
var db = mongoose.connection;
db.once('open', function() {
    console.log("Db Connected Successfully");
});
db.on('error', function(err) {
    console.log(err);
});


const User = require("./model/User")


app.get("/",(req, res, next) => {
    res.render("login",{"title":"Login"})
})

app.get("/signup",(req, res, next) => {
    res.render("signup",{"title":"SignUp"})
})


app.post('/signup', async function (req, res) {
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
        // newUser.save(function (err, doc) {
        //     if (err) {
        //         console.error(err);
        //         res.render("signup", {"message": "Sign Up Failed"})
        //     }
        //     res.render("login", {"message": "Registration successfully Enter your Credentials to Login"})
        // });

        newUser.save().then((err,usr) => {
            if (err) {
                console.error(err);
                res.render("signup", {"message": "Sign Up Failed"})
            }
            const payload = {
                user: {
                    id: usr._id
                }
            };

            jwt.sign(
                payload,
                "randomString", {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).header("Authorization","Bearer " + token).json({});
                }
            );

            req.session.user = newUser;
            res.redirect('/chatting');

        })
    }
});

function checkSignIn(req, res,next){
    if(req.session.user){
        next();     //If session exists, proceed to page
    } else {
        var err = new Error("Not logged in!");
        console.log(req.session.user);
        next(err);  //Error, trying to access unauthorized page!
    }
}
app.get('/chatting', checkSignIn, function(req, res){
    res.render('chatting', {id: req.session.user.id})
});




app.post('/login', function(req, res){
    console.log(Users);
    if(!req.body.id || !req.body.password){
        res.render('login', {message: "Please enter both id and password"});
    } else {
        Users.filter(function(user){
            if(user.id === req.body.id && user.password === req.body.password){
                req.session.user = user;
                res.redirect('/protected_page');
            }
        });
        res.render('login', {message: "Invalid credentials!"});
    }
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/login');
});

app.use('/protected_page', function(err, req, res, next){
    console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('/login');
});


app.listen(3000, () => {
    console.log('The web server has started on port 3000');
});