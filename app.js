const express = require("express");
var exphbs  = require('express-handlebars');
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const bcrypt= require("bcrypt")
const jwt = require("jwt-then")
var session = require('express-session');

const contactRouter = require("./routes/contact")
const chattingRouter = require("./routes/chatting")
const loginRouter = require("./routes/login")
const signupRouter = require("./routes/signup")

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

app.use('/contact',contactRouter);
app.use('/chatting',chattingRouter);
app.use('/signup',signupRouter);
app.use('/',loginRouter);



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
        res.status(200)
        res.redirect('/');
    }
}




app.post('/login', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.render('login', {message: "Please enter both username and password"});
    } else {
        const {username, password} = req.body;
        User.findOne({username}).then(async usr => {
            const isMatch = await bcrypt.compare(password, usr.password);
            if (!isMatch){
                res.status(400);
                res.render('login', {message: "Incorrect username or password"});
            }
            const payload = {
                user: {
                    id: usr.id
                }
            };

            await jwt.sign(
                payload,
                process.env.SECRET,
                {
                    expiresIn: 3600
                },
                (err, token) => {
                    if (err) throw err;
                    console.log("Token Generated",token)
                    res.status(200).header("Authorization", "Bearer " + token).json({});
                }
            );

            req.session.user = usr;
            res.redirect('/chatting');


        }).catch(err => {
             res.status(400);
             res.render("/login",{message: "User Not Exist"})
        })

    }
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/');
});


app.listen(3000, () => {
    console.log('The web server has started on port 3000');
});