import express from 'express';
import { loginUser, registerUser, getProfile, updateProfile, listUsers, sendOtp, googleLogin, deleteUser, sendPasswordResetOtp, resetPassword } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
const userRouter = express.Router();

// regisztráció
userRouter.post("/register", registerUser);

// email validációs kód
userRouter.post("/send-otp", sendOtp);

// google hitelesítés (oauth)
userRouter.post("/google", googleLogin);

// bejelentkezés
userRouter.post("/login", loginUser);

// elfelejtett jelszó
userRouter.post("/forgot-password", sendPasswordResetOtp);
userRouter.post("/reset-password", resetPassword);

// profil adatok lekérése
userRouter.get("/profile", authMiddleware, getProfile);

// profil frissítése
userRouter.post("/update-profile", authMiddleware, updateProfile);

// felhasználók listázása
userRouter.get("/list", listUsers);

// felhasználó törlése
userRouter.post("/remove", deleteUser);

export default userRouter;
