const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

/************************************************ MIDDLEWARES **********************************************************/
// Morgan - logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// JSON body parser middleware to have the request body available on the req object when sending a POST request
app.use(express.json());

app.use(express.static('./public'));

/***************************************************** ROUTES *******************************************************/

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
