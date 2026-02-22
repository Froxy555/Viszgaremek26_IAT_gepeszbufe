import React, { useState, useRef, useEffect, useContext } from 'react';
import './Chatbot.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { translations } from '../../utils/translations';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Szia! Látom nézegeted a menüt. Miben segíthetek? Érdekel miben mennyi kalória van, vagy segítsek választani?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const { url, cartItems, food_list } = useContext(StoreContext);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        // Összeállítjuk a kosár tartalmát a kontextushoz
        const currentContext = [];
        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                const foodInfo = food_list.find(item => item._id === itemId);
                if (foodInfo) {
                    currentContext.push({
                        name: foodInfo.name,
                        price: foodInfo.price,
                        quantity: cartItems[itemId],
                        category: foodInfo.category
                    });
                }
            }
        }

        try {
            const response = await axios.post(`${url}/api/chat`, {
                message: userMsg,
                context: currentContext
            });

            if (response.data.success) {
                setMessages(prev => [...prev, { sender: 'bot', text: response.data.response }]);
            } else {
                setMessages(prev => [...prev, { sender: 'bot', text: "Hupsz, valami hiba történt a kapcsolatommal! (Gépészbüfé szerver hiba)" }]);
            }
        } catch (error) {
            console.error("Chat API hiba:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Hálózat hiba! Nem tudtam elérni a szervert." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {/* Lebegő gomb */}
            {!isOpen && (
                <button className="chatbot-button animate-fade-up" onClick={() => setIsOpen(true)} title="Gépészbüfé AI Asszisztens">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.22 1.05 4.3 2.8 5.86L4 21.5l4.87-2.1c1.02.26 2.08.4 3.13.4 5.52 0 10-3.92 10-8.75S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                    </svg>
                </button>
            )}

            {/* Chat ablak */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-title">
                            <span role="img" aria-label="robot">🤖</span>
                            <div>
                                <h3>AI Pincér</h3>
                                <span>Gépészbüfé Asszisztens</span>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>&times;</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-typing">
                                <span></span><span></span><span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Kérdezz bármit..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
