import React, { useState, useCallback, FormEvent } from 'react';
import { analyzeCompetition, discoverCompetitors } from '../services/geminiService';

const simpleMarkdownToHtml = (text: string): string => {
    if (!text) return '';
    const blocks = text.split('\n\n');

    return blocks.map(block => {
        block = block.trim();
        const lines = block.split('\n');

        // Table check
        if (lines.length > 1 && lines[0].includes('|') && lines[1].replace(/[-| :]/g, '').length === 0) {
            const tableClasses = "w-full text-left border-collapse my-4";
            const thClasses = "p-3 border-b-2 border-brand-shadow bg-brand-shadow bg-opacity-50 font-semibold text-brand-silver";
            const tdClasses = "p-3 border-b border-brand-shadow align-top";

            const header = `<thead><tr>${lines[0].split('|').slice(1, -1).map(h => `<th class="${thClasses}">${h.trim()}</th>`).join('')}</tr></thead>`;
            
            const bodyRows = lines.slice(2).map(row => 
                `<tr>${row.split('|').slice(1, -1).map(c => `<td class="${tdClasses}">${c.trim().replace(/\n/g, '<br/>')}</td>`).join('')}</tr>`
            ).join('');

            const body = `<tbody>${bodyRows}</tbody>`;
            return `<div class="overflow-x-auto"><table class="${tableClasses}">${header}${body}</table></div>`;
        }

        // Headers
        if (block.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-6 mb-2">${block.substring(3)}</h2>`;
        if (block.startsWith('# ')) return `<h1 class="text-3xl font-bold mt-6 mb-2">${block.substring(2)}</h1>`;
        
        // Unordered List
        if (lines.every(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
            const items = lines.map(item => `<li class="mb-1">${item.trim().substring(2)}</li>`).join('');
            return `<ul class="list-disc list-inside space-y-1 my-2">${items}</ul>`;
        }
        
        // Bold and Italic
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

const MarketIntel: React.FC = () => {
    const [allCompetitors, setAllCompetitors] = useState<string[]>([]);
    const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
    const [manualInput, setManualInput] = useState('');
    const [analysis, setAnalysis] = useState<{ text: string; sources: any[] }>({ text: '', sources: [] });
    const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [error, setError] = useState('');

    const handleDiscoverCompetitors = useCallback(async () => {
        setIsLoadingDiscovery(true);
        setError('');
        try {
            const newlyDiscovered = await discoverCompetitors();
            const updatedAllCompetitors = Array.from(new Set([...allCompetitors, ...newlyDiscovered]));
            setAllCompetitors(updatedAllCompetitors);
            const updatedSelectedCompetitors = Array.from(new Set([...selectedCompetitors, ...newlyDiscovered]));
            setSelectedCompetitors(updatedSelectedCompetitors);
        } catch (err) {
            setError('An error occurred while discovering competitors.');
            console.error(err);
        } finally {
            setIsLoadingDiscovery(false);
        }
    }, [allCompetitors, selectedCompetitors]);

    const handleManualAdd = (e: FormEvent) => {
        e.preventDefault();
        const newCompetitor = manualInput.trim();
        if (newCompetitor && !allCompetitors.includes(newCompetitor)) {
            setAllCompetitors(prev => [...prev, newCompetitor]);
            setSelectedCompetitors(prev => [...prev, newCompetitor]);
            setManualInput('');
        }
    };

    const handleToggleCompetitor = (competitor: string) => {
        setSelectedCompetitors(prev => 
            prev.includes(competitor) 
                ? prev.filter(c => c !== competitor)
                : [...prev, competitor]
        );
    };

    const handleAnalysis = useCallback(async () => {
        if (selectedCompetitors.length === 0) return;
        setIsLoadingAnalysis(true);
        setError('');
        setAnalysis({ text: '', sources: [] });
        try {
            const onChunk = (chunk: string) => {
                setAnalysis(prev => ({ ...prev, text: prev.text + chunk }));
            };
            const { sources } = await analyzeCompetition(selectedCompetitors, onChunk);
            setAnalysis(prev => ({ ...prev, sources }));
        } catch (err) {
            setError('An error occurred during analysis.');
            console.error(err);
        } finally {
            setIsLoadingAnalysis(false);
        }
    }, [selectedCompetitors]);

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">Market Intelligence</h2>
            
            <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg space-y-4">
                <h3 className="text-xl font-semibold">Competitive Analysis</h3>
                <p className="text-brand-silver">Discover top competitors, add your own, then select the ones you want to compare and generate a detailed analysis.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <button
                        onClick={handleDiscoverCompetitors}
                        disabled={isLoadingDiscovery}
                        className="bg-brand-blue w-full text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition disabled:bg-brand-shadow disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        <span>{isLoadingDiscovery ? 'Searching...' : 'Discover Competitors'}</span>
                    </button>
                    <form onSubmit={handleManualAdd} className="flex space-x-2 w-full">
                        <input
                            type="text"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="Add competitor name or URL"
                            className="flex-grow bg-brand-navy border border-brand-shadow rounded-lg p-3 focus:ring-2 focus:ring-brand-blue focus:outline-none"
                        />
                        <button type="submit" className="bg-brand-shadow text-white font-bold p-3 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50" disabled={!manualInput.trim()}>Add</button>
                    </form>
                </div>

                {isLoadingDiscovery && !allCompetitors.length && <Loader />}
                {allCompetitors.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-brand-shadow animate-fade-in">
                        <label className="font-semibold text-brand-silver">Select competitors to compare:</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {allCompetitors.map(competitor => (
                                <label key={competitor} className="flex items-center space-x-3 p-3 bg-brand-navy border border-brand-shadow rounded-lg cursor-pointer hover:bg-brand-shadow transition">
                                    <input 
                                        type="checkbox"
                                        checked={selectedCompetitors.includes(competitor)}
                                        onChange={() => handleToggleCompetitor(competitor)}
                                        className="h-5 w-5 rounded bg-brand-gunmetal border-brand-silver text-brand-blue focus:ring-brand-blue"
                                    />
                                    <span className="text-brand-light text-sm">{competitor}</span>
                                </label>
                            ))}
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={handleAnalysis}
                                disabled={isLoadingAnalysis || selectedCompetitors.length === 0}
                                className="bg-green-600 w-full text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-brand-shadow disabled:cursor-not-allowed"
                            >
                                {isLoadingAnalysis ? 'Analyzing...' : `Analyze ${selectedCompetitors.length} Selected Competitor(s)`}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg min-h-[400px]">
                {(isLoadingAnalysis) && !analysis.text && <Loader />}
                {error && <p className="text-red-400">{error}</p>}
                {analysis.text && (
                    <>
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(analysis.text) }} />
                        <SourceList sources={analysis.sources} />
                    </>
                )}
                 {!isLoadingAnalysis && !isLoadingDiscovery && !analysis.text && !error && (
                     <div className="flex flex-col items-center justify-center h-full text-brand-silver text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p>Your competitive analysis report will appear here.</p>
                        <p className="text-sm">Use the tools above to find and select competitors.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketIntel;