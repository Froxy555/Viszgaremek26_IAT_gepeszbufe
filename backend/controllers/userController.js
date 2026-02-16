import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

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
    const { name, email, password } = req.body;
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

        // jelszo titkositasa
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        // felhasznalo letrehozasa es mentese
        const newUser = new userModel({ name, email, password: hashedPassword })
        const user = await newUser.save()
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

export { loginUser, registerUser, getProfile, updateProfile, listUsers }
