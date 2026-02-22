import express from "express";
import { generateChatResponse } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/", generateChatResponse);

export default chatRouter;
