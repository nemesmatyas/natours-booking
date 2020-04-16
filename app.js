const express = require('express');
const fs = require('fs');

const app = express();

// Middleware to have the request body available on the req object when sending a POST request
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/tours-simple.json`)
);
// ROUTE HANDLER
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    numberOfResults: tours.length,
    data: {
      tours,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
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
});

const port = 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
