import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
    listOrders,
    placeOrder,
    updateStatus,
    userOrders,
    verifyOrder,
    placeOrderCod,
    getOrderById
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// JSON feldolgozás middleware
orderRouter.use(express.json());
orderRouter.use(express.urlencoded({ extended: true }));

// összes rendelés listázása (admin funkció)
orderRouter.get("/list", listOrders);

// egyedi rendelés lekérése ID alapján (jelenlegi felhasznalo)
orderRouter.get("/:id", authMiddleware, getOrderById);

// felhasználó saját rendeléseinek lekérése
orderRouter.post("/userorders", authMiddleware, userOrders);

// új rendelés leadása (Stripe fizetés)
orderRouter.post("/place", authMiddleware, placeOrder);

// rendelés státuszának frissítése
orderRouter.post("/status", updateStatus);

// rendelés fizetésének ellenőrzése
orderRouter.post("/verify", verifyOrder);

// új rendelés leadása (Utánvétes fizetés)
orderRouter.post("/placecod", authMiddleware, placeOrderCod);

export default orderRouter;