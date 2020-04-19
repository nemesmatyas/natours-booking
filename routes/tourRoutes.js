const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// Param middleware that only runs when we hid the /:id route
router.param('id', (req, res, next, val) => {
  console.log(`Tour ID is: ${val}`);
  next();
});

// eslint-disable-next-line prettier/prettier
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

// eslint-disable-next-line prettier/prettier
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
