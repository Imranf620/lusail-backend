import { Login, Signup } from '../Controller/UserController.js';
import express from 'express';

const Router = express.Router();

Router.post('/signup', Signup);
Router.post('/login', Login);

export default Router;
