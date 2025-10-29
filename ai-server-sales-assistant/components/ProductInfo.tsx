
import React, { useState, useEffect, useCallback } from 'react';
import { serverSpecs } from '../data/serverSpecs';
import { generatePitch } from '../services/geminiService';
import { ServerSpec } from '../types';

// Enhanced markdown to HTML converter to handle nested lists, code blocks, and more.
const markdownToHtml = (text: string): string => {
    if (!text) return '';

    const codeBlocks: string[] = [];
    // 1. Isolate and replace code blocks to prevent inner markdown processing
    let processedText = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const languageClass = lang ? `language-${lang}` : '';
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
        const codeBlockHtml = `<pre class="bg-brand-navy p-4 rounded-lg overflow-x-auto text-sm"><code class="${languageClass}">${escapedCode}</code></pre>`;
        codeBlocks.push(codeBlockHtml);
        return `{{CODE_BLOCK_${codeBlocks.length - 1}}}`;
    });

    const lines = processedText.split('\n');
    const newLines: string[] = [];
    let inList = false;
    const indentStack: number[] = [];

    // 2. Process line by line for block elements like lists and headers
    lines.forEach(line => {
        const headerMatch = line.match(/^(#{1,3}) (.*)/);
        const listItemMatch = line.match(/^(\s*)([-*]) (.*)/);

        if (headerMatch) {
            if (inList) {
                newLines.push('</ul>'.repeat(indentStack.length));
                inList = false;
                indentStack.length = 0;
            }
            const level = headerMatch[1].length;
            const content = headerMatch[2];
            newLines.push(`<h${level} class="font-bold mt-4 mb-2 ${level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'}">${content}</h${level}>`);
            return;
        }

        if (listItemMatch) {
            const indent = listItemMatch[1].length;
            const content = listItemMatch[3];

            if (!inList) {
                inList = true;
                indentStack.push(indent);
                newLines.push('<ul class="list-disc list-inside space-y-1 my-2">');
            } else {
                if (indent > indentStack[indentStack.length - 1]) {
                    indentStack.push(indent);
                    newLines.push('<ul class="list-disc list-inside ml-4 space-y-1 my-2">');
                } else {
                    while (indentStack.length > 0 && indent < indentStack[indentStack.length - 1]) {
                        indentStack.pop();
                        newLines.push('</ul>');
                    }
                }
            }
            newLines.push(`<li>${content}</li>`);
            return;
        }

        if (inList) {
            newLines.push('</ul>'.repeat(indentStack.length));
            inList = false;
            indentStack.length = 0;
        }
        newLines.push(line);
    });

    if (inList) {
        newLines.push('</ul>'.repeat(indentStack.length));
    }

    processedText = newLines.join('\n');

    // 3. Process paragraphs
    let html = processedText.split(/\n\n+/).map(paragraph => {
        if (!paragraph.trim()) return '';
        if (paragraph.trim().match(/^<(h[1-3]|ul|pre|{{CODE_BLOCK_)/)) {
            return paragraph;
        }
        return `<p>${paragraph.trim().replace(/\n/g, '<br />')}</p>`;
    }).join('');
    
    // 4. Process inline elements
    html = html
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-brand-shadow px-1.5 py-1 rounded text-sm">$1</code>');

    // 5. Restore code blocks
    html = html.replace(/{{CODE_BLOCK_(\d+)}}/g, (match, index) => {
        return codeBlocks[parseInt(index, 10)];
    });

    return html;
};

const SpecTable: React.FC<{ specs: ServerSpec[] }> = ({ specs }) => (
    <div className="bg-brand-gunmetal shadow-lg rounded-xl overflow-hidden">
        {specs.map((category, index) => (
            <div key={index} className="border-b border-brand-shadow last:border-b-0">
                <h3 className="bg-brand-shadow bg-opacity-50 px-6 py-3 text-lg font-bold text-brand-blue">{category.category}</h3>
                <div className="p-6">
                    <ul className="space-y-4">
                        {category.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                                <span className="font-semibold text-brand-silver col-span-1">{item.feature}</span>
                                <div className="text-brand-light col-span-2">
                                    {Array.isArray(item.value) ? (
                                        <ul className="list-disc list-inside">
                                            {item.value.map((v, i) => <li key={i}>{v}</li>)}
                                        </ul>
                                    ) : (
                                        <span>{item.value}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ))}
    </div>
);

const Loader: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
    </div>
);

const ProductInfo: React.FC = () => {
    const [pitch, setPitch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGeneratePitch = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setPitch('');
        try {
            const onChunk = (chunk: string) => {
                setPitch(prev => prev + chunk);
            };
            await generatePitch(serverSpecs, onChunk);
        } catch (err) {
            setError('An error occurred while generating the pitch.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-generate pitch on initial component load
    useEffect(() => {
        handleGeneratePitch();
    }, [handleGeneratePitch]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-bold text-white">Product Deep Dive: LM TEK RM-4U8G</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Specs */}
                <div className="space-y-4">
                     <h3 className="text-2xl font-semibold text-white">Technical Specifications</h3>
                    <SpecTable specs={serverSpecs} />
                </div>

                {/* Sales Pitch */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-semibold text-white">AI-Generated Sales Pitch</h3>
                        <button
                            onClick={handleGeneratePitch}
                            disabled={isLoading}
                            className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition disabled:bg-brand-shadow disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                            <span>Regenerate</span>
                        </button>
                    </div>
                    <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg h-full min-h-[500px]">
                        {isLoading && !pitch && <Loader />}
                        {error && <p className="text-red-400">{error}</p>}
                        {pitch && (
                            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(pitch) }}></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;
