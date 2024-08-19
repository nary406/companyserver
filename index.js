const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const expressApp = express();
const PORT = process.env.PORT || 1337;

expressApp.use(express.json());

const allowedOrigins = ['https://newdashboard.re4billion.ai', 'http://localhost:3000'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

expressApp.use(cors(corsOptions));

expressApp.options('*', cors(corsOptions));

expressApp.use('/', require('./routes/userRoutes'));
expressApp.use('/admin', require('./routes/dataRoutes'));

expressApp.use(errorHandler);

expressApp.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
