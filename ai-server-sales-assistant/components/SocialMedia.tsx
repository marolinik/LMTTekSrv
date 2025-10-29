
import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { generateSocialTextAndImage, generateSocialVideo } from '../services/geminiService';

const Loader: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        <p className="ml-3 text-brand-silver">{message}</p>
    </div>
);

const SocialMedia: React.FC = () => {
    const [subject, setSubject] = useState('Unlocking in-house AI with our new powerhouse server');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const [generatedContent, setGeneratedContent] = useState<{ posts: Record<string, string>, imageUrl: string } | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

    const [isLoadingTextAndImage, setIsLoadingTextAndImage] = useState(false);
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);
    const [videoStatus, setVideoStatus] = useState('');

    const [error, setError] = useState('');
    const [videoError, setVideoError] = useState('');

    const [hasApiKey, setHasApiKey] = useState(false);
    const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const keyStatus = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(keyStatus);
            }
            setIsCheckingApiKey(false);
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Assume success and update UI immediately for better UX
            setHasApiKey(true);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const mimeType = result.split(';')[0].split(':')[1];
                const base64 = result.split(',')[1];
                resolve({ base64, mimeType });
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerate = useCallback(async () => {
        if (!subject || !imageFile) {
            setError('Please provide a subject and an image.');
            return;
        }

        // Reset states
        setIsLoadingTextAndImage(true);
        setIsLoadingVideo(true);
        setError('');
        setVideoError('');
        setGeneratedContent(null);
        setGeneratedVideoUrl(null);
        setVideoStatus('Starting...');

        try {
            const { base64, mimeType } = await fileToBase64(imageFile);

            // Run text/image and video generation in parallel
            const textAndImagePromise = generateSocialTextAndImage(subject, base64, mimeType).then(result => {
                setGeneratedContent(result);
                setIsLoadingTextAndImage(false);
            }).catch(err => {
                console.error(err);
                setError('Failed to generate text/image content.');
                setIsLoadingTextAndImage(false);
            });

            const videoPromise = generateSocialVideo(subject, base64, mimeType, setVideoStatus).then(videoUrl => {
                setGeneratedVideoUrl(videoUrl);
                setIsLoadingVideo(false);
            }).catch(err => {
                console.error(err);
                setVideoError(err.message || 'An unknown error occurred during video generation.');
                setIsLoadingVideo(false);
                if (err.message.includes("Invalid API Key")) {
                    setHasApiKey(false);
                }
            });

            await Promise.allSettled([textAndImagePromise, videoPromise]);

        } catch (err) {
            setError('An unexpected error occurred during setup.');
            setIsLoadingTextAndImage(false);
            setIsLoadingVideo(false);
        }
    }, [subject, imageFile]);
    
    const platformNames: Record<string, string> = {
        linkedin: 'LinkedIn',
        x: 'X (Twitter)',
        instagram: 'Instagram',
        facebook: 'Facebook',
        tiktok: 'TikTok Script'
    };

    const canGenerate = !isLoadingTextAndImage && !isLoadingVideo && !!subject && !!imageFile;

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">Social Media Content Generation</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg space-y-6">
                    <div>
                        <label htmlFor="subject" className="block text-xl font-semibold mb-2">1. Post Subject</label>
                        <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., The future of AI development is here" className="w-full bg-brand-navy border border-brand-shadow rounded-lg p-3 focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
                    </div>
                    <div>
                        <label htmlFor="image-upload" className="block text-xl font-semibold mb-2">2. Upload Image (for start of video)</label>
                         <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-brand-shadow border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? <img src={imagePreview} alt="Preview" className="mx-auto h-40 w-auto rounded-lg"/> : <svg className="mx-auto h-12 w-12 text-brand-silver" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                <div className="flex text-sm text-brand-silver"><label htmlFor="file-upload" className="relative cursor-pointer bg-brand-navy rounded-md font-medium text-brand-blue hover:text-brand-blue focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-brand-gunmetal focus-within:ring-brand-blue px-1"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" /></label><p className="pl-1">or drag and drop</p></div><p className="text-xs text-brand-silver">PNG, JPG, WEBP up to 10MB</p>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold mb-2">3. Generate Content</h3>
                        {!isCheckingApiKey && !hasApiKey && (
                            <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg relative mb-4" role="alert">
                                <strong className="font-bold">Action Required: </strong>
                                <span className="block sm:inline">Video generation requires a Gemini API key with billing enabled.</span>
                                <p className="text-xs mt-1">For more info, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">billing documentation</a>.</p>
                                <button onClick={handleSelectKey} className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Select API Key</button>
                            </div>
                        )}
                        <button onClick={handleGenerate} disabled={!canGenerate || !hasApiKey} className="bg-brand-blue w-full text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition disabled:bg-brand-shadow disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                             <span>{isLoadingTextAndImage || isLoadingVideo ? 'Generating...' : 'Generate All Content'}</span>
                        </button>
                    </div>
                </div>
                
                {/* Output Panel */}
                <div className="bg-brand-gunmetal p-6 rounded-xl shadow-lg space-y-8">
                    <h3 className="text-2xl font-semibold text-white">Generated Content</h3>
                    {(isLoadingTextAndImage || isLoadingVideo) && !generatedContent && !generatedVideoUrl && <Loader message="Starting generation..." />}
                    {error && <p className="text-red-400">{error}</p>}
                    
                    {/* Text and Image Section */}
                    {isLoadingTextAndImage && <Loader message="Generating text & image..." />}
                    {generatedContent && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h4 className="text-xl font-semibold text-brand-blue mb-2">Enhanced Image</h4>
                                <img src={generatedContent.imageUrl} alt="AI Generated" className="w-full rounded-lg shadow-lg" />
                            </div>
                            <div className="space-y-6">
                                {Object.entries(generatedContent.posts).map(([platform, text]) => (
                                    <div key={platform}>
                                        <h4 className="text-xl font-semibold text-brand-blue mb-2">{platformNames[platform]}</h4>
                                        <div className="bg-brand-navy p-4 rounded-lg text-brand-light whitespace-pre-wrap font-mono text-sm">{text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Video Section */}
                    {(isLoadingVideo || videoError || generatedVideoUrl) && <div className="border-t border-brand-shadow my-6"></div>}
                    {isLoadingVideo && <Loader message={videoStatus} />}
                    {videoError && <p className="text-red-400">{videoError}</p>}
                    {generatedVideoUrl && (
                         <div className="space-y-4 animate-fade-in">
                            <h4 className="text-xl font-semibold text-brand-blue">Generated Video</h4>
                            <video controls src={generatedVideoUrl} className="w-full rounded-lg shadow-lg" />
                            <a href={generatedVideoUrl} download={`social_video_${Date.now()}.mp4`} className="inline-block bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">Download Video</a>
                        </div>
                    )}

                    {!isLoadingTextAndImage && !isLoadingVideo && !generatedContent && !error && (
                        <div className="flex flex-col items-center justify-center h-full text-brand-silver text-center pt-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p>Your social media posts, image, and video will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialMedia;
