const debug = require("debug")("vidly:auth");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const { User } = require("../models/users");
const isLoggedIn = require("../middleware/isLoggedIn");
const asyncHandler = require("../middleware/asyncHandler");

router.post("/", isLoggedIn, asyncHandler(async (req, res, next) => {
    
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    // check if user exists
    const user = await User.findOne({email: req.body.email}).catch(e => next(e));
    if(!user) return res.status(400).send("Invalid email or password.");
    
    // check if password matched        
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send("Invalid email or password.");
    
    const token = user.generateToken();
    res.header("x-auth-token", token).send(true);
    
}));

function validate(user) {
    const schema = {
        email: Joi.string().email(),
        password: Joi.string().min(3).max(30).required()
    };
    
    return Joi.validate(user, schema);
}

module.exports = router;
