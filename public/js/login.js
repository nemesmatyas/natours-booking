/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (result.data.status === 'success') {
      showAlert(
        'success',
        'Login successful! You will be redirected shortly...'
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Incorrect username or password');
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/users/logout',
    });

    if (result.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error logging out');
  }
};
