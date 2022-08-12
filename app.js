
const express = require("express");
var exphbs  = require('express-handlebars');
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const bcrypt= require("bcrypt")
const jwt = require("jwt-then")
var session = require('express-session');
const http = require("http")
const socketio = require('socket.io')

var helpers = require('handlebars-helpers')();

const contactRouter = require("./routes/contact")
const chattingRouter = require("./routes/chatting")
const loginRouter = require("./routes/login")
const signupRouter = require("./routes/signup")
const usersRouter = require("./routes/users")
const profileRouter = require("./routes/profile")
const logoutRouter = require("./routes/logout")

const app = express();
require('dotenv').config()
const server = http.createServer(app)
const io = socketio(server)

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

var hbs = exphbs.create({
    helpers: helpers
});


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

app.use('/users',usersRouter);
app.use('/profile',profileRouter);
app.use('/contact',contactRouter);
app.use('/chatting',chattingRouter);
app.use('/signup',signupRouter);
app.use('/',loginRouter);
app.use('/logout',logoutRouter);




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

// io.attach(server, {
//     // includes local domain to avoid CORS error locally
//     // configure it accordingly for production
//     cors: {
//         origin: 'http://localhost',
//         methods: ['GET', 'POST'],
//         credentials: true,
//         transports: ['websocket', 'polling'],
//     },
//     allowEIO3: true,
// })

io.on('connection', (socket) => {
    //console.log('👾 New socket connected! >>', socket.id)
    socket.on('chat', message => {
        console.log('From client: ', message)
    })
})


server.listen(3000, () => {
    console.log('The web server has started on port 3000');
});



