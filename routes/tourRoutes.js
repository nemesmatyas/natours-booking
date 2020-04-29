const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

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
