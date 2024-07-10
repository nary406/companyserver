const express = require('express');

const cors = require('cors');

const errorHandler = require('./middlewares/errorHandler')

const expressApp = express();

const PORT = process.env.PORT || 1337;

expressApp.use(express.json());

expressApp.use(cors({
  origin: 'https://newdashboard.re4billion.ai',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

expressApp.use('/', require('./routes/userRoutes'));

expressApp.use('/admin', require('./routes/dataRoutes'));

expressApp.use(errorHandler);
expressApp.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});