const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

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
