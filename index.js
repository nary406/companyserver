const express = require('express');

const cors = require('cors');

const errorHandler = require('./middlewares/errorHandler')

const expressApp = express();

const PORT = process.env.PORT || 1337;

expressApp.use(express.json());

expressApp.use(function (req, res, next) {

  res.header('Access-Control-Allow-Origin', ["https://re4-drab.vercel.app","http://localhost:1337"]);
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});

expressApp.use(cors({
  origin: ['https://re4-drab.vercel.app', 'http://localhost:1337'],
  credentials: true
}));

expressApp.use('/', require('./routes/userRoutes'));

expressApp.use('/admin', require('./routes/dataRoutes'));

expressApp.use(errorHandler);
expressApp.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});