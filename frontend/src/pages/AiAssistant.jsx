import React, { useState, useEffect, useRef } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import backgroundImage from '../assets/bg.png';
import { api } from '../lib/api';
import './AiAssistant.css';

function AiAssistant() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    async function fetchHistory() {
        try {
            const { data } = await api.get('/ai');
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
        }
    }

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/ai', { message: userMessage.content });
            if (data.success) {
                setMessages(data.data.messages);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error. Please try again later.';
            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        if (window.confirm('Are you sure you want to clear the chat history?')) {
            try {
                await api.delete('/ai');
                setMessages([]);
            } catch (error) {
                console.error("Failed to clear history:", error);
            }
        }
    };

    return (
        <div
            className="ai-assistant-container"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh',
                color: 'white',
            }}
        >
            <Topbar />
            {!isSidebarOpen && (
                <button
                    className="toggle"
                    style={{ left: '20px' }}
                    onClick={() => setIsSidebarOpen(true)}>
                    ⚡
                </button>
            )}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="ai-chat-box">
                <div className="ai-chat-header">
                    <h2>🤖 CampusMate AI Mentor</h2>
                    <button className="clear-btn" onClick={clearHistory}>Clear History</button>
                </div>

                <div className="ai-chat-messages">
                    {messages.length === 0 && (
                        <div className="empty-chat">
                            <p>Hi! I'm your AI mentor. Ask me anything about your schedule, attendance, or projects!</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role}`}>
                            <div className="message-content">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-message assistant">
                            <div className="message-content loading">
                                Typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="ai-chat-input" onSubmit={handleSend}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your AI mentor..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AiAssistant;
