
import React, { useState, useCallback } from 'react';
import { AppView } from './types';
import ProductInfo from './components/ProductInfo';
import MarketIntel from './components/MarketIntel';
import SalesPlaybook from './components/SalesPlaybook';
import LeadGenerator from './components/LeadGenerator';
import SocialMedia from './components/SocialMedia';
import Chatbot from './components/Chatbot';

// SVG Icon Components
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const MarketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const PlaybookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.494h18" /></svg>;
const LeadsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const SocialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;


const App: React.FC = () => {
    const [activeView, setActiveView] = useState<AppView>(AppView.PRODUCT_INFO);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const renderView = useCallback(() => {
        switch (activeView) {
            case AppView.PRODUCT_INFO:
                return <ProductInfo />;
            case AppView.MARKET_INTEL:
                return <MarketIntel />;
            case AppView.SALES_PLAYBOOK:
                return <SalesPlaybook />;
            case AppView.LEAD_GENERATOR:
                return <LeadGenerator />;
            case AppView.SOCIAL_MEDIA:
                return <SocialMedia />;
            default:
                return <ProductInfo />;
        }
    }, [activeView]);

    // FIX: Changed icon type from JSX.Element to React.ReactNode to fix "Cannot find namespace 'JSX'" error.
    const NavItem: React.FC<{ view: AppView; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 w-full text-left ${
                activeView === view
                    ? 'bg-brand-blue text-white shadow-lg'
                    : 'text-brand-silver hover:bg-brand-gunmetal hover:text-white'
            }`}
        >
            {icon}
            <span className="font-semibold">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-brand-navy font-sans">
            {/* Sidebar Navigation */}
            <nav className="w-64 bg-brand-gunmetal p-5 flex flex-col justify-between shadow-2xl">
                <div>
                    <div className="mb-10 flex items-center space-x-3">
                        <div className="bg-brand-blue p-2 rounded-lg">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                        <h1 className="text-xl font-bold text-white">Sales AI</h1>
                    </div>
                    <div className="space-y-3">
                        <NavItem view={AppView.PRODUCT_INFO} label="Product Info" icon={<ProductIcon />} />
                        <NavItem view={AppView.MARKET_INTEL} label="Market Intel" icon={<MarketIcon />} />
                        <NavItem view={AppView.SALES_PLAYBOOK} label="Sales Playbook" icon={<PlaybookIcon />} />
                        <NavItem view={AppView.LEAD_GENERATOR} label="Lead Generator" icon={<LeadsIcon />} />
                        <NavItem view={AppView.SOCIAL_MEDIA} label="Social Media" icon={<SocialIcon />} />
                    </div>
                </div>
                 <button
                    onClick={() => setIsChatOpen(prev => !prev)}
                    className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 w-full text-left text-brand-silver hover:bg-brand-gunmetal hover:text-white mt-auto"
                >
                    <ChatIcon />
                    <span className="font-semibold">AI Assistant</span>
                </button>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {renderView()}
            </main>

            {/* Chatbot Pane */}
            <div className={`transition-all duration-500 ease-in-out ${isChatOpen ? 'w-96' : 'w-0'} overflow-hidden`}>
                 <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
        </div>
    );
};

export default App;