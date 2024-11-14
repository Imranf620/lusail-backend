import {
  ForgetPassword,
  GetallUsers,
  Login,
  Logout,
  MyProfile,
  Signup,
  UpdatePassword,
  UpdateProfile,
  VerifyOTP,
} from '../Controller/UserController.js';
import { isUserLoggedIn, isAuthenticated } from '../utils/Auth.js';
import express from 'express';

const Router = express.Router();

Router.post('/signup', Signup);
Router.post('/login', Login);
Router.get('/users', isUserLoggedIn, isAuthenticated('admin'), GetallUsers);
Router.get('/profile', isUserLoggedIn, MyProfile);
Router.get('/logout', isUserLoggedIn, Logout);
Router.put('/updateProfile', isUserLoggedIn, UpdateProfile);
Router.put('/updatePassword', isUserLoggedIn, UpdatePassword);
Router.post('/forgetPassword', ForgetPassword);
Router.post('/verifyOTP', VerifyOTP);

export default Router;
