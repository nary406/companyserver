const express = require('express');

const router = express.Router();

const { getAlldevices, getDate, postDB} = require('../controllers/dataController');

router.route('/Alldevices').get(getAlldevices);

router.route('/date').post(getDate);

router.route('/db').post(postDB);

module.exports = router;