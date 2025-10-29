
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { ChatMessage } from '../types';
import { createChat } from '../services/geminiService';
import type { Chat, GenerateContentResponse } from '@google/genai';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

const Loader: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="h-2 w-2 bg-brand-light rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-brand-light rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-brand-light rounded-full animate-bounce"></div>
    </div>
);

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            chatRef.current = createChat();
             setMessages([{
                id: 'init',
                sender: 'bot',
                text: "Hello! I'm your AI sales assistant. How can I help you today?"
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chatRef.current) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: input });
            
            let botResponse = '';
            let botMessageId = `bot-${Date.now()}`;
            
            setMessages(prev => [...prev, { id: botMessageId, sender: 'bot', text: '' }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                botResponse += chunkText;
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId ? { ...msg, text: botResponse } : msg
                ));
            }

        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { id: `err-${Date.now()}`, sender: 'bot', text: "Sorry, I encountered an error." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="bg-brand-gunmetal h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-brand-shadow flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">AI Assistant</h3>
                <button onClick={onClose} className="text-brand-silver hover:text-white">&times;</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message, index) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.sender === 'user' ? 'bg-brand-blue text-white rounded-br-none' : 'bg-brand-shadow text-brand-light rounded-bl-none'}`}>
                            {message.text ? message.text : <Loader />}
                        </div>
                    </div>
                ))}
                 {isLoading && messages[messages.length - 1]?.sender === 'user' && (
                    <div className="flex justify-start">
                         <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-brand-shadow text-brand-light rounded-bl-none">
                            <Loader />
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-brand-shadow">
                <form onSubmit={handleSend} className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="flex-grow bg-brand-navy border border-brand-shadow rounded-lg p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-blue text-white font-bold p-2 rounded-lg hover:bg-opacity-80 transition disabled:bg-brand-shadow disabled:cursor-not-allowed">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
