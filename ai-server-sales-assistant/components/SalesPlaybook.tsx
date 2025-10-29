import React, { useState, useCallback } from 'react';
import { getSalesAdvice } from '../services/geminiService';

const markdownToHtml = (text: string): string => {
    if (!text) return '';

    const lines = text.split('\n');
    const newLines: string[] = [];
    const listStack: { type: 'ul' | 'ol'; indent: number }[] = [];

    const closeLists = (targetIndent: number) => {
        while (listStack.length > 0 && targetIndent <= listStack[listStack.length - 1].indent) {
            const list = listStack.pop();
            newLines.push(`</${list.type}>`);
        }
    };

    lines.forEach(line => {
        const headerMatch = line.match(/^(#{1,3}) (.*)/);
        const ulMatch = line.match(/^(\s*)[-*] (.*)/);
        const olMatch = line.match(/^(\s*)\d+\. (.*)/);
        const listItemMatch = ulMatch || olMatch;

        if (headerMatch) {
            closeLists(-1);
            const level = headerMatch[1].length;
            const content = headerMatch[2];
            newLines.push(`<h${level} class="font-bold mt-4 mb-2 ${level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'}">${content}</h${level}>`);
            return;
        }

        if (listItemMatch) {
            const indent = listItemMatch[1].length;
            const content = listItemMatch[2];
            const type = ulMatch ? 'ul' : 'ol';
            const style = ulMatch ? 'list-disc' : 'list-decimal';
            const lastList = listStack.length > 0 ? listStack[listStack.length - 1] : null;

            if (!lastList || indent > lastList.indent) {
                listStack.push({ type, indent });
                const mlClass = listStack.length > 1 ? 'ml-4' : '';
                newLines.push(`<${type} class="${style} list-inside space-y-1 my-2 ${mlClass}">`);
            } else if (indent < lastList.indent) {
                closeLists(indent);
                 // Check if we need to reopen a list of a different type
                if (type !== listStack[listStack.length - 1]?.type) {
                     closeLists(indent - 1);
                     listStack.push({ type, indent });
                     const mlClass = listStack.length > 1 ? 'ml-4' : '';
                     newLines.push(`<${type} class="${style} list-inside space-y-1 my-2 ${mlClass}">`);
                }
            } else if (type !== lastList.type) {
                closeLists(indent - 1);
                listStack.push({ type, indent });
                const mlClass = listStack.length > 1 ? 'ml-4' : '';
                newLines.push(`<${type} class="${style} list-inside space-y-1 my-2 ${mlClass}">`);
            }
            newLines.push(`<li>${content}</li>`);
            return;
        }

        closeLists(-1);
        newLines.push(line);
    });

    closeLists(-1);

    let processedText = newLines.join('\n');

    let html = processedText.split(/\n\n+/).map(paragraph => {
        if (!paragraph.trim()) return '';
        if (paragraph.trim().match(/^<(h[1-3]|ul|ol|li)/)) {
            return paragraph.replace(/\n/g, '');
        }
        return `<p>${paragraph.trim().replace(/\n/g, '<br />')}</p>`;
    }).join('');
    
    html = html
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-brand-shadow px-1.5 py-1 rounded text-sm">$1</code>');

    return html;
};

const Loader: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
    </div>
);

const SalesPlaybook: React.FC = () => {
    const [question, setQuestion] = useState('How do I handle objections about the price being too high compared to cloud solutions?');
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGetAdvice = useCallback(async () => {
        if (!question) return;
        setIsLoading(true);
        setError('');
        setAdvice('');
        try {
            const result = await getSalesAdvice(question);
            setAdvice(result);
        } catch (err) {
            setError('An error occurred while fetching advice.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [question]);

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">Sales Playbook & AI Coach</h2>
            
            <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg space-y-4">
                <h3 className="text-xl font-semibold">Ask for Sales Advice</h3>
                <p className="text-brand-silver">Pose a question or describe a sales scenario to get instant coaching from a low-latency AI model.</p>
                <div className="flex flex-col space-y-4">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g., How to pitch against a well-known competitor?"
                        rows={3}
                        className="w-full bg-brand-navy border border-brand-shadow rounded-lg p-3 focus:ring-2 focus:ring-brand-blue focus:outline-none"
                    />
                    <button
                        onClick={handleGetAdvice}
                        disabled={isLoading || !question}
                        className="bg-brand-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition disabled:bg-brand-shadow disabled:cursor-not-allowed self-start"
                    >
                        {isLoading ? 'Thinking...' : 'Get Advice'}
                    </button>
                </div>
            </div>

            <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg min-h-[400px]">
                {isLoading && <Loader />}
                {error && <p className="text-red-400">{error}</p>}
                {!isLoading && advice && (
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(advice) }}></div>
                )}
                 {!isLoading && !advice && (
                     <div className="flex flex-col items-center justify-center h-full text-brand-silver">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        <p>Sales advice will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesPlaybook;