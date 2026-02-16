import mongoose from "mongoose";

// felhasználó séma létrehozása
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    cartData: { type: Object, default: {} }
}, { minimize: false })

// felhasználó modell létrehozása
const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;