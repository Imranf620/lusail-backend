// messageRoute.js
import express from "express";
import {
  sendMessage,
  getMessages,
  getNotifications,
  clearNotifications,
  getInbox,
} from "../Controller/MessageController.js"; // Import message controller
import { isUserLoggedIn } from "../utils/Auth.js";

// Create the Router
const Router = express.Router();

// Route for sending a message
Router.post("/sendmessage", isUserLoggedIn, (req, res) =>
  sendMessage(req, res, req.app.get("io"))
); // Pass io to sendMessage

// Route for getting messages between two users
Router.get("/messages", isUserLoggedIn, getMessages);
Router.get("/notifications", isUserLoggedIn, getNotifications);
Router.post("/clear-notifications", isUserLoggedIn, clearNotifications);
Router.get("/inbox-chats", isUserLoggedIn, getInbox);

export default Router;
