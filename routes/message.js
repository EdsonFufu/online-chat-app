const express = require("express")
const auth = require("../middleware/auth")
const router = express.Router()
const Message = require("../model/Message")


router.get("/" ,auth, (req,res) => {
    id = req.session.user._id
    Message.find({ $or: [{ from_id: id }, { to_id: id }] }).lean().then(messages => {
        res.json(messages)
    }).catch(err => {
        console.log(err)
        console.log("Error on Fetching Messages")
    })

})

router.post("/" ,auth, (req,res) => {
    console.log("Request Body Message to Post",req.body)

    const message = new Message({
        from_id:req.body.from_id,
        to_id:req.body.to_id,
        from:req.body.from,
        to:req.body.to,
        message:req.body.message,
        createdDate:req.body.createdDate
    })
    console.log("Prepared Message to Post",message)

    message.save().then(message => {
        res.json(message)
    }).catch(err => {
        console.log(err)
        console.log("Error on Posting Message")
    })
})

module.exports = router
