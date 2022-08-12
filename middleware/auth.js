const jwt = require('jwt-then');

module.exports = (req, res, next) => {
    // try {
    //     const token = req.headers.authorization.split(' ')[1];
    //     const decodedToken = jwt.verify(token, process.env.SECRET);
    //     const userId = decodedToken.userId;
    //     if (req.body.userId && req.body.userId !== userId) {
    //         throw 'Invalid user ID';
    //     } else {
    //         next();
    //     }
    // } catch {
    //     res.status(401).json({
    //         error: new Error('Invalid request!')
    //     });
    // }
    if(req.session.user){
        next();     //If session exists, proceed to page
    } else {
        console.log("Not logged in!")
        var err = new Error("Not logged in!");
        //next(err);  //Error, trying to access unauthorized page!
        res.redirect('/');
    }
};

