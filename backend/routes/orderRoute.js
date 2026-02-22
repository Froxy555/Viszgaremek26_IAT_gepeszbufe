import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
    listOrders,
    placeOrder,
    updateStatus,
    userOrders,
    verifyOrder,
    placeOrderCod,
    getOrderById,
    getStats,
    deleteOrder
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// JSON feldolgozás middleware
orderRouter.use(express.json());
orderRouter.use(express.urlencoded({ extended: true }));

// Statisztikák lekérése (admin funkció)
orderRouter.get("/stats", getStats);

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

// megrendelés lemondása / törlése (user oldali)
orderRouter.post("/delete", authMiddleware, deleteOrder);

export default orderRouter;