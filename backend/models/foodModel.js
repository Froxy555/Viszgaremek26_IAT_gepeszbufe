import mongoose from "mongoose";

// étel séma létrehozása
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    available: { type: Boolean, default: true },
    rating: { type: Number, default: 5, min: 0, max: 5 }
})

// étel modell létrehozása
const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;