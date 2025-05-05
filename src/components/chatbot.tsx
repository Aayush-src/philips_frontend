import React, { useState, useEffect, useRef } from 'react';
import downloadIcon from '../assets/download.png';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem('chatHistory');
        if (stored) setMessages(JSON.parse(stored));
    }, []);

    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessage = { type: 'user', text: input };
        setMessages((prev) => [...prev, newMessage]);
        setLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:5000', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input_message: input }),
            });
            const data = await res.json();
            const aiResponse = data.responses[1];
            setMessages((prev) => [...prev, { type: 'bot', text: aiResponse }]);
        } catch (error) {
            setMessages((prev) => [...prev, { type: 'bot', text: 'Error fetching response.' }]);
        } finally {
            setLoading(false);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div className="min-h-screen w-[120vh] ml-[60vh] flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-6xl md:w-4/5 bg-white shadow-xl border-4 border-gray-400 rounded-2xl flex flex-col h-[90vh]">
                <div className="text-center border-b border-gray-300 p-5">
                    <div className="text-3xl font-bold text-black">
                        <img src={downloadIcon} alt="Logo" className="w-12 h-12 " />
                    </div>
                    <div className="text-lg text-black">Chatbot Name</div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 p-6 text-black">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-2xl max-w-[80%] break-words ${msg.type === 'user'
                                ? 'bg-blue-500 text-white self-end ml-auto'
                                : 'bg-gray-200 text-black self-start mr-auto'
                                } animate-fadeIn`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-center space-x-2 bg-gray-200 text-black p-3 rounded-2xl max-w-[80%] animate-pulse self-start mr-auto">
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-5 border-t border-gray-300 flex space-x-3">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={loading}
                        className="flex-1 border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring focus:border-blue-500 text-black"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-blue-500 text-white px-5 py-3 rounded-lg disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
