import { createContext, useEffect, useState } from "react";
import { food_list, menu_list } from "../assets/assets";
import { translations } from "../utils/translations";
import axios from "axios";
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const url = import.meta.env.PROD ? "https://gepeszbufe-backend.onrender.com" : "http://localhost:4000";
    const [food_list, setFoodList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("")
    const [specialRequest, setSpecialRequest] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [profileName, setProfileName] = useState("");
    const [profileAvatar, setProfileAvatar] = useState("");
    const [itemModifications, setItemModifications] = useState({}); // Stores exclusions per item ID
    const [itemAdditions, setItemAdditions] = useState({}); // Stores additions per item ID
    const currency = " Ft";

    // Translation State
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'hu');

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || translations['hu']?.[key] || key;
    };

    // Kosárba tétel függvény
    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    }

    // Kosárból eltávolítás függvény
    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    }

    // Kosár végösszegének kiszámítása
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            try {
                if (cartItems[item] > 0) {
                    let itemInfo = food_list.find((product) => product._id === item);
                    totalAmount += itemInfo.price * cartItems[item];
                }
            } catch (error) {

            }

        }
        return totalAmount;
    }

    // Összetevő kizárása/hozzátekeredése egy adott ételnél (pl. Hamburger)
    const toggleExclusion = (itemId, ingredient) => {
        setItemModifications(prev => {
            const itemExclusions = prev[itemId] || [];
            if (itemExclusions.includes(ingredient)) {
                return { ...prev, [itemId]: itemExclusions.filter(i => i !== ingredient) };
            } else {
                return { ...prev, [itemId]: [...itemExclusions, ingredient] };
            }
        });
    }

    // Extrák/szószok hozzáadása (pl. Pizzaszelethez tartár)
    const toggleAddition = (itemId, addition) => {
        setItemAdditions(prev => {
            const additions = prev[itemId] || [];
            if (additions.includes(addition)) {
                return { ...prev, [itemId]: additions.filter(i => i !== addition) };
            } else {
                return { ...prev, [itemId]: [...additions, addition] };
            }
        });
    }

    // Étel lista betöltése
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            if (response.data && response.data.data) {
                setFoodList(response.data.data);
            } else {
                setFoodList([]);
            }
        } catch (error) {
            console.error("Hiba az étel lista betöltésekor:", error);
            setFoodList([]);
        }
    }

    const loadCartData = async (token) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: token.token || token } });
            if (response.data && response.data.success) {
                setCartItems(response.data.cartData || {});
            } else {
                setCartItems({});
            }
        } catch (error) {
            console.error("Hiba a kosáradatok betöltésekor:", error);
            setCartItems({});
        }
    }

    const [userData, setUserData] = useState({}); // Teljes felhasználói profil tárolása

    // Profil adatok betöltése
    const loadProfile = async (tokenValue) => {
        try {
            const response = await axios.get(url + "/api/user/profile", {
                headers: { token: tokenValue }
            });
            if (response.data.success && response.data.user) {
                const { name, avatarUrl } = response.data.user;
                setProfileName(name || "");
                setProfileAvatar(avatarUrl || "");
                setUserData(response.data.user); // Store full user data

                // Opcionálisan: cache localStorage-ban, de a forrás a backend marad
                localStorage.setItem('profileName', name || "");
                localStorage.setItem('profileAvatar', avatarUrl || "");
            }
        } catch (err) {
            console.error('Profil betöltési hiba', err);
        }
    }

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                await loadCartData({ token: storedToken });
                await loadProfile(storedToken);
            } else {
                // Tartalék: ha nincs token, csak a localStorage-ban lévő vizuális adatok
                const storedName = localStorage.getItem('profileName');
                const storedAvatar = localStorage.getItem('profileAvatar');
                if (storedName) setProfileName(storedName);
                if (storedAvatar) setProfileAvatar(storedAvatar);
            }
        }
        loadData()
    }, [])

    const contextValue = {
        url,
        food_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        token,
        setToken,
        loadCartData,
        setCartItems,
        currency,
        specialRequest,
        setSpecialRequest,
        searchTerm,
        setSearchTerm,
        profileName,
        setProfileName,
        profileAvatar,
        setProfileAvatar,
        loadProfile,
        userData,
        language,
        setLanguage,
        t,
        itemModifications,
        setItemModifications,
        toggleExclusion,
        itemAdditions,
        setItemAdditions,
        toggleAddition
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}

export default StoreContextProvider;
