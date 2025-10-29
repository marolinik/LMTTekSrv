import React, { useState, useCallback } from 'react';
import { findLeads } from '../services/geminiService';

const simpleMarkdownToHtml = (text: string): string => {
    if (!text) return '';

    // Process links first
    let html = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-blue hover:underline">$1</a>');

    const blocks = html.split('\n\n');

    return blocks.map(block => {
        block = block.trim();
        const lines = block.split('\n');

        // Headers
        if (block.startsWith('### ')) return `<h3 class="text-xl font-semibold mt-4 mb-2 text-white">${block.substring(4)}</h3>`;
        if (block.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-6 mb-2">${block.substring(3)}</h2>`;
        if (block.startsWith('# ')) return `<h1 class="text-3xl font-bold mt-6 mb-2">${block.substring(2)}</h1>`;

        // Unordered List
        if (lines.every(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
            const items = lines.map(item => {
                let content = item.trim().substring(2);
                // Handle bold text within list items
                content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-silver">$1</strong>');
                return `<li class="mb-1">${content}</li>`;
            }).join('');
            return `<ul class="list-disc list-inside space-y-2 my-2">${items}</ul>`;
        }

        // Handle remaining bold/italic outside of lists
        block = block.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Paragraphs
        return `<p class="my-2">${block.replace(/\n/g, '<br />')}</p>`;
    }).join('');
};


const Loader: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
    </div>
);

const SourceList: React.FC<{ sources: { title: string; uri: string }[] }> = ({ sources }) => {
    if (sources.length === 0) return null;
    return (
        <div className="mt-6 border-t border-brand-shadow pt-4">
            <h4 className="font-semibold text-brand-silver mb-2">Sources:</h4>
            <ul className="list-disc list-inside space-y-1">
                {sources.map((source, index) => (
                    <li key={index}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline text-sm">
                            {source.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const LeadGenerator: React.FC = () => {
    const [profile, setProfile] = useState('AI startups in the healthcare sector in California developing diagnostic tools.');
    const [leads, setLeads] = useState<{ text: string; sources: any[] }>({ text: '', sources: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFindLeads = useCallback(async () => {
        if (!profile) return;
        setIsLoading(true);
        setError('');
        setLeads({ text: '', sources: [] });
        try {
            const result = await findLeads(profile);
            setLeads(result);
        } catch (err) {
            setError('An error occurred while generating leads.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [profile]);

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">AI Lead Generator</h2>
            
            <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg space-y-4">
                <h3 className="text-xl font-semibold">Describe Your Ideal Customer</h3>
                <p className="text-brand-silver">Provide a detailed description of your target customer profile. The AI will use Google Search to find potential leads, including key contacts and LinkedIn profiles.</p>
                <div className="flex flex-col space-y-4">
                    <textarea
                        value={profile}
                        onChange={(e) => setProfile(e.target.value)}
                        placeholder="e.g., Financial firms in New York using ML for algorithmic trading."
                        rows={4}
                        className="w-full bg-brand-navy border border-brand-shadow rounded-lg p-3 focus:ring-2 focus:ring-brand-blue focus:outline-none"
                    />
                    <button
                        onClick={handleFindLeads}
                        disabled={isLoading || !profile}
                        className="bg-brand-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition disabled:bg-brand-shadow disabled:cursor-not-allowed self-start"
                    >
                        {isLoading ? 'Searching...' : 'Find Leads'}
                    </button>
                </div>
            </div>

            <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg min-h-[400px]">
                {isLoading && <Loader />}
                {error && <p className="text-red-400">{error}</p>}
                {!isLoading && leads.text && (
                    <>
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(leads.text) }} />
                        <SourceList sources={leads.sources} />
                    </>
                )}
                 {!isLoading && !leads.text && (
                    <div className="flex flex-col items-center justify-center h-full text-brand-silver">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a6 6 0 00-12 0v2" /></svg>
                        <p>Potential leads will be listed here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadGenerator;