// messageRoute.js
import express from 'express';
import { sendMessage, getMessages } from '../Controller/MessageController.js'; // Import message controller
import { isUserLoggedIn } from '../utils/Auth.js';
const Router = express.Router();

// Route for sending a message
Router.post('/sendmessage', sendMessage);

// Route for getting messages between two users
Router.get('/messages', isUserLoggedIn, getMessages);

export default Router;
