import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const currency = "huf";

const frontend_URL =
    process.env.NODE_ENV === "production"
        ? "https://gepeszbufe-frontend.onrender.com"
        : "http://localhost:5173";

// rendeles leadasa (stripe fizetessel)
const placeOrder = async (req, res) => {
    try {
        // uj rendeles letrehozasa az adatbazisban
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            note: req.body.note,
            date: new Date(),
        });

        const savedOrder = await newOrder.save();

        // kosar uritese a rendeles utan (csak regisztralt felhasznaloknal)
        if (req.body.userId && !req.body.userId.toString().startsWith("guest_")) {
            await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

            // felhasznaloi adatok frissitese (telefonszam, nev) ha meg lett adva
            const updates = {};
            if (req.body.address.phone) updates.phone = req.body.address.phone;
            if (req.body.address.firstName && req.body.address.lastName) {
                updates.name = `${req.body.address.lastName} ${req.body.address.firstName}`;
            } else if (req.body.address.firstName) {
                updates.name = req.body.address.firstName;
            }

            if (Object.keys(updates).length > 0) {
                await userModel.findByIdAndUpdate(req.body.userId, updates);
            }
        }

        // stripe tetelek osszeallitasa
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));



        // stripe session letrehozasa
        const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?success=true&orderId=${savedOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${savedOrder._id}`,
            line_items: line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url, randomCode: savedOrder.randomCode });

    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ success: false, message: "Hiba a rendelés leadásakor", error: error.message });
    }
};

// rendeles leadasa (utanvetes fizetessel)
const placeOrderCod = async (req, res) => {
    try {
        // adatok kinyerese a keresbol
        const userId = req.body.userId || null;
        const items = req.body.items || [];
        const amount = req.body.amount || 0;
        const address = req.body.address || {};
        const noteText = req.body.note || "";

        // rendeles letrehozasa az adatbazisban
        const newOrder = new orderModel({
            userId,
            items,
            amount,
            address,
            note: noteText,
            payment: true,
            date: new Date(),
            status: "Feldolgozás alatt"
        });

        // rendeles mentese
        let savedOrder;
        try {
            savedOrder = await newOrder.save();
        } catch (saveError) {
            console.error("Database save error:", saveError);
            throw saveError;
        }

        // kosar uritese sikeres rendeles utan
        try {
            if (userId && !userId.toString().startsWith("guest_")) {
                await userModel.findByIdAndUpdate(userId, { cartData: {} });

                // profil frissitese a megadott adatokkal
                const updates = {};
                if (address.phone) updates.phone = address.phone;
                if (address.firstName && address.lastName) {
                    updates.name = `${address.lastName} ${address.firstName}`;
                } else if (address.firstName) {
                    updates.name = address.firstName;
                }

                if (Object.keys(updates).length > 0) {
                    await userModel.findByIdAndUpdate(userId, updates);
                }
            }
        } catch (cartError) {
            console.warn("Warning: Failed to clear user cart:", cartError.message);
        }

        // valasz kuldese
        res.json({
            success: true,
            message: "Rendelés elküldve",
            randomCode: savedOrder.randomCode,
            orderId: savedOrder._id
        });

    } catch (error) {
        console.error('Place COD order error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: "Hiba a rendelés leadásakor",
            error: error.message
        });
    }
};

// osszes rendeles listazasa
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .sort({ date: -1 })
            .lean();

        res.json({
            success: true,
            data: orders.map(order => ({
                ...order,
                formattedDate: new Date(order.date).toLocaleString('hu-HU'),
                randomCode: order.randomCode
            }))
        });
    } catch (error) {
        console.error('List orders error:', error);
        res.status(500).json({ success: false, message: "Hiba a rendelések lekérésekor", error: error.message });
    }
};

// felhasznalo rendelesei
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ userId: req.body.userId })
            .sort({ date: -1 })
            .lean();

        res.json({
            success: true,
            data: orders.map(order => ({
                ...order,
                formattedDate: new Date(order.date).toLocaleString('hu-HU'),
                randomCode: order.randomCode
            }))
        });
    } catch (error) {
        console.error('User orders error:', error);
        res.status(500).json({ success: false, message: "Hiba a rendelések lekérésekor", error: error.message });
    }
};

// statusz frissitese
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        console.log('Updating order:', { orderId, status });

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedOrder) {
            console.log('Order not found:', orderId);
            return res.status(404).json({ success: false, message: "Rendelés nem található" });
        }

        console.log('Order updated successfully:', updatedOrder);
        res.json({ success: true, message: "Állapot frissítve", order: updatedOrder });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: "Hiba történt az állapot frissítésekor", error: error.message });
    }
};

// rendeles ellenorzese (sikeres fizetes eseten statusz valtoztatas)
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            // ha sikeres a fizetes, payment statusz true-ra allitasa
            const updatedOrder = await orderModel.findByIdAndUpdate(
                orderId,
                {
                    payment: true,
                },
                { new: true }
            );

            if (!updatedOrder) {
                return res.status(404).json({ success: false, message: "Rendelés nem található" });
            }

            res.json({ success: true, message: "Fizetve", randomCode: updatedOrder.randomCode });
        } else {
            // ha sikertelen, rendeles torlese
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Sikertelen fizetés" });
        }
    } catch (error) {
        console.error('Verify order error:', error);
        res.status(500).json({ success: false, message: "Hiba a rendelés ellenőrzésekor", error: error.message });
    }
};

// rendeles lekerese id alapjan
const getOrderById = async (req, res) => {
    const { id } = req.params;
    const userId = req.body.userId; // authMiddleware sets this from token

    try {
        const order = await orderModel.findById(id).lean();
        if (!order) {
            return res.status(404).json({ success: false, message: "Rendelés nem található" });
        }

        // Optional user check – if nem egyezik, 403-at adunk vissza
        if (userId && order.userId && order.userId.toString() !== String(userId)) {
            return res.status(403).json({ success: false, message: "Nincs jogosultsága megtekinteni ezt a rendelést" });
        }

        const formattedDate = new Date(order.date).toLocaleString('hu-HU');

        res.json({
            success: true,
            data: {
                ...order,
                formattedDate,
                randomCode: order.randomCode
            }
        });
    } catch (error) {
        console.error('Get order by id error:', error);
        res.status(500).json({ success: false, message: "Hiba a rendelés lekérésekor", error: error.message });
    }
};

// Statisztikák lekérése az admin dashboardhoz
const getStats = async (req, res) => {
    try {
        const orders = await orderModel.find({});

        // 1. Összes bevétel és rendelési szám
        let totalRevenue = 0;
        let totalOrders = orders.length;

        // 2. Értékesítés napokra lebontva (utolsó 7 nap)
        const salesPerDay = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            salesPerDay[dateString] = 0;
        }

        // 3. Top termékek
        const productSales = {};

        orders.forEach(order => {
            if (order.payment) {
                totalRevenue += order.amount;

                const orderDate = new Date(order.date).toISOString().split('T')[0];
                if (salesPerDay[orderDate] !== undefined) {
                    salesPerDay[orderDate] += order.amount;
                }

                order.items.forEach(item => {
                    if (productSales[item.name]) {
                        productSales[item.name] += item.quantity;
                    } else {
                        productSales[item.name] = item.quantity;
                    }
                });
            }
        });

        // Top 5 termék sorbarendezése
        const topProducts = Object.keys(productSales)
            .map(name => ({ name, count: productSales[name] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            success: true,
            totalRevenue,
            totalOrders,
            salesData: {
                labels: Object.keys(salesPerDay),
                data: Object.values(salesPerDay)
            },
            topProducts
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: "Hiba a statisztikák lekérésekor", error: error.message });
    }
};

export {
    placeOrder,
    listOrders,
    userOrders,
    updateStatus,
    verifyOrder,
    placeOrderCod,
    getOrderById,
    getStats
};
