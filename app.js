const express = require('express');
const fs = require('fs');

const app = express();

// Middleware to have the request body available on the req object when sending a POST request
app.use(express.json());

// Currently API is stored locally - read data here
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/tours-simple.json`)
);

/************************************************* ROUTE HANDLERS ********************************************************/
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    numberOfResults: tours.length,
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

app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

/********************************************************** SERVER  **************************************************************/
const port = 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
