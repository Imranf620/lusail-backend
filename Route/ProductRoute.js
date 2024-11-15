import express from 'express';
import {
  createProduct,
  deleteProduct,
  dislikeProduct,
  getAllProducts,
  getSingleProduct,
  likeProduct,
  productViews,
  updateProduct,
} from '../Controller/ProductController.js';
import { isUserLoggedIn, isAuthenticated } from '../utils/Auth.js';

const Router = express.Router();

Router.post(
  '/createProduct',
  isUserLoggedIn,
  isAuthenticated(['admin', 'seller']),
  createProduct
);
Router.get('/getAllProducts', getAllProducts);
Router.get('/singleProduct/:id', getSingleProduct);
Router.put(
  '/updateProduct/:id',
  isUserLoggedIn,
  isAuthenticated(['admin', 'seller']),
  updateProduct
);
Router.delete(
  '/deleteProduct/:id',
  isUserLoggedIn,
  isAuthenticated(['admin', 'seller']),
  deleteProduct
);
Router.put('/likeProduct/:id', isUserLoggedIn, likeProduct);
Router.put('/dislikeProduct/:id', isUserLoggedIn, dislikeProduct);
Router.put('/productViews/:id', productViews);

export default Router;
