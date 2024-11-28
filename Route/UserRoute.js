import {
  DeleteOwnProfile,
  DeleteUserProfile,
  ForgetPassword,
  GetallUsers,
  GetSingleUser,
  Login,
  Logout,
  MyProfile,
  resendOTP, // remove nesxt -----------------
  ResetPassword,
  Signup,
  UpdatePassword,
  UpdateProfile,
  UpdateUserProfile,
  VerifyOTP,
  verifyUser,
} from '../Controller/UserController.js';
import { isUserLoggedIn, isAuthenticated } from '../utils/Auth.js';
import express from 'express';

const Router = express.Router();

Router.post('/signup', Signup);
Router.post('/verify-otp',verifyUser);
Router.post('/resend-otp',resendOTP);
Router.post('/login', Login);
Router.get(
  '/users',
  isUserLoggedIn,
  isAuthenticated(['admin', 'seller']),
  GetallUsers
);
Router.get('/profile', isUserLoggedIn, MyProfile);
Router.get('/logout', isUserLoggedIn, Logout);
Router.put('/updateProfile', isUserLoggedIn, UpdateProfile);
Router.put('/updatePassword', isUserLoggedIn, UpdatePassword);
Router.post('/forgetPassword', ForgetPassword);
Router.post('/verifyOTP', VerifyOTP);
Router.put('/resetPassword', ResetPassword);
Router.get(
  '/user/:id',
  isUserLoggedIn,
  isAuthenticated('admin'),
  GetSingleUser
);
Router.delete('/delete', isUserLoggedIn, DeleteOwnProfile);
Router.delete(
  '/deleteuser/:id',
  isUserLoggedIn,
  isAuthenticated('admin'),
  DeleteUserProfile
);
Router.post(
  '/updateuser/:id',
  isUserLoggedIn,
  isAuthenticated('admin'),
  UpdateUserProfile
);

export default Router;
