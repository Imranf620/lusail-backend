import { Signup } from '../Controller/UserController.js';
import express from 'express';

const Router = express.Router();

Router.post('/signup', Signup);

export default Router;
