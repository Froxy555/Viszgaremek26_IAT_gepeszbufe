import foodModel from "../models/foodModel.js";
import fs from 'fs'

// osszes kaja listazasa
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// kaja hozzaadasa
const addFood = async (req, res) => {

    try {
        let image_filename = `${req.file.filename}`

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
            rating: req.body.rating || 5 
        })

        await food.save();
        res.json({ success: true, message: "Termék hozzáadva" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Hiba" })
    }
}

// kaja eltavolitasa
const removeFood = async (req, res) => {
    try {

        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => { })

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Termék eltávolítva" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// kaja frissitese
const updateFood = async (req, res) => {
    try {
        const { id, name, description, price, category, available, rating } = req.body;

        let updateData = {
            name,
            description,
            price,
            category,
            available: available === 'true' || available === true,
            rating: rating ? Number(rating) : undefined
        };

        if (req.file) {
            // fenykep csereje regirol ujra
            const food = await foodModel.findById(id);
            if (food && food.image) {
                fs.unlink(`uploads/${food.image}`, () => { });
            }
            updateData.image = req.file.filename;
        }

        await foodModel.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Termék frissítve" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Hiba a termék frissítésekor" });
    }
}

export { listFood, addFood, removeFood, updateFood }