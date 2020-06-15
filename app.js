const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving media assets as static files
app.use(express.static(path.join(__dirname, 'public')));

/************************************************ MIDDLEWARES **********************************************************/
// Morgan - logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Helmet - setting security HTTP headers
app.use(helmet());

// Rate limiter - limit the number of requests coming from an IP address in a given time period to prevent DDOS attacks
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // one hour
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// JSON body parser middleware to have the request body available on the req object when sending a POST request
app.use(express.json({ limit: '10kb' }));

// Parse the data from the incoming cookie
app.use(cookieParser());

// Data sanitization - defend against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization - defend against cross-site scripting attacks (XSS)
app.use(xss());

// Prevent parameter pollution - clears up the query string from duplicate fields
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

/***************************************************** ROUTES *******************************************************/

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

module.exports = app;
