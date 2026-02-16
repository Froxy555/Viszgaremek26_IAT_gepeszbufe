import jwt from 'jsonwebtoken';

// felhasználó hitelesítés middleware
const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        // vendég hozzáférés engedélyezése ha nincs token
        return next();
    }
    try {
        // token ellenőrzése és felhasználó azonosítása
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        let message = "Hiba a hitelesítés során";
        if (error.name === 'TokenExpiredError') {
            message = "A munkamenet lejárt, kérlek jelentkezz be újra";
        } else if (error.name === 'JsonWebTokenError') {
            message = "Érvénytelen token";
        }
        return res.json({ success: false, message: message });
    }
}

export default authMiddleware;