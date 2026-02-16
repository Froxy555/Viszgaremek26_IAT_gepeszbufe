import express from 'express';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';
import multer from 'multer';
const foodRouter = express.Router();

// kép tárolás beállítása
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage })

// ételek listázása
foodRouter.get("/list", listFood);

// étel hozzáadása
foodRouter.post("/add", upload.single('image'), addFood);

// étel törlése
foodRouter.post("/remove", removeFood);

// étel frissítése
foodRouter.post("/update", upload.single('image'), updateFood);

export default foodRouter;