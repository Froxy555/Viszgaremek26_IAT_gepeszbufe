import mongoose from "mongoose";

// véletlen, egyszeri kód generálása a rendeléshez
function generateRandomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// rendelés séma létrehozása
const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        default: "Felvettük rendelésed"
    },
    note: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: () => new Date(),
        required: true
    },
    payment: {
        type: Boolean,
        default: false
    },
    randomCode: {
        type: String,
        required: true,
        unique: true,
        default: generateRandomCode
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// dátum formázása magyar formátumban
orderSchema.virtual('formattedDate').get(function () {
    if (!this.date) return '';

    try {
        return this.date.toLocaleString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('Dátum formázási hiba:', error);
        return '';
    }
});

// egyedi rendelési kód biztosítása mentés előtt
orderSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('randomCode')) {
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            const existingOrder = await mongoose.models.order.findOne({ randomCode: this.randomCode });
            if (!existingOrder) {
                isUnique = true;
            } else {
                this.randomCode = generateRandomCode();
                attempts++;
            }
        }

        if (!isUnique) {
            return next(new Error('Nem tudott egyedi véletlenszerű kódot generálni több kísérlet után'));
        }
    }
    next();
});

orderSchema.index({ randomCode: 1 }, { unique: true });

// rendelés modell létrehozása
const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
