import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import nodemailer from "nodemailer";
import axios from "axios";


// token letrehozasa
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

// felhasznalo bejelentkezes ellenorzese
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // felhasznalo keresese email alapjan
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Felhasználó nem létezik" })
        }

        // jelszo osszehasonlitasa
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Érvénytelen hitelesítő adatok" })
        }

        // token letrehozasa es valasz kuldese
        const token = createToken(user._id)
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatarUrl: user.avatarUrl || ''
            }
        })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Hiba történt" })
    }
}

// uj felhasznalo regisztracioja
const registerUser = async (req, res) => {
    const { name, email, password, otp } = req.body;
    try {
        // ellenorzes, hogy letezik-e mar a felhasznalo
        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: "A felhasználó már létezik" })
        }

        // email es jelszo validacio
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Kérlek adj meg egy érvényes email címet" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Kérlek válassz erősebb jelszót" })
        }

        // Mivel OTP kötelező
        if (!otp) {
            return res.json({ success: false, message: "Kérlek add meg a megerősítő kódot" });
        }
        const validOtp = await otpModel.findOne({ email, otp });
        if (!validOtp) {
            return res.json({ success: false, message: "Hibás vagy lejárt megerősítő kód" });
        }

        // jelszo titkositasa
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        // felhasznalo letrehozasa es mentese
        const newUser = new userModel({ name, email, password: hashedPassword })
        const user = await newUser.save()

        await otpModel.deleteMany({ email }); // sikeres reg utan töröljük

        const token = createToken(user._id)
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatarUrl: user.avatarUrl || ''
            }
        })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Hiba történt" })
    }
}

// profil lekerese
const getProfile = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId).select('name email phone avatarUrl'); // Select phone
        if (!user) {
            return res.json({ success: false, message: 'Felhasználó nem található' });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '', // Include phone
                avatarUrl: user.avatarUrl || ''
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Hiba a profil lekérésekor' });
    }
};

// profil frissitese (nev, avatar, jelszo)
const updateProfile = async (req, res) => {
    const userId = req.body.userId;
    const { name, avatarUrl, currentPassword, newPassword } = req.body;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'Felhasználó nem található' });
        }

        // adatok frissitese, ha meg lettek adva
        if (name) {
            user.name = name;
        }

        if (typeof avatarUrl === 'string') {
            user.avatarUrl = avatarUrl;
        }

        // jelszo csere logika
        if (newPassword) {
            if (!currentPassword) {
                return res.json({ success: false, message: 'Add meg a jelenlegi jelszót.' });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: 'A jelenlegi jelszó nem megfelelő.' });
            }

            if (newPassword.length < 8) {
                return res.json({ success: false, message: 'Az új jelszónak legalább 8 karakter hosszúnak kell lennie.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
        }

        await user.save();

        return res.json({
            success: true,
            message: 'Profil frissítve.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatarUrl: user.avatarUrl || ''
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Hiba a profil frissítésekor' });
    }
};

// osszes felhasznalo listazasa
const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Hiba a felhasználók listázásakor" });
    }
}

// otp kód elküldése
const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "A felhasználó már létezik" });
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Érvénytelen email cím" });
        }

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        await otpModel.deleteMany({ email }); // Korábbi kódok törlése
        const newOtp = new otpModel({ email, otp: otpCode });
        await newOtp.save();

        // Nodemailer
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'GépészBüfé - Regisztráció Megerősítő Kód',
                text: `Kérlek használd az alábbi 4 jegyű kódot a regisztráció befejezéséhez:\n\n${otpCode}\n\nA kód 5 percen belül lejár.`
            };
            await transporter.sendMail(mailOptions);
        } else {
            console.log("------------------------");
            console.log("NINCS BEÁLLÍTVA AZ EMAIL SYSTEM (.env fájlban EMAIL_USER és EMAIL_PASS kellenek)");
            console.log(`MEGERŐSÍTŐ KÓD ehhez az emailhez (${email}):`, otpCode);
            console.log("------------------------");
        }

        res.json({ success: true, message: "Megerősítő kód elküldve!" });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Hiba történt az email küldésekor" });
    }
}

// google fiókos bejelentkezés
const googleLogin = async (req, res) => {
    const { token: accessToken } = req.body;
    try {
        // useGoogleLogin access token-t ad, amit ezen az API-n tudunk hitelesíteni és elkérni a profilt:
        const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const { email, name, picture } = userInfoRes.data;

        if (!email) {
            return res.json({ success: false, message: "Nem sikerült lekérni a Google profilodat." });
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            // Ha még nincs ilyen felhasználó, létrehozunk egyet véletlenszerű jelszóval
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(Date.now().toString() + Math.random().toString(), salt);

            const newUser = new userModel({ name, email, password: hashedPassword, avatarUrl: picture });
            user = await newUser.save();
        } else if (!user.avatarUrl && picture) {
            // Ha van felhasználó, de nincs képe, szinkronizáljuk a Google profilképet
            user.avatarUrl = picture;
            await user.save();
        }

        const appToken = createToken(user._id);
        res.json({
            success: true,
            token: appToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatarUrl: user.avatarUrl || ''
            }
        });
    } catch (error) {
        console.log("Google Login Hiba:", error);
        res.json({ success: false, message: "Hiba történt a Google hitelesítés során." });
    }
}

// felhasználó törlése
const deleteUser = async (req, res) => {
    try {
        const userId = req.body.id;
        if (!userId) {
            return res.json({ success: false, message: "Hiányzó felhasználó azonosító" });
        }

        // Alapvédelem nehogy az aktuális admin törölje saját magát
        // Ehhez extra validáció kéne, most egyszerűen csak törlünk:
        await userModel.findByIdAndDelete(userId);
        res.json({ success: true, message: "Felhasználó törölve!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Hiba a törlés során" });
    }
}

export { loginUser, registerUser, getProfile, updateProfile, listUsers, sendOtp, googleLogin, deleteUser }
