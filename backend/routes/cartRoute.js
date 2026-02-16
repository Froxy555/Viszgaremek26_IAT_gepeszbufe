import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController.js';
import authMiddleware from '../middleware/auth.js';

const cartRouter = express.Router();

// kosár lekérése
cartRouter.post("/get", authMiddleware, getCart);

// tétel hozzáadása a kosárhoz
cartRouter.post("/add", authMiddleware, addToCart);

// tétel törlése a kosárból
cartRouter.post("/remove", authMiddleware, removeFromCart);

export default cartRouter;

