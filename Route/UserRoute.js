import {
  DeleteOwnProfile,
  DeleteUserProfile,
  ForgetPassword,
  GetallUsers,
  GetSingleUser,
  Login,
  Logout,
  MyProfile,
  ResetPassword,
  Signup,
  UpdatePassword,
  UpdateProfile,
  UpdateUserProfile,
  UpdateUserRole,
  VerifyOTP,
} from '../Controller/UserController.js';
import { isUserLoggedIn, isAuthenticated } from '../utils/Auth.js';
import express from 'express';

const Router = express.Router();

Router.post('/signup', Signup);
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
Router.put('/resetPassword/:token', ResetPassword);
Router.put(
  '/updateuserrole/:id',
  isUserLoggedIn,
  isAuthenticated('admin'),
  UpdateUserRole
);
Router.post(
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
