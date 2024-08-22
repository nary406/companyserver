const express = require('express');

const router = express.Router();

const { getAlldevices, getDate, postDB, getValDate} = require('../controllers/dataController');

router.route('/alldevices').get(getAlldevices);

router.route('/date').post(getDate);

router.route('/db').post(postDB);

router.route('/val').post(getValDate);

module.exports = router;