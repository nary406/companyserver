const { constants } = require('../constants/statusCode');
const errorHandler = require('../middlewares/errorHandler');
const connect = require('../config/mongoDBconfig');
const Admin = require('../models/userDetails')
const jwt = require('jsonwebtoken');

const JWT_SECRET = "supersecret";

const getOne = (req, res) => {
    res.status(200).json({ message: "Hello" });
};

//@params selectedItem, Date
//@POST request
const getUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        await connect();
        const user = await Admin.findOne({ email: email });
        if (!user) {
            res.status(404);
            return next({ message: "Not Found" });
        }

        if (password !== user.password) {
            res.status(401);
            return next({ message: "Password is incorrect" });
        }

        const token = jwt.sign({ email: user.email, role: user.role, location: user.location }, JWT_SECRET);
        const location = user.location;
        const role = user.role;
        res.status(200).json({ message: "Login successful", data: { token, role, location }});
    } catch (err) {
        res.status(500);
        next(err);
    }
};

//@params email, password, role
//@POST request

module.exports = { getOne, getUser };