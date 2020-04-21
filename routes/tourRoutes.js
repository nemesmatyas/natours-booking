const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// eslint-disable-next-line prettier/prettier
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

// eslint-disable-next-line prettier/prettier
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
