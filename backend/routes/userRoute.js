import express from 'express';
import { loginUser, registerUser, getProfile, updateProfile, listUsers } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
const userRouter = express.Router();

// regisztráció
userRouter.post("/register", registerUser);

// bejelentkezés
userRouter.post("/login", loginUser);

// profil adatok lekérése
userRouter.get("/profile", authMiddleware, getProfile);

// profil frissítése
userRouter.post("/update-profile", authMiddleware, updateProfile);

// felhasználók listázása
userRouter.get("/list", listUsers);

export default userRouter;
