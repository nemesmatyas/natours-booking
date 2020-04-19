const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

/************************************************ MIDDLEWARES **********************************************************/
// Morgan - logging middleware
app.use(morgan('dev'));

// JSON body parser middleware to have the request body available on the req object when sending a POST request
app.use(express.json());

// Add timestamp to request object
app.use((req, res, next) => {
  req.requestTimestamp = new Date().toISOString();
  console.log(req.requestTimestamp);
  next();
});

// Currently API is stored locally - read data here
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/tours-simple.json`)
);

/************************************************* ROUTE HANDLERS ********************************************************/
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    numberOfResults: tours.length,
    requestedAt: req.requestTimestamp,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const paramID = parseInt(req.params.id);
  const tour = tours.find(el => paramID === el.id);
  console.log(tours.length);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: "The required tour ID doesn't exist",
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  const newTour = { id: newID, ...req.body };

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );

  res.send('Processing complete');
};

const updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

/***************************************************** ROUTES *******************************************************/
const tourRouter = express.Router();
const userRouter = express.Router();
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

tourRouter
  .route('/')
  .get(getAllTours)
  .post(createTour);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

/********************************************************** SERVER  **************************************************************/
const port = 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
