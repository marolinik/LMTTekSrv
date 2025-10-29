
import React, { useState, FormEvent } from 'react';
import { Quote } from '../types';

const QuoteManager: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([
        { id: '1', customerName: 'OpenAI', serverConfig: '8x H100, 2TB RAM', price: 150000, status: 'Sent', createdAt: new Date().toISOString() },
        { id: '2', customerName: 'DeepMind', serverConfig: '8x Blackwell, 2TB RAM', price: 250000, status: 'Draft', createdAt: new Date().toISOString() },
    ]);
    const [customerName, setCustomerName] = useState('');
    const [serverConfig, setServerConfig] = useState('8x NVIDIA RTX 6000 Ada, 1TB RAM');
    const [price, setPrice] = useState(120000);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!customerName || !serverConfig || price <= 0) return;

        const newQuote: Quote = {
            id: new Date().getTime().toString(),
            customerName,
            serverConfig,
            price,
            status: 'Draft',
            createdAt: new Date().toISOString(),
        };

        setQuotes([newQuote, ...quotes]);
        setCustomerName('');
        setServerConfig('8x NVIDIA RTX 6000 Ada, 1TB RAM');
        setPrice(120000);
        setIsFormVisible(false);
    };

    const getStatusColor = (status: Quote['status']) => {
        switch (status) {
            case 'Accepted': return 'bg-green-500';
            case 'Sent': return 'bg-blue-500';
            case 'Rejected': return 'bg-red-500';
            case 'Draft': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-bold text-white">Quote Manager</h2>
                <button 
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition"
                >
                    {isFormVisible ? 'Cancel' : 'Create New Quote'}
                </button>
            </div>

            {isFormVisible && (
                 <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">New Quote Details</h3>
                        <div>
                            <label className="block mb-2 font-semibold text-brand-silver">Customer Name</label>
                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-brand-navy border border-brand-shadow rounded-lg p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                        </div>
                        <div>
                             <label className="block mb-2 font-semibold text-brand-silver">Server Configuration</label>
                            <textarea value={serverConfig} onChange={e => setServerConfig(e.target.value)} rows={3} className="w-full bg-brand-navy border border-brand-shadow rounded-lg p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                        </div>
                         <div>
                            <label className="block mb-2 font-semibold text-brand-silver">Price (USD)</label>
                            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-brand-navy border border-brand-shadow rounded-lg p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition">Save Draft</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="bg-brand-gunmetal rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-brand-shadow bg-opacity-50">
                        <tr>
                            <th className="p-4 font-semibold">Customer</th>
                            <th className="p-4 font-semibold">Configuration</th>
                            <th className="p-4 font-semibold">Price</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.map(quote => (
                            <tr key={quote.id} className="border-b border-brand-shadow last:border-0 hover:bg-brand-shadow transition">
                                <td className="p-4">{quote.customerName}</td>
                                <td className="p-4 text-sm text-brand-silver">{quote.serverConfig}</td>
                                <td className="p-4">${quote.price.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${getStatusColor(quote.status)}`}>
                                        {quote.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-brand-silver">{new Date(quote.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuoteManager;
