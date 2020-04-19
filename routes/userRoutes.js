const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// eslint-disable-next-line prettier/prettier
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

// eslint-disable-next-line prettier/prettier
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
