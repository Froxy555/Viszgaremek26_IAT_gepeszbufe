import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateChatResponse = async (req, res) => {
    try {
        const { message, context } = req.body;

        // Check if API Key is set
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "") {
            return res.json({
                success: false,
                message: "Nincs beállítva a GEMINI_API_KEY a .env fájlban! Kérlek pótold, hogy az AI tudjon válaszolni."
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using the recommended fast model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let systemPrompt = `
Te egy nagyon udvarias, profi és segítőkész magyar nyelvű pincér asszisztens vagy a Gépészbüfé nevű étterem modern weboldalán.
A feladatod, hogy kedvesen segíts a felhasználónak, ha kérdése van a menüvel kapcsolatban, kalóriát szeretne számolni, vagy ajánlást kér.
Kérlek válaszolj röviden, tömören és barátságos hangnemben (használj nyugodtan egy-egy emojit is).
Ne térj el a gasztronómia és a rendelés témájától!
        `;

        let contextString = "A felhasználó kosara jelenleg üres.";
        if (context && context.length > 0) {
            contextString = "A felhasználó kosarában jelenleg a következők vannak:\n";
            context.forEach(item => {
                contextString += `- ${item.quantity}x ${item.name} (${item.price} Ft/db, Kategória: ${item.category})\n`;
            });
            contextString += "Ha a felhasználó a kalóriákra kérdez rá, próbáld meg nagyjából megbecsülni a fent említett ételek ismert átlagos kalóriatartalmát (pl. egy sajtburger kb. 300-400 kcal, kóla 140 kcal, stb.), mivel az adatbázis ezt pontosan még nem tárolja.";
        }

        const prompt = `${systemPrompt}\n\n[Rendszer infó: KOSÁR ÁLLAPOTA:]\n${contextString}\n\n======================\nFELHASZNÁLÓ KÉRDÉSE:\n${message}\n======================\nVÁLASZ (csak az üzenet szövege):`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.json({ success: true, response: responseText });

    } catch (error) {
        console.log("Gemini API Hiba:", error);
        res.json({ success: false, message: "Hiba az AI válasz generálásakor. " + error.message });
    }
}
