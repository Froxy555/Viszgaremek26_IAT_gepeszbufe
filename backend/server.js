// szükséges modulok importálása
import express from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import chatRouter from "./routes/chatRoute.js"
import { createServer } from "http"
import { Server } from "socket.io"

// alkalmazás konfigurációja
const app = express()
const port = process.env.PORT || 4000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://gepeszbufe-frontend.onrender.com",
      "https://gepeszbufe-admin.onrender.com"
    ],
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

io.on('connection', (socket) => {
  console.log('A user connected via socket:', socket.id);

  // You could have users join rooms based on their user ID or admin status
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


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
app.use("/api/chat", chatRouter) // mesterséges intelligencia chat

app.get("/", (req, res) => {
  res.send("API Working")
});

// szerver indítása
server.listen(port, () => console.log(`Server started on http://localhost:${port}`))
