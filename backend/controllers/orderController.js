import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const currency = "huf";

const frontend_URL =
    process.env.NODE_ENV === "production"
        ? "https://gepeszbufe-frontend.onrender.com"
        : "http://localhost:5173";

// helper fgv az email kuldesehez rendelese utan
const sendOrderConfirmationEmail = async (order, email) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("Email küldés letiltva (nincs konfigurálva) - rendelés email");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const itemsHtml = order.items.map(item => `<li style="margin-bottom: 5px;"><strong>${item.name}</strong> x ${item.quantity}</li>`).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'GépészBüfé - Sikeres Rendelés! Várjuk érkezésed',
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 2px solid #FF4C24; padding: 25px; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h1 style="color: #FF4C24; margin: 0; font-size: 28px;">Sikeres Rendelés!</h1>
                        <p style="color: #666; font-size: 16px; margin-top: 8px;">A rendelésed sikeresen beérkezett hozzánk.</p>
                    </div>

                    <p style="font-size: 16px;">Szia <strong>${order.address.firstName || ''}</strong>,</p>
                    <p style="font-size: 15px; line-height: 1.5;">Köszönjük, hogy a GépészBüfét választottad! Az alábbiakban összefoglaltuk a rendelésed részleteit.</p>
                    
                    <div style="background-color: #FFF4F2; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #FFDCD4;">
                        <h3 style="margin-top: 0; color: #FF4C24; font-size: 18px; border-bottom: 2px solid #FF4C24; padding-bottom: 10px; display: inline-block;">Rendelés Összesítő</h3>
                        
                        <div style="margin-top: 15px; font-size: 15px;">
                            <p style="margin: 8px 0;"><strong>Azonosító Kód:</strong> <span style="font-size: 18px; color: #FF4C24; font-weight: bold; background: white; padding: 3px 8px; border-radius: 4px; border: 1px dashed #FF4C24;">${order.randomCode}</span></p>
                            <p style="margin: 8px 0;"><strong>Dátum:</strong> ${order.address.orderDate}</p>
                            <p style="margin: 8px 0;"><strong>Átvétel ideje:</strong> ${order.address.breakTime}. szünet</p>
                            <p style="margin: 8px 0;"><strong>Fizetési mód:</strong> ${order.paymentMethod === 'Utánvét' ? 'Helyszíni fizetés (Készpénz/Kártya)' : 'Online kifizetve'}</p>
                            ${order.note ? `<p style="margin: 8px 0; color: #d32f2f;"><strong>Megjegyzés/Kérés:</strong> ${order.note}</p>` : ''}
                        </div>
                        
                        <h4 style="margin: 20px 0 10px 0; color: #555; font-size: 16px;">Tételek listája:</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 15px;">
                            ${itemsHtml}
                        </ul>
                        
                        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #FFDCD4; text-align: right;">
                            <span style="font-size: 16px;">Végösszeg:</span>
                            <span style="font-size: 24px; font-weight: bold; color: #FF4C24; margin-left: 10px;">${order.amount} Ft</span>
                        </div>
                    </div>
                    
                    <p style="text-align: center; color: #555; font-size: 15px; margin-top: 30px;">
                        Kérjük, érkezéskor <strong>mutasd be a telefonodon</strong> ezt az emailt vagy diktáld be a <span style="color: #FF4C24; font-weight: bold;">${order.randomCode}</span> azonosító kódot a büfében a pultnál.
                    </p>
                    
                    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                        <p style="color: #888; font-size: 13px; margin: 0;">Várunk szeretettel!</p>
                        <p style="color: #888; font-size: 13px; font-weight: 600; margin: 5px 0 0 0;">A GépészBüfé Csapata</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Rendelési email sikeresen kiküldve ide:", email);
    } catch (err) {
        console.error("Hiba a rendelési email küldésekor:", err);
    }
}

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
            paymentMethod: "Stripe",
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

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.emit("newOrder", savedOrder);
        }

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
            payment: false,             // kezdetben nincs kifizetve (COD)
            paymentMethod: "Utánvét",   // Explicit módon utánvét
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

        // Email kuldese a megrendelonek
        if (address && address.email) {
            sendOrderConfirmationEmail(savedOrder, address.email); // ne akassza meg a választ, fusson a háttérben
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.emit("newOrder", savedOrder);
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

        // Ha a rendelés elkészült / átvéve, akkor jelölhető kifizetettnek is,
        // így a statisztikába bekerül (mivel a getStats csak a "payment: true" alapján nézi a bevételt)
        let updateData = { status };
        if (status === "Átvéve") {
            updateData.payment = true;
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedOrder) {
            console.log('Order not found:', orderId);
            return res.status(404).json({ success: false, message: "Rendelés nem található" });
        }

        // Emit status update realtime event to clients
        const io = req.app.get("io");
        if (io) {
            io.emit("statusUpdated", updatedOrder);
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

            // Email küldése sikeres fiizetés (stripe) esetén is
            if (updatedOrder.address && updatedOrder.address.email) {
                sendOrderConfirmationEmail(updatedOrder, updatedOrder.address.email);
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

// megrendelés lemondása / törlése (user oldali)
const deleteOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const userId = req.body.userId; // jwt auth-ból jön

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Rendelés nem található" });
        }

        // Jogosultság ellenőrzés: csak a sajátját, v vendégként (guest_) ha megvan a kód
        if (order.userId && !order.userId.startsWith("guest_") && order.userId.toString() !== String(userId)) {
            return res.status(403).json({ success: false, message: "Nincs jogosultságod törölni ezt a rendelést" });
        }

        if (order.status === "Törölve" || order.status === "Vásárló által lemondva") {
            return res.status(400).json({ success: false, message: "A rendelés már le van mondva." })
        }

        if (order.status === "Átvéve") {
            return res.status(400).json({ success: false, message: "Átvett rendelést már nem tudsz lemondani." })
        }

        if (order.status === "Készítés alatt" || order.status === "Elkészült") {
            if (!reason || reason.trim() === "") {
                return res.status(400).json({ success: false, message: "Mivel megerősítették a rendelésed, kérlek adj meg egy magyarázatot a lemondásra!" });
            }
        }

        // Törlés helyett "Lemondva" státuszba tesszük, bekerülve a reason is a note fájlba
        order.status = "Vásárló által lemondva";

        if (reason) {
            order.note = order.note ? `${order.note} | Lemondás oka: ${reason}` : `Lemondás oka: ${reason}`;
        }

        order.payment = false; // biztosra megyünk ne számoljon be

        await order.save();

        res.json({ success: true, message: "Rendelés sikeresen lemondva." });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ success: false, message: "Hiba a rendelés lemondásakor", error: error.message });
    }
}

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
    getStats,
    deleteOrder
};
