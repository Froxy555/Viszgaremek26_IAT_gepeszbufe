// szükséges modulok importálása
import express from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"

// alkalmazás konfigurációja
const app = express()
const port = process.env.PORT || 4000;


// middleware-ek beállítása
app.use(express.json({ limit: '5mb' })) // JSON feldolgozás
app.use(cors({ // CORS beállítások a frontend és admin eléréshez
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://gepeszbufe-frontend.onrender.com",
    "https://gepeszbufe-admin.onrender.com"
  ],
  credentials: true
}));

app.options('*', cors());

// adatbázis kapcsolat létrehozása
connectDB()

// api végpontok definiálása
app.use("/api/user", userRouter) // felhasználói műveletek
app.use("/api/food", foodRouter) // étel műveletek
app.use("/images", express.static('uploads')) // statikus képfájlok kiszolgálása
app.use("/api/cart", cartRouter) // kosár műveletek
app.use("/api/order", orderRouter) // rendelés műveletek

app.get("/", (req, res) => {
  res.send("API Working")
});

// szerver indítása
app.listen(port, () => console.log(`Server started on http://localhost:${port}`))
