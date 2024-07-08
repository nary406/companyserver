const express = require('express');

const router = express.Router();

const { getOne, getUser } = require('../controllers/userController');

router.route('/').get(getOne);

router.route('/login').post(getUser);

module.exports = router;