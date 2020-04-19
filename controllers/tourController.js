const fs = require('fs');

// Currently API is stored locally - read data here
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/tours-simple.json`)
);

/************************************************* ROUTE HANDLERS ********************************************************/
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    numberOfResults: tours.length,
    requestedAt: req.requestTimestamp,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const paramID = parseInt(req.params.id, 10);
  const tour = tours.find((el) => paramID === el.id);

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

exports.createTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  const newTour = { id: newID, ...req.body };

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
