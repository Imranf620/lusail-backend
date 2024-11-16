import express from 'express';
import { isUserLoggedIn, isAuthenticated } from '../utils/Auth.js';
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  statusUpdate,
} from '../Controller/OrderController.js';

const Router = express.Router();

Router.post('/createOrder/:id', isUserLoggedIn, createOrder);
Router.put(
  '/updateStatus/:id',
  isUserLoggedIn,
  isAuthenticated('admin'),
  statusUpdate
);
Router.delete(
  '/deleteOrder/:id',
  isUserLoggedIn,
  isAuthenticated('admin'),
  deleteOrder
);
Router.get(
  '/getAllOrders',
  isUserLoggedIn,
  isAuthenticated('admin'),
  getAllOrders
);

export default Router;